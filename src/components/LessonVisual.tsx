import { useEffect, useRef, useState } from "react";
import { BooleanIntroduction } from "@/components/BooleanIntroduction";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GateShape } from "@/components/circuit/GateShape";
import { gateValue, inputRows, type Gate } from "@/logic/lessonCurriculum";

type Node = { name: string; gate: Gate; inputs: string[]; x: number; y: number };
const box = "rounded-xl border border-primary/20 bg-primary/5 p-4";
function Table({
  headers,
  rows,
  selected = -1,
}: {
  headers: string[];
  rows: (string | number)[][];
  selected?: number;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-center text-sm">
        <thead className="bg-muted">
          <tr>
            {headers.map((h, i) => (
              <th key={i} scope="col" className="whitespace-nowrap p-2 font-mono">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={`border-t transition-colors ${i === selected ? "bg-primary/15 font-bold text-primary" : "bg-card"}`}
            >
              {row.map((cell, j) => (
                <td key={j} className="whitespace-nowrap px-3 py-2 font-mono">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Switches({
  values,
  set,
  bn,
}: {
  values: number[];
  set: (v: number[]) => void;
  bn: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs text-muted-foreground">{bn ? "ইনপুট বদলাও" : "Toggle inputs"}</span>
      {values.map((v, i) => (
        <button
          key={i}
          type="button"
          aria-pressed={v === 1}
          onClick={() => set(values.map((x, j) => (i === j ? 1 - x : x)))}
          className={`min-h-11 rounded-xl border-2 px-4 py-2 font-mono transition ${v ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`}
        >
          {"ABC"[i]} = {v}
        </button>
      ))}
    </div>
  );
}
export function Circuit({
  nodes,
  values,
  label,
}: {
  nodes: Node[];
  values: number[];
  label: string;
}) {
  const positions: Record<string, { x: number; y: number; value: number }> = {};
  values.forEach((value, i) => {
    positions["ABC"[i]!] = { x: 30, y: 45 + i * 105, value };
  });
  nodes.forEach((node) => {
    positions[node.name] = {
      x: node.x + 68,
      y: node.y + 24,
      value: gateValue(
        node.gate,
        positions[node.inputs[0]!]!.value,
        positions[node.inputs[1] ?? node.inputs[0]!]!.value,
      ),
    };
  });
  const width = Math.max(...nodes.map((node) => node.x)) + 160;
  const height = Math.max(340, ...nodes.map((node) => node.y + 95));
  return (
    <div className="overflow-x-auto rounded-xl border bg-card p-3">
      <svg
        role="img"
        aria-label={label}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        style={{ minWidth: width > 500 ? 580 : undefined }}
      >
        <title>{label}</title>
        {values.map((v, i) => (
          <g key={i}>
            <circle cx="30" cy={45 + i * 105} r="20" fill="var(--muted)" />
            <text x="30" y={50 + i * 105} textAnchor="middle" fill="currentColor" fontSize="13">
              {"ABC"[i]}:{v}
            </text>
          </g>
        ))}
        {nodes.flatMap((node) =>
          node.inputs.map((input, i) => {
            const from = positions[input]!;
            const y = node.y + (node.inputs.length === 1 ? 24 : i === 0 ? 12 : 36);
            return (
              <path
                key={`${node.name}-${i}`}
                d={`M${from.x + (input.length === 1 && "ABC".includes(input) ? 20 : 0)} ${from.y} H${node.x - 25 - i * 9} V${y} H${node.x + 8}`}
                fill="none"
                stroke={from.value ? "var(--primary)" : "var(--border)"}
                strokeWidth="2.5"
              />
            );
          }),
        )}
        {nodes.map((node) => (
          <g key={node.name}>
            <path
              d={`M${node.x + (["NAND", "NOR", "XNOR"].includes(node.gate) ? 60 : node.gate === "NOT" ? 53 : 51)} ${node.y + 24} H${node.x + 68}`}
              stroke={positions[node.name]!.value ? "var(--primary)" : "var(--border)"}
              strokeWidth="2.5"
              fill="none"
            />
            <foreignObject x={node.x} y={node.y} width="70" height="50">
              <GateShape type={node.gate} active={positions[node.name]!.value === 1} />
            </foreignObject>
            <text
              x={node.x + 32}
              y={node.y - 8}
              textAnchor="middle"
              fill="currentColor"
              fontSize="12"
            >
              {node.gate}
            </text>
            <text
              x={node.x + 34}
              y={node.y + 68}
              textAnchor="middle"
              fill="var(--primary)"
              fontSize="14"
              fontWeight="bold"
            >
              {node.name}={positions[node.name]!.value}
            </text>
          </g>
        ))}
        <text
          x={width - 65}
          y={height - 25}
          textAnchor="middle"
          fill="var(--primary)"
          fontSize="17"
          fontWeight="bold"
        >
          {nodes[nodes.length - 1]!.name} = {positions[nodes[nodes.length - 1]!.name]!.value}
        </text>
      </svg>
    </div>
  );
}
function DeMorgan({ bn, law }: { bn: boolean; law: 0 | 1 }) {
  const first = law === 0;
  return (
    <section className="space-y-3 rounded-xl border p-3">
      <h3 className="font-semibold">
        {bn
          ? first
            ? "ডি মর্গ্যানের প্রথম সূত্র"
            : "ডি মর্গ্যানের দ্বিতীয় সূত্র"
          : first
            ? "De Morgan’s first law"
            : "De Morgan’s second law"}
      </h3>
      <p className="font-mono text-lg text-primary">{first ? "(A+B)′ = A′B′" : "(AB)′ = A′+B′"}</p>
      <p className="text-sm">
        {bn
          ? "প্রতিটি ইনপুটের পূরক নাও এবং AND ↔ OR বদলাও।"
          : "Complement each input and swap AND ↔ OR."}
      </p>
      <Table
        headers={["A", "B", first ? "(A+B)′" : "(AB)′", first ? "A′B′" : "A′+B′"]}
        rows={inputRows(2).map(([a, b]) => [
          a!,
          b!,
          first ? 1 - (a! | b!) : 1 - (a! & b!),
          first ? (1 - a!) & (1 - b!) : (1 - a!) | (1 - b!),
        ])}
      />
      <p className="text-xs text-muted-foreground">
        {bn
          ? "চারটি ইনপুটেই শেষ দুই কলাম সমান, তাই সূত্রটি প্রমাণিত।"
          : "The last two columns match for all four inputs, proving the law."}
      </p>
    </section>
  );
}
const examples = [
  {
    steps: ["AB + AB′", "A(B + B′)", "A·1", "A"],
    reasons: [
      "Distributive Law: XY + XZ = X(Y + Z)",
      "Complement Law: B + B′ = 1",
      "Identity Law: A·1 = A",
    ],
    bn: ["বণ্টন সূত্র: XY + XZ = X(Y + Z)", "পূরক সূত্র: B + B′ = 1", "অভেদ সূত্র: A·1 = A"],
  },
  {
    steps: ["A + A′B", "(A + A′)(A + B)", "1·(A + B)", "A + B"],
    reasons: [
      "Distributive Law: X + YZ = (X+Y)(X+Z)",
      "Complement Law: A + A′ = 1",
      "Identity Law: 1·X = X",
    ],
    bn: ["বণ্টন সূত্র: X + YZ = (X+Y)(X+Z)", "পূরক সূত্র: A + A′ = 1", "অভেদ সূত্র: 1·X = X"],
  },
];
function Simplify({ bn }: { bn: boolean }) {
  const [example, setExample] = useState(0),
    [values, setValues] = useState([0, 1]);
  const e = examples[example]!,
    [a, b] = values as [number, number];
  const original = [
    (a & b) | (a & (1 - b)),
    a | ((1 - a) & b),
    (a | b) & (a | (1 - b)),
    Number(!(a | b)) | ((1 - a) & b),
  ][example];
  const reduced = [a, a | b, a, 1 - a][example];
  return (
    <div className="space-y-5">
      <p className="text-sm">
        {bn
          ? "একই আউটপুট রেখে রাশি ছোট করি। এই দুই উদাহরণে বণ্টন, পূরক ও অভেদ সূত্র ব্যবহার করব।"
          : "Reduce terms without changing the output. These two examples use distribution, complement and identity laws."}
      </p>
      <div className="flex flex-wrap gap-2">
        {examples.map((_, i) => (
          <Button
            key={i}
            variant="outline"
            aria-pressed={example === i}
            onClick={() => {
              setExample(i);
            }}
          >
            {bn ? "উদাহরণ" : "Example"} {i + 1}
          </Button>
        ))}
      </div>
      <ol className="space-y-3">
        {e.steps.map((expression, i) => (
          <li key={i} className={`${box} animate-in fade-in motion-reduce:animate-none`}>
            <p className="font-mono text-xl">
              {i ? "= " : "F = "}
              {expression}
            </p>
            {i > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {bn ? e.bn[i - 1] : e.reasons[i - 1]}
              </p>
            )}
          </li>
        ))}
      </ol>
      <Switches values={values} set={setValues} bn={bn} />
      <output aria-live="polite" className="block font-mono text-primary">
        {bn ? "মূল রাশি" : "Original"} = {original}　{bn ? "সরল রাশি" : "Simplified"} = {reduced} ✓
      </output>
    </div>
  );
}
const rules: Record<Gate, [string, string, string]> = {
  AND: ["AB", "1 only when both inputs are 1.", "দুটি ইনপুটই 1 হলে শুধু ফল 1।"],
  OR: ["A+B", "1 when at least one input is 1.", "অন্তত একটি 1 হলে ফল 1।"],
  NOT: ["A′", "Flip the input: 0 becomes 1; 1 becomes 0.", "ইনপুট উল্টাও: 0 হয় 1, 1 হয় 0।"],
  NAND: ["(AB)′", "AND, then NOT: only 11 gives 0.", "AND, তারপর NOT: শুধু 11 তে ফল 0।"],
  NOR: ["(A+B)′", "OR, then NOT: only 00 gives 1.", "OR, তারপর NOT: শুধু 00 তে ফল 1।"],
  XOR: ["A′B + AB′", "1 when the two inputs differ.", "দুটি ইনপুট ভিন্ন হলে ফল 1।"],
  XNOR: ["AB + A′B′", "1 when the two inputs match.", "দুটি ইনপুট সমান হলে ফল 1।"],
};
function GateFamilies({ bn }: { bn: boolean }) {
  const families: { en: string; bn: string; gates: Gate[] }[] = [
    { en: "Basic", bn: "মৌলিক", gates: ["AND", "OR", "NOT"] },
    { en: "Universal", bn: "সার্বজনীন", gates: ["NAND", "NOR"] },
    { en: "Exclusive", bn: "বিশেষ", gates: ["XOR", "XNOR"] },
    { en: "Compound", bn: "যৌগিক", gates: [] },
  ];
  return (
    <div className="space-y-3">
      <p className="text-sm">
        {bn
          ? "লজিক গেট ইনপুটের ওপর যৌক্তিক নিয়ম প্রয়োগ করে আউটপুট দেয়।"
          : "Logic gates apply a Boolean rule to their inputs to produce an output."}
      </p>
      <div className="mx-auto w-fit rounded-lg bg-foreground px-5 py-2 text-sm font-semibold text-background">
        {bn ? "লজিক গেট" : "Logic gates"}
      </div>
      <div aria-hidden="true" className="mx-auto h-3 w-px bg-border" />
      <div className="grid grid-cols-4 gap-1 border-t pt-2 text-center text-xs">
        {families.map((f) => (
          <span
            key={f.en}
            className="mx-auto rounded-lg bg-foreground px-3 py-2 font-bold text-background"
          >
            {bn ? f.bn : f.en}
          </span>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {families.map((f) => (
          <div key={f.en} className="min-w-0 rounded-xl border bg-card p-3">
            <h3 className="mb-3 font-semibold">{bn ? f.bn : f.en}</h3>
            <div className="space-y-2">
              {f.gates.map((gate) => (
                <div key={gate} className="flex items-center gap-3 rounded-lg bg-muted/30 p-2">
                  <div role="img" aria-label={gate + " gate"} className="w-16 shrink-0">
                    <GateShape type={gate} active={false} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">
                      {gate} · <span className="font-mono">{rules[gate][0]}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{rules[gate][bn ? 2 : 1]}</p>
                  </div>
                </div>
              ))}
              {f.en === "Compound" &&
                (["AO", "OA", "AOI", "OAI"] as const).map((name) => {
                  const andFirst = name.startsWith("A");
                  const inverted = name.endsWith("I");
                  const stages: Gate[] = [
                    andFirst ? "AND" : "OR",
                    inverted ? (andFirst ? "NOR" : "NAND") : andFirst ? "OR" : "AND",
                  ];
                  return (
                    <div key={name} className="rounded-lg bg-muted/30 p-2">
                      <p className="text-xs font-semibold">
                        {name} ·{" "}
                        <span className="font-mono">
                          {andFirst
                            ? inverted
                              ? "(AB+C)′"
                              : "AB+C"
                            : inverted
                              ? "((A+B)C)′"
                              : "(A+B)C"}
                        </span>
                      </p>
                      <svg
                        role="img"
                        aria-label={name + " circuit"}
                        viewBox="0 0 230 85"
                        className="mt-1 h-20 w-full max-w-60"
                      >
                        <path
                          d="M15 20H38 M15 44H38 M78 32H111V20H138 M15 72H120V44H138 M178 32H218"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <text x="2" y="22" fontSize="10" fill="currentColor">
                          A
                        </text>
                        <text x="2" y="46" fontSize="10" fill="currentColor">
                          B
                        </text>
                        <text x="2" y="75" fontSize="10" fill="currentColor">
                          C
                        </text>
                        <text x="220" y="35" fontSize="10" fill="currentColor">
                          Y
                        </text>
                        {stages.map((gate, i) => (
                          <foreignObject key={i} x={30 + i * 100} y="8" width="64" height="48">
                            <GateShape type={gate} active={false} />
                          </foreignObject>
                        ))}
                      </svg>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export function LessonVisual({
  lesson,
  bn,
  onPractice,
  preview = false,
  conceptsOnly = false,
}: {
  lesson: number;
  bn: boolean;
  onPractice: () => void;
  preview?: boolean;
  conceptsOnly?: boolean;
}) {
  const pages =
    lesson === 0
      ? bn
        ? ["পরিচিতি ও সূত্র", "ডি মর্গ্যানের দুই সূত্র"]
        : ["Introduction & laws", "De Morgan’s two laws"]
      : lesson === 1
        ? [bn ? "ধাপে ধাপে সরলীকরণ" : "Simplify step by step"]
        : [bn ? "গেটের চার বিভাগ" : "Four gate families"];
  const [page, setPage] = useState(0);
  const partHeading = useRef<HTMLDivElement>(null);
  useEffect(() => {
    partHeading.current?.closest('[role="dialog"]')?.scrollTo({ top: 0 });
    partHeading.current?.focus({ preventScroll: true });
  }, [page]);
  return (
    <div className="space-y-6">
      <div
        ref={partHeading}
        tabIndex={-1}
        aria-current="step"
        className="w-fit rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
      >
        {page + 1}. {pages[page]}
      </div>
      <div
        key={page}
        className="space-y-5 animate-in fade-in duration-200 motion-reduce:animate-none"
      >
        {lesson === 0 &&
          (page === 0 ? (
            <BooleanIntroduction bn={bn} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <DeMorgan bn={bn} law={0} />
              <div className="min-w-0">
                <DeMorgan bn={bn} law={1} />
              </div>
            </div>
          ))}
        {lesson === 1 && <Simplify bn={bn} />}
        {lesson === 2 && <GateFamilies bn={bn} />}
      </div>
      <div className="flex flex-wrap justify-between gap-3 border-t pt-5">
        <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {bn ? "আগের অংশ" : "Previous part"}
        </Button>
        {page < pages.length - 1 ? (
          <Button variant="destructive" onClick={() => setPage(page + 1)}>
            {bn ? "পরের অংশ" : "Next part"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className={conceptsOnly ? "hidden" : ""}
            variant="destructive"
            onClick={onPractice}
          >
            {preview
              ? bn
                ? "চলমান শেখার ধাপে ফিরি"
                : "Return to my learning path"
              : bn
                ? "এবার অনুশীলন করি"
                : "Practise this lesson"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
