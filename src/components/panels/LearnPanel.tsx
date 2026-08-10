import { useState } from "react";
import { Input } from "@/components/ui/input";
import { BookOpen, Lightbulb, Sigma, CircuitBoard, Search } from "lucide-react";

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

const GATES: { gate: string; bn: string; expr: string; rule: string; ruleBn: string }[] = [
  { gate: "AND", bn: "এবং গেট", expr: "F = A · B", rule: "Output 1 only when all inputs are 1.", ruleBn: "সব ইনপুট 1 হলেই আউটপুট 1 (ON)।" },
  { gate: "OR", bn: "অথবা গেট", expr: "F = A + B", rule: "Output 1 when any input is 1.", ruleBn: "যেকোনো একটি ইনপুট 1 হলেই আউটপুট 1।" },
  { gate: "NOT", bn: "নট বা পূরক গেট", expr: "F = A'", rule: "Inverts the input.", ruleBn: "ইনপুটের বিপরীত মান দেয়।" },
  { gate: "NAND", bn: "ন্যান্ড গেট", expr: "F = (A · B)'", rule: "Universal gate — AND followed by NOT.", ruleBn: "সার্বজনীন গেট — AND-এর পর NOT।" },
  { gate: "NOR", bn: "নর গেট", expr: "F = (A + B)'", rule: "Universal gate — OR followed by NOT.", ruleBn: "সার্বজনীন গেট — OR-এর পর NOT।" },
  { gate: "XOR", bn: "এক্সঅর গেট", expr: "F = A ⊕ B = A'B + AB'", rule: "Output 1 when inputs differ.", ruleBn: "ইনপুট দুটি ভিন্ন হলে আউটপুট 1।" },
  { gate: "XNOR", bn: "এক্সনর গেট", expr: "F = (A ⊕ B)' = AB + A'B'", rule: "Output 1 when inputs are equal.", ruleBn: "ইনপুট দুটি সমান হলে আউটপুট 1।" },
];

const POINTERS: { en: string; bn: string }[] = [
  {
    en: "NAND and NOR are universal gates — any circuit can be built using only NAND or only NOR.",
    bn: "NAND ও NOR সার্বজনীন গেট — শুধু NAND অথবা শুধু NOR দিয়েই যেকোনো বর্তনী তৈরি করা যায়।",
  },
  {
    en: "A truth table with n variables has 2ⁿ rows.",
    bn: "n সংখ্যক চলকের সত্যক সারণিতে (truth table) 2ⁿ টি সারি থাকে।",
  },
  {
    en: "SOP (Sum of Products) is built from the rows where output = 1; POS (Product of Sums) from rows where output = 0.",
    bn: "SOP (গুণফলের যোগ) নেওয়া হয় আউটপুট 1 এর সারি থেকে; POS (যোগফলের গুণ) নেওয়া হয় আউটপুট 0 এর সারি থেকে।",
  },
  {
    en: "Minterm = product term for a 1-row; Maxterm = sum term for a 0-row.",
    bn: "মিনটার্ম = আউটপুট 1 সারির গুণফল পদ; ম্যাক্সটার্ম = আউটপুট 0 সারির যোগফল পদ।",
  },
  {
    en: "Apply De Morgan by breaking the bar and changing the sign: break the line, change the sign.",
    bn: "ডি মরগ্যান প্রয়োগের নিয়ম — দাগ ভাঙো, চিহ্ন বদলাও (break the line, change the sign)।",
  },
  {
    en: "Precedence: NOT → AND → XOR → OR. Use brackets whenever you are unsure.",
    bn: "অগ্রাধিকার ক্রম: NOT → AND → XOR → OR। সন্দেহ হলে বন্ধনী ব্যবহার করো।",
  },
  {
    en: "Simplifying reduces gate count, cost and propagation delay of the circuit.",
    bn: "সরলীকরণ করলে গেট সংখ্যা, খরচ ও বিলম্ব (propagation delay) কমে যায়।",
  },
  {
    en: "Half adder: Sum = A ⊕ B, Carry = A · B. Full adder: Sum = A ⊕ B ⊕ Cin.",
    bn: "হাফ অ্যাডার: যোগফল = A ⊕ B, ক্যারি = A · B। ফুল অ্যাডার: যোগফল = A ⊕ B ⊕ Cin।",
  },
];

const GLOSSARY: { en: string; bn: string }[] = [
  { en: "Boolean Algebra", bn: "বুলিয়ান বীজগণিত" },
  { en: "Logic Gate", bn: "লজিক গেট / যুক্তি দ্বার" },
  { en: "Truth Table", bn: "সত্যক সারণি" },
  { en: "Complement / Inversion", bn: "পূরক / বিপরীতকরণ" },
  { en: "Variable", bn: "চলক" },
  { en: "Expression", bn: "রাশি" },
  { en: "Sum of Products (SOP)", bn: "গুণফলের যোগ" },
  { en: "Product of Sums (POS)", bn: "যোগফলের গুণ" },
  { en: "Minterm / Maxterm", bn: "মিনটার্ম / ম্যাক্সটার্ম" },
  { en: "Universal Gate", bn: "সার্বজনীন গেট" },
  { en: "Simplification", bn: "সরলীকরণ" },
  { en: "Karnaugh Map", bn: "কার্নো ম্যাপ" },
  { en: "Adder", bn: "যোগকারী বর্তনী" },
  { en: "Encoder / Decoder", bn: "এনকোডার / ডিকোডার" },
];

export function LearnPanel() {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const match = (...parts: string[]) => !needle || parts.join(" ").toLowerCase().includes(needle);

  const laws = LAWS.filter((l) => match(l.name, l.bn, l.forms.join(" "), l.note, l.noteBn));
  const gates = GATES.filter((g) => match(g.gate, g.bn, g.expr, g.rule, g.ruleBn));
  const pointers = POINTERS.filter((p) => match(p.en, p.bn));
  const glossary = GLOSSARY.filter((g) => match(g.en, g.bn));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Learn Boolean Logic</h2>
          <p className="text-sm text-muted-foreground">
            বুলিয়ান যুক্তি শিখো — laws, gates and key pointers in English &amp; বাংলা.
          </p>
        </div>
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search / খুঁজুন…"
            className="pl-8"
          />
        </div>
      </div>

      <section className="mb-8">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <Sigma className="h-4 w-4 text-primary" /> Boolean Laws · বুলিয়ান সূত্রাবলি
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {laws.map((l) => (
            <article key={l.name} className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <div className="font-semibold">{l.name}</div>
              <div className="text-sm text-primary">{l.bn}</div>
              <div className="mt-2 space-y-1">
                {l.forms.map((f) => (
                  <div key={f} className="rounded-md bg-muted px-2 py-1 font-mono text-sm">
                    {f}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{l.note}</p>
              <p className="text-xs text-muted-foreground">{l.noteBn}</p>
            </article>
          ))}
          {laws.length === 0 && <p className="text-sm text-muted-foreground">No matching law.</p>}
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <CircuitBoard className="h-4 w-4 text-primary" /> Gates at a glance · গেট পরিচিতি
        </h3>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-2">Gate · গেট</th>
                <th className="p-2">Expression</th>
                <th className="p-2">Rule · নিয়ম</th>
              </tr>
            </thead>
            <tbody>
              {gates.map((g) => (
                <tr key={g.gate} className="border-t border-border">
                  <td className="p-2 font-semibold">
                    {g.gate}
                    <div className="text-xs font-normal text-muted-foreground">{g.bn}</div>
                  </td>
                  <td className="p-2 font-mono text-xs">{g.expr}</td>
                  <td className="p-2 text-xs">
                    {g.rule}
                    <div className="text-muted-foreground">{g.ruleBn}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <Lightbulb className="h-4 w-4 text-primary" /> Key pointers · গুরুত্বপূর্ণ পয়েন্ট
        </h3>
        <ul className="space-y-2">
          {pointers.map((p) => (
            <li key={p.en} className="rounded-xl border border-border bg-card p-3 text-sm shadow-sm">
              {p.en}
              <div className="text-muted-foreground">{p.bn}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-4">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <BookOpen className="h-4 w-4 text-primary" /> Glossary · পরিভাষা
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {glossary.map((g) => (
            <div key={g.en} className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
              <span className="font-medium">{g.en}</span>
              <span className="text-muted-foreground"> — {g.bn}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
