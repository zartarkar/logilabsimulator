type HintNode = { id: string; kind: string };
type HintEdge = { source: string; target: string; targetHandle?: string | null };

/** Suggest an unoccupied port without introducing a cycle or changing existing wires. */
export function nextWiringHint(nodes: HintNode[], edges: HintEdge[]) {
  const sourceKinds = new Set(["INPUT", "CONST0", "CONST1"]);
  const arity = (node: HintNode) => ["NOT", "BUFFER", "OUTPUT"].includes(node.kind) ? 1 : 2;
  const targets = nodes.filter(node => !sourceKinds.has(node.kind))
    .sort((a, b) => Number(a.kind === "OUTPUT") - Number(b.kind === "OUTPUT"));
  const reaches = (from: string, to: string, visited = new Set<string>()): boolean => {
    if (from === to) return true;
    if (visited.has(from)) return false;
    visited.add(from);
    return edges.some(edge => edge.source === from && reaches(edge.target, to, visited));
  };
  const ready = (node: HintNode) => sourceKinds.has(node.kind) ||
    Array.from({ length: arity(node) }, (_, i) => `in-${i}`).every(handle =>
      edges.some(edge => edge.target === node.id && (edge.targetHandle ?? "in-0") === handle));
  for (const target of targets) {
    for (let port = 0; port < arity(target); port++) {
      const targetHandle = `in-${port}`;
      if (edges.some(edge => edge.target === target.id && (edge.targetHandle ?? "in-0") === targetHandle)) continue;
      const sources = nodes.filter(node => node.kind !== "OUTPUT" && ready(node) && !reaches(target.id, node.id));
      sources.sort((a, b) => {
        // Use distinct inputs for a gate, then take the gate's signal to the LED.
        const score = (node: HintNode) =>
          Number(edges.some(edge => edge.source === node.id && edge.target === target.id)) * 100 +
          (target.kind === "OUTPUT" ? Number(sourceKinds.has(node.kind)) * 20 : 0) +
          edges.filter(edge => edge.source === node.id).length;
        return score(a) - score(b);
      });
      if (sources[0]) return { sourceId: sources[0].id, targetId: target.id, targetHandle };
    }
  }
  return null;
}
