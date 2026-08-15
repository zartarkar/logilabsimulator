import { useMemo, useState } from "react";
import { useCircuitStore } from "@/store/useCircuitStore";
import { traceAst } from "@/logic/evaluator";
import { Button } from "@/components/ui/button";

const WORD: Record<string, string> = {
  AND: "AND — output is 1 only when every input is 1",
  OR: "OR — output is 1 when at least one input is 1",
  NOT: "NOT — output is the inverse of the input",
  XOR: "XOR — output is 1 when an odd number of inputs are 1",
  XNOR: "XNOR — output is 1 when an even number of inputs are 1",
  NAND: "NAND — inverse of AND",
  NOR: "NOR — inverse of OR",
  BUFFER: "BUFFER — output equals input",
};

const SYM: Record<string, string> = { AND: " × ", OR: " + ", XOR: " ⊕ ", XNOR: " ⊙ ", NAND: " NAND ", NOR: " NOR " };

export function CalculationPanel() {
  const { parsed, values } = useCircuitStore();
  const [beginner, setBeginner] = useState(true);
  const steps = useMemo(() => (parsed ? traceAst(parsed.ast, values) : []), [parsed, values]);

  if (!parsed) return <p className="p-4 text-sm text-muted-foreground">Parse an expression to see the calculation.</p>;

  return (
    <div className="space-y-3 p-4">
      <div className="flex gap-2">
        <Button size="sm" variant={beginner ? "default" : "outline"} onClick={() => setBeginner(true)} className={beginner ? "button-red" : ""}>
          Beginner
        </Button>
        <Button size="sm" variant={!beginner ? "default" : "outline"} onClick={() => setBeginner(false)} className={!beginner ? "button-red" : ""}>
          Compact
        </Button>
      </div>
      <div className="rounded-lg border border-border bg-card p-3 font-mono text-sm">
        {parsed.variables.map((v) => (
          <div key={v}>
            {v} = {values[v] ?? 0}
          </div>
        ))}
      </div>
      <ol className="space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="rounded-lg border border-border bg-card p-3 text-sm">
            <div className="font-mono">
              {s.expr} = {s.inputs.map((x) => x.value).join(s.kind === "NOT" ? "" : (SYM[s.kind] ?? ", "))}
              {s.kind === "NOT" ? "'" : ""} = <strong>{s.value}</strong>
            </div>
            {beginner && <p className="mt-1 text-xs text-muted-foreground">{WORD[s.kind]}</p>}
          </li>
        ))}
      </ol>
      <div className="rounded-lg border-2 border-[var(--signal-on)]/50 bg-[var(--signal-on)]/10 p-3 font-mono text-sm font-bold">
        {parsed.name} = {steps.length ? steps[steps.length - 1]!.value : (values[parsed.variables[0] ?? ""] ?? 0)}{" "}
        <span className="ml-2">
          ({(steps.length ? steps[steps.length - 1]!.value : 0) === 1 ? "ON" : "OFF"})
        </span>
      </div>
    </div>
  );
}
