import type { NodeChange } from "@xyflow/react";

export interface BuilderGeometry {
  id: string;
  x: number;
  y: number;
  measured?: { width: number; height: number };
  dragging?: boolean;
}

/** Keep React Flow's measured dimensions when projecting domain nodes back to the canvas. */
export function applyBuilderGeometry<T extends BuilderGeometry>(nodes: T[], changes: NodeChange[]): T[] {
  let result = nodes;
  for (const change of changes) {
    if (change.type === "remove") {
      result = result.filter(node => node.id !== change.id);
    } else if (change.type === "dimensions" || change.type === "position") {
      result = result.map(node => {
        if (node.id !== change.id) return node;
        if (change.type === "dimensions") {
          const size = change.dimensions;
          if (!size || !Number.isFinite(size.width) || !Number.isFinite(size.height) || size.width <= 0 || size.height <= 0) return node;
          if (node.measured?.width === size.width && node.measured?.height === size.height) return node;
          return { ...node, measured: { width: size.width, height: size.height } };
        }
        const position = change.position;
        const x = position && Number.isFinite(position.x) ? position.x : node.x;
        const y = position && Number.isFinite(position.y) ? position.y : node.y;
        const dragging = change.dragging ?? node.dragging ?? false;
        if (x === node.x && y === node.y && dragging === (node.dragging ?? false)) return node;
        return { ...node, x, y, dragging };
      });
    }
  }
  return result.every((node, i) => node === nodes[i]) && result.length === nodes.length ? nodes : result;
}
