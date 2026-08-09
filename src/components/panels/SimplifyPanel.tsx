import { useCircuitStore } from "@/store/useCircuitStore";
import { Button } from "@/components/ui/button";
import { analyze } from "@/logic/analysis";
import { CircuitCanvas } from "@/components/circuit/CircuitCanvas";
import { Wand2 } from "lucide-react";

export function SimplifyPanel() {
  const { parsed, simplified, simplifiedGraph, runSimplify, graph, showLabels, animate } = useCircuitStore();
  if (!parsed) return <p className="p-4 text-sm text-muted-foreground">Parse an expression first.</p>;

  const before = graph ? analyze(graph) : null;
  const after = simplifiedGraph ? analyze(simplifiedGraph) : null;

  return (
    <div className="space-y-3 p-4">
      <Button size="sm" onClick={runSimplify}>
        <Wand2 className="mr-1 h-3.5 w-3.5" /> Simplify expression
      </Button>
      {!simplified && <p className="text-sm text-muted-foreground">Uses Quine–McCluskey minimisation with full equivalence verification.</p>}
      {simplified && (
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-3 font-mono text-sm">
            <div className="text-muted-foreground">Original: {parsed.normalized}</div>
            <div className="mt-1 font-bold">Simplified: {simplified.expression}</div>
            <div className="mt-1 text-xs">
              {simplified.verified ? "✔ Equivalence verified on every input combination" : `⚠ ${simplified.note ?? "Not verified — original kept"}`}
            </div>
          </div>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            {simplified.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          {before && after && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded border border-border p-2">
                <div className="text-xs uppercase text-muted-foreground">Original</div>
                <div className="font-mono">{before.gateCount} gates · depth {before.depth} · {before.delay} ns</div>
              </div>
              <div className="rounded border border-border p-2">
                <div className="text-xs uppercase text-muted-foreground">Simplified</div>
                <div className="font-mono">{after.gateCount} gates · depth {after.depth} · {after.delay} ns</div>
              </div>
            </div>
          )}
          {simplifiedGraph && (
            <div className="h-[280px] overflow-hidden rounded-lg border border-border">
              <CircuitCanvas
                graph={simplifiedGraph}
                nodeValues={Object.fromEntries(simplifiedGraph.nodes.map((n) => [n.id, n.value]))}
                edgeValues={Object.fromEntries(simplifiedGraph.edges.map((e) => [e.id, e.value]))}
                showLabels={showLabels}
                animate={animate}
                minimap={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
