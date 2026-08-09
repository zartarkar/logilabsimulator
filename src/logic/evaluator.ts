import type { AstNode } from "./types";

export type Env = Record<string, 0 | 1>;

export function evalGate(kind: string, vals: (0 | 1)[]): 0 | 1 {
  switch (kind) {
    case "AND":
      return vals.every((v) => v === 1) ? 1 : 0;
    case "OR":
      return vals.some((v) => v === 1) ? 1 : 0;
    case "NAND":
      return vals.every((v) => v === 1) ? 0 : 1;
    case "NOR":
      return vals.some((v) => v === 1) ? 0 : 1;
    case "XOR":
      return (vals.filter((v) => v === 1).length % 2) as 0 | 1;
    case "XNOR":
      return (vals.filter((v) => v === 1).length % 2 === 0 ? 1 : 0) as 0 | 1;
    case "NOT":
      return vals[0] === 1 ? 0 : 1;
    case "BUFFER":
      return vals[0] ?? 0;
    default:
      return 0;
  }
}

export function evaluateAst(node: AstNode, env: Env): 0 | 1 {
  if (node.kind === "VAR") return env[node.name] ?? 0;
  if (node.kind === "CONST") return node.value;
  return evalGate(
    node.kind,
    node.children.map((c) => evaluateAst(c, env)),
  );
}

/** All 2^n environments for the given variables (MSB = first variable). */
export function* enumerateEnvs(vars: string[]): Generator<Env> {
  const n = vars.length;
  const total = 2 ** n;
  for (let i = 0; i < total; i++) {
    const env: Env = {};
    for (let b = 0; b < n; b++) {
      env[vars[b]!] = ((i >> (n - 1 - b)) & 1) as 0 | 1;
    }
    yield env;
  }
}

/** Step-by-step evaluation trace of every distinct subexpression. */
export interface TraceStep {
  expr: string;
  kind: string;
  inputs: { expr: string; value: 0 | 1 }[];
  value: 0 | 1;
  depth: number;
}

export function traceAst(node: AstNode, env: Env): TraceStep[] {
  const steps: TraceStep[] = [];
  const seen = new Set<string>();
  const walk = (n: AstNode): { value: 0 | 1; depth: number } => {
    if (n.kind === "VAR") return { value: env[n.name] ?? 0, depth: 0 };
    if (n.kind === "CONST") return { value: n.value, depth: 0 };
    const kids = n.children.map((c) => ({ node: c, ...walk(c) }));
    const value = evalGate(
      n.kind,
      kids.map((k) => k.value),
    );
    const depth = Math.max(...kids.map((k) => k.depth)) + 1;
    if (!seen.has(n.expr)) {
      seen.add(n.expr);
      steps.push({
        expr: n.expr,
        kind: n.kind,
        inputs: kids.map((k) => ({ expr: k.node.expr, value: k.value })),
        value,
        depth,
      });
    }
    return { value, depth };
  };
  walk(node);
  return steps.sort((a, b) => a.depth - b.depth);
}
