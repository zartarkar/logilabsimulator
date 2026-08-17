import { Button } from "@/components/ui/button";
import { useCircuitStore } from "@/store/useCircuitStore";
import { cn } from "@/lib/utils";
import { useLang } from "@/i18n";

export function InputsPanel() {
  const { parsed, values, setValue } = useCircuitStore();
  const { t } = useLang();
  if (!parsed) return <p className="p-4 text-sm text-muted-foreground">{t("parseFirst")}</p>;

  return (
    <div className="p-3">
      {/* Buttons removed to keep focus on truth table and simplification in current layout */}
      <ul className="flex max-w-full gap-2 overflow-x-auto pb-1">
        {parsed.variables.map((v) => {
          const on = values[v] === 1;
          return (
            <li key={v} className="shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.currentTarget.blur();
                  setValue(v, on ? 0 : 1);
                }}
                aria-pressed={on}
                aria-label={`Variable ${v} is ${on ? 1 : 0}, click to toggle`}
                className={cn(
                  "h-9 gap-2 border-2 px-2.5 text-left",
                  on ? "border-[var(--signal-on)] bg-[var(--signal-on)]/10" : "border-border bg-card",
                )}
              >
                <span className="font-mono text-sm font-semibold">{v}</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-5 w-9 items-center rounded-full p-0.5 transition-all",
                      on ? "justify-end bg-[var(--signal-on)]" : "justify-start bg-muted",
                    )}
                  >
                    <span className="h-4 w-4 rounded-full bg-background shadow" />
                  </span>
                  <span className="w-3 font-mono text-xs font-bold tabular-nums">{on ? 1 : 0}</span>
                </span>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
