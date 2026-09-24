import { useNavigate, useSearch } from "@tanstack/react-router";
import { decodeBuilderCircuit, encodeBuilderCircuit, nextBuilderId } from "@/logic/builderUrl";
import { WiringGesture } from "./WiringGesture";
import { ShareCircuit } from "./ShareCircuit";
import { nextWiringHint } from "@/logic/wiringHint";
import { PracticeTourPreview, type PracticeTourStage } from "./PracticeTourPreview";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { applyBuilderGeometry, type BuilderGeometry } from "@/logic/builderGeometry";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  addEdge,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes, type GateNodeData } from "@/components/circuit/nodes";
import { GateShape } from "@/components/circuit/GateShape";
import type { AstNode, CircuitNodeType } from "@/logic/types";
import { enumerateEnvs, evalGate, evaluateAst } from "@/logic/evaluator";
import { parseExpression } from "@/logic/parser";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Lightbulb,
  MapPin,
  ToggleLeft,
  Trash2,
  Sparkles,
  Maximize2,
  PartyPopper,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useLang, DICT } from "@/i18n";
import {
  PRACTICE_CHALLENGES,
  checkCircuitMatchesChallengeTarget,
  getChallengeAst,
  getChallengeRootGate,
} from "@/logic/challenges";

export interface SBNode extends BuilderGeometry {
  id: string;
  kind: CircuitNodeType;
  label: string;
  x: number;
  y: number;
  inputValue: 0 | 1;
}

const PALETTE: CircuitNodeType[] = ["AND", "OR", "NOT", "NAND", "NOR", "XOR", "XNOR"];

const ARITY: Record<string, number> = { NOT: 1, BUFFER: 1, OUTPUT: 1 };

function rfType(t: CircuitNodeType) {
  if (t === "INPUT") return "input";
  if (t === "OUTPUT") return "output";
  if (t === "CONST0" || t === "CONST1") return "constant";
  return "gate";
}

function nodeExpression(
  id: string,
  nodes: SBNode[],
  edges: Edge[],
  memo = new Map<string, string>(),
): string {
  const cached = memo.get(id);
  if (cached) return cached;

  const node = nodes.find((item) => item.id === id);
  if (!node) return "?";
  if (node.kind === "INPUT" || node.kind === "CONST0" || node.kind === "CONST1") {
    memo.set(id, node.label);
    return node.label;
  }

  const inputs = edges
    .filter((edge) => edge.target === id)
    .sort(
      (a, b) =>
        Number((a.targetHandle ?? "in-0").split("-")[1]) -
        Number((b.targetHandle ?? "in-0").split("-")[1]),
    )
    .map((edge) => nodeExpression(edge.source, nodes, edges, memo));
  const joined = inputs.join(
    node.kind === "OR" || node.kind === "NOR"
      ? " + "
      : node.kind === "XOR" || node.kind === "XNOR"
        ? " ⊕ "
        : " · ",
  );
  const notInput = inputs[0] ?? "?";
  const expression =
    node.kind === "NOT"
      ? `${/[+·⊕]/.test(notInput) ? `(${notInput})` : notInput}'`
      : node.kind === "OUTPUT"
        ? (inputs[0] ?? "?")
        : joined || node.kind;
  memo.set(id, expression);
  return expression;
}

function simulate(
  nodes: SBNode[],
  edges: Edge[],
  override?: Record<string, 0 | 1>,
): Record<string, 0 | 1> {
  const incoming = new Map<string, { src: string; port: number }[]>();
  for (const n of nodes) incoming.set(n.id, []);
  for (const e of edges) {
    const port = Number((e.targetHandle ?? "in-0").split("-")[1] ?? 0);
    incoming.get(e.target)?.push({ src: e.source, port });
  }
  const values: Record<string, 0 | 1> = {};
  for (const n of nodes) {
    values[n.id] =
      n.kind === "INPUT" ? (override?.[n.id] ?? n.inputValue) : n.kind === "CONST1" ? 1 : 0;
  }
  // iterate until stable (bounded to avoid loops from user-made cycles)
  for (let pass = 0; pass < nodes.length + 2; pass++) {
    let changed = false;
    for (const n of nodes) {
      if (n.kind === "INPUT" || n.kind === "CONST0" || n.kind === "CONST1") continue;
      const ins = (incoming.get(n.id) ?? [])
        .sort((a, b) => a.port - b.port)
        .map((i) => values[i.src] ?? 0);
      const v = n.kind === "OUTPUT" ? (ins[0] ?? 0) : ins.length ? evalGate(n.kind, ins) : 0;
      if (values[n.id] !== v) {
        values[n.id] = v;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return values;
}

export function diagnosePracticeCircuit(
  nodes: SBNode[],
  edges: Edge[],
  expectedExpression: string,
  bn: boolean,
): string[] {
  const errors: string[] = [];
  const gateNodes = nodes.filter((node) => !["INPUT", "OUTPUT"].includes(node.kind));
  const minX = Math.min(...gateNodes.map((node) => node.x), 0);
  const maxX = Math.max(...gateNodes.map((node) => node.x), 1);
  const minY = Math.min(...gateNodes.map((node) => node.y), 0);
  const maxY = Math.max(...gateNodes.map((node) => node.y), 1);
  const describeGate = (node: SBNode) => {
    const xPosition =
      node.x <= minX + (maxX - minX) / 2
        ? bn
          ? "বাম পাশের"
          : "left-side"
        : bn
          ? "ডান পাশের"
          : "right-side";
    const yRatio = (node.y - minY) / Math.max(maxY - minY, 1);
    const yPosition =
      yRatio < 0.34
        ? bn
          ? "উপরের"
          : "upper"
        : yRatio > 0.66
          ? bn
            ? "নিচের"
            : "lower"
          : bn
            ? "মাঝের"
            : "middle";
    return bn
      ? `canvas এর ${yPosition} ${xPosition} ${node.kind} gate`
      : `the ${yPosition} ${xPosition} ${node.kind} gate on the canvas`;
  };
  const expectedVariables = Array.from(
    new Set(
      expectedExpression.replace(/\b(?:AND|OR|NOT|NAND|NOR|XOR|XNOR)\b/gi, "").match(/[A-Z]/g) ??
        [],
    ),
  );
  const inputs = nodes.filter((node) => node.kind === "INPUT");
  const outputs = nodes.filter((node) => node.kind === "OUTPUT");

  if (!nodes.length)
    return [
      bn
        ? "Canvas খালি। প্রথমে প্রয়োজনীয় input, gate এবং output LED যোগ করো।"
        : "The canvas is empty. Add the required inputs, gates, and output LED first.",
    ];
  if (inputs.length < expectedVariables.length)
    errors.push(
      bn
        ? `${expectedVariables.length - inputs.length}টি input switch কম আছে।`
        : `${expectedVariables.length - inputs.length} input switch(es) are missing.`,
    );
  if (!outputs.length) errors.push(bn ? "Output LED যোগ করা হয়নি।" : "The output LED is missing.");
  if (outputs.length > 1)
    errors.push(
      bn
        ? "একটির বেশি Output LED আছে। একটি final output রাখো।"
        : "There is more than one output LED. Keep one final output.",
    );

  const inputLabels = new Set(inputs.map((node) => node.label));
  const missingVariables = expectedVariables.filter((variable) => !inputLabels.has(variable));
  if (missingVariables.length)
    errors.push(
      bn
        ? `এই inputগুলো পাওয়া যায়নি: ${missingVariables.join(", ")}।`
        : `These inputs are missing: ${missingVariables.join(", ")}.`,
    );

  nodes
    .filter((node) => node.kind !== "INPUT")
    .forEach((node) => {
      const incoming = edges.filter((edge) => edge.target === node.id);
      const required = ARITY[node.kind] ?? 2;
      if (incoming.length < required) {
        const name = node.kind === "OUTPUT" ? "Output LED" : describeGate(node);
        errors.push(
          bn
            ? `${name} এ ${required - incoming.length}টি সংযোগ কম আছে।`
            : `${name} is missing ${required - incoming.length} input connection(s).`,
        );
      }
    });

  const invalidEdges = edges.filter(
    (edge) =>
      !nodes.some((node) => node.id === edge.source) ||
      !nodes.some((node) => node.id === edge.target),
  );
  if (invalidEdges.length)
    errors.push(
      bn
        ? "এক বা একাধিক তার ভাঙা component এর সঙ্গে যুক্ত। সেগুলো মুছে আবার সংযোগ দাও।"
        : "One or more wires point to a missing component. Remove and reconnect them.",
    );

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const hasCycle = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    const cyclic = edges.filter((edge) => edge.source === id).some((edge) => hasCycle(edge.target));
    visiting.delete(id);
    visited.add(id);
    return cyclic;
  };
  if (nodes.some((node) => hasCycle(node.id)))
    errors.push(
      bn
        ? "Circuit এ একটি loop তৈরি হয়েছে। যে তারটি আগের gate এ ফিরে গেছে সেটি সরাও।"
        : "The circuit contains a loop. Remove the wire that feeds back into an earlier gate.",
    );

  if (outputs[0]) {
    const connectedToOutput = new Set<string>();
    const visit = (id: string) => {
      if (connectedToOutput.has(id)) return;
      connectedToOutput.add(id);
      edges.filter((edge) => edge.target === id).forEach((edge) => visit(edge.source));
    };
    visit(outputs[0].id);
    const disconnected = nodes.filter(
      (node) => node.kind !== "OUTPUT" && !connectedToOutput.has(node.id),
    );
    if (disconnected.length)
      errors.push(
        bn
          ? `${disconnected.length}টি component final output এর সঙ্গে যুক্ত নয়।`
          : `${disconnected.length} component(s) are not connected to the final output.`,
      );
  }

  if (!checkCircuitMatchesChallengeTarget(nodes, edges, expectedExpression) && outputs[0]) {
    const outputInput = outputs[0]
      ? edges.find((edge) => edge.target === outputs[0].id)
      : undefined;
    const actualFinalGate = outputInput
      ? nodes.find((node) => node.id === outputInput.source)
      : undefined;
    const expectedFinalGate = getChallengeRootGate(expectedExpression);
    if (expectedFinalGate && actualFinalGate && actualFinalGate.kind !== expectedFinalGate) {
      errors.push(
        bn
          ? `Final gate এ ${expectedFinalGate} ব্যবহার করতে হবে, কিন্তু তুমি ${actualFinalGate.kind} ব্যবহার করেছ। ${actualFinalGate.kind} gate টি ${expectedFinalGate} gate দিয়ে বদলে আবার সংযোগ দাও।`
          : `The final gate should be ${expectedFinalGate}, but you used ${actualFinalGate.kind}. Replace the ${actualFinalGate.kind} gate with the required ${expectedFinalGate} gate and reconnect it.`,
      );
    } else if (actualFinalGate) {
      const expectedAst = getChallengeAst(expectedExpression);
      const mismatch = expectedAst
        ? findFirstGateMismatch(nodes, edges, expectedAst, actualFinalGate.id)
        : undefined;
      if (mismatch) errors.push(formatPracticeMismatch(mismatch, bn));
      else
        errors.push(
          bn
            ? "সংযুক্ত circuit টির output target expression এর সঙ্গে মিলছে না। লাল চিহ্নিত connection টি ঠিক করো।"
            : "The connected circuit output does not match the target expression. Fix the highlighted connection.",
        );
    }
  }
  return Array.from(new Set(errors));
}

function findFirstGateMismatch(
  nodes: SBNode[],
  edges: Edge[],
  expected: AstNode,
  actualId: string,
): { id: string; expected: string; actual: string; branch: string } | undefined {
  const actual = nodes.find((node) => node.id === actualId);
  if (!actual) return undefined;
  if (expected.kind === "VAR")
    return actual.kind === "INPUT" && actual.label === expected.name
      ? undefined
      : {
          id: actual.id,
          expected: `input ${expected.name}`,
          actual: actual.kind === "INPUT" ? `input ${actual.label}` : actual.kind,
          branch: expected.expr,
        };
  if (expected.kind === "CONST") return undefined;
  if (actual.kind !== expected.kind)
    return { id: actual.id, expected: expected.kind, actual: actual.kind, branch: expected.expr };

  const incomingIds = (id: string) =>
    edges
      .filter((edge) => edge.target === id)
      .sort(
        (a, b) =>
          Number((a.targetHandle ?? "in-0").split("-")[1]) -
          Number((b.targetHandle ?? "in-0").split("-")[1]),
      )
      .map((edge) => edge.source);
  const associative = ["AND", "OR", "XOR"].includes(expected.kind) && expected.children.length > 2;
  const actualChildren = incomingIds(actual.id);
  if (associative) {
    // The UI uses two-input gates, so a 3-term operation is represented by a
    // short chain. Expand only until the target term count is reached. Fully
    // recursive flattening would hide a wrong OR used inside an AB branch.
    while (actualChildren.length < expected.children.length) {
      const expandableIndex = actualChildren.findIndex(
        (id) => nodes.find((node) => node.id === id)?.kind === expected.kind,
      );
      if (expandableIndex < 0) break;
      const [expandable] = actualChildren.splice(expandableIndex, 1);
      actualChildren.splice(expandableIndex, 0, ...incomingIds(expandable!));
    }
    if (actualChildren.length < expected.children.length) {
      const labelsFromExpected = (node: AstNode): string =>
        [
          ...new Set(
            node.kind === "VAR"
              ? [node.name]
              : node.kind === "CONST"
                ? []
                : node.children.flatMap((child) =>
                    labelsFromExpected(child).split(",").filter(Boolean),
                  ),
          ),
        ]
          .sort()
          .join(",");
      const labelsFromActual = (id: string, seen = new Set<string>()): string => {
        if (seen.has(id)) return "";
        const node = nodes.find((item) => item.id === id);
        if (!node) return "";
        if (node.kind === "INPUT") return node.label;
        const next = new Set(seen).add(id);
        return [
          ...new Set(
            incomingIds(id).flatMap((source) =>
              labelsFromActual(source, next).split(",").filter(Boolean),
            ),
          ),
        ]
          .sort()
          .join(",");
      };
      const expectedChildLabels = new Set(expected.children.map(labelsFromExpected));
      const wrongChainGate = actualChildren
        .map((id) => nodes.find((node) => node.id === id))
        .find(
          (node) =>
            node &&
            incomingIds(node.id).length >= 2 &&
            (!expectedChildLabels.has(labelsFromActual(node.id)) ||
              incomingIds(node.id).filter((source) =>
                expectedChildLabels.has(labelsFromActual(source)),
              ).length >= 2),
        );
      if (wrongChainGate) {
        return {
          id: wrongChainGate.id,
          expected: expected.kind,
          actual: wrongChainGate.kind,
          branch: expected.expr,
        };
      }
    }
  }
  const variables = [
    ...new Set(nodes.filter((node) => node.kind === "INPUT").map((node) => node.label)),
  ].sort();
  const envs = [...enumerateEnvs(variables)];
  const actualValue = (
    id: string,
    env: Record<string, 0 | 1>,
    visiting = new Set<string>(),
  ): 0 | 1 => {
    if (visiting.has(id)) return 0;
    const node = nodes.find((item) => item.id === id);
    if (!node) return 0;
    if (node.kind === "INPUT") return env[node.label] ?? 0;
    if (node.kind === "CONST0" || node.kind === "CONST1") return node.kind === "CONST1" ? 1 : 0;
    const next = new Set(visiting).add(id);
    const values = incomingIds(id).map((source) => actualValue(source, env, next));
    return node.kind === "OUTPUT"
      ? (values[0] ?? 0)
      : values.length
        ? evalGate(node.kind, values)
        : 0;
  };
  const expectedVariables = (node: AstNode): Set<string> =>
    node.kind === "VAR"
      ? new Set([node.name])
      : node.kind === "CONST"
        ? new Set()
        : new Set(node.children.flatMap((child) => [...expectedVariables(child)]));
  const actualVariables = (id: string, seen = new Set<string>()): Set<string> => {
    if (seen.has(id)) return new Set();
    const node = nodes.find((item) => item.id === id);
    if (!node) return new Set();
    if (node.kind === "INPUT") return new Set([node.label]);
    const next = new Set(seen).add(id);
    return new Set(incomingIds(id).flatMap((source) => [...actualVariables(source, next)]));
  };
  const distance = (expectedChild: AstNode, id: string) => {
    const expectedVars = expectedVariables(expectedChild);
    const actualVars = actualVariables(id);
    const variableDifference =
      [...expectedVars].filter((name) => !actualVars.has(name)).length +
      [...actualVars].filter((name) => !expectedVars.has(name)).length;
    const truthDifference = envs.reduce(
      (total, env) => total + Number(evaluateAst(expectedChild, env) !== actualValue(id, env)),
      0,
    );
    return variableDifference * Math.max(envs.length, 1) * 2 + truthDifference;
  };

  // Pair branches by their behaviour, not merely by the variable names they
  // contain. This distinguishes A'BC, AB'C and ABC', which all have the same
  // variable set but complement a different input.
  const pairMemo = new Map<string, { score: number; ids: string[] }>();
  const choosePairs = (index: number, usedMask: number): { score: number; ids: string[] } => {
    if (index >= expected.children.length) return { score: 0, ids: [] };
    const key = `${index}:${usedMask}`;
    const cached = pairMemo.get(key);
    if (cached) return cached;
    let best = { score: Number.POSITIVE_INFINITY, ids: [] as string[] };
    actualChildren.forEach((id, actualIndex) => {
      if (actualIndex >= 30 || usedMask & (1 << actualIndex)) return;
      const rest = choosePairs(index + 1, usedMask | (1 << actualIndex));
      const score = distance(expected.children[index]!, id) + rest.score;
      if (score < best.score) best = { score, ids: [id, ...rest.ids] };
    });
    pairMemo.set(key, best);
    return best;
  };
  const pairedIds = choosePairs(0, 0).ids;
  const remaining = new Set(actualChildren);
  for (let index = 0; index < expected.children.length; index++) {
    const expectedChild = expected.children[index]!;
    const match = pairedIds[index];
    if (!match)
      return {
        id: actual.id,
        expected: `branch ${expectedChild.expr}`,
        actual: "missing connection",
        branch: expectedChild.expr,
      };
    remaining.delete(match);
    const mismatch = findFirstGateMismatch(nodes, edges, expectedChild, match);
    if (mismatch) return mismatch;
  }
  const extra = [...remaining][0];
  if (extra) {
    const extraNode = nodes.find((node) => node.id === extra);
    return {
      id: extra,
      expected: "no extra branch",
      actual: extraNode?.kind ?? "extra connection",
      branch: expected.expr,
    };
  }
  return undefined;
}

function formatPracticeMismatch(
  mismatch: { id: string; expected: string; actual: string; branch: string },
  bn: boolean,
): string {
  const branch = `“${mismatch.branch}”`;
  if (mismatch.actual === "missing connection") {
    return bn
      ? `${branch} branch টি অসম্পূর্ণ। এই gate এ ওই branch এর output wire সংযোগ করো।`
      : `The ${branch} branch is incomplete. Connect that branch's output wire to this gate.`;
  }
  if (mismatch.expected === "no extra branch") {
    return bn
      ? `${branch} অংশে একটি অতিরিক্ত ${mismatch.actual} branch যুক্ত আছে। অতিরিক্ত wire টি সরাও।`
      : `An extra ${mismatch.actual} branch is connected in ${branch}. Remove the extra wire.`;
  }
  if (mismatch.expected === "NOT") {
    return bn
      ? `${branch} অংশে ${mismatch.actual} সরাসরি ব্যবহার করা হয়েছে। এখানে NOT gate বসিয়ে complemented signal তৈরি করো।`
      : `${mismatch.actual} is used directly in ${branch}. Add a NOT gate here to create the complemented signal.`;
  }
  if (mismatch.expected.startsWith("input ")) {
    return bn
      ? `${branch} অংশে ${mismatch.expected} সংযোগ করার কথা, কিন্তু ${mismatch.actual} সংযুক্ত আছে। ভুল wire টি সরিয়ে সঠিক input দাও।`
      : `${branch} requires ${mismatch.expected}, but ${mismatch.actual} is connected. Replace the incorrect wire with the required input.`;
  }
  return bn
    ? `${branch} অংশে ${mismatch.expected} gate দরকার, কিন্তু ${mismatch.actual} ব্যবহার করা হয়েছে। এই gate টি ${mismatch.expected} দিয়ে বদলে একই branch এর wireগুলো আবার সংযোগ করো।`
    : `${branch} requires an ${mismatch.expected} gate, but ${mismatch.actual} is used. Replace it with ${mismatch.expected} and reconnect the same branch wires.`;
}

function getChallengeLearningOutcomes(challengeId: string, bn: boolean): string[] {
  const outcomes: Record<string, { bn: string[]; en: string[] }> = {
    "and-gate": {
      bn: [
        "AND gate কখন output 1 দেয় তা বুঝেছ",
        "দুইটি input সঠিক gate port এ যুক্ত করতে শিখেছ",
        "Input বদলে circuit output যাচাই করতে পেরেছ",
      ],
      en: [
        "Understood when an AND gate produces 1",
        "Connected two inputs to the correct gate ports",
        "Verified circuit output by changing input values",
      ],
    },
    "or-gate": {
      bn: [
        "OR gate এর output rule বুঝেছ",
        "একাধিক input branch এক gate এ যুক্ত করতে শিখেছ",
        "Truth table অনুযায়ী output পরীক্ষা করতে পেরেছ",
      ],
      en: [
        "Understood the OR gate output rule",
        "Connected multiple input branches to one gate",
        "Tested the output against the truth table",
      ],
    },
    "xor-gate": {
      bn: [
        "দুই input ভিন্ন হলে XOR কেন 1 দেয় তা বুঝেছ",
        "XOR circuit সঠিকভাবে wire করতে শিখেছ",
        "সব input combination দিয়ে result যাচাই করেছ",
      ],
      en: [
        "Understood why XOR is 1 when inputs differ",
        "Wired an XOR circuit correctly",
        "Verified the result across input combinations",
      ],
    },
    "intermediate-1": {
      bn: [
        "AB এবং A'C নামে দুইটি product branch তৈরি করেছ",
        "A input কে NOT করে complemented signal ব্যবহার করেছ",
        "দুই branch OR করে final expression তৈরি করেছ",
      ],
      en: [
        "Built the AB and A'C product branches",
        "Used a NOT gate to create the complemented A signal",
        "Combined both branches with OR to form the final expression",
      ],
    },
    "intermediate-2": {
      bn: [
        "Bracket অনুযায়ী A+B অংশটি আগে তৈরি করেছ",
        "Intermediate OR output কে C এর সঙ্গে AND করেছ",
        "Operation order circuit structure এ প্রয়োগ করেছ",
      ],
      en: [
        "Built the grouped A+B operation first",
        "ANDed the intermediate OR output with C",
        "Applied expression order to the circuit structure",
      ],
    },
    "intermediate-3": {
      bn: [
        "AB, AC এবং BC নামে তিনটি parallel product branch তৈরি করেছ",
        "দুই input gate chain ব্যবহার করে তিন branch combine করেছ",
        "Multi branch expression এর final output যাচাই করেছ",
      ],
      en: [
        "Built the parallel AB, AC, and BC product branches",
        "Combined three branches using two input gate chains",
        "Verified the final output of a multi branch expression",
      ],
    },
    "intermediate-4": {
      bn: [
        "A+B এবং C+D নামে দুইটি sum group তৈরি করেছ",
        "দুই group এর output AND করে product of sums বানিয়েছ",
        "Bracket এবং final gate এর সম্পর্ক বুঝেছ",
      ],
      en: [
        "Built the A+B and C+D sum groups",
        "ANDed both group outputs to create a product of sums",
        "Understood how brackets determine the final gate",
      ],
    },
    "hard-1": {
      bn: [
        "A'BC, AB'C এবং ABC' branch আলাদাভাবে তৈরি করেছ",
        "প্রতিটি branch এ সঠিক variable complement করেছ",
        "তিনটি complex branch OR chain দিয়ে combine করেছ",
      ],
      en: [
        "Built the A'BC, AB'C, and ABC' branches separately",
        "Complemented the correct variable in every branch",
        "Combined three complex branches through an OR chain",
      ],
    },
    "hard-2": {
      bn: [
        "B কে complement করে inner A+B' group তৈরি করেছ",
        "পুরো grouped output এ আবার NOT প্রয়োগ করেছ",
        "Nested complement এর পরে C branch OR করেছ",
      ],
      en: [
        "Complemented B inside the A+B' group",
        "Applied NOT again to the complete grouped output",
        "ORed the nested complement result with C",
      ],
    },
    "hard-3": {
      bn: [
        "একই circuit এ XOR এবং NAND operation ব্যবহার করেছ",
        "দুই ধরনের gate branch স্বাধীনভাবে তৈরি করেছ",
        "Mixed gate outputs OR করে final result পেয়েছ",
      ],
      en: [
        "Used XOR and NAND operations in one circuit",
        "Built two different gate branches independently",
        "ORed the mixed gate outputs to get the final result",
      ],
    },
    "hard-4": {
      bn: [
        "A+B' এবং E+F' inner group সঠিকভাবে তৈরি করেছ",
        "Group দুটিকে যথাক্রমে C ও D এর সঙ্গে AND করেছ",
        "দুইটি multi stage branch OR করে final circuit শেষ করেছ",
      ],
      en: [
        "Built the A+B' and E+F' inner groups correctly",
        "ANDed those groups with C and D respectively",
        "Completed the circuit by ORing two multi stage branches",
      ],
    },
  };
  const selected = outcomes[challengeId];
  return (
    selected?.[bn ? "bn" : "en"] ??
    (bn
      ? [
          "Expression কে gate operation এ ভাগ করতে পেরেছ",
          "Gate ও wire সঠিকভাবে ব্যবহার করেছ",
          "Circuit output যাচাই করতে পেরেছ",
        ]
      : [
          "Translated an expression into gate operations",
          "Used gates and wires correctly",
          "Verified the circuit output",
        ])
  );
}

export function locatePracticeNodeErrors(
  nodes: SBNode[],
  edges: Edge[],
  expectedExpression: string,
  bn: boolean,
): Record<string, string> {
  const nodeErrors: Record<string, string> = {};
  const outputs = nodes.filter((node) => node.kind === "OUTPUT");
  nodes
    .filter((node) => node.kind !== "INPUT")
    .forEach((node) => {
      const required = ARITY[node.kind] ?? 2;
      const missing = required - edges.filter((edge) => edge.target === node.id).length;
      if (missing > 0)
        nodeErrors[node.id] = bn
          ? `এখানে আরও ${missing}টি input wire দাও`
          : `Add ${missing} more input wire(s) here`;
    });
  if (outputs[0]) {
    const connected = new Set<string>();
    const visit = (id: string) => {
      if (connected.has(id)) return;
      connected.add(id);
      edges.filter((edge) => edge.target === id).forEach((edge) => visit(edge.source));
    };
    visit(outputs[0].id);
    nodes
      .filter((node) => node.kind !== "OUTPUT" && !connected.has(node.id))
      .forEach((node) => {
        nodeErrors[node.id] ??= bn
          ? "এটি final output এর সঙ্গে যুক্ত করো"
          : "Connect this to the final output";
      });
    if (!checkCircuitMatchesChallengeTarget(nodes, edges, expectedExpression)) {
      const finalEdge = edges.find((edge) => edge.target === outputs[0].id);
      const finalGate = finalEdge ? nodes.find((node) => node.id === finalEdge.source) : undefined;
      const expectedAst = getChallengeAst(expectedExpression);
      const mismatch =
        finalGate && expectedAst
          ? findFirstGateMismatch(nodes, edges, expectedAst, finalGate.id)
          : undefined;
      if (mismatch) {
        nodeErrors[mismatch.id] = formatPracticeMismatch(mismatch, bn);
      } else if (finalGate && !Object.keys(nodeErrors).length) {
        nodeErrors[finalGate.id] = bn
          ? "এই branch এর আগের gate ও wire পরীক্ষা করো"
          : "Check the earlier gates and wires in this branch";
      }
    }
  }
  return nodeErrors;
}

interface SandboxBuilderProps {
  isPracticeMode?: boolean;
  onOnboardingComplete?: () => void;
}

function Inner({ isPracticeMode: initialPracticeMode = false, onOnboardingComplete }: SandboxBuilderProps) {
  const [isPracticeMode, setIsPracticeMode] = useState(initialPracticeMode);
  const search = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const urlEnabled = !onOnboardingComplete;
  const [initialCircuit] = useState(() => decodeBuilderCircuit(urlEnabled ? search.circuit : undefined));
  const [nodes, setNodes] = useState<SBNode[]>(initialCircuit.nodes);
  const [edges, setEdges] = useState<Edge[]>(initialCircuit.edges);
  const serializedCircuit = encodeBuilderCircuit(nodes, edges);
  const observedUrl = useRef(search.circuit);
  const observedCircuit = useRef(serializedCircuit);
  const pendingUrl = useRef<{ value: string | undefined } | null>(null);
  useEffect(() => {
    if (!urlEnabled || (search.tab !== "builder" && search.tab !== "practice")) return;
    if (search.circuit !== observedUrl.current) {
      observedUrl.current = search.circuit;
      if (pendingUrl.current?.value === search.circuit && pendingUrl.current) {
        pendingUrl.current = null;
      } else {
        const restored = decodeBuilderCircuit(search.circuit);
        observedCircuit.current = encodeBuilderCircuit(restored.nodes, restored.edges);
        setNodes(restored.nodes);
        setEdges(restored.edges);
        nextIdRef.current = nextBuilderId(restored.nodes);
        return;
      }
    }
    if (serializedCircuit === observedCircuit.current) return;
    const timer = window.setTimeout(() => {
      observedCircuit.current = serializedCircuit;
      pendingUrl.current = { value: serializedCircuit };
      void navigate({ search: previous => ({ ...previous, circuit: serializedCircuit }), replace: true, resetScroll: false });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [serializedCircuit, search.circuit, search.tab, urlEnabled, navigate]);
  const [toggledInputs, setToggledInputs] = useState<Set<string>>(() => new Set());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string>(
    PRACTICE_CHALLENGES[0]?.id ?? "",
  );
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "hard">("beginner");
  const [hasSelectedDifficulty, setHasSelectedDifficulty] = useState(Boolean(onOnboardingComplete));
  const [guideIndex, setGuideIndex] = useState<number>(0);
  const [guideSkipped, setGuideSkipped] = useState(false);
  const [tutorialPreview, setTutorialPreview] = useState<PracticeTourStage | null>(null);
  useEffect(() => {
    const preview = (event: Event) => {
      const stage = (event as CustomEvent<PracticeTourStage | null>).detail;
      setTutorialPreview(stage);
    };
    window.addEventListener("logiclab:tutorial-practice", preview);
    return () => window.removeEventListener("logiclab:tutorial-practice", preview);
  }, []);
  const [showTruthTable, setShowTruthTable] = useState(false);
  const [showChallengeSuccess, setShowChallengeSuccess] = useState(false);
  const [onboardingSolved, setOnboardingSolved] = useState(false);
  const [hasSelectedExpression, setHasSelectedExpression] = useState(Boolean(onOnboardingComplete));
  const [challengeErrors, setChallengeErrors] = useState<string[]>([]);
  const [challengeNodeErrors, setChallengeNodeErrors] = useState<Record<string, string>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const { screenToFlowPosition, fitView } = useReactFlow();
  useEffect(() => {
    if (!onOnboardingComplete || !nodes.length) return;
    const timer = window.setTimeout(() => {
      fitView({ padding: 0.25, maxZoom: 1.15, duration: 0 });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [onOnboardingComplete, nodes.length, fitView]);
  const paneRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showTruthTable) workspaceRef.current?.scrollTo({ top: 0 });
  }, [showTruthTable]);
  const nextIdRef = useRef(nextBuilderId(initialCircuit.nodes));
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const isMobile = useIsMobile();
  const { t, lang } = useLang();

  useEffect(() => setIsPracticeMode(initialPracticeMode), [initialPracticeMode]);

  useEffect(() => {
    const element = paneRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setCanvasSize({ width: Math.max(width, 1), height: Math.max(height, 1) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const canvasExtent = useMemo<[[number, number], [number, number]]>(() => {
    const workspaceWidth = Math.max(canvasSize.width, 280);
    const workspaceHeight = Math.max(canvasSize.height, 280);
    return [
      [-workspaceWidth * 0.35, -workspaceHeight * 0.35],
      [workspaceWidth * 1.35, workspaceHeight * 1.35],
    ];
  }, [canvasSize]);

  useEffect(() => {
    if ((!isPracticeMode && canvasSize.height >= 500) || nodes.length === 0) return;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        fitView({ padding: 0.12, maxZoom: 1.05, duration: 0 });
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [fitView, isMobile, isPracticeMode, nodes.length, canvasSize.width, canvasSize.height]);

  // Helper to get i18n key prefix for challenge ID
  const getChallengeKeyPrefix = (challengeId: string): string => {
    const map: Record<string, string> = {
      "and-gate": "practiceAnd1",
      "or-gate": "practiceOr2",
      "xor-gate": "practiceXor3",
    };
    return map[challengeId] ?? "";
  };

  // Helper to get translated challenge text
  const getTranslatedChallengeText = (
    challengeId: string,
    property: string,
    index?: number,
  ): string => {
    const prefix = getChallengeKeyPrefix(challengeId);
    const challenge = PRACTICE_CHALLENGES.find((item) => item.id === challengeId);
    const guideEntry = property.match(/^Guide(\d+)(Msg|Detail)$/);
    const guideStep = guideEntry ? challenge?.guide[Number(guideEntry[1])] : undefined;
    if (isMobile && guideStep && guideEntry) {
      if (guideEntry[2] === "Detail") return "";
      const bn = lang === "bn";
      if (guideStep.target === "canvas:wire")
        return bn ? "OUT → IN চাপো: A ও B → গেট → LED।" : "Tap OUT → IN: A and B → gate → LED.";
      if (guideStep.target === "canvas:toggle")
        return bn ? "ইনপুটের 0/1 চাপো, LED জ্বালাও।" : "Tap input 0/1 switches to light the LED.";
      const component = guideStep.target.split(":")[1];
      if (component === "INPUT") {
        const input = challenge!.guide.slice(0, Number(guideEntry[1]) + 1).filter(step => step.target === "component:INPUT").length === 1 ? "A" : "B";
        return bn ? `${input} এর জন্য Input switch চাপো।` : `Tap Input switch for ${input}.`;
      }
      if (component === "OUTPUT") return bn ? "Output LED চাপো।" : "Tap Output LED.";
      return bn ? `${component} গেট চাপো।` : `Tap the ${component} gate.`;
    }
    if (guideStep?.target === "canvas:toggle") {
      if (guideEntry?.[2] === "Msg")
        return lang === "bn" ? "ইনপুটের ০/1 বোতাম চাপো" : "Tap an input’s 0/1 switch";
      return lang === "bn"
        ? "চিহ্নিত সুইচ চাপলে মান বদলাবে। ইনপুট বদলে তারের রং ও LED দেখো। LED জ্বালিয়ে এই ধাপ শেষ করো।"
        : "Tap the highlighted switch to change its value. Follow the wire colour and LED. Make the LED light up to finish this step.";
    }
    if (guideStep?.target === "canvas:wire" && guideEntry?.[2] === "Detail")
      return lang === "bn"
        ? "প্রথমে ইনপুটের ডান পাশের বিন্দুতে চাপো, তারপর গেটের বাম পাশের বিন্দুতে চাপো। এভাবেই A ও B কে গেটে এবং গেটের ডান পাশকে LED তে যুক্ত করো। বিন্দু ধরে টেনেও তার জোড়া যায়।"
        : "Tap the dot on the right of an input, then a dot on the left of the gate. Connect A and B to the gate, then its right dot to the LED. You can also drag between dots.";
    if (!prefix && challenge) {
      if (property === "Title") return challenge.title;
      if (property === "Summary") return challenge.summary;
      if (property === "Hint") return challenge.hint;
      const instructionMatch = property.match(/^Inst(\d+)$/);
      if (instructionMatch) return challenge.instructions[Number(instructionMatch[1])] ?? "";
      const guideMatch = property.match(/^Guide(\d+)(Msg|Detail)$/);
      if (guideMatch) {
        const step = challenge.guide[Number(guideMatch[1])];
        return guideMatch[2] === "Msg" ? (step?.message ?? "") : (step?.detail ?? "");
      }
    }
    // The AND guide now places A and B before the gate; translations retain their original keys.
    if (challengeId === "and-gate" && guideEntry) {
      const originalIndex = [1, 2, 0, 3, 4, 5][Number(guideEntry[1])];
      return t(`${prefix}Guide${originalIndex}${guideEntry[2]}` as keyof typeof DICT);
    }
    const suffix = index !== undefined ? `${property}${index}` : property;
    const key = `${prefix}${suffix}` as keyof typeof DICT;
    return t(key) || "";
  };

  // Dragging updates a node's x/y on nearly every frame, but neither the
  // gate simulation nor the truth table depend on position — only on which
  // nodes/edges exist and each INPUT's toggled value. Keying these memos off
  // that instead of the raw `nodes` array (whose identity changes on every
  // drag frame) avoids re-running simulate() and the whole truth-table loop
  // on every position update, which was the source of visible jank while
  // dragging a node around the canvas.
  const logicSignature = nodes.map((n) => `${n.id}:${n.kind}:${n.label}:${n.inputValue}`).join("|");

  // Positions never invalidate logic, labels, or per-node event handlers.
  const logicalNodes = useMemo(() => nodes, [logicSignature]);

  const values = useMemo(
    () => simulate(nodes, edges),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logicSignature, edges],
  );

  const truth = useMemo(() => {
    const inputs = nodes.filter((n) => n.kind === "INPUT");
    const outputs = nodes.filter((n) => n.kind === "OUTPUT");
    if (!inputs.length || !outputs.length || inputs.length > 8) return null;
    const rows: { env: Record<string, 0 | 1>; out: Record<string, 0 | 1> }[] = [];
    for (let m = 0; m < 1 << inputs.length; m++) {
      const env: Record<string, 0 | 1> = {};
      inputs.forEach((n, i) => {
        env[n.id] = ((m >> (inputs.length - 1 - i)) & 1) as 0 | 1;
      });
      const sim = simulate(nodes, edges, env);
      const out: Record<string, 0 | 1> = {};
      for (const o of outputs) out[o.id] = sim[o.id] ?? 0;
      rows.push({ env, out });
    }
    return { inputs, outputs, rows };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logicSignature, edges]);

  const addNode = useCallback(
    (kind: CircuitNodeType) => {
      const seq = nextIdRef.current + 1;
      nextIdRef.current = seq;
      const id = `sb${seq}`;

      const rect = paneRef.current?.getBoundingClientRect();
      // Use center of the actual canvas container
      const center = screenToFlowPosition({
        x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
        y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
      });

      const label =
        kind === "INPUT"
          ? String.fromCharCode(65 + ((seq - 1) % 26))
          : kind === "OUTPUT"
            ? "OUT"
            : kind;

      setNodes((ns) => {
        const sameKindCount = ns.filter((node) => node.kind === kind).length;
        // Enforce the current step against queued updates, including rapid taps.
        if (isPracticeMode && !guideSkipped && hasSelectedDifficulty && hasSelectedExpression) {
          const challenge = PRACTICE_CHALLENGES.find((item) => item.id === activeChallengeId);
          const target = `component:${kind}`;
          const allowedCount = challenge?.guide.slice(0, guideIndex + 1)
            .filter((step) => step.target === target).length ?? 0;
          if (challenge?.guide[guideIndex]?.target !== target || sameKindCount >= allowedCount) return ns;
        }
        const usedInputLabels = new Set(
          ns.filter((node) => node.kind === "INPUT").map((node) => node.label),
        );
        const firstAvailableInputLabel =
          Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index)).find(
            (candidate) => !usedInputLabels.has(candidate),
          ) ?? `IN${sameKindCount + 1}`;
        const practiceLabel = kind === "INPUT" ? firstAvailableInputLabel : label;
        if (!isPracticeMode) {
          let x = center.x,
            y = center.y;
          while (ns.some((n) => Math.abs(n.x - x) < 100 && Math.abs(n.y - y) < 65)) {
            x += 45;
            y += 65;
          }
          return [...ns, { id, kind, label: practiceLabel, x, y, inputValue: 0 }];
        }
        const logicKinds: CircuitNodeType[] = [
          "AND",
          "OR",
          "NOT",
          "NAND",
          "NOR",
          "XOR",
          "XNOR",
          "BUFFER",
        ];
        const isLogic = logicKinds.includes(kind);
        const narrowOnboarding = Boolean(onOnboardingComplete) && canvasSize.width < 400;
        const isLateStage = kind === "OR" || kind === "NOR";
        const bandCount = ns.filter((node) =>
          isLateStage
            ? node.kind === "OR" || node.kind === "NOR"
            : logicKinds.includes(node.kind) && node.kind !== "OR" && node.kind !== "NOR",
        ).length;
        const x =
          narrowOnboarding ? (kind === "INPUT" ? 20 : 260) : kind === "INPUT"
            ? 70
            : kind === "OUTPUT"
              ? Math.max(85, canvasSize.width - 105)
              : isLogic
                ? canvasSize.width * (isLateStage ? 0.68 : 0.4)
                : canvasSize.width * 0.25;
        const y =
          narrowOnboarding ? (kind === "INPUT" ? 50 + sameKindCount * 120 : kind === "OUTPUT" ? 270 : 110 + bandCount * 90) : kind === "INPUT"
            ? 90 + sameKindCount * 95
            : kind === "OUTPUT"
              ? canvasSize.height / 2
              : 90 + bandCount * 90;
        return [...ns, { id, kind, label: practiceLabel, x, y, inputValue: 0 }];
      });
      setSelectedIds([id]);
    },
    [canvasSize, fitView, isMobile, isPracticeMode, screenToFlowPosition, guideSkipped, hasSelectedDifficulty, hasSelectedExpression, activeChallengeId, guideIndex, onOnboardingComplete],
  );

  const removeNode = useCallback((id: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
  }, []);

  const moveSelectedNode = useCallback(
    (dx: number, dy: number) => {
      const selectedId = selectedIds[0];
      if (!selectedId) return;
      setNodes((current) =>
        current.map((node) =>
          node.id === selectedId
            ? {
                ...node,
                x: Math.min(canvasExtent[1][0], Math.max(canvasExtent[0][0], node.x + dx)),
                y: Math.min(canvasExtent[1][1], Math.max(canvasExtent[0][1], node.y + dy)),
              }
            : node,
        ),
      );
    },
    [canvasExtent, selectedIds],
  );

  // Select without blocking React Flow's drag gesture. Tap-to-place and
  // directional buttons remain available as alternatives on touch screens.
  const handleNodePointerDown = useCallback(
    (id: string, e: ReactPointerEvent) => {
      if ((e.target as HTMLElement).closest?.(".react-flow__handle")) return;
      setSelectedIds([id]);
    },
    [isMobile],
  );

  const onPaneClick = useCallback(
    (event: { clientX: number; clientY: number }) => {
      if (!isMobile || selectedIds.length !== 1) return;
      const id = selectedIds[0];
      const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, x: pos.x, y: pos.y } : n)));
    },
    [selectedIds, screenToFlowPosition, isMobile],
  );

  const activeChallenge =
    PRACTICE_CHALLENGES.find((c) => c.id === activeChallengeId) ?? PRACTICE_CHALLENGES[0];
  const difficultyChallenges = PRACTICE_CHALLENGES.filter(
    (challenge) => challenge.difficulty === difficulty,
  );
  const challengeLearningOutcomes = getChallengeLearningOutcomes(activeChallenge.id, lang === "bn");
  const activeGuide =
    !hasSelectedDifficulty || !hasSelectedExpression || guideSkipped
      ? undefined
      : (activeChallenge?.guide[guideIndex] ?? activeChallenge?.guide[0]);

  // Check if current step is truly satisfied before marking it complete.
  const checkStepCompletion = useCallback(() => {
    if (!isPracticeMode || !activeChallenge || guideSkipped) return;

    const currentGuide = activeChallenge.guide[guideIndex];
    if (!currentGuide) return;

    const target = currentGuide.target;
    const circuitMatchesTarget = checkCircuitMatchesChallengeTarget(
      logicalNodes,
      edges,
      activeChallenge.target,
    );

    let isCompleted = false;

    if (target.startsWith("component:")) {
      const kind = target.slice("component:".length);
      const requiredCount = activeChallenge.guide
        .slice(0, guideIndex + 1)
        .filter((step) => step.target === target).length;
      isCompleted = nodes.filter((node) => node.kind === kind).length >= requiredCount;
    } else if (target === "canvas:wire") {
      isCompleted = circuitMatchesTarget;
    } else if (target === "canvas:toggle") {
      const inputs = nodes.filter((node) => node.kind === "INPUT");
      const outputs = nodes.filter((node) => node.kind === "OUTPUT");
      isCompleted =
        circuitMatchesTarget && inputs.length > 0 && outputs.some((node) => values[node.id] === 1);
    }

    if (isCompleted && !completedSteps.has(guideIndex)) {
      setCompletedSteps((prev) => new Set([...prev, guideIndex]));
      setTimeout(() => {
        if (guideIndex < activeChallenge.guide.length - 1) {
          setGuideIndex((idx) => idx + 1);
        } else if (activeChallenge.difficulty === "beginner") {
          if (!onOnboardingComplete) setGuideSkipped(true);
          setShowChallengeSuccess(true);
          setOnboardingSolved(true);
        }
      }, 800);
    }
  }, [
    logicalNodes,
    edges,
    guideIndex,
    activeChallenge,
    isPracticeMode,
    completedSteps,
    guideSkipped,
    values,
  ]);

  useEffect(() => {
    checkStepCompletion();
  }, [checkStepCompletion]);

  const loadChallenge = useCallback((challengeId: string) => {
    setHasSelectedExpression(true);
    setShowTruthTable(false);
    const challenge =
      PRACTICE_CHALLENGES.find((item) => item.id === challengeId) ?? PRACTICE_CHALLENGES[0];
    if (!challenge) return;

    setActiveChallengeId(challenge.id);
    setGuideIndex(0);
    setGuideSkipped(false);
    setShowChallengeSuccess(false);
    setChallengeErrors([]);
    setChallengeNodeErrors({});
    setCompletedSteps(new Set());
    setSelectedIds([]);
    setNodes([]);
    setEdges([]);
    setToggledInputs(new Set());
  }, []);

  const changeDifficulty = useCallback(
    (nextDifficulty: "beginner" | "intermediate" | "hard") => {
      setHasSelectedDifficulty(true);
      setDifficulty(nextDifficulty);
      const firstChallenge = PRACTICE_CHALLENGES.find(
        (challenge) => challenge.difficulty === nextDifficulty,
      );
      if (firstChallenge) loadChallenge(firstChallenge.id);
      setHasSelectedExpression(false);
      setGuideSkipped(true);
    },
    [loadChallenge],
  );

  const nodeData = useMemo(() => {
    const expressionMemo = new Map<string, string>();
    return new Map(
      logicalNodes.map((n) => [
        n.id,
        {
          gateType: n.kind,
          label: n.label,
          expr: nodeExpression(n.id, logicalNodes, edges, expressionMemo),
          value: values[n.id] ?? 0,
          inputCount: ARITY[n.kind] ?? 2,
          showLabels: true,
          diagnosticError: challengeNodeErrors[n.id],
          onToggle:
            n.kind === "INPUT"
              ? () => {
                  setToggledInputs((previous) => new Set([...previous, n.id]));
                  setNodes((ns) =>
                    ns.map((x) => (x.id === n.id ? { ...x, inputValue: x.inputValue ? 0 : 1 } : x)),
                  );
                }
              : undefined,
          onDelete: () => removeNode(n.id),
          onNodePointerDown: (e: ReactPointerEvent) => handleNodePointerDown(n.id, e),
        } satisfies GateNodeData,
      ]),
    );
  }, [logicalNodes, edges, values, removeNode, handleNodePointerDown, challengeNodeErrors]);
  const rfNodes: Node[] = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        type: rfType(n.kind),
        position: { x: n.x, y: n.y },
        ...(n.measured ? { measured: n.measured } : {}),
        dragging: n.dragging ?? false,
        selected: selectedIds.includes(n.id),
        data: nodeData.get(n.id)!,
      })),
    [nodes, selectedIds, nodeData],
  );

  const isGuideTarget = useCallback(
    (target: string) => isPracticeMode && activeGuide?.target === target,
    [activeGuide, isPracticeMode],
  );
  const highlightGuide = isPracticeMode ? (activeGuide?.target ?? "") : "";
  useEffect(() => {
    if (!isMobile || !highlightGuide.startsWith("component:")) return;
    const palette = document.querySelector<HTMLElement>('[data-tour="builder-palette"]');
    const target = palette?.querySelector<HTMLElement>(`[data-practice-target="${highlightGuide}"]`);
    if (!palette || !target) return;
    // Scroll only the palette: the instruction and canvas stay in place.
    palette.scrollTop += target.getBoundingClientRect().top - palette.getBoundingClientRect().top - 8;
  }, [isMobile, highlightGuide, guideIndex]);

  const closeChallengeSuccess = () => {
    setShowChallengeSuccess(false);
    if (onOnboardingComplete) return;
    setGuideSkipped(true);
    setHasSelectedDifficulty(false);
    setHasSelectedExpression(false);
    setShowTruthTable(false);
  };

  const styledEdges = useMemo(
    () =>
      edges.map((e) => {
        const on = values[e.source] === 1;
        return {
          ...e,
          type: "smoothstep",
          animated: on,
          label: String(values[e.source] ?? 0),
          labelStyle: {
            fontSize: 10,
            fontFamily: "ui-monospace, monospace",
            fill: "var(--foreground)",
          },
          labelBgStyle: { fill: "var(--background)", fillOpacity: 0.85 },
          style: {
            stroke: on ? "var(--wire-on)" : "var(--wire-off)",
            strokeWidth: on ? 2.4 : 1.4,
            strokeDasharray: on ? undefined : "4 3",
            cursor: "pointer",
          },
          interactionWidth: isMobile ? 32 : 20,
          className: "cursor-pointer",
        };
      }),
    [edges, values, isMobile],
  );

  const onConnect = useCallback((c: Connection) => {
    setEdges((es) => {
      const filtered = es.filter(
        (e) => !(e.target === c.target && e.targetHandle === c.targetHandle),
      );
      return addEdge({ ...c, id: `${c.source}-${c.target}-${c.targetHandle}` }, filtered);
    });
  }, []);

  const removeEdgeOnTap = useCallback(
    (event: { stopPropagation: () => void }, edge: Edge) => {
      event.stopPropagation();
      setEdges((current) => current.filter((item) => item.id !== edge.id));
      setChallengeErrors([]);
      setChallengeNodeErrors({});
      toast.success(lang === "bn" ? "Wire সরানো হয়েছে" : "Wire removed");
    },
    [lang],
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const removed = changes.filter((c) => c.type === "remove").map((c) => c.id);
    const selectionChanges = changes.filter((c) => c.type === "select");
    setNodes((ns) => applyBuilderGeometry(ns, changes));
    if (selectionChanges.length) {
      setSelectedIds((prev) => {
        const selected = new Set(prev);
        selectionChanges.forEach((c) => (c.selected ? selected.add(c.id) : selected.delete(c.id)));
        return [...selected];
      });
    }
    if (removed.length) {
      setSelectedIds((prev) => prev.filter((id) => !removed.includes(id)));
      setEdges((es) =>
        es.filter((e) => !removed.includes(e.source) && !removed.includes(e.target)),
      );
    }
  }, []);

  return (
    <div
      className={`flex h-full min-h-0 flex-col lg:flex-row bg-transparent sandbox-container overflow-hidden touch-none lg:touch-auto ${isPracticeMode ? "practice-builder" : ""} ${activeGuide && isPracticeMode ? "mobile-guided-builder" : ""} ${!isMobile ? "desktop-builder" : ""}`}
    >
      {onOnboardingComplete && onboardingSolved && <Button className="absolute right-4 top-4 z-30" onClick={onOnboardingComplete}>{lang === "bn" ? "সিমুলেশনে যাই" : "Go to simulation"}</Button>}
      <AlertDialog open={showChallengeSuccess} onOpenChange={(open) => open ? setShowChallengeSuccess(true) : closeChallengeSuccess()}>
        <AlertDialogContent className="challenge-success max-w-lg overflow-y-auto border-2 border-primary/35 bg-card p-0 text-center shadow-2xl sm:text-center">
          <button onClick={closeChallengeSuccess} aria-label="Close and return to circuit" className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-card"><X className="h-5 w-5" /></button>
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-transparent px-6 pb-5 pt-7">
            <span className="absolute left-10 top-8 h-2 w-2 rounded-full bg-amber-400" />
            <span className="absolute right-12 top-12 h-2.5 w-2.5 rotate-45 bg-destructive" />
            <span className="absolute left-20 top-20 h-2 w-3 rotate-12 rounded-full bg-sky-500" />
            <span className="absolute right-20 top-6 h-3 w-1.5 -rotate-12 rounded-full bg-violet-500" />
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-card bg-primary text-primary-foreground shadow-xl shadow-primary/25">
              <PartyPopper className="h-10 w-10" aria-hidden="true" />
            </div>
            <AlertDialogHeader className="mt-3 text-center sm:text-center">
              <AlertDialogTitle className="text-2xl font-black text-primary">
                {lang === "bn" ? "অভিনন্দন!" : "Congratulations!"}
              </AlertDialogTitle>
              <AlertDialogDescription className="mx-auto max-w-sm text-sm leading-relaxed text-foreground/75">
                {lang === "bn"
                  ? `তুমি সফলভাবে ${activeChallenge.title} circuit তৈরি ও পরীক্ষা করেছ।`
                  : `You successfully built and tested the ${activeChallenge.title} circuit.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="mx-auto mt-3 inline-flex rounded-full border border-primary/25 bg-card/85 px-4 py-1.5 font-mono text-sm font-bold text-primary shadow-sm">
              {activeChallenge.title}
            </div>
          </div>
          <div className="px-6 py-5 text-left">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              {lang === "bn" ? "এই practice থেকে যা শিখেছ" : "What you learned"}
            </h3>
            <ul className="mt-3 space-y-2.5">
              {challengeLearningOutcomes.map((outcome) => (
                <li
                  key={outcome}
                  className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/[0.045] px-3 py-2.5 text-sm leading-relaxed text-foreground"
                >
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
          <AlertDialogFooter className="border-t border-border bg-muted/30 px-6 py-4 sm:justify-center">
            <AlertDialogAction className="min-w-36 font-bold" onClick={onOnboardingComplete ?? closeChallengeSuccess}>
              {onOnboardingComplete ? (lang === "bn" ? "সিমুলেশনে যাই" : "Go to simulation") : lang === "bn" ? "সার্কিটে ফিরে যাও" : "Back to circuit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={challengeErrors.length > 0}
        onOpenChange={(open) => !open && setChallengeErrors([])}
      >
        <AlertDialogContent className="max-w-md border-destructive/30">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <CircleAlert className="h-7 w-7" aria-hidden="true" />
          </div>
          <AlertDialogHeader className="text-center sm:text-center">
            <AlertDialogTitle>
              {lang === "bn" ? "আরও একটু ঠিক করতে হবে" : "A few things need fixing"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === "bn"
                ? "নিচের সমস্যাগুলো ঠিক করে আবার Check করো।"
                : "Fix the issues below, then check your circuit again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="space-y-2 rounded-xl bg-muted/60 p-3 text-sm">
            {challengeErrors.map((error, index) => (
              <li key={error} className="flex items-start gap-2">
                <span className="font-bold text-destructive">{index + 1}.</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction>
              {lang === "bn" ? "ঠিক আছে, ঠিক করব" : "Got it, I'll fix it"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <aside className="flex shrink-0 flex-col gap-2 border-b border-border bg-card/60 backdrop-blur-sm p-2.5 lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r z-10 touch-auto no-scrollbar">
        <div
          data-tour="practice-panel"
          style={tutorialPreview ? { display: "flex" } : undefined}
          className="practice-panel order-1 relative w-full shrink-0 overflow-hidden rounded-xl border-2 border-primary/45 bg-card p-3 shadow-md ring-1 ring-primary/10 flex flex-col gap-2.5"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {lang === "bn" ? "প্র্যাকটিস চ্যালেঞ্জ" : "Practice challenges"}
            </div>
            {isPracticeMode && !tutorialPreview && !onOnboardingComplete && (
              <button
                className="text-[10px] font-medium text-muted-foreground underline-offset-2 hover:underline"
                onClick={() => {
                  setIsPracticeMode(false);
                  setHasSelectedDifficulty(false);
                }}
              >
                {lang === "bn" ? "বন্ধ করো" : "Exit"}
              </button>
            )}
          </div>

          {tutorialPreview ? <PracticeTourPreview stage={tutorialPreview} bn={lang === "bn"} /> : !isPracticeMode ? (
            <div>
              <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">
                {lang === "bn" ? "চ্যালেঞ্জ মোডে সহজ, মধ্যম বা কঠিন স্তর বেছে নিয়ে সার্কিট তৈরি করো।" : "Choose Easy, Intermediate or Hard in challenge mode to build a circuit."}
              </p>
              <Button
                size="sm"
                className="h-8 w-full text-xs"
                onClick={() => {
                  setIsPracticeMode(true);
                  setHasSelectedDifficulty(false);
                  setGuideSkipped(true);
                }}
              >
                <Sparkles className="mr-1 h-3.5 w-3.5" />{" "}
                {lang === "bn" ? "চ্যালেঞ্জ শুরু করো" : "Start a challenge"}
              </Button>
            </div>
          ) : (
            activeChallenge && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                    Difficulty
                  </label>
                  <select
                    disabled={Boolean(onOnboardingComplete)}
                    aria-label="Select practice difficulty"
                    value={hasSelectedDifficulty ? difficulty : ""}
                    onChange={(event) =>
                      changeDifficulty(event.target.value as "beginner" | "intermediate" | "hard")
                    }
                    className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
                  >
                    <option value="" disabled>
                      {lang === "bn" ? "লেভেল বেছে নাও" : "Choose a level"}
                    </option>
                    <option value="beginner">{lang === "bn" ? "সহজ" : "Easy"}</option>
                    <option value="intermediate">{lang === "bn" ? "মধ্যম" : "Intermediate"}</option>
                    <option value="hard">{lang === "bn" ? "কঠিন" : "Hard"}</option>
                  </select>
                </div>
                {hasSelectedDifficulty && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                      Expression
                    </label>
                    {!hasSelectedExpression ? (
                      <div className="flex flex-col gap-1.5">
                        {difficultyChallenges.map((challenge) => (
                          <button
                            key={challenge.id}
                            onClick={() => loadChallenge(challenge.id)}
                            className="min-h-10 rounded-lg border border-border bg-card px-2.5 py-2 text-left font-mono text-xs font-medium text-foreground transition hover:border-primary hover:bg-primary/5"
                          >
                            {challenge.title}
                          </button>
                        ))}
                      </div>
                    ) : <select
                      disabled={Boolean(onOnboardingComplete)}
                      aria-label="Select practice expression"
                      value={hasSelectedExpression ? activeChallenge.id : ""}
                      onChange={(event) => loadChallenge(event.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 font-mono text-xs font-medium text-foreground transition hover:bg-muted"
                    >
                      {difficultyChallenges.map((challenge) => (
                        <option key={challenge.id} value={challenge.id}>
                          {challenge.title}
                        </option>
                      ))}
                    </select>}
                  </div>
                )}
                {hasSelectedExpression && difficulty !== "beginner" && (
                  <Button
                    size="sm"
                    className="h-8 w-full text-xs"
                    onClick={() => {
                      const errors = diagnosePracticeCircuit(
                        nodes,
                        edges,
                        activeChallenge.target,
                        lang === "bn",
                      );
                      if (errors.length) {
                        setChallengeNodeErrors(
                          locatePracticeNodeErrors(
                            nodes,
                            edges,
                            activeChallenge.target,
                            lang === "bn",
                          ),
                        );
                        const incompleteNodeIds = nodes
                          .filter((node) => {
                            if (node.kind === "INPUT") return false;
                            const required = node.kind === "OUTPUT" || node.kind === "NOT" ? 1 : 2;
                            return (
                              edges.filter((edge) => edge.target === node.id).length < required
                            );
                          })
                          .map((node) => node.id);
                        if (incompleteNodeIds.length) {
                          setSelectedIds(incompleteNodeIds);
                        } else {
                          const output = nodes.find((node) => node.kind === "OUTPUT");
                          const finalEdge = output
                            ? edges.find((edge) => edge.target === output.id)
                            : undefined;
                          if (finalEdge) setSelectedIds([finalEdge.source]);
                        }
                        setChallengeErrors(errors);
                        return;
                      }
                      setChallengeNodeErrors({});
                      setShowChallengeSuccess(true);
          setOnboardingSolved(true);
                    }}
                  >
                    <Check className="mr-1 h-3.5 w-3.5" />{" "}
                    {lang === "bn" ? "সার্কিট যাচাই করো" : "Check circuit"}
                  </Button>
                )}
              </div>
            )
          )}
        </div>

        {isPracticeMode && activeGuide && !tutorialPreview && (
          <section
            className="practice-guide order-2 shrink-0 border rounded-lg border-border bg-card/95 px-4 py-2.5 backdrop-blur-sm"
            aria-label="Guided practice step"
          >
            <div className="flex flex-col items-stretch gap-2">
              <div className="flex min-w-0 flex-1 items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                    <span className="rounded-md border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-xs normal-case tracking-normal text-foreground">
                      {activeChallenge.title}
                    </span>
                    Step {guideIndex + 1} of {activeChallenge.guide.length}
                    {completedSteps.has(guideIndex) && (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <Check className="h-3 w-3" aria-hidden="true" /> Complete
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    {getTranslatedChallengeText(activeChallenge.id, `Guide${guideIndex}Msg`)}
                  </p>
                  {!isMobile && !onOnboardingComplete && <p className="text-[10px] text-muted-foreground">
                    {getTranslatedChallengeText(activeChallenge.id, `Guide${guideIndex}Detail`)}
                  </p>}
                  {highlightGuide === "canvas:wire" && (
                    <svg
                      role="img"
                      aria-label={
                        lang === "bn"
                          ? "প্রথমে OUT, তারপর IN বিন্দুতে চাপ দিয়ে তার জোড়ো"
                          : "Tap OUT first, then IN to connect a wire"
                      }
                      viewBox="0 0 270 32"
                      className="mt-1 h-8 w-64 max-w-full text-primary"
                    >
                      <rect x="1" y="3" width="72" height="26" rx="6" fill="var(--muted)" />
                      <text x="12" y="20" fontSize="11" fill="currentColor">
                        1. OUT
                      </text>
                      <circle cx="73" cy="16" r="5" fill="currentColor" />
                      <path
                        d="M80 16 H183 M176 11 L183 16 L176 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                      <rect x="196" y="3" width="72" height="26" rx="6" fill="var(--muted)" />
                      <circle cx="196" cy="16" r="5" fill="currentColor" />
                      <text x="211" y="20" fontSize="11" fill="currentColor">
                        2. IN
                      </text>
                    </svg>
                  )}
                </div>
              </div>
              <div className="guide-navigation flex shrink-0 items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={guideIndex === 0}
                  onClick={() => setGuideIndex((idx) => Math.max(0, idx - 1))}
                >
                  <ChevronLeft className="mr-1 h-3 w-3" aria-hidden="true" /> {lang === "bn" ? "আগের" : "Back"}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={
                    guideIndex === activeChallenge.guide.length - 1 ||
                    !completedSteps.has(guideIndex)
                  }
                  onClick={() =>
                    setGuideIndex((idx) => Math.min(activeChallenge.guide.length - 1, idx + 1))
                  }
                >
                  {lang === "bn" ? "পরের" : "Next"} <ChevronRight className="ml-1 h-3 w-3" aria-hidden="true" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => loadChallenge(activeChallenge.id)}
                >
                  <RotateCcw className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> {lang === "bn" ? "রিসেট" : "Reset"}
                </Button>
                <Button
                  disabled={Boolean(onOnboardingComplete)}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground"
                  onClick={() => {
                    setGuideSkipped(true);
                    toast.info(
                      lang === "bn"
                        ? "গাইড বাদ দেওয়া হয়েছে। এখন নিজের মতো সার্কিট বানাও।"
                        : "Guide skipped. You can now build the circuit on your own.",
                    );
                  }}
                >
                  {lang === "bn" ? "বাদ দাও" : "Skip"}
                </Button>
              </div>
            </div>
          </section>
        )}

        <div
          data-tour="builder-palette"
          className="component-palette order-3 flex shrink-0 min-w-0 gap-2 overflow-x-auto lg:flex-col lg:overflow-x-visible lg:pt-1"
        >
          <h3 className="hidden text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 lg:block mb-1">
            Components
          </h3>
          <button
            data-practice-target="component:INPUT"
            onClick={() => addNode("INPUT")}
            disabled={isPracticeMode && activeGuide && !isGuideTarget("component:INPUT")}
            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm whitespace-nowrap transition ${
              isGuideTarget("component:INPUT")
                ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-lg shadow-primary/20 hover:shadow-primary/40"
                : isPracticeMode && activeGuide
                  ? "border-border opacity-40 cursor-not-allowed"
                  : "border-border hover:bg-muted bg-card"
            } ${!isPracticeMode || !activeGuide ? "hover:bg-muted bg-card text-foreground" : "text-foreground"}`}
          >
            <span className="relative flex items-center gap-2">
              {!isMobile && isGuideTarget("component:INPUT") && (
                <span className="w-full text-center text-[10px] font-bold uppercase text-primary">Choose</span>
              )}
              <ToggleLeft className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="min-w-0 whitespace-normal text-center leading-tight">Input switch</span>
            </span>
          </button>
          <button
            data-practice-target="component:OUTPUT"
            onClick={() => addNode("OUTPUT")}
            disabled={isPracticeMode && activeGuide && !isGuideTarget("component:OUTPUT")}
            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm whitespace-nowrap transition ${
              isGuideTarget("component:OUTPUT")
                ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-lg shadow-primary/20 hover:shadow-primary/40"
                : isPracticeMode && activeGuide
                  ? "border-border opacity-40 cursor-not-allowed"
                  : "border-border hover:bg-muted bg-card"
            } ${!isPracticeMode || !activeGuide ? "hover:bg-muted bg-card text-foreground" : "text-foreground"}`}
          >
            <span className="relative flex items-center gap-2">
              {!isMobile && isGuideTarget("component:OUTPUT") && (
                <span className="w-full text-center text-[10px] font-bold uppercase text-primary">Choose</span>
              )}
              <Lightbulb className="h-4 w-4 text-[var(--signal-on)]" aria-hidden="true" />
              <span className="min-w-0 whitespace-normal text-center leading-tight">Output LED</span>
            </span>
          </button>
          {PALETTE.map((g) => (
            <button
              key={g}
              data-practice-target={`component:${g}`}
              onClick={() => addNode(g)}
              disabled={isPracticeMode && activeGuide && !isGuideTarget(`component:${g}`)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                isGuideTarget(`component:${g}`)
                  ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-lg shadow-primary/20 hover:shadow-primary/40"
                  : isPracticeMode && activeGuide
                    ? "border-border opacity-40 cursor-not-allowed"
                    : "border-border hover:bg-muted bg-card"
              } ${!isPracticeMode || !activeGuide ? "hover:bg-muted bg-card text-foreground" : "text-foreground"}`}
              aria-label={`Add ${g} gate`}
            >
              <span className="relative flex items-center gap-2">
              {!isMobile && isGuideTarget(`component:${g}`) && (
                <span className="w-full text-center text-[10px] font-bold uppercase text-primary">Choose</span>
              )}
                <span className="palette-icon">
                  <GateShape type={g} active={false} />
                </span>
                <span className="font-mono text-xs">{g}</span>
              </span>
            </button>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="lg:mt-2"
            disabled={selectedIds.length === 0}
            onClick={() => {
              selectedIds.forEach(removeNode);
              setSelectedIds([]);
              toast.success("Selected components removed");
            }}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNodes([]);
              setEdges([]);
              setSelectedIds([]);
              toast.success("Canvas cleared");
            }}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        </div>
      </aside>
      <div
        ref={workspaceRef}
        className={`builder-workspace flex min-h-0 flex-1 flex-col relative ${showTruthTable ? "truth-open overflow-y-auto" : "overflow-hidden"}`}
      >
        <div
          ref={paneRef}
          data-tour="builder-canvas"
          data-practice-target="canvas"
          className={`min-h-0 flex-1 relative ${highlightGuide === "canvas:wire" ? "practice-wire-help" : highlightGuide === "canvas:toggle" ? "practice-toggle-help" : ""}`}
        >
          {isMobile && selectedIds.length === 1 && highlightGuide !== "canvas:wire" && (
            <div className="pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-card/95 px-3 py-1 text-[10px] text-muted-foreground shadow">
              {lang === "bn"
                ? "গেট টানো · অথবা খালি জায়গায় চাপো"
                : "Drag a gate · or tap empty space to place it"}
            </div>
          )}
          <div className="absolute right-2 top-2 z-30 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 bg-card/95 px-2.5 shadow-md"
            data-tour="builder-fit"
            onClick={() => fitView({ padding: isMobile ? 0.3 : 0.2, maxZoom: 1.15, duration: 250 })}
            title="Fit circuit to screen"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span className="ml-1 hidden sm:inline">Fit</span>
          </Button>
          {!onOnboardingComplete && <ShareCircuit circuit={serializedCircuit} bn={lang === "bn"} />}
          </div>
          {isMobile && selectedIds.length === 1 && highlightGuide !== "canvas:wire" && (
            <div
              className="absolute bottom-2 right-2 z-30 flex items-center gap-0.5 rounded-lg border border-border bg-card/90 p-1 shadow-md backdrop-blur-sm"
              aria-label="Move selected component"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveSelectedNode(-28, 0)}
                aria-label="Move left"
              >
                <ArrowLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveSelectedNode(0, -28)}
                aria-label="Move up"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveSelectedNode(0, 28)}
                aria-label="Move down"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => moveSelectedNode(28, 0)}
                aria-label="Move right"
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          )}
          {(() => {
            if (!isPracticeMode || guideSkipped || tutorialPreview) return null;
            const wire = nextWiringHint(nodes, edges);
            if (wire && (!isPracticeMode || highlightGuide === "canvas:wire"))
              return <WiringGesture key={`${wire.sourceId}-${wire.targetId}-${wire.targetHandle}`} {...wire} bn={lang === "bn"} />;
            if (wire || (isPracticeMode && highlightGuide !== "canvas:toggle")) return null;
            const input = nodes.find(n => n.kind === "INPUT" && !toggledInputs.has(n.id) && edges.some(edge => edge.source === n.id));
            return input ? <WiringGesture key={input.id} mode="toggle" sourceId={input.id} targetId={input.id} bn={lang === "bn"} /> : null;
          })()}
          <ReactFlow
            nodes={rfNodes}
            edges={styledEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={(changes) => {
              const removed = changes.filter((c) => c.type === "remove").map((c) => c.id);
              if (removed.length) setEdges((es) => es.filter((e) => !removed.includes(e.id)));
            }}
            onConnect={onConnect}
            onEdgeClick={removeEdgeOnTap}
            onPaneClick={onPaneClick}
            deleteKeyCode={["Backspace", "Delete"]}
            proOptions={{ hideAttribution: true }}
            fitView
            fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
            minZoom={0.2}
            maxZoom={2.5}
            translateExtent={canvasExtent}
            nodeExtent={canvasExtent}
            panOnScroll={!isMobile}
            selectionOnDrag={!isMobile}
            panOnDrag={isMobile ? true : [1, 2]}
            autoPanOnConnect={!isMobile}
            autoPanOnNodeDrag={!isMobile}
            nodesDraggable={true}
            nodeDragThreshold={8}
            connectOnClick={true}
            connectionRadius={32}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
            nodeOrigin={[0.5, 0.5]}
          >
            <Background variant={onOnboardingComplete ? BackgroundVariant.Lines : BackgroundVariant.Dots} gap={onOnboardingComplete ? 24 : 18} size={1} color={onOnboardingComplete ? "#cbd5e1" : "var(--grid-dot)"} />
            {(!isMobile || !isPracticeMode) && (
              <Controls
                position="bottom-right"
                orientation="horizontal"
                showInteractive={false}
                className="!bg-card !text-foreground !shadow-md !rounded-md !m-2"
              />
            )}
          </ReactFlow>
        </div>

        {/* Overlaid Truth Table - reduced prominence as requested */}
        {!onOnboardingComplete && <section
          aria-label="Circuit truth table"
          className="builder-truth shrink-0 border-t bg-card px-3 py-2"
        >
          {!showTruthTable ? (
            <Button variant="outline" size="sm" onClick={() => setShowTruthTable(true)}>
              {lang === "bn" ? "তোমার সার্কিটের ট্রুথ টেবিল দেখো" : "View your circuit truth table"}
            </Button>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  aria-expanded={true}
                  onClick={() => setShowTruthTable(false)}
                  className="flex flex-1 items-center gap-2 py-2 text-left text-xs font-semibold"
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {t("builderTruth")}
                </button>
                <Button
                  aria-label="Close truth table"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowTruthTable(false)}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <div className="mt-3 rounded-lg border border-border bg-card p-2">
                {truth ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr>
                          {truth.inputs.map((n) => (
                            <th
                              key={n.id}
                              className="border-b border-border px-3 py-1 text-left font-mono text-xs"
                            >
                              {n.label}
                            </th>
                          ))}
                          {truth.outputs.map((n) => (
                            <th
                              key={n.id}
                              className="border-b border-border px-3 py-1 text-left font-mono text-xs font-bold"
                            >
                              {n.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {truth.rows.map((r, i) => (
                          <tr key={i} className="hover:bg-muted/60">
                            {truth.inputs.map((n) => (
                              <td
                                key={n.id}
                                className="border-b border-border/50 px-3 py-1 font-mono tabular-nums"
                              >
                                {r.env[n.id]}
                              </td>
                            ))}
                            {truth.outputs.map((n) => (
                              <td
                                key={n.id}
                                className="border-b border-border/50 px-3 py-1 font-mono font-bold tabular-nums"
                              >
                                {r.out[n.id]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("builderTruthEmpty")}</p>
                )}
              </div>
            </>
          )}
        </section>}
      </div>
    </div>
  );
}

export function SandboxBuilder({ isPracticeMode = false, onOnboardingComplete }: SandboxBuilderProps) {
  return (
    <ReactFlowProvider>
      <Inner isPracticeMode={isPracticeMode} onOnboardingComplete={onOnboardingComplete} />
    </ReactFlowProvider>
  );
}
