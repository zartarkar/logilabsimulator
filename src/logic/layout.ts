import type { CircuitGraph, CircuitNode } from "./types";

export interface LayoutOptions {
  direction: "LR" | "TB";
  nodeSpacing: number;
  layerSpacing: number;
}

export const NODE_W = 96;
export const NODE_H = 56;

/**
 * Deterministic layered (Sugiyama-style) layout: layer assignment by logic level,
 * ordering by iterative barycenter passes to reduce crossings, then coordinate
 * assignment with a guaranteed minimum separation so nodes never overlap.
 */
export function layoutGraph(graph: CircuitGraph, opts: LayoutOptions) {
  const layers = new Map<number, CircuitNode[]>();
  for (const n of graph.nodes) {
    const arr = layers.get(n.level) ?? [];
    arr.push(n);
    layers.set(n.level, arr);
  }
  const levels = [...layers.keys()].sort((a, b) => a - b);
  const order = new Map<string, number>();
  for (const l of levels) layers.get(l)!.forEach((n, i) => order.set(n.id, i));

  const succ = new Map<string, string[]>();
  for (const n of graph.nodes) for (const i of n.inputs) {
    succ.set(i, [...(succ.get(i) ?? []), n.id]);
  }

  for (let pass = 0; pass < 6; pass++) {
    const forward = pass % 2 === 0;
    const seq = forward ? levels : [...levels].reverse();
    for (const l of seq) {
      const arr = layers.get(l)!;
      const bary = (n: CircuitNode) => {
        const refs = forward ? n.inputs : (succ.get(n.id) ?? []);
        if (!refs.length) return order.get(n.id) ?? 0;
        return refs.reduce((s, r) => s + (order.get(r) ?? 0), 0) / refs.length;
      };
      arr.sort((a, b) => bary(a) - bary(b));
      arr.forEach((n, i) => order.set(n.id, i));
    }
  }

  const gapMain = opts.layerSpacing;
  const gapCross = opts.nodeSpacing;
  const maxCount = Math.max(...levels.map((l) => layers.get(l)!.length));
  const span = maxCount * (NODE_H + gapCross);

  for (const l of levels) {
    const arr = layers.get(l)!;
    const total = arr.length * (NODE_H + gapCross);
    const start = (span - total) / 2;
    arr.forEach((n, i) => {
      const main = l * (NODE_W + gapMain);
      const cross = start + i * (NODE_H + gapCross);
      if (opts.direction === "LR") {
        n.x = main;
        n.y = cross;
      } else {
        n.x = cross;
        n.y = main;
      }
    });
  }
  return graph;
}
