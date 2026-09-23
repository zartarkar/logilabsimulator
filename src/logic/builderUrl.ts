import { z } from "zod";
import type { Edge } from "@xyflow/react";
import type { SBNode } from "@/components/builder/SandboxBuilder";

const kind = z.enum([
  "INPUT",
  "OUTPUT",
  "AND",
  "OR",
  "NOT",
  "NAND",
  "NOR",
  "XOR",
  "XNOR",
  "BUFFER",
  "CONST0",
  "CONST1",
]);
const id = z.string().min(1).max(80);
const payload = z.object({
  n: z
    .array(
      z.tuple([
        id,
        kind,
        z.string().max(80),
        z.number().finite(),
        z.number().finite(),
        z.union([z.literal(0), z.literal(1)]),
      ]),
    )
    .max(300),
  e: z.array(z.tuple([id, id, z.string().max(40), z.string().max(40)])).max(600),
});

export function encodeBuilderCircuit(nodes: SBNode[], edges: Edge[]): string | undefined {
  if (!nodes.length) return undefined;
  return `v1:${JSON.stringify({
    n: nodes.map((n) => [
      n.id,
      n.kind,
      n.label,
      Math.round(n.x * 10) / 10,
      Math.round(n.y * 10) / 10,
      n.inputValue,
    ]),
    e: edges.map((e) => [e.source, e.target, e.sourceHandle ?? "out", e.targetHandle ?? "in-0"]),
  })}`;
}

export function decodeBuilderCircuit(value?: string): { nodes: SBNode[]; edges: Edge[] } {
  const empty = { nodes: [], edges: [] };
  if (!value?.startsWith("v1:") || value.length > 100000) return empty;
  try {
    const parsed = payload.safeParse(JSON.parse(value.slice(3)));
    if (!parsed.success) return empty;
    const nodes: SBNode[] = parsed.data.n.map(([id, kind, label, x, y, inputValue]) => ({
      id,
      kind,
      label,
      x,
      y,
      inputValue,
    }));
    const ids = new Set(nodes.map((n) => n.id));
    if (ids.size !== nodes.length) return empty;
    const edges: Edge[] = [];
    const occupied = new Set<string>();
    for (const [source, target, sourceHandle, targetHandle] of parsed.data.e) {
      const targetNode = nodes.find((n) => n.id === target);
      const arity = targetNode && ["NOT", "BUFFER", "OUTPUT"].includes(targetNode.kind) ? 1 : 2;
      const port = `${target}:${targetHandle}`;
      if (
        !ids.has(source) ||
        !targetNode ||
        source === target ||
        occupied.has(port) ||
        sourceHandle !== "out" ||
        !Array.from({ length: arity }, (_, i) => `in-${i}`).includes(targetHandle)
      )
        return empty;
      if (
        ["INPUT", "CONST0", "CONST1"].includes(targetNode.kind) ||
        nodes.find((n) => n.id === source)?.kind === "OUTPUT"
      )
        return empty;
      // Combinational circuits cannot contain a feedback loop.
      const reachable = [target];
      const visited = new Set<string>();
      while (reachable.length) {
        const current = reachable.pop()!;
        if (current === source) return empty;
        if (visited.has(current)) continue;
        visited.add(current);
        reachable.push(...edges.filter((e) => e.source === current).map((e) => e.target));
      }
      occupied.add(port);
      edges.push({
        id: `${source}-${target}-${targetHandle}`,
        source,
        target,
        sourceHandle,
        targetHandle,
      });
    }
    return { nodes, edges };
  } catch {
    return empty;
  }
}

export function nextBuilderId(nodes: SBNode[]): number {
  return nodes.reduce((max, node) => Math.max(max, Number(/^sb(\d+)$/.exec(node.id)?.[1] ?? 0)), 0);
}
