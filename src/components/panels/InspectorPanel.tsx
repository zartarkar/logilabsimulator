import { useCircuitStore } from "@/store/useCircuitStore";
import { GATE_DELAYS } from "@/logic/types";

export function InspectorPanel() {
  const { graph, selectedId, nodeValues } = useCircuitStore();
  if (!graph) return <p className="p-4 text-sm text-muted-foreground">Generate a circuit first.</p>;
  const node = graph.nodes.find((n) => n.id === selectedId);
  if (!node) return <p className="p-4 text-sm text-muted-foreground">Click any gate on the canvas to inspect it.</p>;

  const sources = node.inputs.map((id) => graph.nodes.find((n) => n.id === id)!);
  const targets = graph.nodes.filter((n) => n.inputs.includes(node.id));
  const inputVals = sources.map((s) => nodeValues[s.id] ?? 0);
  const opSymbol: Record<string, string> = { AND: " × ", OR: " + ", XOR: " ⊕ ", XNOR: " ⊙ ", NAND: " NAND ", NOR: " NOR " };

  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
    <div className="flex justify-between gap-4 border-b border-border/60 py-1.5 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-mono">{v}</span>
    </div>
  );

  return (
    <div className="p-4">
      <Row k="Gate type" v={node.type} />
      <Row k="Subexpression" v={node.expr} />
      <Row k="Inputs" v={inputVals.length ? inputVals.join(", ") : "—"} />
      <Row
        k="Calculation"
        v={
          node.type === "NOT"
            ? `NOT ${inputVals[0] ?? 0}`
            : inputVals.length
              ? inputVals.join(opSymbol[node.type] ?? ", ")
              : "—"
        }
      />
      <Row k="Output" v={nodeValues[node.id] ?? 0} />
      <Row k="State" v={(nodeValues[node.id] ?? 0) === 1 ? "ON" : "OFF"} />
      <Row k="Logic level" v={node.level} />
      <Row k="Gate delay" v={`${GATE_DELAYS[node.type] ?? 0} ns`} />
      <Row k="Source gates" v={sources.map((s) => s.label).join(", ") || "—"} />
      <Row k="Drives" v={targets.map((t) => t.label).join(", ") || "—"} />
    </div>
  );
}
