import { describe, expect, it } from "vitest";
import { decodeBuilderCircuit, encodeBuilderCircuit, nextBuilderId } from "../logic/builderUrl";
import type { SBNode } from "../components/builder/SandboxBuilder";

const nodes: SBNode[] = [
  { id: "sb2", kind: "INPUT", label: "A", x: 70, y: 100, inputValue: 1 },
  { id: "sb9", kind: "NOT", label: "NOT", x: 270, y: 100, inputValue: 0 },
  { id: "sb10", kind: "OUTPUT", label: "OUT", x: 470, y: 100, inputValue: 0 },
];
const edges = [
  { id: "a", source: "sb2", target: "sb9", sourceHandle: "out", targetHandle: "in-0" },
  { id: "b", source: "sb9", target: "sb10", sourceHandle: "out", targetHandle: "in-0" },
];
describe("builder share links", () => {
  it("round-trips components, positions, switches and connections through a URL", () => {
    const url = new URL("https://example.test/?tab=builder");
    url.searchParams.set("circuit", encodeBuilderCircuit(nodes, edges)!);
    const restored = decodeBuilderCircuit(url.searchParams.get("circuit")!);
    expect(restored.nodes).toEqual(nodes);
    expect(restored.edges.map(({ id: _, ...edge }) => edge)).toEqual(
      edges.map(({ id: _, ...edge }) => edge),
    );
    expect(nextBuilderId(restored.nodes)).toBe(10);
  });
  it("omits transient drag geometry and removes the parameter for an empty canvas", () => {
    expect(
      encodeBuilderCircuit(
        nodes.map((n) => ({ ...n, dragging: true, measured: { width: 40, height: 50 } })),
        edges,
      ),
    ).toBe(encodeBuilderCircuit(nodes, edges));
    expect(encodeBuilderCircuit([], [])).toBeUndefined();
  });
  it("ignores corrupt, dangling, duplicate and cyclic circuits", () => {
    for (const raw of [
      "invalid",
      "v2:{}",
      "v1:{",
      encodeBuilderCircuit([...nodes, nodes[0]!], edges),
      encodeBuilderCircuit(nodes, [{ ...edges[0]!, target: "missing" }]),
      encodeBuilderCircuit(nodes, [{ ...edges[0]!, targetHandle: "in-1" }]),
    ]) {
      expect(decodeBuilderCircuit(raw)).toEqual({ nodes: [], edges: [] });
    }
    const gates: SBNode[] = nodes.slice(0, 2).map((n) => ({ ...n, kind: "NOT" }));
    expect(
      decodeBuilderCircuit(
        encodeBuilderCircuit(gates, [edges[0]!, { ...edges[0]!, source: "sb9", target: "sb2" }]),
      ),
    ).toEqual({ nodes: [], edges: [] });
  });
});
