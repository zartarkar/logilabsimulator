import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GateShape } from "@/components/circuit/GateShape";
import type { CircuitNodeType } from "@/logic/types";
import { useLang } from "@/i18n";
import { ArrowRight, Binary, BookOpen, CircuitBoard, Lightbulb, MousePointerClick, Sigma } from "lucide-react";

interface Law {
  name: string;
  bn: string;
  forms: string[];
  note: string;
  noteBn: string;
}

const LAWS: Law[] = [
  {
    name: "De Morgan's First Theorem",
    bn: "ডি মরগ্যানের প্রথম সূত্র",
    forms: ["(A + B)' = A' · B'", "NOT(A OR B) = NOT A AND NOT B"],
    note: "The complement of a sum equals the product of the complements.",
    noteBn: "যোগফলের পূরক (complement) = আলাদা আলাদা পূরকের গুণফল।",
  },
  {
    name: "De Morgan's Second Theorem",
    bn: "ডি মরগ্যানের দ্বিতীয় সূত্র",
    forms: ["(A · B)' = A' + B'", "NOT(A AND B) = NOT A OR NOT B"],
    note: "The complement of a product equals the sum of the complements.",
    noteBn: "গুণফলের পূরক = আলাদা আলাদা পূরকের যোগফল।",
  },
  {
    name: "Commutative Law",
    bn: "বিনিময় সূত্র",
    forms: ["A + B = B + A", "A · B = B · A"],
    note: "Order of the variables does not change the result.",
    noteBn: "চলকের ক্রম বদলালেও ফলাফল বদলায় না।",
  },
  {
    name: "Associative Law",
    bn: "সংযোগ সূত্র",
    forms: ["(A + B) + C = A + (B + C)", "(A · B) · C = A · (B · C)"],
    note: "Grouping of the variables does not change the result.",
    noteBn: "বন্ধনীর গ্রুপিং বদলালেও ফলাফল একই থাকে।",
  },
  {
    name: "Distributive Law",
    bn: "বণ্টন সূত্র",
    forms: ["A · (B + C) = A·B + A·C", "A + (B · C) = (A + B)·(A + C)"],
    note: "AND distributes over OR, and (uniquely in Boolean algebra) OR distributes over AND.",
    noteBn: "AND, OR-এর উপর বণ্টিত হয়; বুলিয়ান বীজগণিতে OR-ও AND-এর উপর বণ্টিত হয়।",
  },
  {
    name: "Identity Law",
    bn: "অভেদ সূত্র",
    forms: ["A + 0 = A", "A · 1 = A"],
    note: "0 is the identity for OR, 1 is the identity for AND.",
    noteBn: "OR-এর অভেদ উপাদান 0, AND-এর অভেদ উপাদান 1।",
  },
  {
    name: "Null / Dominance Law",
    bn: "শূন্য বা আধিপত্য সূত্র",
    forms: ["A + 1 = 1", "A · 0 = 0"],
    note: "1 dominates OR, 0 dominates AND.",
    noteBn: "OR-এ 1 এবং AND-এ 0 ফলাফল নির্ধারণ করে দেয়।",
  },
  {
    name: "Idempotent Law",
    bn: "সমঘাত সূত্র",
    forms: ["A + A = A", "A · A = A"],
    note: "Repeating a variable adds nothing new.",
    noteBn: "একই চলক বারবার নিলে নতুন কিছু যোগ হয় না।",
  },
  {
    name: "Complement Law",
    bn: "পূরক সূত্র",
    forms: ["A + A' = 1", "A · A' = 0"],
    note: "A variable and its complement cover everything / nothing.",
    noteBn: "চলক ও তার পূরক একসাথে সব (1) অথবা কিছুই না (0) দেয়।",
  },
  {
    name: "Involution / Double Negation",
    bn: "দ্বৈত পূরক সূত্র",
    forms: ["(A')' = A"],
    note: "Complementing twice returns the original value.",
    noteBn: "দুইবার পূরক নিলে আগের মানই ফিরে আসে।",
  },
  {
    name: "Absorption Law",
    bn: "শোষণ সূত্র",
    forms: ["A + A·B = A", "A · (A + B) = A"],
    note: "The larger term absorbs the smaller one.",
    noteBn: "বড় পদ ছোট পদকে শোষণ করে নেয়।",
  },
  {
    name: "Redundancy / Consensus",
    bn: "অতিরিক্ততা সূত্র",
    forms: ["A·B + A'·C + B·C = A·B + A'·C"],
    note: "The consensus term B·C is redundant and can be dropped.",
    noteBn: "B·C পদটি অপ্রয়োজনীয়, তাই বাদ দেওয়া যায়।",
  },
];

const GATES: { gate: CircuitNodeType; bn: string; en: string; expr: string; simpleBn: string; simpleEn: string }[] = [
  { gate: "AND", bn: "এবং", en: "all inputs", expr: "F = A · B", simpleBn: "A ও B দুটিই 1 হলে ফল 1", simpleEn: "The result is 1 only when both A and B are 1." },
  { gate: "OR", bn: "অথবা", en: "any input", expr: "F = A + B", simpleBn: "অন্তত একটি input 1 হলে ফল 1", simpleEn: "The result is 1 when at least one input is 1." },
  { gate: "NOT", bn: "বিপরীত", en: "opposite", expr: "F = A'", simpleBn: "Input উল্টে দেয়: 0→1, 1→0", simpleEn: "It reverses the input: 0→1 and 1→0." },
  { gate: "NAND", bn: "AND-এর বিপরীত", en: "opposite of AND", expr: "F = (A · B)'", simpleBn: "AND-এর ফল উল্টে দেয়", simpleEn: "It reverses the result of AND." },
  { gate: "NOR", bn: "OR-এর বিপরীত", en: "opposite of OR", expr: "F = (A + B)'", simpleBn: "OR-এর ফল উল্টে দেয়", simpleEn: "It reverses the result of OR." },
  { gate: "XOR", bn: "ভিন্ন কি না", en: "inputs differ", expr: "F = A ⊕ B", simpleBn: "দুটি input ভিন্ন হলে ফল 1", simpleEn: "The result is 1 when the two inputs are different." },
  { gate: "XNOR", bn: "একই কি না", en: "inputs match", expr: "F = (A ⊕ B)'", simpleBn: "দুটি input একই হলে ফল 1", simpleEn: "The result is 1 when the two inputs are equal." },
];

function gateOutput(gate: CircuitNodeType, a: 0 | 1, b: 0 | 1): 0 | 1 {
  if (gate === "NOT") return a ? 0 : 1;
  if (gate === "AND") return a && b ? 1 : 0;
  if (gate === "OR") return a || b ? 1 : 0;
  if (gate === "NAND") return a && b ? 0 : 1;
  if (gate === "NOR") return a || b ? 0 : 1;
  if (gate === "XOR") return a !== b ? 1 : 0;
  return a === b ? 1 : 0;
}

export function LearnPanel() {
  const { lang } = useLang();
  const bn = lang === "bn";
  const [selectedGate, setSelectedGate] = useState<CircuitNodeType>("AND");
  const [a, setA] = useState<0 | 1>(0);
  const [b, setB] = useState<0 | 1>(0);
  const gate = GATES.find((item) => item.gate === selectedGate) ?? GATES[0];
  const output = gateOutput(selectedGate, a, b);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">
      <div data-tour="learn-intro" className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-7">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <BookOpen className="h-3.5 w-3.5" /> {bn ? "একদম শুরু থেকে" : "Start from zero"}
        </div>
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{bn ? "ডিজিটাল লজিক আসলে কী?" : "What is digital logic?"}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {bn ? <>কম্পিউটার বিদ্যুৎ আছে বা নেই, এই দুই অবস্থা দিয়ে সিদ্ধান্ত নেয়। আমরা এগুলোকে <strong className="text-foreground">1 (ON/সত্য)</strong> এবং <strong className="text-foreground">0 (OFF/মিথ্যা)</strong> বলি। Logic gate হলো ছোট একটি সিদ্ধান্ত যন্ত্র। এটি input নেয়, একটি নিয়ম প্রয়োগ করে, তারপর output দেয়।</> : <>A computer makes decisions using two electrical states: on and off. We call them <strong className="text-foreground">1 (ON/true)</strong> and <strong className="text-foreground">0 (OFF/false)</strong>. A logic gate is a tiny decision-making device. It receives inputs, applies a rule, and produces an output.</>}
        </p>
      </div>

      <section data-tour="learn-overview">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><Binary className="h-5 w-5 text-primary" /> {bn ? "চারটি ধারণায় পুরো অধ্যায়" : "The chapter in four ideas"}</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["1", "Input", bn ? "A, B, C হলো switch-এর মতো input variable" : "A, B, and C are input variables that behave like switches."],
            ["2", "Gate", bn ? "AND, OR, NOT input-এর উপর নিয়ম চালায়" : "AND, OR, and NOT apply rules to the inputs."],
            ["3", "Expression", bn ? "A·B বা A+B হলো circuit লেখার সংক্ষিপ্ত ভাষা" : "A·B and A+B are short ways to describe a circuit."],
            ["4", "Output", bn ? "সব gate পেরিয়ে শেষ ফল F = 0 অথবা 1" : "After passing through the gates, the final output F is 0 or 1."],
          ].map(([n, title, text]) => (
            <article key={n} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <span className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{n}</span>
              <h4 className="font-semibold">{title}</h4><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section data-tour="learn-gates">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <MousePointerClick className="h-5 w-5 text-primary" /> {bn ? "নিজে চাপ দিয়ে Gate বোঝো" : "Try the gates yourself"}
        </h3>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-5 flex flex-wrap gap-2">
            {GATES.map((item) => <Button key={item.gate} size="sm" variant={selectedGate === item.gate ? "default" : "outline"} onClick={() => setSelectedGate(item.gate)}>{item.gate}</Button>)}
          </div>
          <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
            <div className="flex justify-center gap-3">
              <button onClick={() => setA(a ? 0 : 1)} className={`rounded-xl border px-6 py-4 font-mono font-bold transition ${a ? "border-primary bg-primary text-primary-foreground" : "bg-muted"}`}>A = {a}</button>
              {selectedGate !== "NOT" && <button onClick={() => setB(b ? 0 : 1)} className={`rounded-xl border px-6 py-4 font-mono font-bold transition ${b ? "border-primary bg-primary text-primary-foreground" : "bg-muted"}`}>B = {b}</button>}
            </div>
            <div className="flex items-center justify-center gap-3"><ArrowRight className="h-5 w-5 text-muted-foreground" /><GateShape type={selectedGate} active={output === 1} /><ArrowRight className="h-5 w-5 text-muted-foreground" /></div>
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 text-2xl font-black transition ${output ? "border-emerald-500 bg-emerald-500/15 text-emerald-600" : "border-muted bg-muted text-muted-foreground"}`}>F={output}</div>
          </div>
          <div className="mt-5 rounded-xl bg-muted/60 p-3 text-center"><strong>{gate.gate} ({bn ? gate.bn : gate.en})</strong><div className="font-mono text-sm text-primary">{gate.expr}</div><p className="text-xs text-muted-foreground">{bn ? gate.simpleBn : gate.simpleEn}</p></div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-4"><h3 className="mb-2 flex items-center gap-2 font-bold"><CircuitBoard className="h-4 w-4 text-primary" /> {bn ? "Expression কীভাবে পড়বে?" : "How do you read an expression?"}</h3><div className="space-y-2 text-sm"><p><code className="rounded bg-muted px-1">A'</code> = {bn ? "A নয়" : "NOT A"}</p><p><code className="rounded bg-muted px-1">A·B</code> {bn ? "বা" : "or"} <code className="rounded bg-muted px-1">AB</code> = A AND B</p><p><code className="rounded bg-muted px-1">A+B</code> = A OR B</p><p className="text-xs text-muted-foreground">{bn ? "ক্রম: প্রথমে বন্ধনী → NOT → AND → XOR → OR" : "Order: brackets → NOT → AND → XOR → OR"}</p></div></article>
        <article className="rounded-xl border border-border bg-card p-4"><h3 className="mb-2 flex items-center gap-2 font-bold"><Lightbulb className="h-4 w-4 text-primary" /> {bn ? "Truth table কী?" : "What is a truth table?"}</h3><p className="text-sm leading-relaxed text-muted-foreground">{bn ? "Input-এর সম্ভাব্য সব combination এবং প্রতিটির output একসাথে দেখানো table। দুইটি input হলে combination: 00, 01, 10, 11। অর্থাৎ 2² = 4টি row। তিনটি input হলে 2³ = 8টি row।" : "A truth table lists every possible input combination and its output. Two inputs produce 00, 01, 10, and 11, so 2² = 4 rows. Three inputs produce 2³ = 8 rows."}</p></article>
      </section>

      <section data-tour="learn-laws">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <Sigma className="h-5 w-5 text-primary" /> {bn ? "প্রয়োজনীয় Boolean Laws" : "Essential Boolean laws"}
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">{bn ? "একসাথে সব মুখস্থ নয়। নাম চাপলে সূত্র ও সহজ ব্যাখ্যা দেখো।" : "Do not memorize everything at once. Select a law to see its formula and explanation."}</p>
        <div className="grid items-start gap-2 sm:grid-cols-2">
          {LAWS.map((law) => (
            <details key={law.name} className="group self-start rounded-xl border border-border bg-card p-3 shadow-sm open:border-primary/30">
              <summary className="cursor-pointer select-none caret-transparent font-semibold outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm">{bn ? law.bn : law.name}{bn && <span className="ml-2 text-xs font-normal text-muted-foreground">{law.name}</span>}</summary>
              <div className="mt-3 space-y-1">{law.forms.map((form) => <div key={form} className="rounded-md bg-muted px-2 py-1 font-mono text-sm">{form}</div>)}</div>
              <p className="mt-2 text-xs text-muted-foreground">{bn ? law.noteBn : law.note}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
