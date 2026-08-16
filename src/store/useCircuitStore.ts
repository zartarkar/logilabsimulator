import { create } from "zustand";
import type { CircuitGraph, ParseError, SyntaxMode, AstNode } from "@/logic/types";
import { parseExpression, ParseFailure } from "@/logic/parser";
import { buildGraph, evaluateGraph, validateGraph } from "@/logic/graph";
import { layoutGraph } from "@/logic/layout";
import { simplify, type SimplifyResult } from "@/logic/simplify";
import { evaluateAst, type Env } from "@/logic/evaluator";

export interface Parsed {
  name: string;
  ast: AstNode;
  variables: string[];
  normalized: string;
}

interface State {
  expression: string;
  tab: "circuit" | "build" | "learn";
  mode: SyntaxMode;
  twoInputMode: boolean;
  shareSubexpressions: boolean;
  direction: "LR" | "TB";
  showLabels: boolean;
  animate: boolean;
  parsed: Parsed | null;
  error: ParseError | null;
  graph: CircuitGraph | null;
  values: Env;
  nodeValues: Record<string, 0 | 1>;
  edgeValues: Record<string, 0 | 1>;
  selectedId: string | null;
  simplified: null | SimplifyResult;
  simplifiedGraph: CircuitGraph | null;
  validation: { ok: boolean; issues: string[]; acyclic: boolean; equivalent: boolean } | null;
  setExpression: (v: string) => void;
  setTab: (t: "circuit" | "build" | "learn") => void;
  setMode: (m: SyntaxMode) => void;
  setOption: (k: "twoInputMode" | "shareSubexpressions" | "showLabels" | "animate", v: boolean) => void;
  setDirection: (d: "LR" | "TB") => void;
  parseOnly: () => void;
  generate: () => void;
  setValue: (name: string, v: 0 | 1) => void;
  setValues: (env: Env) => void;
  randomize: () => void;
  setAll: (v: 0 | 1) => void;
  select: (id: string | null) => void;
  runSimplify: () => void;
}

const LAYOUT = { nodeSpacing: 34, layerSpacing: 110 };

function snapshot(graph: CircuitGraph, env: Env) {
  evaluateGraph(graph, env);
  const nodeValues: Record<string, 0 | 1> = {};
  const edgeValues: Record<string, 0 | 1> = {};
  for (const n of graph.nodes) nodeValues[n.id] = n.value;
  for (const e of graph.edges) edgeValues[e.id] = e.value;
  return { nodeValues, edgeValues };
}

export const useCircuitStore = create<State>((set, get) => ({
  expression: "F = XYZ+XY+X'Y'Z",
  tab: "circuit",
  mode: "single-letter",
  twoInputMode: false,
  shareSubexpressions: false,
  direction: "LR",
  showLabels: true,
  animate: true,
  parsed: null,
  error: null,
  graph: null,
  values: {},
  nodeValues: {},
  edgeValues: {},
  selectedId: null,
  simplified: null,
  simplifiedGraph: null,
  validation: null,

  setExpression: (expression) => set({ expression }),
  setTab: (tab) => set({ tab }),
  setMode: (mode) => {
    set({ mode });
    if (get().parsed) get().generate();
  },
  setOption: (k, v) => {
    set({ [k]: v } as never);
    if ((k === "twoInputMode" || k === "shareSubexpressions") && get().parsed) get().generate();
  },
  setDirection: (direction) => {
    set({ direction });
    if (get().parsed) get().generate();
  },

  parseOnly: () => {
    try {
      const parsed = parseExpression(get().expression, get().mode);
      const values = { ...get().values };
      for (const v of parsed.variables) if (values[v] === undefined) values[v] = 0;
      set({ parsed, values, error: null });
    } catch (e) {
      set({ error: e instanceof ParseFailure ? e.detail : { type: "Unknown", position: 0, token: "", message: String(e) } });
    }
  },

  generate: () => {
    try {
      const state = get();
      const parsed = parseExpression(state.expression, state.mode);
      const values: Env = { ...state.values };
      for (const v of parsed.variables) if (values[v] === undefined) values[v] = 0;

      const graph = buildGraph(parsed.ast, parsed.name, {
        twoInputMode: state.twoInputMode,
        shareSubexpressions: state.shareSubexpressions,
      });
      layoutGraph(graph, { direction: state.direction, ...LAYOUT });
      const snap = snapshot(graph, values);
      const check = validateGraph(graph);
      const equivalent = evaluateGraph(graph, values) === evaluateAst(parsed.ast, values);

      set({
        parsed,
        graph,
        values,
        error: null,
        selectedId: null,
        simplified: null,
        simplifiedGraph: null,
        validation: { ...check, equivalent },
        ...snap,
      });
    } catch (e) {
      set({
        error:
          e instanceof ParseFailure
            ? e.detail
            : { type: "InternalError", position: 0, token: "", message: String(e) },
        graph: null,
      });
    }
  },

  setValue: (name, v) => {
    const values = { ...get().values, [name]: v };
    const graph = get().graph;
    if (!graph) return set({ values });
    set({ values, ...snapshot(graph, values) });
  },
  setValues: (env) => {
    const values = { ...get().values, ...env };
    const graph = get().graph;
    if (!graph) return set({ values });
    set({ values, ...snapshot(graph, values) });
  },
  randomize: () => {
    const vars = get().parsed?.variables ?? [];
    const env: Env = {};
    for (const v of vars) env[v] = (Math.random() < 0.5 ? 0 : 1) as 0 | 1;
    get().setValues(env);
  },
  setAll: (v) => {
    const vars = get().parsed?.variables ?? [];
    const env: Env = {};
    for (const name of vars) env[name] = v;
    get().setValues(env);
  },
  select: (selectedId) => set({ selectedId }),

  runSimplify: () => {
    const { parsed, values, direction } = get();
    if (!parsed) return;
    const result = simplify(parsed.ast, parsed.variables);
    let simplifiedGraph: CircuitGraph | null = null;
    if (result.ast) {
      simplifiedGraph = buildGraph(result.ast, `${parsed.name}ₛ`, {
        twoInputMode: get().twoInputMode,
        shareSubexpressions: get().shareSubexpressions,
      });
      layoutGraph(simplifiedGraph, { direction, ...LAYOUT });
      evaluateGraph(simplifiedGraph, values);
    }
    set({ simplified: result, simplifiedGraph });
  },
}));
