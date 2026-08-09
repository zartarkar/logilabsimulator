import { useMemo } from "react";
import { useCircuitStore } from "@/store/useCircuitStore";
import { analyze } from "@/logic/analysis";

export function AnalysisPanel() {
  const { graph } = useCircuitStore();
  const stats = useMemo(() => (graph ? analyze(graph) : null), [graph]);
  if (!graph || !stats) return <p className="p-4 text-sm text-muted-foreground">Generate a circuit first.</p>;

  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => (
    <div className="flex justify-between border-b border-border/60 py-1.5 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );

  return (
    <div className="p-4">
      <Row k="Input variables" v={stats.inputCount} />
      <Row k="Total gates" v={stats.gateCount} />
      <Row k="Wires" v={stats.wireCount} />
      <Row k="Logic depth" v={stats.depth} />
      <Row k="Max fan-out" v={stats.maxFanout} />
      <Row k="Inversions" v={stats.inversions} />
      <Row k="2-input equivalent" v={stats.twoInputEquivalent} />
      <Row k="Estimated delay" v={`${stats.delay} ns`} />
      <Row k="Critical path" v={`${stats.criticalPath.length} nodes`} />
      <div className="mt-3">
        <h4 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Gate breakdown</h4>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(stats.byType).map(([t, c]) => (
            <span key={t} className="rounded border border-border bg-card px-2 py-0.5 font-mono text-xs">
              {t} × {c}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Delay values are educational estimates (NOT/BUFFER 1 ns, AND/OR/NAND/NOR 2 ns, XOR/XNOR 3 ns).
      </p>
    </div>
  );
}
