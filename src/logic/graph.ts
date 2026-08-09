import type {
  AstNode,
  BuildOptions,
  CircuitEdge,
  CircuitGraph,
  CircuitNode,
  GateType,
} from "./types";
import { GATE_DELAYS } from "./types";
import { evalGate, type Env } from "./evaluator";
import { collectVariables } from "./parser";

/** Builds a directed acyclic circuit graph from an AST. */
export function buildGraph(
  ast: AstNode,
  outputName: string,
  options: BuildOptions,
): CircuitGraph {
  const nodes: CircuitNode[] = [];
  const byId = new Map<string, CircuitNode>();
  const inputNodes = new Map<string, string>();
  const shared = new Map<string, string>();
  let counter = 0;

  const add = (
    type: CircuitNode["type"],
    label: string,
    expr: string,
    inputs: string[],
  ): string => {
    const id = `${type.toLowerCase()}_${++counter}`;
    const node: CircuitNode = {
      id,
      type,
      label,
      expr,
      inputs,
      level: 0,
      delay: GATE_DELAYS[type] ?? 0,
      x: 0,
      y: 0,
      value: 0,
    };
    nodes.push(node);
    byId.set(id, node);
    return id;
  };

  const variables = collectVariables(ast);
  for (const v of variables) inputNodes.set(v, add("INPUT", v, v, []));

  const build = (n: AstNode): string => {
    if (n.kind === "VAR") return inputNodes.get(n.name)!;
    if (n.kind === "CONST")
      return (
        shared.get(`const${n.value}`) ??
        (() => {
          const id = add(n.value === 1 ? "CONST1" : "CONST0", String(n.value), String(n.value), []);
          shared.set(`const${n.value}`, id);
          return id;
        })()
      );

    if (options.shareSubexpressions && shared.has(n.expr)) return shared.get(n.expr)!;

    const childIds = n.children.map(build);
    let id: string;
    const kind = n.kind as GateType;

    if (options.twoInputMode && childIds.length > 2 && kind !== "NOT" && kind !== "BUFFER") {
      // Cascade into two-input gates. For NAND/NOR the cascade is not equivalent,
      // so decompose as (AND/OR cascade) followed by a final inverting gate.
      const base: GateType = kind === "NAND" ? "AND" : kind === "NOR" ? "OR" : kind;
      let acc = childIds[0]!;
      for (let i = 1; i < childIds.length; i++) {
        const isLast = i === childIds.length - 1;
        const gate: GateType = isLast ? kind : base;
        acc = add(gate, gate, n.expr, [acc, childIds[i]!]);
      }
      id = acc;
    } else {
      id = add(kind, kind, n.expr, childIds);
    }
    if (options.shareSubexpressions) shared.set(n.expr, id);
    return id;
  };

  const rootId = build(ast);
  const outputId = add("OUTPUT", outputName, ast.expr, [rootId]);

  const edges: CircuitEdge[] = [];
  for (const node of nodes) {
    node.inputs.forEach((src, port) => {
      edges.push({
        id: `${src}->${node.id}:${port}`,
        source: src,
        target: node.id,
        targetPort: port,
        value: 0,
      });
    });
  }

  const graph: CircuitGraph = { nodes, edges, variables, outputId };
  assignLevels(graph);
  return graph;
}

export function topoOrder(graph: CircuitGraph): string[] | null {
  const indeg = new Map<string, number>();
  const outs = new Map<string, string[]>();
  for (const n of graph.nodes) {
    indeg.set(n.id, n.inputs.length);
    outs.set(n.id, []);
  }
  for (const e of graph.edges) outs.get(e.source)?.push(e.target);
  const queue = graph.nodes.filter((n) => n.inputs.length === 0).map((n) => n.id);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const t of outs.get(id) ?? []) {
      const d = (indeg.get(t) ?? 0) - 1;
      indeg.set(t, d);
      if (d === 0) queue.push(t);
    }
  }
  return order.length === graph.nodes.length ? order : null;
}

export function assignLevels(graph: CircuitGraph) {
  const order = topoOrder(graph) ?? graph.nodes.map((n) => n.id);
  const map = new Map(graph.nodes.map((n) => [n.id, n]));
  for (const id of order) {
    const n = map.get(id)!;
    n.level = n.inputs.length
      ? Math.max(...n.inputs.map((i) => (map.get(i)?.level ?? 0) + 1))
      : 0;
  }
}

/** Evaluates the whole graph in topological order, mutating node/edge values. */
export function evaluateGraph(graph: CircuitGraph, env: Env): 0 | 1 {
  const map = new Map(graph.nodes.map((n) => [n.id, n]));
  const order = topoOrder(graph) ?? graph.nodes.map((n) => n.id);
  for (const id of order) {
    const n = map.get(id)!;
    if (n.type === "INPUT") n.value = env[n.label] ?? 0;
    else if (n.type === "CONST0") n.value = 0;
    else if (n.type === "CONST1") n.value = 1;
    else if (n.type === "OUTPUT") n.value = map.get(n.inputs[0]!)?.value ?? 0;
    else n.value = evalGate(n.type, n.inputs.map((i) => map.get(i)?.value ?? 0));
  }
  for (const e of graph.edges) e.value = map.get(e.source)?.value ?? 0;
  return map.get(graph.outputId)?.value ?? 0;
}

export function validateGraph(graph: CircuitGraph) {
  const ids = new Set(graph.nodes.map((n) => n.id));
  const issues: string[] = [];
  for (const n of graph.nodes) {
    for (const i of n.inputs) if (!ids.has(i)) issues.push(`${n.id} references missing ${i}`);
    if (n.type !== "INPUT" && n.type !== "CONST0" && n.type !== "CONST1" && n.inputs.length === 0)
      issues.push(`${n.id} (${n.type}) has no inputs`);
  }
  const acyclic = topoOrder(graph) !== null;
  if (!acyclic) issues.push("Cycle detected in circuit graph");
  return { ok: issues.length === 0, issues, acyclic };
}
