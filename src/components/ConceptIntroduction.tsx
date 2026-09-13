import { useState } from "react";
import { Lightbulb, ArrowRight, Power } from "lucide-react";

export function ConceptIntroduction({ bn }: { bn: boolean }) {
  const [switches, setSwitches] = useState([false, true]);
  const [rule, setRule] = useState<"AND" | "OR">("AND");
  const on = rule === "AND" ? switches.every(Boolean) : switches.some(Boolean);
  return (
    <div
      data-tour="concept-demo"
      className="grid items-center gap-6 rounded-2xl border border-white bg-white/85 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] lg:grid-cols-[1fr_1.1fr_1fr] lg:p-6"
    >
      <div>
        <p className="text-xs font-semibold text-primary">
          {bn ? "ইন্টার‌্যাক্টিভ উদাহরণ" : "Interactive example"}
        </p>
        <h2 className="mt-2 text-lg font-bold">
          {bn ? "AND ও OR অপারেশন" : "AND and OR operations"}
        </h2>
        <p className="mt-2 text-sm leading-8 text-muted-foreground">
          {bn
            ? "সুইচ A ও B ইনপুট নির্দেশ করে; বাতি আউটপুট F নির্দেশ করে। ইনপুট ও অপারেশন পরিবর্তন করে ফল পর্যবেক্ষণ করো।"
            : "Switches A and B represent inputs; the light represents output F. Change the inputs and operation to observe the result."}
        </p>
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="flex gap-2">
          {switches.map((v, i) => (
            <button
              key={i}
              aria-pressed={v}
              onClick={() => setSwitches(switches.map((x, j) => (i === j ? !x : x)))}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-4 text-xs ${v ? "border-emerald-500 bg-emerald-50" : "bg-slate-50"}`}
            >
              <Power className="h-5 w-5" />
              {bn ? "ইনপুট" : "Input"} {i === 0 ? "A" : "B"}
              <strong>
                {v ? "1" : "0"} · {v ? (bn ? "চালু" : "On") : bn ? "বন্ধ" : "Off"}
              </strong>
            </button>
          ))}
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        <div
          aria-live="polite"
          className={`flex min-w-20 flex-col items-center gap-2 rounded-xl p-3 ${on ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600"}`}
        >
          <Lightbulb className="h-9 w-9" fill={on ? "#fde68a" : "none"} />
          <span className="text-xs font-bold">F = {on ? "1" : "0"}</span>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-2">
          {(["AND", "OR"] as const).map((r) => (
            <button
              key={r}
              aria-pressed={rule === r}
              onClick={() => setRule(r)}
              className={`rounded-lg border px-3 py-2 text-xs leading-6 ${rule === r ? "border-primary bg-primary/5 font-semibold" : "bg-white"}`}
            >
              {r === "AND"
                ? bn
                  ? "উভয় ইনপুট 1"
                  : "Both inputs are 1"
                : bn
                  ? "অন্তত একটি ইনপুট 1"
                  : "At least one input is 1"}
              <span className="block text-muted-foreground">{r}</span>
            </button>
          ))}
        </div>
        <p aria-live="polite" className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-sm leading-6">
          <span className="font-mono">
            F = {rule === "AND" ? "A·B" : "A+B"} = {Number(switches[0])}
            {rule === "AND" ? "·" : "+"}
            {Number(switches[1])} = {Number(on)}
          </span>
        </p>
      </div>
    </div>
  );
}
