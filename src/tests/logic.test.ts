import { describe, it, expect } from "vitest";
import { parseExpression } from "../logic/parser";
import { evaluateAst, enumerateEnvs } from "../logic/evaluator";
import { buildGraph, evaluateGraph, validateGraph } from "../logic/graph";
import { simplify } from "../logic/simplify";
import { EXAMPLES } from "../logic/examples";
import {
  normalizeChallengeExpression,
  checkChallengeTarget,
  checkCircuitMatchesChallengeTarget,
  getChallengeRootGate,
  PRACTICE_CHALLENGES,
} from "../logic/challenges";
import { diagnosePracticeCircuit, locatePracticeNodeErrors } from "../components/builder/SandboxBuilder";

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

describe("challenge helpers", () => {
  it("normalizes equivalent boolean expressions for challenge checks", () => {
    expect(normalizeChallengeExpression("A·B + C")).toBe(normalizeChallengeExpression("AB+C"));
    expect(normalizeChallengeExpression("(A+B)' ")).toBe(normalizeChallengeExpression("(A+B)'"));
  });

  it("provides guided practice steps instead of showing a completed circuit immediately", () => {
    expect(PRACTICE_CHALLENGES[0].guide[0].target).toBe("component:AND");
    expect(PRACTICE_CHALLENGES[0].guide[0].message).toContain("AND");
  });

  it("detects a correct circuit target", () => {
    expect(checkChallengeTarget("A.B", "A AND B")).toBe(true);
    expect(checkChallengeTarget("A + B", "A AND B")).toBe(false);
  });

  it("keeps every intermediate and hard practice expression valid and checkable", () => {
    for (const challenge of PRACTICE_CHALLENGES.filter((item) => item.difficulty !== "beginner")) {
      expect(checkChallengeTarget(challenge.target, challenge.target), challenge.title).toBe(true);
    }
  });

  it("identifies the required final gate for precise practice feedback", () => {
    const cases = [
      ["AB", "AND"],
      ["A + B", "OR"],
      ["A'", "NOT"],
      ["A NAND B", "NAND"],
      ["A NOR B", "NOR"],
      ["A XOR B", "XOR"],
      ["A XNOR B", "XNOR"],
    ] as const;
    for (const [expression, gate] of cases) expect(getChallengeRootGate(expression), expression).toBe(gate);
  });

  it("checks every binary gate keyword against its matching circuit", () => {
    const targets = {
      AND: "AB",
      OR: "A OR B",
      NAND: "A NAND B",
      NOR: "A NOR B",
      XOR: "A XOR B",
      XNOR: "A XNOR B",
    } as const;
    for (const [kind, target] of Object.entries(targets)) {
      const nodes = [
        { id: "a", kind: "INPUT", label: "A", inputValue: 0 },
        { id: "b", kind: "INPUT", label: "B", inputValue: 0 },
        { id: "gate", kind, label: kind, inputValue: 0 },
        { id: "out", kind: "OUTPUT", label: "OUT", inputValue: 0 },
      ];
      const edges = [
        { source: "a", target: "gate", targetHandle: "in-0" },
        { source: "b", target: "gate", targetHandle: "in-1" },
        { source: "gate", target: "out", targetHandle: "in-0" },
      ];
      expect(checkCircuitMatchesChallengeTarget(nodes, edges, target), `${kind}: ${target}`).toBe(true);
    }
  });

  it("checks a NOT circuit against postfix complement syntax", () => {
    const nodes = [
      { id: "a", kind: "INPUT", label: "A", inputValue: 0 },
      { id: "not", kind: "NOT", label: "NOT", inputValue: 0 },
      { id: "out", kind: "OUTPUT", label: "OUT", inputValue: 0 },
    ];
    const edges = [
      { source: "a", target: "not", targetHandle: "in-0" },
      { source: "not", target: "out", targetHandle: "in-0" },
    ];
    expect(checkCircuitMatchesChallengeTarget(nodes, edges, "A'")).toBe(true);
  });

  it("derives the correct final operation for every un-guided challenge", () => {
    const expectedRoots: Record<string, string> = {
      "intermediate-1": "OR", "intermediate-2": "AND", "intermediate-3": "OR",
      "intermediate-4": "AND", "intermediate-5": "NAND", "intermediate-6": "NOT",
      "hard-1": "OR", "hard-2": "OR", "hard-3": "OR",
      "hard-4": "OR", "hard-5": "OR", "hard-6": "OR",
    };
    for (const challenge of PRACTICE_CHALLENGES.filter((item) => item.difficulty !== "beginner")) {
      expect(getChallengeRootGate(challenge.target), challenge.title).toBe(expectedRoots[challenge.id]);
    }
  });

  it("checks a built circuit using input IDs and output IDs, not just labels", () => {
    const nodes = [
      { id: "inputA", kind: "INPUT", label: "A", inputValue: 0 },
      { id: "inputB", kind: "INPUT", label: "B", inputValue: 0 },
      { id: "andGate", kind: "AND", label: "AND", inputValue: 0 },
      { id: "outputY", kind: "OUTPUT", label: "OUT", inputValue: 0 },
    ] as const;
    const edges = [
      { source: "inputA", target: "andGate", targetHandle: "in-0" },
      { source: "inputB", target: "andGate", targetHandle: "in-1" },
      { source: "andGate", target: "outputY", targetHandle: "in-0" },
    ];

    expect(checkCircuitMatchesChallengeTarget(nodes as any, edges, "A.B")).toBe(true);
  });

  it("validates all eight un-guided practice circuits without false suggestions", () => {
    const challenges = PRACTICE_CHALLENGES.filter((item) => item.difficulty !== "beginner");
    expect(challenges).toHaveLength(8);
    for (const challenge of challenges) {
      const parsed = parse(challenge.target);
      const graph = buildGraph(parsed.ast, "OUT", { twoInputMode: true, shareSubexpressions: true });
      const nodes = graph.nodes.map((node) => ({
        id: node.id,
        kind: node.type,
        label: node.label,
        inputValue: 0 as const,
        x: node.level * 100,
        y: 0,
      }));
      const edges = graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        targetHandle: `in-${edge.targetPort}`,
      }));
      expect(diagnosePracticeCircuit(nodes, edges, challenge.target, false), challenge.title).toEqual([]);
      expect(locatePracticeNodeErrors(nodes, edges, challenge.target, false), challenge.title).toEqual({});
    }
  });

  it("points to the exact complemented branch in the hard three-term expression", () => {
    const challenge = PRACTICE_CHALLENGES.find((item) => item.id === "hard-1")!;
    const parsed = parse(challenge.target);
    const graph = buildGraph(parsed.ast, "OUT", { twoInputMode: true, shareSubexpressions: false });
    const notB = graph.nodes.find((node) => node.type === "NOT" && graph.nodes.find((source) => source.id === node.inputs[0])?.label === "B")!;
    const nodes = graph.nodes.map((node) => ({
      id: node.id,
      kind: node.id === notB.id ? "BUFFER" as const : node.type,
      label: node.label,
      inputValue: 0 as const,
      x: node.level * 100,
      y: 0,
    }));
    const edges = graph.edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target, targetHandle: `in-${edge.targetPort}` }));
    const markers = locatePracticeNodeErrors(nodes, edges, challenge.target, false);
    expect(Object.keys(markers)).toEqual([notB.id]);
    expect(markers[notB.id]).toContain("B'");
    expect(markers[notB.id]).toContain("NOT");
    expect(markers[notB.id]).toContain("BUFFER");
  });

  it("marks the changed gate itself across every fixed medium and hard example", () => {
    const replacement: Record<string, any> = {
      AND: "OR", OR: "AND", NOT: "BUFFER", NAND: "AND", NOR: "OR", XOR: "XNOR", XNOR: "XOR", BUFFER: "NOT",
    };
    for (const challenge of PRACTICE_CHALLENGES.filter((item) => item.difficulty !== "beginner")) {
      const parsed = parse(challenge.target);
      const graph = buildGraph(parsed.ast, "OUT", { twoInputMode: true, shareSubexpressions: false });
      const edges = graph.edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target, targetHandle: `in-${edge.targetPort}` }));
      for (const changed of graph.nodes.filter((node) => replacement[node.type])) {
        const nodes = graph.nodes.map((node) => ({
          id: node.id,
          kind: node.id === changed.id ? replacement[node.type] : node.type,
          label: node.label,
          inputValue: 0 as const,
          x: node.level * 100,
          y: 0,
        }));
        const markers = locatePracticeNodeErrors(nodes, edges, challenge.target, false);
        expect(markers[changed.id], `${challenge.title}: changed ${changed.type} at ${changed.id}; markers=${JSON.stringify(markers)}`).toBeTruthy();
        expect(markers[changed.id], `${challenge.title}: expected gate name`).toContain(changed.type);
        expect(markers[changed.id], `${challenge.title}: actual gate name`).toContain(replacement[changed.type]);
      }
    }
  });
});
