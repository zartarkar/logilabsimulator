import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { GateShape } from "@/components/circuit/GateShape";

export function LogicFoundations({ bn }: { bn: boolean }) {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const [mode, setMode] = useState<"AND" | "OR" | "NOT">("AND");
  const on = mode === "AND" ? a && b : mode === "OR" ? a || b : !a;
  const rule = mode === "AND"
    ? (bn ? "দুটো সুইচই চালু হলে বাতি জ্বলবে।" : "Both switches must be on to light the bulb.")
    : mode === "OR"
    ? (bn ? "যেকোনো একটা সুইচ চালু হলেই বাতি জ্বলবে।" : "Either switch can light the bulb.")
    : (bn ? "উল্টো কাজ করে: সুইচ বন্ধ হলে বাতি জ্বলে।" : "It flips the input: switch off, bulb on.");
  const input = (label: string, value: boolean, toggle: () => void) => (
    <button type="button" aria-pressed={value} onClick={toggle}
      className={`flex min-h-16 w-full flex-wrap items-center justify-center gap-2 rounded-xl border-2 px-2 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${value ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
      <span>{bn ? "সুইচ" : "Switch"} {label}</span>
      <span aria-hidden="true" className={`relative inline-flex h-6 w-10 shrink-0 rounded-full ${value ? "bg-primary" : "bg-muted-foreground/30"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-1"}`} />
      </span>
      <span className="font-mono">{Number(value)}</span>
    </button>
  );
  return (
    <>
      <section data-tour="learn-intro" className="space-y-3 px-1">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">{bn ? "চলো, একটা বাতি জ্বালাই!" : "Let’s light a bulb!"}</h2>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{bn ? "সুইচ চাপো, দেখো কী হয়। কখন বাতি জ্বলবে, সেই নিয়মটাই ঠিক করে লজিক গেট।" : "Tap a switch and see what happens. A logic gate sets the rule for when the bulb lights up."}</p>
        <div className="flex gap-3 text-xs font-medium">
          <span className="rounded-full bg-muted px-3 py-2">{bn ? "0 = বন্ধ / না" : "0 = off / no"}</span>
          <span className="rounded-full bg-primary/10 px-3 py-2 text-primary">{bn ? "1 = চালু / হ্যাঁ" : "1 = on / yes"}</span>
        </div>
      </section>
      <section data-tour="learn-overview" className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label={bn ? "গেট বেছে নাও" : "Choose a gate"}>
          {(["AND", "OR", "NOT"] as const).map(gate => (
            <button type="button" key={gate} aria-pressed={mode === gate} onClick={() => setMode(gate)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${mode === gate ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>
              {gate} · {gate === "AND" ? (bn ? "দুটোই" : "Both") : gate === "OR" ? (bn ? "যেকোনো একটা" : "Either") : (bn ? "উল্টো" : "Opposite")}
            </button>
          ))}
        </div>
        <p className="text-sm font-medium sm:text-base">{rule}</p>
        <div className="grid grid-cols-[minmax(0,1fr)_20px_64px_20px_56px] items-center rounded-xl bg-muted/40 px-2 py-6 sm:grid-cols-[minmax(140px,220px)_1fr_80px_1fr_100px] sm:px-6">
          <div className="space-y-3">
            {input("A", a, () => setA(value => !value))}
            {mode !== "NOT" && input("B", b, () => setB(value => !value))}
          </div>
          <svg viewBox="0 0 40 80" className="h-24 w-full" preserveAspectRatio="none" aria-hidden="true">
            <path d={mode === "NOT" ? "M0 40 H40" : "M0 16 H20 V30 H40"} fill="none" className={a ? "stroke-primary" : "stroke-muted-foreground"} strokeWidth="2" />
            {mode !== "NOT" && <path d="M0 64 H20 V50 H40" fill="none" className={b ? "stroke-primary" : "stroke-muted-foreground"} strokeWidth="2" />}
          </svg>
          <div className="flex flex-col items-center gap-2"><GateShape type={mode} active={on} /><span className="text-xs font-semibold">{mode}</span></div>
          <div aria-hidden="true" className={`h-0.5 w-full ${on ? "bg-primary" : "bg-muted-foreground/40"}`} />
          <output aria-live="polite" className="flex flex-col items-center gap-2 text-center">
            <span className={`flex h-14 w-14 items-center justify-center rounded-full transition sm:h-20 sm:w-20 ${on ? "bg-amber-300/25 text-amber-500 shadow-[0_0_28px_rgba(251,191,36,0.25)]" : "bg-muted text-muted-foreground"}`}>
              <Lightbulb className="h-8 w-8 sm:h-10 sm:w-10" fill={on ? "currentColor" : "none"} aria-hidden="true" />
            </span>
            <span className="text-xs font-semibold">{Number(on)} · {bn ? (on ? "জ্বলছে" : "বন্ধ") : (on ? "On" : "Off")}</span>
          </output>
        </div>
        <p className="text-center text-sm text-muted-foreground">{bn ? "গেট বদলে দেখো—একই সুইচে ফল কীভাবে বদলায়!" : "Try another gate—see how the same switches give a different result!"}</p>
        <details className="rounded-xl border border-border p-4">
          <summary className="cursor-pointer text-sm font-semibold">{bn ? "বইয়ের ভাষায় এটা কীভাবে লিখব?" : "How do we write this as an expression?"}</summary>
          <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
            <p>{bn ? "সুইচ দুটির নাম A ও B। বাতির ফলকে বলি F। এখন যে গেটটি দেখছ, তার রাশি:" : "Call the switches A and B, and the bulb’s result F. For your selected gate:"}</p>
            <p className="rounded-lg bg-muted px-3 py-2 font-mono text-foreground">{mode === "AND" ? "F = A·B" : mode === "OR" ? "F = A+B" : "F = A'"} = {Number(on)}</p>
            <p>{bn ? "· মানে AND, + মানে OR, আর ' মানে NOT। এখানে + সাধারণ যোগ নয়: 1 OR 1-এর ফল 1।" : "· means AND, + means OR, and ' means NOT. Here + is not ordinary addition: 1 OR 1 gives 1."}</p>
            <p>{bn ? "সব সম্ভাব্য সুইচের অবস্থা ও ফল একসঙ্গে লিখলে সেটাই ট্রুথ টেবিল। দুটি সুইচে চারটি অবস্থা: 00, 01, 10, 11।" : "List every switch combination and its result to make a truth table. Two switches have four combinations: 00, 01, 10, 11."}</p>
            <p>{bn ? "এখানে 0/1 দিয়ে বন্ধ/চালু বোঝাচ্ছি। বাস্তব সার্কিটে LOW/HIGH ভোল্টেজ দিয়ে লজিক মান প্রকাশ করা হয়; 0 মানে পুরো ডিভাইস বন্ধ নয়।" : "Here 0/1 represent off/on. Real circuits use LOW/HIGH voltage levels for logic values; 0 does not mean the whole device is unpowered."}</p>
          </div>
        </details>
      </section>
    </>
  );
}
