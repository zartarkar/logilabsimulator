import { useEffect, useRef, useState } from "react";
import { BooleanIntroduction } from "@/components/BooleanIntroduction";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GateShape } from "@/components/circuit/GateShape";
import { gateValue, inputRows, universalNetwork, type Gate } from "@/logic/lessonCurriculum";

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
              <th key={i} scope="col" className="whitespace-nowrap p-3 font-mono">
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
export function Circuit({ nodes, values, label }: { nodes: Node[]; values: number[]; label: string }) {
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
function DeMorgan({ bn, proof = false, law }: { bn: boolean; proof?: boolean; law: 0 | 1 }) {
  const [values, setValues] = useState([0, 1]);
  const [a, b] = values as [number, number];
  const first: Gate = law === 0 ? "OR" : "AND",
    second: Gate = law === 0 ? "AND" : "OR";
  return (
    <div className="space-y-5">
      <h3 className="text-xl font-bold text-primary">
        {law === 0
          ? bn
            ? "প্রথম উপপাদ্য"
            : "First theorem"
          : bn
            ? "দ্বিতীয় উপপাদ্য"
            : "Second theorem"}
      </h3>
      <p className="text-base leading-8">
        {law === 0
          ? bn
            ? "দুই বা ততোধিক বুলিয়ান চলকের যৌক্তিক যোগফলের পূরক প্রতিটি চলকের পূরকের যৌক্তিক গুণফলের সমান।"
            : "The complement of the logical sum of two or more Boolean variables equals the logical product of their complements."
          : bn
            ? "দুই বা ততোধিক বুলিয়ান চলকের যৌক্তিক গুণফলের পূরক প্রতিটি চলকের পূরকের যৌক্তিক যোগফলের সমান।"
            : "The complement of the logical product of two or more Boolean variables equals the logical sum of their complements."}
      </p>
      <p className="text-sm">{bn ? "A ও B বুলিয়ান চলক হলে" : "For Boolean variables A and B"}</p>
      <div
        role="math"
        aria-label={
          law === 0
            ? "NOT (A OR B) equals (NOT A) AND (NOT B)"
            : "NOT (A AND B) equals (NOT A) OR (NOT B)"
        }
        className="flex items-center justify-center gap-4 rounded-xl bg-primary/5 px-4 py-6 font-mono text-2xl"
      >
        <span className="border-t-2 border-current pt-1">A {law === 0 ? "+" : "·"} B</span>
        <span>=</span>
        <span className="border-t-2 border-current pt-1">A</span>
        <span>{law === 0 ? "·" : "+"}</span>
        <span className="border-t-2 border-current pt-1">B</span>
      </div>
      <p className="text-sm leading-7">
        {law === 0
          ? bn
            ? "‘A বা B কোনোটিই চালু নয়’ মানে ‘A বন্ধ এবং B বন্ধ’। বাঁয়ে আগে OR করে ফল উল্টাই। ডানে আগে দুটি ইনপুট উল্টে AND করি। দুই পথেই একই ফল!"
            : "‘Neither A nor B is on’ means ‘A is off AND B is off’. On the left, OR first, then invert the result. On the right, invert each input, then AND them. Both paths agree!"
          : bn
            ? "‘A ও B দুটো একসঙ্গে চালু নয়’ মানে ‘A বন্ধ অথবা B বন্ধ’। বাঁয়ে আগে AND করে ফল উল্টাই। ডানে ইনপুটগুলো উল্টে OR করি। অন্তত একটি বন্ধ হলেই ফল 1।"
            : "‘A and B are not both on’ means ‘A is off OR B is off’. On the left, AND first, then invert. On the right, invert the inputs, then OR them. Either input being off makes the result 1."}
      </p>
      <Switches values={values} set={setValues} bn={bn} />
      {!proof && (
        <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div>
            <p className="mb-2 text-sm font-semibold">{law === 0 ? "NOR" : "NAND"}</p>
            <Circuit
              values={values}
              label={law === 0 ? "NOR gate" : "NAND gate"}
              nodes={[
                { name: "F", gate: law === 0 ? "NOR" : "NAND", inputs: ["A", "B"], x: 140, y: 90 },
              ]}
            />
          </div>
          <span aria-hidden="true" className="text-center text-3xl font-bold">
            =
          </span>
          <div>
            <p className="mb-2 text-sm font-semibold">
              {bn ? "আগে NOT, তারপর বদলানো গেট" : "Invert inputs, then swap the gate"}
            </p>
            <Circuit
              values={values}
              label={law === 0 ? "Inverted inputs into AND" : "Inverted inputs into OR"}
              nodes={[
                { name: "P", gate: "NOT", inputs: ["A"], x: 110, y: 22 },
                { name: "Q", gate: "NOT", inputs: ["B"], x: 110, y: 128 },
                { name: "F", gate: second, inputs: ["P", "Q"], x: 245, y: 80 },
              ]}
            />
          </div>
        </div>
      )}
      {proof && (
        <>
          <Table
            headers={
              law === 0
                ? ["A", "B", "A+B", "(A+B)′", "A′", "B′", "A′B′"]
                : ["A", "B", "AB", "(AB)′", "A′", "B′", "A′+B′"]
            }
            rows={inputRows(2).map(([x, y]) => {
              const p = gateValue(first, x!, y!);
              return [x!, y!, p, 1 - p, 1 - x!, 1 - y!, gateValue(second, 1 - x!, 1 - y!)];
            })}
            selected={a * 2 + b}
          />
          <p className={box}>
            {bn
              ? "চারটি সম্ভাব্য ইনপুটেই বাম ও ডান পাশের ফল মেলে। তাই সূত্রটি শুধু একটি উদাহরণে নয়, সব ইনপুটের জন্য সত্য।"
              : "The left and right result columns match in all four possible cases. This proves the identity for every input, not just one example."}
          </p>
        </>
      )}
      <p className="text-sm font-medium text-primary">
        {bn
          ? "মনে রাখো: বন্ধনী ভাঙলে ইনপুট উল্টাবে এবং + ও · বদলাবে। শুধু ইনপুট উল্টালে হবে না।"
          : "Remember: invert each input AND swap + with ·. Inverting the inputs alone is not enough."}
      </p>
    </div>
  );
}
function TruthBuilder({ bn, n }: { bn: boolean; n: 2 | 3 }) {
  return (
    <div className="space-y-5">
      <p className="text-sm leading-7">
        {bn
          ? "1. আলাদা চলক গুনে 2ⁿটি সারি নাও। ২. বাইনারি ক্রমে ইনপুট লেখো। ৩. NOT, তারপর AND, সবশেষে OR হিসাব করো; বন্ধনী থাকলে আগে সেটি। প্রতিটি মধ্যবর্তী ফলের জন্য কলাম রাখো।"
          : "1. Count distinct variables and make 2ⁿ rows. 2. List inputs in binary order. 3. Evaluate NOT, then AND, then OR; handle parentheses first. Give each intermediate result its own column."}
      </p>
      <p className={box}>
        {n === 2
          ? "A: 00 11; B: 01 01 → 00, 01, 10, 11"
          : "A: 0000 1111; B: 0011 0011; C: 0101 0101"}
        <br />
        {bn ? "রাশি" : "Expression"}: {n === 2 ? "F = A + B′" : "F = AB + A′C"} · 2<sup>{n}</sup> ={" "}
        {2 ** n} {bn ? "সারি" : "rows"}
      </p>
      <Table
        headers={n === 2 ? ["A", "B", "B′", "F = A+B′"] : ["A", "B", "C", "A′", "AB", "A′C", "F"]}
        rows={inputRows(n).map((r) => {
          const [a, b, c] = r as [number, number, number];
          return n === 2
            ? [a, b, 1 - b, a | (1 - b)]
            : [
                a,
                b,
                c,
                1 - a,
                a & b,
                (1 - a) & c,
                (a & b) | ((1 - a) & c),
              ];
        })}
      />

      <p className="text-sm text-muted-foreground">
        {n === 2
          ? bn
            ? "উদাহরণ: A=0, B=0 → B′=1 → F=0+1=1।"
            : "Example: A=0, B=0 → B′=1 → F=0+1=1."
          : bn
            ? "উদাহরণ: A=0, B=1, C=1 → A′=1, AB=0, A′C=1 → F=1।"
            : "Example: A=0, B=1, C=1 → A′=1, AB=0, A′C=1 → F=1."}
      </p>
    </div>
  );
}
const examples = [
  {
    steps: ["AB + AB′", "A(B + B′)", "A·1", "A"],
    reasons: ["Distributive Law: XY + XZ = X(Y + Z)", "Complement Law: B + B′ = 1", "Identity Law: A·1 = A"],
    bn: ["বণ্টন সূত্র: XY + XZ = X(Y + Z)", "পূরক সূত্র: B + B′ = 1", "অভেদ সূত্র: A·1 = A"],
  },
  {
    steps: ["A + A′B", "(A + A′)(A + B)", "1·(A + B)", "A + B"],
    reasons: ["Distributive Law: X + YZ = (X+Y)(X+Z)", "Complement Law: A + A′ = 1", "Identity Law: 1·X = X"],
    bn: ["বণ্টন সূত্র: X + YZ = (X+Y)(X+Z)", "পূরক সূত্র: A + A′ = 1", "অভেদ সূত্র: 1·X = X"],
  },
  {
    steps: ["(A + B)(A + B′)", "A + BB′", "A + 0", "A"],
    reasons: ["Distributive Law: (X+Y)(X+Z) = X+YZ", "Complement Law: BB′ = 0", "Identity Law: A+0 = A"],
    bn: ["বণ্টন সূত্র: (X+Y)(X+Z) = X+YZ", "পূরক সূত্র: BB′ = 0", "অভেদ সূত্র: A+0 = A"],
  },
  {
    steps: ["(A + B)′ + A′B", "A′B′ + A′B", "A′(B′ + B)", "A′"],
    reasons: ["De Morgan’s Law: (A+B)′ = A′B′", "Distributive Law: XY + XZ = X(Y+Z)", "Complement and Identity Laws: B′+B = 1; A′·1 = A′"],
    bn: ["ডি মর্গ্যানের সূত্র: (A+B)′ = A′B′", "বণ্টন সূত্র: XY + XZ = X(Y+Z)", "পূরক ও অভেদ সূত্র: B′+B = 1; A′·1 = A′"],
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
      <p className="text-sm leading-7">
        {bn
          ? "লক্ষ্য: একই আউটপুট রেখে কম পদ ও কম গেট ব্যবহার করা। আগে বন্ধনী ও NOT দেখো, সাধারণ পদ বের করো, পূরক/অভেদ দিয়ে ছোট করো, তারপর শোষণ সূত্র দেখো। শেষে সব ইনপুটে ফল মিলিয়ে নাও। সাধারণ বীজগণিতের মতো 1+1=2 বা ইচ্ছেমতো কাটাকাটি এখানে চলে না।"
          : "The goal is fewer terms and gates with the same output. Inspect brackets and NOT, factor shared terms, apply complement/identity, then look for absorption. Check every input afterwards. Do not use ordinary arithmetic such as 1+1=2 or cancel terms without a Boolean law."}
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
const gateNotes: Record<Gate, [string, string]> = {
  AND: ["যৌক্তিক গুণের কাজ করে। সব ইনপুট 1 হলেই আউটপুট 1। যেমন, দুটি সুইচ একসঙ্গে চালু থাকলেই বাতি জ্বলবে।", "Logical multiplication. Every input must be 1. Think of a lamp that needs both switches on."],
  OR: ["যৌক্তিক যোগের কাজ করে। যেকোনো একটি ইনপুট 1 হলেই আউটপুট 1। সব ইনপুট ০ হলে আউটপুট ০। যেমন, দুটি অ্যালার্মের যেকোনোটি চালু হলেই সংকেত আসবে।", "Logical addition. Any input being 1 is enough; only all zeros give 0. Either alarm can trigger the signal."],
  NOT: ["একটি ইনপুট ও একটি আউটপুট থাকে। ইনপুটের পূরক বা বিপরীত মান দেয়। তাই একে ইনভার্টার (Inverter) বলা হয়। ০ দিলে 1, আর 1 দিলে ০।", "One input, one output. It returns the complement of the input, so it is also called an inverter: 0 becomes 1 and 1 becomes 0."],
  NAND: ["AND গেটের আউটপুটে NOT যুক্ত করলে NAND হয়। আগে যৌক্তিক গুণ, তারপর ফলের পূরক। শুধু দুটি ইনপুটই 1 হলে আউটপুট ০।", "Connect NOT after AND to make NAND. Multiply logically, then complement the result. Only two ones produce 0."],
  NOR: ["OR গেটের আউটপুটে NOT যুক্ত করলে NOR হয়। আগে যৌক্তিক যোগ, তারপর ফলের পূরক। শুধু দুটি ইনপুটই ০ হলে আউটপুট 1।", "Connect NOT after OR to make NOR. Add logically, then complement the result. Only two zeros produce 1."],
  XOR: ["দুটি ইনপুট অসমান হলে আউটপুট 1; সমান হলে ০। ⊕ চিহ্ন দিয়ে XOR বোঝানো হয়। ০1 ও 1০ অবস্থায় এটি চালু হয়।", "For two inputs, different values give 1 and matching values give 0. The symbol ⊕ means XOR. It detects 01 and 10."],
  XNOR: ["XOR গেটের আউটপুট উল্টে দিলে XNOR হয়। দুটি ইনপুট সমান হলে আউটপুট 1; অসমান হলে ০। অর্থাৎ ০০ ও 11 অবস্থায় এটি চালু হয়।", "Invert XOR to get XNOR. Matching inputs give 1; different inputs give 0. It detects 00 and 11."],
};
function GateLesson({ gate, bn }: { gate: Gate; bn: boolean }) {
  const [values, setValues] = useState(gate === "NOT" ? [0] : [0, 1]);
  const preceding: Gate | null = gate === "NAND" ? "AND" : gate === "NOR" ? "OR" : gate === "XNOR" ? "XOR" : null;
  return <article className="gate-article space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-2xl font-bold">{gate} {bn ? "গেট" : "gate"}</h3>
      <span className="rounded-lg bg-muted px-4 py-2 font-mono text-lg">Y = {rules[gate][0]}</span>
    </div>
    <p className="text-sm leading-8 text-muted-foreground">{gateNotes[gate][bn ? 0 : 1]}</p>
    <Switches values={values} set={setValues} bn={bn} />
    <div className="grid items-center gap-5 sm:grid-cols-2">
      <div><p className="mb-3 text-xs font-semibold text-muted-foreground">{bn ? "লজিক চিত্র" : "Gate symbol"}</p><Circuit label={`${gate} gate`} values={values} nodes={[{name:"Y", gate, inputs:gate === "NOT" ? ["A"] : ["A","B"], x:140,y:75}]} /></div>
      <div><p className="mb-3 text-xs font-semibold text-muted-foreground">{bn ? "সত্যক সারণি" : "Truth table"}</p><Table headers={gate === "NOT" ? ["A","Y"] : ["A","B","Y"]} rows={inputRows(values.length).map(r => [...r,gateValue(gate,r[0]!,r[1] ?? 0)])} selected={values.length === 1 ? values[0]! : values[0]!*2+values[1]!} /><p className="mt-3 text-xs leading-6 text-muted-foreground">{bn ? "ইনপুট বদলালে চিত্রের সংকেত ও সারণির নির্বাচিত সারি বদলাবে।" : "Toggle an input to follow its signal and matching table row."}</p></div>
    </div>
    {preceding && <div className="border-t pt-5"><h4 className="mb-3 font-semibold">{preceding} → NOT = {gate}</h4><Circuit label={`${preceding} followed by NOT equals ${gate}`} values={values} nodes={[{name:"P",gate:preceding,inputs:["A","B"],x:130,y:80},{name:"Y",gate:"NOT",inputs:["P"],x:280,y:80}]} /></div>}
    {(gate === "XOR" || gate === "XNOR") && <Universal bn={bn} target={gate} />}
  </article>;
}
function Universal({ bn, target }: { bn: boolean; target: "XOR" | "XNOR" }) {
  const [family,setFamily] = useState<"NAND" | "NOR">("NAND");
  const [values,setValues] = useState([0,1]);
  const steps=universalNetwork(family,target,values[0]!,values[1]!);
  const terms = family === "NAND" ? target === "XOR" ? ["(A′B)′", "(AB′)′"] : ["(AB)′", "(A′B′)′"] : target === "XOR" ? ["(A+B)′", "(A′+B′)′"] : ["(A+B′)′", "(A′+B)′"];
  return <section className="space-y-5 border-t pt-6">
    <h4 className="text-lg font-bold">{bn ? "সার্বজনীন গেট দিয়ে তৈরি করি" : "Build it with universal gates"}</h4>
    <div className="flex gap-2">{(["NAND","NOR"] as const).map(f=><Button key={f} variant="outline" aria-pressed={family===f} onClick={()=>setFamily(f)}>{bn ? "শুধু" : "Only"} {f}</Button>)}</div>
    <p className="text-sm leading-7">{bn ? "একই ইনপুট দুবার দিলে NAND ও NOR দুটিই NOT এর কাজ করে। প্রথম দুটি গেটে A ও B এর পূরক নিই। পরের দুটি গেটে প্রয়োজনীয় পদ তৈরি করে শেষ গেটে মিলিয়ে দিই। এখানে মোট পাঁচটি গেট ব্যবহার করা হয়েছে।" : "Tying both inputs together makes either NAND or NOR act as NOT. First complement A and B, form the two required terms, then combine them in the final gate. This construction uses five gates."}</p>
    <div className="space-y-2 rounded-xl bg-muted/60 p-4 font-mono text-sm leading-7"><p>P = A′, Q = B′</p><p>R = {terms[0]}, S = {terms[1]}</p><p>Y = {family === "NAND" ? "(R·S)′" : "(R+S)′"} = {rules[target][0]}</p></div>
    <Switches values={values} set={setValues} bn={bn} />
    <Circuit label={`${target} using only ${family}`} values={values} nodes={steps.map(s=>({...s,gate:family}))} />
    <ol className="grid gap-2 sm:grid-cols-2">{steps.map((s,i)=><li key={s.name} className="rounded-lg border bg-muted/20 p-3 font-mono text-sm">{i+1}. {s.name} = {s.inputs.join(` ${family} `)} = {s.value}</li>)}</ol>
    <Table headers={["A","B",family,target]} rows={inputRows(2).map(([a,b])=>[a!,b!,universalNetwork(family,target,a!,b!).at(-1)!.value,gateValue(target,a!,b!)])} selected={values[0]!*2+values[1]!} />
  </section>;
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
        ? bn
          ? ["২টি চলকের সারণি", "৩টি চলকের সারণি", "ডি মর্গ্যানের প্রমাণ"]
          : ["Truth table with 2 variables", "Truth table with 3 variables", "Prove De Morgan"]
        : lesson === 2
          ? bn
            ? ["ধাপে ধাপে সরলীকরণ"]
            : ["Simplify step by step"]
          : bn
            ? ["গেটের বিভাগ", "মৌলিক গেট", "সার্বজনীন গেট", "বিশেষ বা এক্সক্লুসিভ গেট"]
            : ["Gate families", "Basic gates", "Universal gates", "Exclusive gates"];
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
            <div className="space-y-10">
              <DeMorgan bn={bn} law={0} />
              <div className="border-t pt-8">
                <DeMorgan bn={bn} law={1} />
              </div>
            </div>
          ))}
        {lesson === 1 &&
          (page < 2 ? (
            <TruthBuilder key={page} bn={bn} n={page === 0 ? 2 : 3} />
          ) : (
            <div className="space-y-10">
              <DeMorgan bn={bn} law={0} proof />
              <div className="border-t pt-8">
                <DeMorgan bn={bn} law={1} proof />
              </div>
            </div>
          ))}
        {lesson === 2 && <Simplify bn={bn} />}
        {lesson === 3 &&
          (page === 0 ? (
            <>
              <p className="text-sm leading-7">
                {bn
                  ? "বুলিয়ান অ্যালজেবরার যৌক্তিক কাজ সম্পাদনের জন্য ব্যবহৃত ইলেকট্রনিক সার্কিটকে লজিক গেট বলে। এক বা একাধিক ইনপুট থেকে নির্দিষ্ট নিয়মে একটি আউটপুট পাওয়া যায়। কাজের ধরন অনুযায়ী লজিক গেটের চারটি বিভাগ নিচে দেখানো হলো।"
                  : "A logic gate is an electronic circuit that performs a Boolean operation. It takes one or more inputs and produces an output according to its rule. The four families below group gates by their role."}
              </p>
              <div className="mx-auto w-fit rounded-xl bg-foreground px-8 py-4 font-semibold text-background">
                {bn ? "লজিক গেট" : "Logic gates"}
              </div>
              <div aria-hidden="true" className="mx-auto h-6 w-px bg-primary/40" />
              <div className="grid gap-3 border-t-2 border-border pt-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Basic", "মৌলিক", "AND · OR · NOT"],
                  ["Universal", "সার্বজনীন", "NAND · NOR"],
                  ["Exclusive", "বিশেষ", "XOR · XNOR"],
                  ["Compound", "যৌগিক বা জটিল", "AO · OA · AOI · OAI"],
                ].map(([en, bengali, items]) => (
                  <div key={en} className="relative rounded-xl border bg-card p-4 before:absolute before:-top-6 before:left-1/2 before:h-6 before:w-px before:bg-border">
                    <h4 className="font-bold">{bn ? bengali : en}</h4>
                    {bn && <p className="mt-1 text-xs text-muted-foreground">{en} gate</p>}
                    <p className="mt-2 font-mono text-sm leading-6">{items}</p>
                  </div>
                ))}
              </div>
              <p className="rounded-xl bg-muted/60 p-4 text-sm leading-7">{bn ? "মৌলিক গেটের সমন্বয়ে যৌগিক সার্কিট তৈরি হয়। যেমন AND এর পরে OR দিলে AO। NAND, NOR এবং বিশেষ গেটও মৌলিক গেট মিলিয়ে তৈরি করা যায়। পরের অংশগুলোতে প্রথম তিনটি বিভাগের সাতটি গেট শিখব।" : "Compound circuits combine basic operations, such as AND followed by OR (AO). NAND, NOR and exclusive gates can also be built from basic gates. Next, explore the seven gates in the first three families."}</p>
            </>
          ) : page === 1 ? (
            <div>{(["AND", "OR", "NOT"] as const).map(gate => <GateLesson key={gate} gate={gate} bn={bn} />)}</div>
          ) : page === 2 ? (
            <div><p className="mb-6 rounded-xl bg-muted/60 p-4 text-sm leading-7">{bn ? "NAND অথবা NOR, যেকোনো এক ধরনের গেট দিয়েই মৌলিক গেটসহ যেকোনো বুলিয়ান ফাংশন বাস্তবায়ন করা যায়। তাই এদের সার্বজনীন গেট বলা হয়।" : "NAND alone or NOR alone can implement any Boolean function, including all basic gates. That is why they are called universal gates."}</p>{(["NAND", "NOR"] as const).map(gate => <GateLesson key={gate} gate={gate} bn={bn} />)}</div>
          ) : (
            <div>{(["XOR", "XNOR"] as const).map(gate => <GateLesson key={gate} gate={gate} bn={bn} />)}</div>
          ))}
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
          <Button className={conceptsOnly ? "hidden" : ""} variant="destructive" onClick={onPractice}>
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
