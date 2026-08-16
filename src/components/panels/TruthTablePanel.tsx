import { useMemo, useState } from "react";
import { useCircuitStore } from "@/store/useCircuitStore";
import { evaluateAst, enumerateEnvs } from "@/logic/evaluator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";

export function TruthTablePanel() {
  const { parsed, values, setValues } = useCircuitStore();
  const [filter, setFilter] = useState<"all" | "1" | "0">("all");
  const [confirmed, setConfirmed] = useState(false);
  const [showIntermediate, setShowIntermediate] = useState(true);

  const vars = parsed?.variables ?? [];
  const tooBig = vars.length > 12;

  const intermediates = useMemo(() => {
    if (!parsed || !showIntermediate) return [];
    const out: { expr: string; node: typeof parsed.ast }[] = [];
    const walk = (n: typeof parsed.ast) => {
      if ("children" in n) {
        n.children.forEach(walk);
        if (n !== parsed.ast && out.length < 6 && !out.some((o) => o.expr === n.expr))
          out.push({ expr: n.expr, node: n });
      }
    };
    walk(parsed.ast);
    return out.slice(0, 6);
  }, [parsed, showIntermediate]);

  const rows = useMemo(() => {
    if (!parsed || (tooBig && !confirmed)) return [];
    const result: { env: Record<string, 0 | 1>; mids: (0 | 1)[]; out: 0 | 1 }[] = [];
    for (const env of enumerateEnvs(vars)) {
      result.push({
        env,
        mids: intermediates.map((m) => evaluateAst(m.node, env)),
        out: evaluateAst(parsed.ast, env),
      });
    }
    return result;
  }, [parsed, vars, intermediates, tooBig, confirmed]);

  if (!parsed) return <p className="p-4 text-sm text-muted-foreground">Parse an expression to build its truth table.</p>;
  if (tooBig && !confirmed)
    return (
      <div className="space-y-3 p-4 text-sm">
        <p>
          This expression has {vars.length} variables — {2 ** vars.length} rows. Combinations grow as 2ⁿ, so the table
          may be slow to render.
        </p>
        <Button size="sm" variant="outline" onClick={() => setConfirmed(true)}>
          Generate anyway
        </Button>
      </div>
    );

  const visible = rows.filter((r) => filter === "all" || String(r.out) === filter);
  const activeIndex = rows.findIndex((r) => vars.every((v) => r.env[v] === (values[v] ?? 0)));

  const csv = () => {
    const header = [...vars, ...intermediates.map((i) => i.expr), parsed.name].join(",");
    const body = rows.map((r) => [...vars.map((v) => r.env[v]), ...r.mids, r.out].join(",")).join("\n");
    return `${header}\n${body}`;
  };

  const download = () => {
    const blob = new Blob([csv()], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${parsed.name}-truth-table.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-2">
        {(["all", "1", "0"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className={filter === f ? "button-red" : ""}>
            {f === "all" ? "All rows" : `Output ${f}`}
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={() => setShowIntermediate((s) => !s)}>
          {showIntermediate ? "Hide" : "Show"} intermediates
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">{visible.length} rows</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-card">
            <tr>
              {vars.map((v) => (
                <th key={v} className="border-b border-border px-3 py-2 text-left font-mono text-xs">
                  {v}
                </th>
              ))}
              {intermediates.map((m) => (
                <th key={m.expr} className="border-b border-border px-3 py-2 text-left font-mono text-xs text-muted-foreground">
                  {m.expr}
                </th>
              ))}
              <th className="border-b border-border px-3 py-2 text-left font-mono text-xs">{parsed.name}</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => {
              const isActive = rows.indexOf(r) === activeIndex;
              return (
                <tr
                  key={i}
                  onClick={() => setValues(r.env)}
                  className={cn(
                    "cursor-pointer hover:bg-muted/60",
                    isActive && "bg-[var(--signal-on)]/15 outline outline-1 outline-[var(--signal-on)]",
                  )}
                >
                  {vars.map((v) => (
                    <td key={v} className="border-b border-border/50 px-3 py-1 font-mono tabular-nums">
                      {r.env[v]}
                    </td>
                  ))}
                  {r.mids.map((m, k) => (
                    <td key={k} className="border-b border-border/50 px-3 py-1 font-mono tabular-nums text-muted-foreground">
                      {m}
                    </td>
                  ))}
                  <td className="border-b border-border/50 px-3 py-1 font-mono font-bold tabular-nums">{r.out}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
