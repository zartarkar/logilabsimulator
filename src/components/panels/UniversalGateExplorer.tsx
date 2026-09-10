import { useState } from "react";
import { GateShape } from "@/components/circuit/GateShape";

type Target = "NOT" | "AND" | "OR";
type Family = "NAND" | "NOR";

export function UniversalGateExplorer({ bn }: { bn: boolean }) {
  const [target, setTarget] = useState<Target>("NOT");
  const [a, setA] = useState<0 | 1>(0);
  const [b, setB] = useState<0 | 1>(1);
  const result = target === "NOT" ? Number(!a) : target === "AND" ? a & b : a | b;
  const build = (family: Family) => {
    const gate = (x: number, y: number) => family === "NAND" ? Number(!(x && y)) : Number(!(x || y));
    const invertA = gate(a, a);
    const invertB = gate(b, b);
    const combined = gate(a, b);
    if (target === "NOT") return [{ inputs: "A, A", output: "F", x: a, y: a, value: invertA }];
    if ((target === "AND" && family === "NAND") || (target === "OR" && family === "NOR")) return [
      { inputs: "A, B", output: "P", x: a, y: b, value: combined },
      { inputs: "P, P", output: "F", x: combined, y: combined, value: gate(combined, combined) },
    ];
    return [
      { inputs: "A, A", output: "P", x: a, y: a, value: invertA },
      { inputs: "B, B", output: "Q", x: b, y: b, value: invertB },
      { inputs: "P, Q", output: "F", x: invertA, y: invertB, value: gate(invertA, invertB) },
    ];
  };
  return (
    <section className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-primary">{bn ? "নিজে করে দেখি" : "Try it yourself"}</p>
        <h3 className="text-xl font-bold">{bn ? "এক ধরনের গেট, তিন রকম কাজ" : "One gate type, three jobs"}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{bn ? "কোন গেট বানাতে চাও? বেছে নাও, তারপর ধাপগুলো দেখো।" : "Choose the gate you want to build, then follow the steps."}</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={bn ? "যে গেট বানাবে" : "Gate to build"}>
        {(["NOT", "AND", "OR"] as const).map(type => <button type="button" key={type} aria-pressed={target === type} onClick={() => setTarget(type)} className={`rounded-lg border px-5 py-2.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${target === type ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted"}`}>{type} {bn ? "বানাই" : "gate"}</button>)}
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-muted/60 p-3">
        <span className="text-sm text-muted-foreground">{bn ? "ইনপুট বদলাও:" : "Change inputs:"}</span>
        <button type="button" aria-pressed={a === 1} onClick={() => setA(a ? 0 : 1)} className="rounded-lg border border-border bg-card px-4 py-2 font-mono text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">A = {a}</button>
        {target !== "NOT" && <button type="button" aria-pressed={b === 1} onClick={() => setB(b ? 0 : 1)} className="rounded-lg border border-border bg-card px-4 py-2 font-mono text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">B = {b}</button>}
        <output aria-live="polite" className="text-sm font-semibold text-primary">{target}: F = {result}</output>
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        {(["NAND", "NOR"] as const).map(family => {
          const steps = build(family);
          return <article key={family} className="overflow-hidden rounded-xl border border-border bg-background">
            <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-3">
              <h4 className="font-bold">{bn ? "শুধু" : "Only"} {family}</h4>
              <span className="rounded-full bg-card px-2.5 py-1 text-xs text-muted-foreground">{steps.length} {bn ? "টি গেট" : steps.length === 1 ? "gate" : "gates"}</span>
            </div>
            <ol className="space-y-4 p-4">
              {steps.map((step, index) => <li key={step.output} className="space-y-3">
                <div className="flex items-center gap-2 text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{index + 1}</span><span>{step.inputs} <span className="text-muted-foreground">{bn ? "ইনপুটে দাও" : "go into the inputs"}</span></span></div>
                <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-4">
                  <div className="font-mono text-sm leading-7"><div>{step.inputs.split(", ")[0]} = {step.x}</div><div>{step.inputs.split(", ")[1]} = {step.y}</div></div>
                  <span aria-hidden="true" className="text-muted-foreground">→</span>
                  <GateShape type={family} active={step.value === 1} />
                  <span aria-hidden="true" className="text-muted-foreground">→</span>
                  <span className={`rounded-lg px-2 py-2 font-mono text-sm font-bold ${step.value ? "bg-primary/10 text-primary" : "bg-card text-muted-foreground"}`}>{step.output}={step.value}</span>
                </div>
                <p className="break-words font-mono text-xs leading-6 text-muted-foreground">{step.output} = {step.inputs.split(", ").join(` ${family} `)} = {step.value}</p>
              </li>)}
            </ol>
            <div className="border-t border-border bg-primary/5 px-4 py-3 text-sm"><strong className="text-primary">F = {steps[steps.length - 1]!.value}</strong><span className="ml-2 text-muted-foreground">{bn ? `${target} গেটের মতোই ফল` : `Same result as ${target}`}</span></div>
          </article>;
        })}
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{target === "NOT" ? (bn ? "একই A দুই ইনপুটে দিলে NAND ও NOR—দুটিই A-এর উল্টো মান দেয়।" : "Feed A into both inputs: either NAND or NOR flips A.") : (bn ? "P ও Q হলো আগের ধাপের ফল। এগুলোই পরের গেটের ইনপুট—নতুন সুইচ নয়।" : "P and Q are results from earlier steps. They feed the next gate; they are not new switches.")}</p>
    </section>
  );
}
