import { Button } from "@/components/ui/button";
import { useCircuitStore } from "@/store/useCircuitStore";
import { cn } from "@/lib/utils";
import { Shuffle, RotateCcw, CheckCheck } from "lucide-react";
import { useLang } from "@/i18n";

export function InputsPanel() {
  const { parsed, values, setValue, randomize, setAll } = useCircuitStore();
  const { t } = useLang();
  if (!parsed) return <p className="p-4 text-sm text-muted-foreground">{t("parseFirst")}</p>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={randomize}>
          <Shuffle className="mr-1 h-3.5 w-3.5" /> {t("randomize")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setAll(0)}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" /> {t("all0")}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setAll(1)}>
          <CheckCheck className="mr-1 h-3.5 w-3.5" /> {t("all1")}
        </Button>
      </div>
      <ul className="space-y-2">
        {parsed.variables.map((v) => {
          const on = values[v] === 1;
          return (
            <li key={v}>
              <button
                onClick={(e) => {
                  e.currentTarget.blur();
                  setValue(v, on ? 0 : 1);
                }}
                aria-pressed={on}
                aria-label={`Variable ${v} is ${on ? 1 : 0}, click to toggle`}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border-2 px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  on ? "border-[var(--signal-on)] bg-[var(--signal-on)]/10" : "border-border bg-card",
                )}
              >
                <span className="font-mono text-sm font-semibold">{v}</span>
                <span className="flex items-center gap-2">
                  <span className={cn("text-[11px] font-semibold", on ? "text-[var(--signal-on)]" : "text-muted-foreground")}>
                    {on ? "ON" : "OFF"}
                  </span>
                  <span
                    className={cn(
                      "flex h-6 w-11 items-center rounded-full p-0.5 transition-all",
                      on ? "justify-end bg-[var(--signal-on)]" : "justify-start bg-muted",
                    )}
                  >
                    <span className="h-5 w-5 rounded-full bg-background shadow" />
                  </span>
                  <span className="w-3 font-mono text-sm font-bold tabular-nums">{on ? 1 : 0}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
