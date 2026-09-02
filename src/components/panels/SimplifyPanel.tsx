import { useCircuitStore } from "@/store/useCircuitStore";
import { analyze } from "@/logic/analysis";
import { CircuitCanvas } from "@/components/circuit/CircuitCanvas";
import { useLang } from "@/i18n";

export function SimplifyPanel() {
  const { parsed, simplified, simplifiedGraph, graph, showLabels, animate } = useCircuitStore();
  const { lang, t } = useLang();
  if (!parsed) return <p className="p-4 text-sm text-muted-foreground">{lang === "bn" ? "প্রথমে একটি এক্সপ্রেশন পার্স করো।" : "Parse an expression first."}</p>;

  const before = graph ? analyze(graph) : null;
  const after = simplifiedGraph ? analyze(simplifiedGraph) : null;

  return (
    <div className="space-y-3 p-4">
      {!simplified && <p className="text-sm text-muted-foreground">{t("preparingSimplification")}</p>}
      {simplified && (
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-3 font-mono text-sm">
            <div className="text-muted-foreground">{t("original")}: {parsed.normalized}</div>
            <div className="mt-1 font-bold">{t("simplified")}: {simplified.expression}</div>
            <div className="mt-1 text-xs">
              {simplified.verified ? `✔ ${t("equivalenceVerified")}` : `⚠ ${simplified.note ?? t("notVerified")}`}
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
                <div className="text-xs uppercase text-muted-foreground">{t("original")}</div>
                <div className="font-mono">{before.gateCount} {t("gates")} · {t("depth")} {before.depth} · {before.delay} ns</div>
              </div>
              <div className="rounded border border-border p-2">
                <div className="text-xs uppercase text-muted-foreground">{t("simplified")}</div>
                <div className="font-mono">{after.gateCount} {t("gates")} · {t("depth")} {after.depth} · {after.delay} ns</div>
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
