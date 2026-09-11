import { describe, expect, it } from "vitest";
import { applyBuilderGeometry, type BuilderGeometry } from "../logic/builderGeometry";

describe("builder geometry during dragging", () => {
  it("retains every node's dimensions across drag, selection and drag end", () => {
    let nodes: BuilderGeometry[] = [{ id: "a", x: 0, y: 0 }, { id: "gate", x: 200, y: 40 }];
    nodes = applyBuilderGeometry(nodes, [
      { id: "a", type: "dimensions", dimensions: { width: 180, height: 44 } },
      { id: "gate", type: "dimensions", dimensions: { width: 70, height: 64 } },
    ]);
    const untouched = nodes[0];
    for (let frame = 1; frame <= 60; frame++) {
      nodes = applyBuilderGeometry(nodes, [{ id: "gate", type: "position", position: { x: 200 + frame, y: 40 + frame }, dragging: true }]);
      expect(nodes[0]).toBe(untouched);
      expect(nodes[1]?.measured).toEqual({ width: 70, height: 64 });
    }
    nodes = applyBuilderGeometry(nodes, [{ id: "gate", type: "select", selected: true }, { id: "gate", type: "position", dragging: false }]);
    expect(nodes[1]).toMatchObject({ x: 260, y: 100, dragging: false, measured: { width: 70, height: 64 } });
  });
  it("does not restart measurement for unchanged or temporarily invalid sizes", () => {
    const nodes = [{ id: "a", x: 0, y: 0, measured: { width: 180, height: 44 } }];
    for (const dimensions of [{ width: 180, height: 44 }, { width: 0, height: 0 }, { width: NaN, height: 44 }]) {
      expect(applyBuilderGeometry(nodes, [{ id: "a", type: "dimensions", dimensions }])).toBe(nodes);
    }
  });
});
