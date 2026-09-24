import { describe, expect, it } from "vitest";
import { nextWiringHint } from "../logic/wiringHint";

describe("sequential wiring hints", () => {
  const nodes = [{ id: "a", kind: "INPUT" }, { id: "b", kind: "INPUT" }, { id: "gate", kind: "AND" }, { id: "out", kind: "OUTPUT" }];
  it("demonstrates both inputs and the output before toggling", () => {
    const edges: { source: string; target: string; targetHandle: string }[] = [];
    for (const [sourceId, targetId, targetHandle] of [["a", "gate", "in-0"], ["b", "gate", "in-1"], ["gate", "out", "in-0"]]) {
      expect(nextWiringHint(nodes, edges)).toEqual({ sourceId, targetId, targetHandle });
      edges.push({ source: sourceId!, target: targetId!, targetHandle: targetHandle! });
    }
    expect(nextWiringHint(nodes, edges)).toBeNull();
    edges.splice(1, 1);
    expect(nextWiringHint(nodes, edges)).toEqual({ sourceId: "b", targetId: "gate", targetHandle: "in-1" });
  });
  it("handles unary gates and direct input-to-output wiring", () => {
    expect(nextWiringHint([nodes[0]!, nodes[3]!], [])).toEqual({ sourceId: "a", targetId: "out", targetHandle: "in-0" });
    expect(nextWiringHint([{ id: "not", kind: "NOT" }], [])).toBeNull();
  });
});
