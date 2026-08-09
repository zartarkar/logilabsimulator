import type { CircuitGraph } from "./types";
import { GATE_DELAYS } from "./types";

export interface Analysis {
  inputCount: number;
  gateCount: number;
  byType: Record<string, number>;
  depth: number;
  wireCount: number;
  inversions: number;
  maxFanout: number;
  criticalPath: string[];
  delay: number;
  twoInputEquivalent: number;
}

export function analyze(graph: CircuitGraph): Analysis {
  const map = new Map(graph.nodes.map((n) => [n.id, n]));
  const byType: Record<string, number> = {};
  let gateCount = 0;
  let twoInputEquivalent = 0;
  for (const n of graph.nodes) {
    if (n.type === "INPUT" || n.type === "OUTPUT") continue;
    byType[n.type] = (byType[n.type] ?? 0) + 1;
    if (n.type !== "CONST0" && n.type !== "CONST1") {
      gateCount++;
      twoInputEquivalent += Math.max(1, n.inputs.length - 1);
    }
  }
  const fanout = new Map<string, number>();
  for (const e of graph.edges) fanout.set(e.source, (fanout.get(e.source) ?? 0) + 1);

  // critical path by accumulated delay
  const best = new Map<string, { delay: number; prev: string | null }>();
  const order = [...graph.nodes].sort((a, b) => a.level - b.level);
  for (const n of order) {
    let bestPrev: string | null = null;
    let bestDelay = 0;
    for (const i of n.inputs) {
      const d = best.get(i)?.delay ?? 0;
      if (d >= bestDelay) {
        bestDelay = d;
        bestPrev = i;
      }
    }
    best.set(n.id, { delay: bestDelay + (GATE_DELAYS[n.type] ?? 0), prev: bestPrev });
  }
  const path: string[] = [];
  let cur: string | null = graph.outputId;
  while (cur) {
    path.unshift(cur);
    cur = best.get(cur)?.prev ?? null;
  }

  return {
    inputCount: graph.variables.length,
    gateCount,
    byType,
    depth: Math.max(0, ...graph.nodes.map((n) => n.level)),
    wireCount: graph.edges.length,
    inversions: (byType["NOT"] ?? 0) + (byType["NAND"] ?? 0) + (byType["NOR"] ?? 0) + (byType["XNOR"] ?? 0),
    maxFanout: Math.max(0, ...[...fanout.values()]),
    criticalPath: path.filter((id) => map.has(id)),
    delay: best.get(graph.outputId)?.delay ?? 0,
    twoInputEquivalent,
  };
}
