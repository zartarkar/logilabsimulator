import { parseExpression } from "./parser";
import type { AstNode } from "./types";
import { enumerateEnvs, evaluateAst } from "./evaluator";

export interface PracticeGuideStep {
  id: string;
  target: string;
  message: string;
  detail: string;
  highlight?: string;
}

export interface PracticeChallenge {
  id: string;
  difficulty: "beginner" | "intermediate" | "hard";
  title: string;
  summary: string;
  target: string;
  instructions: string[];
  hint: string;
  guide: PracticeGuideStep[];
}

export const PRACTICE_CHALLENGES: PracticeChallenge[] = [
  {
    id: "and-gate",
    difficulty: "beginner",
    title: "F = AB",
    summary: "Create a circuit that outputs 1 only when both inputs are 1.",
    target: "A.B",
    instructions: [
      "Add two input switches labeled A and B.",
      "Add one AND gate and one output LED.",
      "Connect A and B to the AND gate, then connect the gate output to the LED.",
    ],
    hint: "The output should be 1 only when both A and B are 1.",
    guide: [
      {
        id: "component-AND",
        target: "component:AND",
        message: "Choose this element: AND gate.",
        detail: "Select the AND gate from the component section first.",
        highlight: "AND",
      },
      {
        id: "component-INPUT",
        target: "component:INPUT",
        message: "Now choose this element: Input switch.",
        detail: "Add the first signal source that represents input A.",
        highlight: "Input switch",
      },
      {
        id: "component-INPUT-B",
        target: "component:INPUT",
        message: "Add another input switch for B.",
        detail: "You need two input switches for A and B.",
        highlight: "Input switch",
      },
      {
        id: "component-OUTPUT",
        target: "component:OUTPUT",
        message: "Choose this element: Output LED.",
        detail: "Add the output LED that will show the final result.",
        highlight: "Output LED",
      },
      {
        id: "canvas-wire",
        target: "canvas:wire",
        message: "Complete all three wire connections.",
        detail: "Connect A and B to the AND gate, then connect the AND gate to the output LED.",
        highlight: "wire",
      },
      {
        id: "canvas-toggle",
        target: "canvas:toggle",
        message: "Toggle the input values and check the result.",
        detail: "Set inputs to 1 and 1 to see the LED turn on.",
        highlight: "toggle",
      },
    ],
  },
  {
    id: "or-gate",
    difficulty: "beginner",
    title: "F = A + B",
    summary: "Create a circuit that outputs 1 when either input is 1.",
    target: "A + B",
    instructions: [
      "Place two input switches and one OR gate.",
      "Wire both inputs to the OR gate.",
      "Connect the OR output to the output LED.",
    ],
    hint: "The output should be 0 only when both inputs are 0.",
    guide: [
      {
        id: "component-OR",
        target: "component:OR",
        message: "Choose this element: OR gate.",
        detail: "Select the OR gate from the component section.",
        highlight: "OR",
      },
      {
        id: "component-INPUT-OR",
        target: "component:INPUT",
        message: "Add input switch A.",
        detail: "This is the first OR input.",
        highlight: "Input switch",
      },
      {
        id: "component-INPUT-B-OR",
        target: "component:INPUT",
        message: "Add input switch B.",
        detail: "The OR gate needs both inputs connected.",
        highlight: "Input switch",
      },
      {
        id: "component-OUTPUT-OR",
        target: "component:OUTPUT",
        message: "Choose this element: Output LED.",
        detail: "Attach the LED to the OR output to read the final value.",
        highlight: "Output LED",
      },
      {
        id: "canvas-wire-OR",
        target: "canvas:wire",
        message: "Complete all three wire connections.",
        detail: "Connect A and B to the OR gate, then connect the OR gate to the output LED.",
        highlight: "wire",
      },
      { id: "toggle-OR", target: "canvas:toggle", message: "Toggle an input", detail: "Light the LED by changing the inputs.", highlight: "toggle" },
    ],
  },
  {
    id: "xor-gate",
    difficulty: "beginner",
    title: "F = A XOR B",
    summary: "Create a circuit that outputs 1 when exactly one input is on.",
    target: "A XOR B",
    instructions: [
      "Use two input switches and one XOR gate.",
      "Connect each input to the XOR gate.",
      "Route the XOR result to the output LED.",
    ],
    hint: "XOR is true when the two inputs differ.",
    guide: [
      {
        id: "component-XOR",
        target: "component:XOR",
        message: "Choose this element: XOR gate.",
        detail: "This gate outputs 1 only when the two inputs differ.",
        highlight: "XOR",
      },
      {
        id: "component-INPUT-XOR",
        target: "component:INPUT",
        message: "Add input switch A.",
        detail: "This is the first XOR input.",
        highlight: "Input switch",
      },
      {
        id: "component-INPUT-B-XOR",
        target: "component:INPUT",
        message: "Add input switch B.",
        detail: "You need one signal for A and one for B.",
        highlight: "Input switch",
      },
      {
        id: "component-OUTPUT-XOR",
        target: "component:OUTPUT",
        message: "Choose this element: Output LED.",
        detail: "This will show whether exactly one input is on.",
        highlight: "Output LED",
      },
      {
        id: "canvas-wire-XOR",
        target: "canvas:wire",
        message: "Complete all three wire connections.",
        detail: "Connect A and B to the XOR gate, then connect the XOR gate to the output LED.",
        highlight: "wire",
      },
      { id: "toggle-XOR", target: "canvas:toggle", message: "Toggle an input", detail: "Light the LED by changing the inputs.", highlight: "toggle" },
    ],
  },
  ...[
    ["intermediate-1", "F = AB + A'C", "AB+A'C"],
    ["intermediate-2", "F = (A + B)C", "(A+B)C"],
    ["intermediate-3", "F = AB + AC + BC", "AB+AC+BC"],
    ["intermediate-4", "F = (A + B)(C + D)", "(A+B)(C+D)"],
  ].map(([id, title, target]) => ({
    id,
    difficulty: "intermediate" as const,
    title,
    target,
    summary: `Build the circuit for ${title}.`,
    instructions: [],
    hint: "Break the expression into smaller gate operations.",
    guide: [],
  })),
  ...[
    ["hard-1", "F = A'BC + AB'C + ABC'", "A'BC+AB'C+ABC'"],
    ["hard-2", "F = (A + B')' + C", "(A+B')'+C"],
    ["hard-3", "F = (A XOR B) + (C NAND D)", "(A XOR B)+(C NAND D)"],
    ["hard-4", "F = ((A + B')C) + D(E + F')", "((A+B')C)+(D(E+F'))"],
  ].map(([id, title, target]) => ({
    id,
    difficulty: "hard" as const,
    title,
    target,
    summary: `Build the circuit for ${title}.`,
    instructions: [],
    hint: "Work from the innermost grouped operations toward the output.",
    guide: [],
  })),
];

export function normalizeChallengeExpression(input: string): string {
  const text = (input ?? "").trim().replace(/\u00A0/g, "");

  const forParsing = text
    .replace(/([A-Za-z0-9]'?)\s+XNOR\s+([A-Za-z0-9]'?)/gi, "XNOR($1,$2)")
    .replace(/([A-Za-z0-9]'?)\s+NAND\s+([A-Za-z0-9]'?)/gi, "NAND($1,$2)")
    .replace(/([A-Za-z0-9]'?)\s+NOR\s+([A-Za-z0-9]'?)/gi, "NOR($1,$2)")
    .replace(/\bAND\b/gi, " . ")
    .replace(/\bOR\b/gi, " + ")
    .replace(/\bNOT\b/gi, " ' ")
    .replace(/[·×∧]/g, " . ")
    .replace(/[∨]/g, " + ")
    .replace(/¬/g, "'")
    .replace(/!/g, "'")
    .replace(/\*/g, ".")
    .replace(/\s+/g, " ");

  return forParsing
    .replace(/([A-Za-z0-9])\s*\.\s*(?=[A-Za-z0-9])/g, "$1")
    .replace(/\s+/g, "")
    .trim();
}

function parseAny(expr: string) {
  const cleaned = normalizeChallengeExpression(expr);
  const containsNamedOperator = /\b(?:AND|OR|NOT|NAND|NOR|XOR|XNOR)\b/i.test(expr);
  const candidates = containsNamedOperator
    ? [expr.trim(), cleaned, cleaned.replace(/\./g, ""), cleaned.replace(/\+/g, "")]
    : [cleaned, expr.trim(), cleaned.replace(/\./g, ""), cleaned.replace(/\+/g, "")];
  const modes = containsNamedOperator ? (["named", "single-letter"] as const) : (["single-letter", "named"] as const);

  for (const candidate of candidates) {
    if (!candidate) continue;
    for (const mode of modes) {
      try {
        return parseExpression(candidate, mode);
      } catch {
        // Try the other syntax mode or normalized candidate.
      }
    }
  }

  throw new Error("Unable to parse challenge expression");
}

export function checkChallengeTarget(userCircuitExpression: string, expectedExpression: string): boolean {
  const user = userCircuitExpression?.trim();
  const expected = expectedExpression?.trim();
  if (!user || !expected) return false;

  try {
    const left = parseAny(user).ast;
    const right = parseAny(expected).ast;
    const variables = Array.from(new Set([...parseAny(user).variables, ...parseAny(expected).variables]));

    for (const env of enumerateEnvs(variables)) {
      if (evaluateAst(left, env) !== evaluateAst(right, env)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function getChallengeRootGate(expectedExpression: string): string | undefined {
  try {
    const kind = parseAny(expectedExpression).ast.kind;
    return kind === "VAR" || kind === "CONST" ? undefined : kind;
  } catch {
    return undefined;
  }
}

export function getChallengeAst(expectedExpression: string): AstNode | undefined {
  try {
    return parseAny(expectedExpression).ast;
  } catch {
    return undefined;
  }
}

export function checkCircuitMatchesChallengeTarget(
  nodes: Array<{ id: string; kind: string; label: string; inputValue?: 0 | 1 }>,
  edges: Array<{ source: string; target: string; targetHandle?: string }>,
  expectedExpression: string,
): boolean {
  const inputNodes = nodes.filter((n) => n.kind === "INPUT");
  const outputNodes = nodes.filter((n) => n.kind === "OUTPUT");
  if (!inputNodes.length || !outputNodes.length) return false;

  const outputId = outputNodes[0].id;
  const variables = inputNodes.map((n) => n.label);
  const allPossible = Array.from({ length: 1 << Math.max(variables.length, 1) }, (_, index) => {
    const env: Record<string, 0 | 1> = {};
    variables.forEach((variable, variableIndex) => {
      env[variable] = ((index >> (variables.length - 1 - variableIndex)) & 1) as 0 | 1;
    });
    return env;
  });

  const valueAtNode = (nodeId: string, env: Record<string, 0 | 1>): 0 | 1 => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return 0;
    if (node.kind === "INPUT") return env[node.label] ?? 0;
    if (node.kind === "CONST0") return 0;
    if (node.kind === "CONST1") return 1;

    const incoming = edges
      .filter((edge) => edge.target === nodeId)
      .sort((a, b) => Number((a.targetHandle ?? "in-0").split("-")[1]) - Number((b.targetHandle ?? "in-0").split("-")[1]))
      .map((edge) => valueAtNode(edge.source, env));

    if (node.kind === "OUTPUT") return incoming[0] ?? 0;
    if (!incoming.length) return 0;

    if (node.kind === "NOT") return incoming[0] ? 0 : 1;
    if (node.kind === "BUFFER") return incoming[0] ?? 0;
    if (node.kind === "AND") return Number(incoming[0] && incoming[1]) as 0 | 1;
    if (node.kind === "OR") return Number(incoming[0] || incoming[1]) as 0 | 1;
    if (node.kind === "NAND") return Number(!(incoming[0] && incoming[1])) as 0 | 1;
    if (node.kind === "NOR") return Number(!(incoming[0] || incoming[1])) as 0 | 1;
    if (node.kind === "XOR") return Number(Boolean(incoming[0]) !== Boolean(incoming[1])) as 0 | 1;
    if (node.kind === "XNOR") return Number(Boolean(incoming[0]) === Boolean(incoming[1])) as 0 | 1;
    return incoming[0] ?? 0;
  };

  const expected = parseAny(expectedExpression);
  const expectedValue = (env: Record<string, 0 | 1>) => evaluateAst(expected.ast, env);

  return allPossible.every((env) => valueAtNode(outputId, env) === expectedValue(env));
}

