import { describe, it, expect } from "vitest";
import { parseExpression } from "../logic/parser";
import { evaluateAst, enumerateEnvs } from "../logic/evaluator";
import { buildGraph, evaluateGraph, validateGraph } from "../logic/graph";
import { simplify } from "../logic/simplify";
import { EXAMPLES } from "../logic/examples";

const parse = (s: string, mode: "single-letter" | "named" = "single-letter") =>
  parseExpression(s, mode);

describe("tokenizer + parser", () => {
  it("implicit AND in single letter mode", () => {
    expect(parse("XYZ").variables).toEqual(["X", "Y", "Z"]);
  });
  it("keeps named variables intact", () => {
    expect(parse("SensorA + inputB", "named").variables).toEqual(["SensorA", "inputB"]);
  });
  it("postfix not binds to group", () => {
    const r = parse("(A+B)'");
    expect(evaluateAst(r.ast, { A: 1, B: 0 })).toBe(0);
    expect(evaluateAst(r.ast, { A: 0, B: 0 })).toBe(1);
  });
  it("precedence AND over OR", () => {
    const r = parse("A+B.C");
    expect(evaluateAst(r.ast, { A: 0, B: 1, C: 0 })).toBe(0);
    expect(evaluateAst(r.ast, { A: 1, B: 0, C: 0 })).toBe(1);
  });
  it("word and unicode operators", () => {
    expect(evaluateAst(parse("A XOR B").ast, { A: 1, B: 0 })).toBe(1);
    expect(evaluateAst(parse("A ⊕ B").ast, { A: 1, B: 1 })).toBe(0);
    expect(evaluateAst(parse("¬A ∧ B").ast, { A: 0, B: 1 })).toBe(1);
    expect(evaluateAst(parse("A ∨ B").ast, { A: 0, B: 1 })).toBe(1);
    expect(evaluateAst(parse("NAND(A,B)").ast, { A: 1, B: 1 })).toBe(0);
    expect(evaluateAst(parse("XNOR(A,B)").ast, { A: 1, B: 1 })).toBe(1);
    expect(evaluateAst(parse("A NOR B").ast, { A: 0, B: 0 })).toBe(1);
  });
  it("constants", () => {
    expect(evaluateAst(parse("A.1").ast, { A: 1 })).toBe(1);
    expect(evaluateAst(parse("A.FALSE").ast, { A: 1 })).toBe(0);
  });
  it("reports precise errors", () => {
    expect(() => parse("A + (B.C")).toThrowError(/closing parenthesis/i);
    expect(() => parse("A ++ B")).toThrowError(/operand/i);
    expect(() => parse("")).toThrowError(/empty/i);
    expect(() => parse("A # B")).toThrowError(/Unsupported symbol/);
  });
  it("worked example XYZ+XY+X'Y'Z with X=1,Y=1,Z=0", () => {
    expect(evaluateAst(parse("F = XYZ+XY+X'Y'Z").ast, { X: 1, Y: 1, Z: 0 })).toBe(1);
  });
});

describe("graph equivalence", () => {
  const opts = [
    { twoInputMode: false, shareSubexpressions: false },
    { twoInputMode: true, shareSubexpressions: false },
    { twoInputMode: false, shareSubexpressions: true },
    { twoInputMode: true, shareSubexpressions: true },
  ];
  const exprs = EXAMPLES.flatMap((g) => g.items.map((i) => i.expr));
  for (const expr of exprs) {
    it(`matches AST for ${expr}`, () => {
      const { ast, variables, name } = parse(expr);
      for (const o of opts) {
        const graph = buildGraph(ast, name, o);
        expect(validateGraph(graph).ok).toBe(true);
        for (const env of enumerateEnvs(variables)) {
          expect(evaluateGraph(graph, env)).toBe(evaluateAst(ast, env));
        }
      }
    });
  }
});

describe("simplification", () => {
  it("simplifies and verifies", () => {
    const { ast, variables } = parse("AB+AB'");
    const r = simplify(ast, variables);
    expect(r.verified).toBe(true);
    expect(r.expression).toBe("A");
  });
  it("keeps equivalence for complex expression", () => {
    const { ast, variables } = parse("XYZ+XY+X'Y'Z");
    const r = simplify(ast, variables);
    expect(r.verified).toBe(true);
    for (const env of enumerateEnvs(variables)) {
      expect(evaluateAst(r.ast!, env)).toBe(evaluateAst(ast, env));
    }
  });
});
