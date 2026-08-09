import type { AstNode } from "./types";
import { evaluateAst, enumerateEnvs, type Env } from "./evaluator";
import { makeOp } from "./parser";

export interface SimplifyResult {
  expression: string;
  ast: AstNode | null;
  steps: string[];
  verified: boolean;
  note?: string;
}

/** Quine–McCluskey minimisation producing a minimal sum-of-products. */
export function simplify(ast: AstNode, vars: string[]): SimplifyResult {
  const steps: string[] = [];
  if (vars.length === 0) {
    const v = evaluateAst(ast, {});
    return { expression: String(v), ast: { id: "c", kind: "CONST", value: v, expr: String(v) }, steps: ["Constant expression."], verified: true };
  }
  if (vars.length > 10) {
    return {
      expression: ast.expr,
      ast: null,
      steps: [],
      verified: false,
      note: "Simplification is limited to 10 variables (2^n minterm enumeration).",
    };
  }

  const n = vars.length;
  const minterms: number[] = [];
  let idx = 0;
  for (const env of enumerateEnvs(vars)) {
    if (evaluateAst(ast, env) === 1) minterms.push(idx);
    idx++;
  }
  steps.push(`Truth table built: ${minterms.length} minterms out of ${2 ** n} rows.`);

  if (minterms.length === 0)
    return { expression: "0", ast: { id: "c0", kind: "CONST", value: 0, expr: "0" }, steps: [...steps, "Function is always 0."], verified: true };
  if (minterms.length === 2 ** n)
    return { expression: "1", ast: { id: "c1", kind: "CONST", value: 1, expr: "1" }, steps: [...steps, "Function is always 1."], verified: true };

  const primes = primeImplicants(minterms, n);
  steps.push(`Prime implicants found: ${primes.length}.`);
  const chosen = coverMinterms(primes, minterms, n);
  steps.push(`Essential cover selected: ${chosen.length} product terms.`);

  const terms = chosen.map((p) => implicantToAst(p, vars));
  const simplifiedAst = terms.length === 1 ? terms[0]! : makeOp("OR", terms);
  const verified = equivalent(ast, simplifiedAst, vars);
  steps.push(verified ? "Equivalence verified against every input combination." : "Equivalence check FAILED — keeping original expression.");

  return {
    expression: verified ? simplifiedAst.expr : ast.expr,
    ast: verified ? simplifiedAst : null,
    steps,
    verified,
  };
}

export interface Implicant {
  bits: number; // value bits
  mask: number; // 1 = don't care
  covers: number[];
}

function primeImplicants(minterms: number[], n: number): Implicant[] {
  let current: Implicant[] = minterms.map((m) => ({ bits: m, mask: 0, covers: [m] }));
  const primes: Implicant[] = [];
  while (current.length) {
    const used = new Array(current.length).fill(false);
    const next = new Map<string, Implicant>();
    for (let i = 0; i < current.length; i++) {
      for (let j = i + 1; j < current.length; j++) {
        const a = current[i]!;
        const b = current[j]!;
        if (a.mask !== b.mask) continue;
        const diff = a.bits ^ b.bits;
        if (diff && (diff & (diff - 1)) === 0) {
          used[i] = true;
          used[j] = true;
          const mask = a.mask | diff;
          const bits = a.bits & ~diff;
          const key = `${bits}/${mask}`;
          if (!next.has(key))
            next.set(key, { bits, mask, covers: [...new Set([...a.covers, ...b.covers])] });
        }
      }
    }
    current.forEach((imp, i) => {
      if (!used[i]) primes.push(imp);
    });
    current = [...next.values()];
    if (n === 0) break;
  }
  return primes;
}

function coverMinterms(primes: Implicant[], minterms: number[], _n: number): Implicant[] {
  const remaining = new Set(minterms);
  const chosen: Implicant[] = [];

  // essential prime implicants
  for (const m of minterms) {
    const covering = primes.filter((p) => p.covers.includes(m));
    if (covering.length === 1 && !chosen.includes(covering[0]!)) {
      chosen.push(covering[0]!);
      covering[0]!.covers.forEach((c) => remaining.delete(c));
    }
  }
  // greedy cover for the rest
  while (remaining.size) {
    let best: Implicant | null = null;
    let bestCount = -1;
    for (const p of primes) {
      if (chosen.includes(p)) continue;
      const count = p.covers.filter((c) => remaining.has(c)).length;
      if (count > bestCount) {
        bestCount = count;
        best = p;
      }
    }
    if (!best || bestCount <= 0) break;
    chosen.push(best);
    best.covers.forEach((c) => remaining.delete(c));
  }
  return chosen;
}

function implicantToAst(p: Implicant, vars: string[]): AstNode {
  const n = vars.length;
  const lits: AstNode[] = [];
  for (let b = 0; b < n; b++) {
    const bit = 1 << (n - 1 - b);
    if (p.mask & bit) continue;
    const name = vars[b]!;
    const v: AstNode = { id: `v_${name}_${b}`, kind: "VAR", name, expr: name };
    lits.push(p.bits & bit ? v : makeOp("NOT", [v]));
  }
  if (lits.length === 0) return { id: "one", kind: "CONST", value: 1, expr: "1" };
  return lits.length === 1 ? lits[0]! : makeOp("AND", lits);
}

export function equivalent(a: AstNode, b: AstNode, vars: string[]): boolean {
  if (vars.length > 16) return false;
  for (const env of enumerateEnvs(vars)) {
    if (evaluateAst(a, env as Env) !== evaluateAst(b, env as Env)) return false;
  }
  return true;
}
