import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLang } from "@/i18n";
import {
  BOOLEAN_LAWS,
  gateValue,
  inputRows,
  universalNetwork,
  type Gate,
} from "@/logic/lessonCurriculum";
import { UniversalGateBasics } from "@/components/UniversalGateBasics";
import { Circuit } from "@/components/LessonVisual";
import { ConceptIntroduction } from "@/components/ConceptIntroduction";
import {
  BookOpenCheck,
  Table2,
  Sigma,
  GitBranch,
  Layers,
  CircuitBoard,
  ChevronDown,
} from "lucide-react";
import { GateShape } from "@/components/circuit/GateShape";

const gates: Gate[] = ["AND", "OR", "NOT", "NAND", "NOR", "XOR", "XNOR"];
const formulas = ["AB", "A+B", "A′", "(AB)′", "(A+B)′", "A′B+AB′", "AB+A′B′"];
const meanings = [
  ["Output is 1 only when both inputs are 1.", "উভয় ইনপুট 1 হলেই আউটপুট 1; অন্যথায় ০।"],
  [
    "Output is 1 when at least one input is 1.",
    "অন্তত একটি ইনপুট 1 হলে আউটপুট 1; উভয় ইনপুট ০ হলে ০।",
  ],
  ["Output is the complement of input A.", "আউটপুট ইনপুট A এর পূরক: ০ হলে 1, 1 হলে ০।"],
  ["Output is the complement of AND.", "AND এর পূরক: উভয় ইনপুট 1 হলে আউটপুট ০; অন্যথায় 1।"],
  ["Output is the complement of OR.", "OR এর পূরক: উভয় ইনপুট ০ হলে আউটপুট 1; অন্যথায় ০।"],
  ["Output is 1 when the two inputs differ.", "দুটি ইনপুটের মান ভিন্ন হলে আউটপুট 1; একই হলে ০।"],
  ["Output is 1 when the two inputs agree.", "দুটি ইনপুটের মান একই হলে আউটপুট 1; ভিন্ন হলে ০।"],
];
const notes = [
  [
    "OR with 0 or AND with 1 leaves the variable unchanged.",
    "কোনো চলকের সঙ্গে ০ এর OR অথবা 1 এর AND করলে চলকটির মান অপরিবর্তিত থাকে।",
  ],
  [
    "A variable and its complement have opposite values. Their OR is always 1 and their AND is always 0.",
    "একটি চলক ও তার পূরকের মান বিপরীত। তাই তাদের যৌক্তিক যোগফল সর্বদা 1 এবং যৌক্তিক গুণফল সর্বদা ০।",
  ],
  [
    "OR or AND of a variable with itself equals that variable. Boolean addition differs from arithmetic addition.",
    "একই চলকের সঙ্গে OR বা AND করলে সেই চলকই পাওয়া যায়। বুলিয়ান যোগ সাধারণ গাণিতিক যোগ নয়; এখানে 1+1=1।",
  ],
  [
    "OR with 1 always produces 1; AND with 0 always produces 0.",
    "কোনো চলকের সঙ্গে 1 এর OR করলে ফল সর্বদা 1; ০ এর AND করলে ফল সর্বদা ০।",
  ],
  [
    "Changing the order of operands does not change an AND or OR result.",
    "AND বা OR অপারেশনে চলকগুলোর ক্রম পরিবর্তন করলে ফল পরিবর্তিত হয় না।",
  ],
  [
    "For the same operation, changing the grouping of variables does not change the result.",
    "একই অপারেশনের ক্ষেত্রে বন্ধনী দিয়ে চলকগুলোর গ্রুপ পরিবর্তন করলেও ফল অপরিবর্তিত থাকে।",
  ],
  [
    "AND distributes over OR, and OR distributes over AND. The identities also allow factorisation.",
    "AND অপারেশনকে OR এর উপর এবং OR কে AND এর উপর বণ্টন করা যায়। একই সূত্র ব্যবহার করে সাধারণ গুণনীয়কও বের করা যায়।",
  ],
  [
    "In A+AB, A=1 makes the result 1 and A=0 makes both terms 0; therefore the result is A.",
    "A+AB রাশিতে A=1 হলে ফল 1; A=০ হলে উভয় পদ ০। তাই রাশিটির ফল A এর সমান।",
  ],
];
const reductions = [
  ["AB+AB′ → A(B+B′) → A·1 → A", "XY+XZ=X(Y+Z); B+B′=1; A·1=A", "XY+XZ=X(Y+Z); B+B′=1; A·1=A"],
  [
    "A+A′B → (A+A′)(A+B) → 1·(A+B) → A+B",
    "X+YZ=(X+Y)(X+Z); A+A′=1; 1·X=X",
    "X+YZ=(X+Y)(X+Z); A+A′=1; 1·X=X",
  ],
  [
    "(A+B)(A+B′) → A+BB′ → A+0 → A",
    "(X+Y)(X+Z)=X+YZ; BB′=0; A+0=A",
    "(X+Y)(X+Z)=X+YZ; BB′=0; A+0=A",
  ],
  [
    "(A+B)′+A′B → A′B′+A′B → A′(B′+B) → A′",
    "(A+B)′=A′B′; XY+XZ=X(Y+Z); B′+B=1; A′·1=A′",
    "(A+B)′=A′B′; XY+XZ=X(Y+Z); B′+B=1; A′·1=A′",
  ],
];
const reductionLaws = [
  ["Distributive Law · Complement Law · Identity Law", "বণ্টন সূত্র · পূরক সূত্র · অভেদ সূত্র"],
  ["Distributive Law · Complement Law · Identity Law", "বণ্টন সূত্র · পূরক সূত্র · অভেদ সূত্র"],
  ["Distributive Law · Complement Law · Identity Law", "বণ্টন সূত্র · পূরক সূত্র · অভেদ সূত্র"],
  [
    "De Morgan’s Law · Distributive Law · Complement Law · Identity Law",
    "ডি মর্গ্যানের সূত্র · বণ্টন সূত্র · পূরক সূত্র · অভেদ সূত্র",
  ],
];
function GateConceptCard({ gate, index, bn }: { gate: Gate; index: number; bn: boolean }) {
  const [inputs, setInputs] = useState([0, 1]);
  const output = gateValue(gate, inputs[0]!, inputs[1]!);
  return (
    <article className="flex flex-col rounded-xl border bg-white p-5">
      <GateShape type={gate} active={output === 1} />
      <h3 className="mt-3 font-bold">
        {gate}{" "}
        <span className="font-mono font-normal text-muted-foreground">{formulas[index]}</span>
      </h3>
      <p className="mt-3 flex-1 text-sm leading-7">{meanings[index]![bn ? 1 : 0]}</p>
      <div className="mt-4 border-t pt-3">
        <p className="mb-2 text-xs text-muted-foreground">
          {bn ? "ইনপুটে চাপ দিয়ে মান বদলাও" : "Tap an input to change its value"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {inputs.slice(0, gate === "NOT" ? 1 : 2).map((value, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${gate} input ${i === 0 ? "A" : "B"}`}
              aria-pressed={value === 1}
              onClick={() => setInputs(inputs.map((v, j) => (i === j ? 1 - v : v)))}
              className={`min-h-9 rounded-md border px-3 py-1 font-mono text-xs ${value ? "border-primary/40 bg-primary/5" : "bg-muted/50"}`}
            >
              {i === 0 ? "A" : "B"} = {value}
            </button>
          ))}
          <span aria-live="polite" className="ml-auto text-xs">
            {bn ? "আউটপুট" : "Output"}: <strong className="font-mono">{output}</strong>
          </span>
        </div>
      </div>
    </article>
  );
}

function Table({
  headers,
  rows,
  active = -1,
}: {
  headers: string[];
  rows: (string | number)[][];
  active?: number;
}) {
  const { lang } = useLang();
  return (
    <details className="rounded-xl border bg-white">
      <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-primary">
        {lang === "bn" ? "ট্রুথ টেবিল মিলিয়ে দেখি" : "Check the truth table"}{" "}
        <span className="text-xs font-normal text-muted-foreground">
          ({rows.length} {lang === "bn" ? "সারি" : "rows"})
        </span>
      </summary>
      <div className="overflow-x-auto border-t">
        <table className="w-full text-center text-xs sm:text-sm">
          <thead className="bg-slate-100">
            <tr>
              {headers.map((h, i) => (
                <th key={i} scope="col" className="whitespace-nowrap px-3 py-3 font-mono">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className={`border-t ${i === active ? "bg-emerald-50 font-bold text-emerald-900" : "bg-white"}`}
              >
                {r.map((v, j) => (
                  <td key={j} className="px-3 py-2 font-mono">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
const ConceptSections = createContext<{ openId: string | null; toggle: (id: string) => void }>({
  openId: null,
  toggle: () => {},
});
function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const { openId, toggle } = useContext(ConceptSections);
  const open = openId === id;
  return (
    <section
      hidden={!open}
      data-tour={`concept-${id}`}
      id={id}
      className="concept-chapter scroll-mt-6 rounded-2xl border border-white bg-white/85 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:p-8"
    >
      <h2 className="font-display text-xl font-bold sm:text-2xl">
        <button
          type="button"
          onClick={() => toggle(id)}
          aria-expanded={open}
          aria-controls={`${id}-content`}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          {title}
          <ChevronDown
            className={`h-5 w-5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </h2>
      <div
        id={`${id}-content`}
        hidden={!open}
        className="mt-6 space-y-8 text-sm leading-8 sm:text-base sm:leading-9"
      >
        {children}
      </div>
    </section>
  );
}

export function ConceptsPage() {
  const { lang } = useLang();
  const bn = lang === "bn";
  const say = (en: string, text: string) => (bn ? text : en);
  const [openId, setOpenId] = useState<string | null>(null);
  const toggleSection = (id: string) => setOpenId((current) => (current === id ? null : id));
  const [bits, setBits] = useState([0, 1, 1]);
  const [twoInputs, setTwoInputs] = useState([0, 1]);
  const [threeInputs, setThreeInputs] = useState([0, 1, 1]);
  const scrollRef = useRef<HTMLElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);
  const [a, b, c] = bits as [number, number, number];
  const [family, setFamily] = useState<"NAND" | "NOR">("NAND");
  const [target, setTarget] = useState<"XOR" | "XNOR">("XOR");
  const network = universalNetwork(family, target, a, b);
  return (
    <ConceptSections.Provider value={{ openId, toggle: toggleSection }}>
      <main
        ref={scrollRef}
        data-tour="concepts"
        className="relative min-h-0 flex-1 overflow-y-auto bg-[#f7f8fa] px-5 sm:px-10 lg:px-16 xl:px-24"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-destructive/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-96 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl space-y-7 py-7 sm:space-y-9 sm:py-10">
          <header
            data-tour="concept-intro"
            className="rounded-2xl border border-white/80 bg-white/70 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-8"
          >
            <div>
              <p className="text-xs font-bold tracking-widest text-destructive">
                LOGICLAB / {say("REFERENCE", "এক নজরে")}
              </p>
              <h1 className="my-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                {say("Concept refresher", "কনসেপ্ট ঝালাই")}
              </h1>
              <p className="max-w-3xl text-sm leading-8 text-muted-foreground sm:text-base sm:leading-9">
                {say(
                  "Boolean algebra represents logical relationships using two values: 0 and 1. This overview connects Boolean operations, truth tables, simplification and logic gates through definitions and worked examples.",
                  "বুলিয়ান বীজগণিতে ০ ও 1, এই দুটি মান দিয়ে যৌক্তিক সম্পর্ক প্রকাশ করা হয়। এখানে সংজ্ঞা ও উদাহরণের মাধ্যমে বুলিয়ান অপারেশন, সত্যক সারণি, সরলীকরণ এবং লজিক গেটের পারস্পরিক সম্পর্ক আলোচনা করা হয়েছে।",
                )}
              </p>
            </div>
          </header>
          <ConceptIntroduction bn={bn} />
          <nav
            data-tour="concept-map"
            aria-label={say("On this page", "এই পাতায়")}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {[
              ["signals", "Boolean Operations & Logic Gates", "বুলিয়ান অপারেশন ও লজিক গেট"],
              ["tables", "Truth Tables", "সত্যক সারণি (Truth Table)"],
              ["laws", "Boolean Laws", "বুলিয়ান বীজগণিতের সূত্র"],
              ["morgan", "De Morgan’s Theorems", "ডি মর্গ্যানের উপপাদ্য"],
              ["reduce", "Boolean Function Simplification", "বুলিয়ান ফাংশন সরলীকরণ"],
              ["universal", "Universal Gates", "সার্বজনীন গেট"],
            ].map(([id, en, text], index) => (
              <button
                type="button"
                key={id}
                aria-expanded={openId === id}
                aria-controls={`${id}-content`}
                onClick={() => toggleSection(id!)}
                className="group flex items-center gap-3 rounded-2xl border border-white bg-white/85 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] transition-colors hover:border-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  {(() => {
                    const Icon = [CircuitBoard, Table2, Sigma, GitBranch, Layers, BookOpenCheck][
                      index
                    ]!;
                    return <Icon className="h-5 w-5" />;
                  })()}
                </span>
                <span className="flex-1 text-sm font-semibold leading-6">{bn ? text : en}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground ${openId === id ? "rotate-180" : ""}`}
                />
              </button>
            ))}
          </nav>
          <Section
            id="signals"
            title={say("01 / Boolean Operations & Logic Gates", "০১ / বুলিয়ান অপারেশন ও লজিক গেট")}
          >
            <p>
              {say(
                "A Boolean variable can have one of two values: 0 (false) or 1 (true). AND, OR and NOT are the basic operations on these variables. A logic gate is an electronic circuit that produces an output according to a Boolean operation. For example, if A and B represent two switches, an AND gate produces F=1 only when A=B=1.",
                "বুলিয়ান চলকের মান দুটি: ০ (মিথ্যা) অথবা 1 (সত্য)। এই চলকগুলোর উপর AND, OR ও NOT হলো মৌলিক অপারেশন। বুলিয়ান অপারেশন অনুযায়ী আউটপুট প্রদানকারী ইলেকট্রনিক সার্কিটকে লজিক গেট বলে। যেমন, A ও B দুটি সুইচের অবস্থা নির্দেশ করলে AND গেটে কেবল A=B=1 হলেই F=1 হবে।",
              )}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gates.map((g, i) => (
                <GateConceptCard key={g} gate={g} index={i} bn={bn} />
              ))}
              <div className="rounded-xl bg-slate-100 p-4">
                <h3 className="font-bold">{say("Read the notation", "চিহ্নগুলো পড়ি")}</h3>
                <p>
                  · / AB = AND
                  <br />+ = OR
                  <br />
                  A′ / A̅ = NOT
                </p>
                <p className="mt-3 text-sm leading-7">
                  {say("Brackets first, then NOT, AND, OR.", "আগে বন্ধনী, তারপর NOT, AND, OR।")}
                </p>
              </div>
            </div>
            <p>
              {say(
                "Basic: AND, OR, NOT. Universal: NAND, NOR. Exclusive: XOR, XNOR. Compound circuits join stages: AO = AND → OR; OA = OR → AND; AOI and OAI invert those outputs. NAND = AND → NOT, NOR = OR → NOT, XNOR = XOR → NOT.",
                "মৌলিক: AND, OR, NOT। সার্বজনীন: NAND, NOR। বিশেষ: XOR, XNOR। যৌগিক সার্কিটে ধাপগুলো জোড়া লাগে: AO = AND → OR; OA = OR → AND; AOI ও OAI এ শেষে ফল উল্টে যায়। NAND = AND → NOT, NOR = OR → NOT, XNOR = XOR → NOT।",
              )}
            </p>
          </Section>
          <Section id="tables" title={say("02 / Truth Tables", "০২ / সত্যক সারণি (Truth Table)")}>
            <p>
              {say(
                "A truth table lists the output for every possible input combination of a Boolean expression. Each independent input has two values, so n inputs require 2ⁿ rows. List inputs in binary order, calculate intermediate operations, then determine the final output. Parentheses are evaluated first, followed by NOT, AND and OR.",
                "কোনো বুলিয়ান রাশির সব সম্ভাব্য ইনপুট সমন্বয়ের জন্য আউটপুট যে সারণিতে দেখানো হয়, তাকে সত্যক সারণি বলে। প্রতিটি স্বতন্ত্র ইনপুটের দুটি মান থাকায় nটি ইনপুটের জন্য ২ⁿটি সারি প্রয়োজন। প্রথমে বাইনারি ক্রমে ইনপুট লিখতে হয়, এরপর মধ্যবর্তী অপারেশন এবং সবশেষে চূড়ান্ত আউটপুট নির্ণয় করতে হয়। হিসাবের ক্রম: বন্ধনী, NOT, AND, OR।",
              )}
            </p>
            <Table
              headers={["A", "B", ...gates]}
              rows={inputRows(2).map(([x, y]) => [
                x!,
                y!,
                ...gates.map((g) => gateValue(g, x!, y!)),
              ])}
              active={a * 2 + b}
            />
            <div className="concept-table-comparison grid gap-5 lg:grid-cols-2">
              <div className="concept-table-example">
                <h3 className="font-bold">
                  {say("Two inputs → four possible states", "দুটি ইনপুট → চারটি সম্ভাব্য অবস্থা")}
                </h3>
                <p>
                  {say(
                    "A has 2 choices and B has 2: 2 × 2 = 4 rows. We write this as 2².",
                    "A এর ২টি অবস্থা, B এরও ২টি: ২ × ২ = ৪টি সারি। সংক্ষেপে একেই ২² লেখা হয়।",
                  )}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {inputRows(2).map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setTwoInputs(r)}
                      aria-pressed={twoInputs[0]! * 2 + twoInputs[1]! === i}
                      className={`rounded-xl border px-2 py-3 text-center text-xs ${twoInputs[0]! * 2 + twoInputs[1]! === i ? "border-primary bg-primary/5" : "bg-white"}`}
                    >
                      <span className="block font-mono">A={r[0]}</span>
                      <span className="block font-mono">B={r[1]}</span>
                    </button>
                  ))}
                </div>
                <p className="font-mono">F = A+B′</p>
                <Table
                  headers={["A", "B", "B′", "F"]}
                  rows={inputRows(2).map(([x, y]) => [x!, y!, 1 - y!, x! | (1 - y!)])}
                  active={twoInputs[0]! * 2 + twoInputs[1]!}
                />
                <p className="font-mono">
                  A={twoInputs[0]}, B={twoInputs[1]} ; NOT B={1 - twoInputs[1]!} ; F=
                  {twoInputs[0]! | (1 - twoInputs[1]!)}
                </p>
              </div>
              <div className="concept-table-example">
                <h3 className="font-bold">
                  {say(
                    "One more input → eight possible states",
                    "আরেকটি ইনপুট → আটটি সম্ভাব্য অবস্থা",
                  )}
                </h3>
                <p>
                  {say(
                    "For each A/B pair, C can be 0 or 1. The four cases double: 2 × 2 × 2 = 8 rows, written 2³.",
                    "A/B এর প্রতিটি জোড়ায় C হতে পারে ০ বা 1। তাই চারটি অবস্থা দ্বিগুণ হয়: ২ × ২ × ২ = ৮টি সারি, সংক্ষেপে ২³।",
                  )}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {inputRows(3).map((r, i) => (
                    <button
                      key={i}
                      onClick={() => setThreeInputs(r)}
                      aria-pressed={
                        threeInputs[0]! * 4 + threeInputs[1]! * 2 + threeInputs[2]! === i
                      }
                      className={`rounded-xl border px-2 py-3 text-center font-mono text-xs ${threeInputs[0]! * 4 + threeInputs[1]! * 2 + threeInputs[2]! === i ? "border-primary bg-primary/5" : "bg-white"}`}
                    >
                      {r.map((v, j) => (
                        <span key={j} className="block">
                          {"ABC"[j]}={v}
                        </span>
                      ))}
                    </button>
                  ))}
                </div>
                <p className="font-mono">F = AB+A′C</p>
                <Table
                  headers={["A", "B", "C", "A′", "AB", "A′C", "F"]}
                  rows={inputRows(3).map(([x, y, z]) => [
                    x!,
                    y!,
                    z!,
                    1 - x!,
                    x! & y!,
                    (1 - x!) & z!,
                    (x! & y!) | ((1 - x!) & z!),
                  ])}
                  active={threeInputs[0]! * 4 + threeInputs[1]! * 2 + threeInputs[2]!}
                />
                <p className="font-mono">
                  AB={threeInputs[0]! & threeInputs[1]!}, A′C=
                  {(1 - threeInputs[0]!) & threeInputs[2]!} → F=
                  {(threeInputs[0]! & threeInputs[1]!) | ((1 - threeInputs[0]!) & threeInputs[2]!)}
                </p>
              </div>
            </div>
          </Section>
          <Section
            id="laws"
            title={say("03 / Laws of Boolean Algebra", "০৩ / বুলিয়ান বীজগণিতের সূত্র")}
          >
            <p>
              {say(
                "Boolean laws establish equivalence between expressions: both sides produce the same output for every input. These identities are used to simplify expressions and analyse circuits. Each card gives the formula, a numerical example and its explanation.",
                "বুলিয়ান সূত্রগুলো দুটি রাশির সমতুল্যতা প্রকাশ করে: প্রতিটি ইনপুটের জন্য উভয় পাশের আউটপুট একই হয়। রাশি সরলীকরণ ও সার্কিট বিশ্লেষণে এই সূত্রগুলো ব্যবহৃত হয়। প্রতিটি কার্ডে সূত্র, সংখ্যাভিত্তিক উদাহরণ ও ব্যাখ্যা দেওয়া আছে।",
              )}
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {BOOLEAN_LAWS.slice(0, 8).map((law, i) => (
                <article
                  key={law.name}
                  className="law-card space-y-5 rounded-xl border border-emerald-100 bg-emerald-50/40 p-6"
                >
                  <h3 className="flex items-center gap-3 font-semibold">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm text-destructive shadow-sm">
                      {bn ? (i + 1).toLocaleString("bn-BD") : i + 1}
                    </span>
                    {bn ? `${law.bn} সূত্র` : `${law.name} Law`}
                  </h3>
                  <div className="font-mono">
                    {law.forms.map((f) => (
                      <p key={f}>{f}</p>
                    ))}
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{law.example}</p>
                  </div>
                  <p className="text-sm leading-8">{notes[i]![bn ? 1 : 0]}</p>
                </article>
              ))}
            </div>
            <p className="rounded-xl bg-amber-50 p-4">
              {say("Double complement undoes the reversal:", "দ্বি পূরকে আগের অবস্থায় ফিরি:")}{" "}
              <span className="font-mono">A=1 → A′=0 → (A′)′=1=A</span>
            </p>
          </Section>
          <Section
            id="morgan"
            title={say("04 / De Morgan’s Theorems", "০৪ / ডি মর্গ্যানের উপপাদ্য")}
          >
            <p>
              {say(
                "De Morgan’s first theorem states that the complement of a logical sum equals the logical product of the complements. The second states that the complement of a logical product equals the logical sum of the complements. Thus, applying a complement to a group exchanges AND and OR and complements each variable.",
                "ডি মর্গ্যানের প্রথম উপপাদ্য অনুযায়ী, যৌক্তিক যোগফলের পূরক চলকগুলোর পূরকের যৌক্তিক গুণফলের সমান। দ্বিতীয় উপপাদ্য অনুযায়ী, যৌক্তিক গুণফলের পূরক চলকগুলোর পূরকের যৌক্তিক যোগফলের সমান। অর্থাৎ, পুরো রাশির পূরক নির্ণয়ে AND ও OR পরস্পর পরিবর্তিত হয় এবং প্রতিটি চলকের পূরক নিতে হয়।",
              )}
            </p>
            <div className="grid gap-5 lg:grid-cols-2">
              {([0, 1] as const).map((law) => (
                <article
                  key={law}
                  className="law-card space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-5"
                >
                  <h3 className="flex items-center gap-3 font-semibold">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm text-destructive shadow-sm">
                      {law + 9}
                    </span>
                    {bn
                      ? `ডি মর্গ্যানের ${law === 0 ? "প্রথম" : "দ্বিতীয়"} সূত্র`
                      : `De Morgan’s ${law === 0 ? "First" : "Second"} Law`}
                  </h3>
                  <h3 className="font-mono text-lg font-bold">
                    {law === 0 ? "(A+B)′ = A′B′" : "(AB)′ = A′+B′"}
                  </h3>
                  <p>
                    {law === 0
                      ? say(
                          "Neither is on: NOR equals inverted inputs followed by AND.",
                          "কোনোটিই চালু নয়: NOR = উল্টানো ইনপুটের AND।",
                        )
                      : say(
                          "Not both on: NAND equals inverted inputs followed by OR.",
                          "দুটিই একসঙ্গে চালু নয়: NAND = উল্টানো ইনপুটের OR।",
                        )}
                  </p>
                  <Table
                    headers={
                      law === 0
                        ? ["A", "B", "A+B", "(A+B)′", "A′B′"]
                        : ["A", "B", "AB", "(AB)′", "A′+B′"]
                    }
                    rows={inputRows(2).map(([x, y]) => {
                      const v = law === 0 ? x! | y! : x! & y!;
                      return [
                        x!,
                        y!,
                        v,
                        1 - v,
                        law === 0 ? (1 - x!) & (1 - y!) : (1 - x!) | (1 - y!),
                      ];
                    })}
                    active={a * 2 + b}
                  />
                </article>
              ))}
            </div>
            <p>
              {say(
                "The last two columns match for every input: this proves both identities and allows either circuit to replace the other.",
                "প্রতিটি ইনপুটে শেষ দুই কলাম মেলে: এই মিলই দুই সূত্রের প্রমাণ, তাই একটি সার্কিটের বদলে অন্যটি বসানো যায়।",
              )}
            </p>
          </Section>
          <Section
            id="reduce"
            title={say("05 / Boolean Function Simplification", "০৫ / বুলিয়ান ফাংশন সরলীকরণ")}
          >
            <p>
              {say(
                "Simplification expresses a Boolean function using fewer terms or operations while preserving its output for every input. For example, use XY+XZ=X(Y+Z), Y+Y?=1 and X?1=X to combine terms. The examples below show each equivalent expression in sequence; the number of terms need not decrease at every intermediate step.",
                "সব ইনপুটের জন্য আউটপুট অপরিবর্তিত রেখে কম পদ বা অপারেশনে বুলিয়ান ফাংশন প্রকাশ করাকে সরলীকরণ বলে। প্রথমে বণ্টন সূত্র, এরপর প্রয়োজন অনুযায়ী পূরক, অভেদ বা শোষণ সূত্র প্রয়োগ করা যায়। নিচের উদাহরণে সমতুল্য রাশিগুলো ধাপে ধাপে দেখানো হয়েছে; প্রতিটি মধ্যবর্তী ধাপেই পদসংখ্যা কমতে হবে এমন নয়।",
              )}
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {reductions.map((r, i) => (
                <article
                  key={i}
                  className="rounded-xl border-l-4 border-l-primary bg-white p-5 shadow-sm"
                >
                  <p className="font-mono font-semibold leading-8">{r[0]}</p>
                  <p className="text-sm font-semibold leading-7">{reductionLaws[i]![bn ? 1 : 0]}</p>
                  <p className="mt-3 text-sm leading-8">
                    {say("Applied identities: ", "ব্যবহৃত সূত্র: ")}
                    {r[bn ? 2 : 1]}
                  </p>
                  <p className="mt-3 font-mono text-xs">
                    {say("Current inputs: original = simplified =", "এখনকার ইনপুটে: মূল = সরল =")}{" "}
                    {[a, a | b, a, 1 - a][i]}
                  </p>
                </article>
              ))}
            </div>
            <p>
              {say(
                "Absorption is another shortcut: A+AB=A and A(A+B)=A. Matching one selected input is not proof; compare every output row.",
                "শোষণেও পথ ছোট হয়: A+AB=A ও A(A+B)=A। শুধু একটি নির্বাচিত ইনপুটে মিল প্রমাণ নয়; প্রতিটি সারির আউটপুট মেলাও।",
              )}
            </p>
          </Section>
          <Section
            id="universal"
            title={say("06 / Universal Gates: NAND and NOR", "০৬ / সার্বজনীন গেট: NAND ও NOR")}
          >
            <p>
              {say(
                "A universal gate can be used on its own to implement any Boolean function. NAND and NOR are universal because each can implement NOT, AND and OR. Connecting both inputs of either gate to A produces A′. In the five-gate examples below, P and Q produce the complements, R and S calculate intermediate terms, and Y produces the final output.",
                "যে গেট ব্যবহার করে একাই যেকোনো বুলিয়ান ফাংশন বাস্তবায়ন করা যায়, তাকে সার্বজনীন গেট বলে। NAND ও NOR উভয়ই সার্বজনীন, কারণ প্রতিটি দিয়ে NOT, AND ও OR তৈরি করা যায়। যেকোনো একটির দুই ইনপুটে A দিলে আউটপুট A′ হয়। নিচের পাঁচ গেটের উদাহরণে P ও Q পূরক, R ও S মধ্যবর্তী পদ এবং Y চূড়ান্ত আউটপুট নির্ণয় করে।",
              )}
            </p>
            <UniversalGateBasics bn={bn} />
            <div className="space-y-3 border-t pt-6">
              <h3 className="text-xl font-bold">
                {bn
                  ? "NAND / NOR দিয়ে XOR ও XNOR সার্কিট তৈরি"
                  : "Build XOR and XNOR circuits using NAND / NOR"}
              </h3>
              <p>
                {bn
                  ? "প্রথমে কোন ধরনের গেট ব্যবহার করবে, তারপর কোন সার্কিট তৈরি করবে তা বেছে নাও। নিচের চিত্রের প্রতিটি গেট নির্বাচিত একই ধরনের। তারগুলো অনুসরণ করলে বোঝা যাবে প্রতিটি মধ্যবর্তী আউটপুট পরের কোন গেটে যাচ্ছে।"
                  : "Choose the gate type to use, then the circuit to build. Every gate in the diagram uses your selected type. Follow the wires to see how each intermediate output feeds the next gate."}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <fieldset className="flex gap-2">
                <legend className="mb-2 text-xs font-bold">
                  {say("1. Gate type to use", "১. যে গেট ব্যবহার করব")}
                </legend>
                {(["NAND", "NOR"] as const).map((f) => (
                  <button
                    key={f}
                    aria-pressed={family === f}
                    onClick={() => setFamily(f)}
                    className={`rounded-lg border px-4 py-2 ${family === f ? "bg-slate-900 text-white" : "bg-white"}`}
                  >
                    {f}
                  </button>
                ))}
              </fieldset>
              <fieldset className="flex gap-2">
                <legend className="mb-2 text-xs font-bold">
                  {say("2. Circuit to build", "২. যে সার্কিট তৈরি করব")}
                </legend>
                {(["XOR", "XNOR"] as const).map((t) => (
                  <button
                    key={t}
                    aria-pressed={target === t}
                    onClick={() => setTarget(t)}
                    className={`rounded-lg border px-4 py-2 ${target === t ? "bg-slate-900 text-white" : "bg-white"}`}
                  >
                    {t}
                  </button>
                ))}
              </fieldset>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <h4 className="font-semibold">
                {bn
                  ? `শুধু ${family} গেট দিয়ে ${target} সার্কিট`
                  : `${target} circuit using only ${family} gates`}
              </h4>
              <p className="mt-2 font-mono">F = {target === "XOR" ? "A′B + AB′" : "AB + A′B′"}</p>
              <div className="my-3 flex gap-3">
                {[a, b].map((value, i) => (
                  <button
                    key={i}
                    className="rounded-lg border bg-white px-4 py-2 font-mono"
                    aria-pressed={value === 1}
                    onClick={() => setBits(bits.map((v, j) => (i === j ? 1 - v : v)))}
                  >
                    {i === 0 ? "A" : "B"} = {value}
                  </button>
                ))}
              </div>
              <Circuit
                label={`${target} circuit using five ${family} gates`}
                values={[a, b]}
                nodes={network.map((n) => ({ ...n, gate: family }))}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[network.slice(0, 2), network.slice(2, 4), network.slice(4)].map((stage, i) => (
                <div key={i} className="rounded-xl border bg-white p-5">
                  <p className="mb-3 text-xs font-bold text-muted-foreground">
                    {bn ? (i + 1).toLocaleString("bn-BD") : i + 1} /{" "}
                    {say(
                      ["INVERT", "FORM TERMS", "COMBINE"][i]!,
                      ["উল্টাই", "পদ বানাই", "মেলাই"][i]!,
                    )}
                  </p>
                  {stage.map((n) => (
                    <p key={n.name} className="font-mono">
                      {n.name} = ({n.inputs.join(family === "NAND" ? "·" : "+")})′ ={" "}
                      <strong>{n.value}</strong>
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <Table
              headers={["A", "B", `${family} → Y`, target]}
              rows={inputRows(2).map(([x, y]) => [
                x!,
                y!,
                universalNetwork(family, target, x!, y!).at(-1)!.value,
                gateValue(target, x!, y!),
              ])}
              active={a * 2 + b}
            />
            <p>
              {say(
                "XOR selects A′B+AB′; XNOR selects AB+A′B′. Matching columns verify the circuit. More compact alternatives use four NANDs for XOR or four NORs for XNOR, then one extra inversion for the opposite output.",
                "XOR বেছে নেয় A′B+AB′, XNOR বেছে নেয় AB+A′B′। মিলে যাওয়া কলামগুলো সার্কিট যাচাই করে। আরও ছোট বিকল্পে চার NAND দিয়ে XOR বা চার NOR দিয়ে XNOR হয়; আরেকবার উল্টালে বিপরীত আউটপুট মেলে।",
              )}
            </p>
          </Section>
        </div>
      </main>
    </ConceptSections.Provider>
  );
}
