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
            ? "১. A ও B বোতামে চাপ দিয়ে ইনপুট চালু বা বন্ধ করো। ২. AND অথবা OR বোতাম বেছে নাও। ৩. একই ইনপুটে বাতি ও আউটপুট F কীভাবে বদলায় দেখো।"
            : "1. Tap A and B to turn the inputs on or off. 2. Choose AND or OR. 3. Compare the light and output F for the same inputs."}
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
        <h3 className="mb-3 text-sm font-semibold">
          {bn ? "কোন অপারেশন পরীক্ষা করবে? নিচে চাপো" : "Which operation will you test? Tap below"}
        </h3>
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
                  ? "উভয় ইনপুট 1 হলে বাতি জ্বলে"
                  : "Light on only when both inputs are 1"
                : bn
                  ? "অন্তত একটি ইনপুট 1 হলে বাতি জ্বলে"
                  : "Light on when at least one input is 1"}
              <span className="block font-bold">
                {r}
                {rule === r ? (bn ? " · নির্বাচিত" : " · Selected") : ""}
              </span>
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
        <p className="mt-2 text-xs leading-6 text-muted-foreground" aria-live="polite">
          {bn
            ? `এখন ${rule} নির্বাচিত। A=${Number(switches[0])}, B=${Number(switches[1])}; তাই আউটপুট ${Number(on)} এবং বাতি ${on ? "জ্বলছে" : "নিভে আছে"}।`
            : `${rule} is selected. With A=${Number(switches[0])} and B=${Number(switches[1])}, the output is ${Number(on)} and the light is ${on ? "on" : "off"}.`}
        </p>
      </div>
    </div>
  );
}
