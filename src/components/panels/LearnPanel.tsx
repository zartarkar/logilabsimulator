import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GateShape } from "@/components/circuit/GateShape";
import type { CircuitNodeType } from "@/logic/types";
import { useLang } from "@/i18n";
import { ArrowRight, CircuitBoard, Lightbulb, MousePointerClick, Sigma, CheckCircle2, XCircle, Zap } from "lucide-react";
import { LEARN_QUESTIONS, type LearnQuestion } from "@/logic/learnQuestions";
import { LogicFoundations } from "./LogicFoundations";
import { DigitalLogicChapter } from "./DigitalLogicChapter";
import { QuizLesson } from "./QuizLesson";

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

// Score tracker component
function ScoreBar({ score, totalQuestions, bn }: { score: number; totalQuestions: number; bn: boolean }) {
  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-xs text-muted-foreground">{bn ? "স্কোর" : "Score"}</p>
              <p className="font-bold text-lg">{score}/{totalQuestions * 10}</p>
            </div>
          </div>
        </div>
        <div className="h-2 w-48 bg-muted rounded-lg overflow-hidden" role="progressbar" aria-label={bn ? "স্কোর" : "Score"} aria-valuemin={0} aria-valuemax={totalQuestions * 10} aria-valuenow={score}>
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300"
            style={{ width: `${(score / (totalQuestions * 10)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Question card component
function QuestionCard({
  question,
  onAnswer,
  answered,
  selectedAnswer,
  feedback,
  bn,
}: {
  question: LearnQuestion;
  onAnswer: (index: number) => void;
  answered: boolean;
  selectedAnswer: number | null;
  feedback: string | null;
  bn: boolean;
}) {
  return (
    <div className="space-y-4">
      <QuizLesson questionId={question.id} bn={bn} />
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      <p className="text-xs font-semibold text-primary">
        {bn ? `প্রশ্ন ${question.id} / ${LEARN_QUESTIONS.length}` : `Question ${question.id} / ${LEARN_QUESTIONS.length}`}
        {question.topic && <> · {bn ? question.topic.bn : question.topic.en}</>}
      </p>
      {question.hint && (
        <details className="rounded-lg bg-muted/50 p-3 text-sm">
          <summary className="cursor-pointer font-medium">{bn ? "সাহায্য নেই" : "Take a hint"}</summary>
          <p className="mt-2 leading-7 text-muted-foreground">{bn ? question.hint.bn : question.hint.en}</p>
        </details>
      )}
      {question.id === 17 && (
        <table className="w-full max-w-sm text-center text-sm">
          <caption className="mb-2 text-left text-muted-foreground">{bn ? "এই টেবিল দেখে রাশি বেছে নাও" : "Choose an expression for this table"}</caption>
          <thead><tr>{["A", "B", "F"].map(label => <th key={label} scope="col" className="border-b p-2">{label}</th>)}</tr></thead>
          <tbody>{[[0,0,0],[0,1,1],[1,0,1],[1,1,0]].map((row, index) => <tr key={index}>{row.map((value, column) => <td key={column} className="border-b p-2 font-mono">{value}</td>)}</tr>)}</tbody>
        </table>
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-semibold text-base">{bn ? question.question.bn : question.question.en}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
          {bn ? (question.difficulty === "easy" ? "সহজ" : question.difficulty === "medium" ? "মাঝারি" : "কঠিন") : (question.difficulty === "easy" ? "Easy" : question.difficulty === "medium" ? "Medium" : "Hard")}
        </span>
      </div>

      <div className="grid gap-2">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !answered && onAnswer(idx)}
            disabled={answered}
            className={`px-4 py-3 rounded-lg border-2 text-left font-medium transition ${
              selectedAnswer === idx
                ? answered
                  ? (idx === question.correctAnswerIndex)
                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-950"
                    : "border-red-500 bg-red-50/50 text-red-950"
                  : "border-primary bg-primary/10"
                : answered
                  ? (idx === question.correctAnswerIndex)
                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-950 opacity-100"
                    : "border-border opacity-50"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
            } ${answered ? "cursor-default" : "cursor-pointer"}`}
          >
            <div className="flex items-center justify-between">
              <span>{bn ? option.bn : option.en}</span>
              {answered && selectedAnswer === idx && (
                (idx === question.correctAnswerIndex) ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )
              )}
              {answered && (idx === question.correctAnswerIndex) && selectedAnswer !== idx && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              )}
            </div>
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`rounded-lg p-4 text-sm ${selectedAnswer !== null && selectedAnswer === question.correctAnswerIndex ? "bg-emerald-50/50 border border-emerald-200" : "bg-blue-50/50 border border-blue-200"}`}>
          <p className="font-semibold mb-1">{selectedAnswer !== null && selectedAnswer === question.correctAnswerIndex ? (bn ? "দারুণ!" : "Great!") : (bn ? "ভালো চেষ্টা!" : "Good try!")}</p>
          <p className="text-sm leading-relaxed">{feedback}</p>
        </div>
      )}

      {!answered && (
        <p className="text-xs text-muted-foreground text-center">{bn ? "একটি উত্তর বেছে নিন" : "Select an answer to continue"}</p>
      )}
      </div>
    </div>
  );
}

export function LearnPanel() {
  const { lang } = useLang();
  const bn = lang === "bn";
  const [selectedGate, setSelectedGate] = useState<CircuitNodeType>("AND");
  const [a, setA] = useState<0 | 1>(0);
  const [b, setB] = useState<0 | 1>(0);

  // Scoring state
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [unlockedBadges, setUnlockedBadges] = useState<Set<string>>(new Set());

  const gate = GATES.find((item) => item.gate === selectedGate) ?? GATES[0];
  const output = gateOutput(selectedGate, a, b);

  const handleQuestionAnswer = (questionId: number, answerIdx: number) => {
    if (answeredQuestions.has(questionId)) return;

    const question = LEARN_QUESTIONS.find((q) => q.id === questionId);
    if (!question) return;

    const isCorrect = answerIdx === question.correctAnswerIndex;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerIdx }));
    setAnsweredQuestions((prev) => new Set(prev).add(questionId));

    if (isCorrect) {
      setScore((prev) => prev + 10);

    }

    // Check for badge unlock
    const correctCount = score / 10 + (isCorrect ? 1 : 0);
    if (correctCount === LEARN_QUESTIONS.length && !unlockedBadges.has("all-correct")) {
      setUnlockedBadges((prev) => new Set(prev).add("all-correct"));
    }
  };

  // Glossary data
  const glossary = [
    { term: bn ? "বুলিয়ান বীজগণিত" : "Boolean Algebra", definition: bn ? "যুক্তি এবং সত্য/মিথ্যা নিয়ে কাজ করার গণিত।" : "Mathematics of logic and true/false values." },
    { term: bn ? "Logic Gate" : "Logic Gate", definition: bn ? "একটি ডিজিটাল সার্কিট যা input নিয়ে একটি নিয়ম প্রয়োগ করে output দেয়।" : "A digital circuit that applies a rule to inputs to produce output." },
    { term: bn ? "Truth Table" : "Truth Table", definition: bn ? "সব সম্ভাব্য input combination এবং তাদের output দেখায় এমন টেবিল।" : "A table showing all possible input combinations and their outputs." },
    { term: bn ? "Complement" : "Complement", definition: bn ? "একটি মান এর বিপরীত: 0 থেকে 1, বা 1 থেকে 0।" : "The opposite of a value: 0 becomes 1, 1 becomes 0." },
    { term: bn ? "Expression" : "Expression", definition: bn ? "Logic gates এবং operations ব্যবহার করে একটি circuit লেখার উপায়।" : "A way to write a circuit using gates and operations." },
    { term: bn ? "Simplification" : "Simplification", definition: bn ? "একটি complex expression কে সহজতর এবং ছোট আকারে পরিণত করা।" : "Making a complex expression simpler and smaller." },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6">

      <LogicFoundations bn={bn} />

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

      <DigitalLogicChapter bn={bn} />

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

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <p className="text-xs font-semibold text-primary">{bn ? "পড়া হলো, এবার অনুশীলন" : "You’ve learned it. Now try it."}</p>
        <h2 className="font-display text-2xl font-bold">{bn ? "এবার নিজেকে যাচাই করো" : "Check what you’ve learned"}</h2>
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          {bn ? `উপরের পাঠ থেকেই নিচে ${LEARN_QUESTIONS.length}টি প্রশ্ন আছে। প্রতিটি প্রশ্নে একটি উত্তর বেছে নাও। উত্তর দিলেই সঠিক উত্তর ও তার ব্যাখ্যা দেখতে পাবে।` : `The ${LEARN_QUESTIONS.length} questions below cover the lessons you just read. Choose one answer for each question. You’ll then see the correct answer and an explanation.`}
        </p>
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-primary/10 px-3 py-2 text-primary">{bn ? "সঠিক উত্তরে ১০ নম্বর" : "10 points per correct answer"}</span>
          <span className="rounded-full bg-muted px-3 py-2">{bn ? "ভুল উত্তরে নম্বর কাটবে না" : "No penalty for wrong answers"}</span>
          <span className="rounded-full bg-muted px-3 py-2">{bn ? "সময়ের চাপ নেই" : "No time limit"}</span>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{bn ? "একবার উত্তর দিলে সেই প্রশ্নের উত্তর বদলানো যাবে না। সব প্রশ্ন শেষে আবার চেষ্টা করতে পারবে। নিচের স্কোরে তোমার পাওয়া নম্বর জমবে।" : "Once answered, a question’s answer is locked. After finishing all questions, you can try again. The score below tracks your points."}</p>
      </section>
      <ScoreBar score={score} totalQuestions={LEARN_QUESTIONS.length} bn={bn} />
      {unlockedBadges.size > 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-sm font-semibold text-emerald-900 mb-2">{bn ? "🎉 ব্যাজ আনলক হয়েছে!" : "🎉 Badge Unlocked!"}</p>
          <div className="flex flex-wrap gap-2">
            {unlockedBadges.has("all-correct") && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-semibold">🎯 {bn ? "সব সঠিক" : "All Correct"}</span>
            )}
          </div>
        </div>
      )}
      {LEARN_QUESTIONS.map(q => (
        <QuestionCard key={q.id} question={q}
          onAnswer={(idx) => handleQuestionAnswer(q.id, idx)}
          answered={answeredQuestions.has(q.id)}
          selectedAnswer={selectedAnswers[q.id] ?? null}
          feedback={answeredQuestions.has(q.id) ? (bn ? q.explanation.bn : q.explanation.en) : null}
          bn={bn}
        />
      ))}

      {/* Summary Section */}
      {answeredQuestions.size === LEARN_QUESTIONS.length && (
        <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">{bn ? "🎉 আপনি সব প্রশ্নের উত্তর দিয়েছেন!" : "🎉 You completed all questions!"}</h3>
            <Button variant="outline" onClick={() => {
              setScore(0);
              setAnsweredQuestions(new Set());
              setSelectedAnswers({});
              setUnlockedBadges(new Set());
            }}>{bn ? "আবার চেষ্টা করো" : "Try again"}</Button>
            <div className="text-5xl font-black text-primary">{score}/{LEARN_QUESTIONS.length * 10}</div>
            <p className="text-lg font-semibold">{bn ? `আপনার স্কোর: ${Math.round((score / (LEARN_QUESTIONS.length * 10)) * 100)}%` : `Your Score: ${Math.round((score / (LEARN_QUESTIONS.length * 10)) * 100)}%`}</p>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              {bn 
                ? "দুর্দান্ত! আপনি Boolean logic, gates এবং laws সম্পর্কে শক্তিশালী ভিত্তি তৈরি করেছেন। এখন Challenge সেকশনে গিয়ে বাস্তব circuit তৈরি করে অনুশীলন করুন।"
                : "Excellent! You've built a strong foundation in Boolean logic, gates, and laws. Now practice building circuits in the Challenge section."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
