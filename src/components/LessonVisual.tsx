import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GateShape } from "@/components/circuit/GateShape";
import {
  BOOLEAN_LAWS,
  gateValue,
  inputRows,
  universalNetwork,
  type Gate,
} from "@/logic/lessonCurriculum";

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
function Circuit({ nodes, values, label }: { nodes: Node[]; values: number[]; label: string }) {
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
        style={{ minWidth: Math.min(width, 620) }}
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
function DeMorgan({ bn, proof = false }: { bn: boolean; proof?: boolean }) {
  const [law, setLaw] = useState(0),
    [values, setValues] = useState([0, 1]);
  const [a, b] = values as [number, number];
  const first: Gate = law === 0 ? "OR" : "AND",
    second: Gate = law === 0 ? "AND" : "OR";
  const left = Number(!gateValue(first, a, b)),
    right = gateValue(second, 1 - a, 1 - b);
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {[0, 1].map((i) => (
          <Button
            key={i}
            variant={law === i ? "default" : "outline"}
            aria-pressed={law === i}
            onClick={() => setLaw(i)}
          >
            {bn ? "সূত্র" : "Law"} {i + 1}
          </Button>
        ))}
      </div>
      <h3 className="font-mono text-xl font-bold">
        {law === 0 ? "(A + B)′ = A′B′" : "(AB)′ = A′ + B′"}
      </h3>
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
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold">
              {bn ? "আগে গেট, তারপর NOT" : "Gate first, then NOT"}
            </p>
            <Circuit
              values={values}
              label={law === 0 ? "OR followed by NOT" : "AND followed by NOT"}
              nodes={[
                { name: "P", gate: first, inputs: ["A", "B"], x: 115, y: 90 },
                { name: "F", gate: "NOT", inputs: ["P"], x: 240, y: 90 },
              ]}
            />
          </div>
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
      <output
        aria-live="polite"
        className="block rounded-xl bg-primary/10 p-4 text-center font-mono font-bold"
      >
        {bn ? "বাঁ পাশ" : "Left"} = {left}　{bn ? "ডান পাশ" : "Right"} = {right} ✓
      </output>
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
function TruthBuilder({ bn }: { bn: boolean }) {
  const [n, setN] = useState(2),
    [reveal, setReveal] = useState(0);
  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {[2, 3].map((i) => (
          <Button
            key={i}
            aria-pressed={n === i}
            variant={n === i ? "default" : "outline"}
            onClick={() => {
              setN(i);
              setReveal(0);
            }}
          >
            {i} {bn ? "টি চলক" : "variables"}
          </Button>
        ))}
      </div>
      <p className="text-sm leading-7">
        {bn
          ? "১. আলাদা চলক গুনে 2ⁿটি সারি নাও। ২. বাইনারি ক্রমে ইনপুট লেখো। ৩. NOT, তারপর AND, সবশেষে OR হিসাব করো; বন্ধনী থাকলে আগে সেটি। প্রতিটি মধ্যবর্তী ফলের জন্য কলাম রাখো।"
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
            ? [a, b, reveal >= 1 ? 1 - b : "?", reveal >= 2 ? a | (1 - b) : "?"]
            : [
                a,
                b,
                c,
                reveal >= 1 ? 1 - a : "?",
                reveal >= 2 ? a & b : "?",
                reveal >= 2 ? (1 - a) & c : "?",
                reveal >= 3 ? (a & b) | ((1 - a) & c) : "?",
              ];
        })}
      />
      <Button
        variant="outline"
        onClick={() => setReveal(reveal >= (n === 2 ? 2 : 3) ? 0 : reveal + 1)}
      >
        {reveal >= (n === 2 ? 2 : 3)
          ? bn
            ? "আবার শুরু"
            : "Reset steps"
          : bn
            ? "পরের কলাম হিসাব করি"
            : "Calculate the next column"}
      </Button>
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
    reasons: ["Distributive: factor A", "Complement: B + B′ = 1", "Identity: A·1 = A"],
    bn: ["বণ্টন: A সাধারণ নাও", "পূরক: B + B′ = 1", "অভেদ: A·1 = A"],
  },
  {
    steps: ["A + A′B", "(A + A′)(A + B)", "1·(A + B)", "A + B"],
    reasons: ["Distributive: X + YZ = (X+Y)(X+Z)", "Complement: A + A′ = 1", "Identity"],
    bn: ["বণ্টন: X + YZ = (X+Y)(X+Z)", "পূরক: A + A′ = 1", "অভেদ"],
  },
  {
    steps: ["(A + B)(A + B′)", "A + BB′", "A + 0", "A"],
    reasons: ["Distributive, in reverse", "Complement: BB′ = 0", "Identity"],
    bn: ["বণ্টন সূত্র উল্টোভাবে", "পূরক: BB′ = 0", "অভেদ"],
  },
  {
    steps: ["(A + B)′ + A′B", "A′B′ + A′B", "A′(B′ + B)", "A′"],
    reasons: ["De Morgan I", "Factor A′", "Complement, then identity"],
    bn: ["ডি মর্গ্যান ১", "A′ সাধারণ নাও", "পূরক, তারপর অভেদ"],
  },
];
function Simplify({ bn }: { bn: boolean }) {
  const [example, setExample] = useState(0),
    [step, setStep] = useState(0),
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
            variant={example === i ? "default" : "outline"}
            onClick={() => {
              setExample(i);
              setStep(0);
            }}
          >
            {bn ? "উদাহরণ" : "Example"} {i + 1}
          </Button>
        ))}
      </div>
      <ol className="space-y-3">
        {e.steps.slice(0, step + 1).map((expression, i) => (
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
      <Button variant="outline" onClick={() => setStep(step === e.steps.length - 1 ? 0 : step + 1)}>
        {step === e.steps.length - 1
          ? bn
            ? "আবার করি"
            : "Start again"
          : bn
            ? "পরের ধাপ দেখি"
            : "Reveal next step"}
      </Button>
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
  NAND: ["(AB)′", "AND, then NOT: only 11 gives 0.", "AND, তারপর NOT: শুধু 11-তে ফল 0।"],
  NOR: ["(A+B)′", "OR, then NOT: only 00 gives 1.", "OR, তারপর NOT: শুধু 00-তে ফল 1।"],
  XOR: ["A′B + AB′", "1 when the two inputs differ.", "দুটি ইনপুট ভিন্ন হলে ফল 1।"],
  XNOR: ["AB + A′B′", "1 when the two inputs match.", "দুটি ইনপুট সমান হলে ফল 1।"],
};
function GateExplorer({ bn }: { bn: boolean }) {
  const [gate, setGate] = useState<Gate>("AND"),
    [values, setValues] = useState([0, 1]);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {Object.keys(rules).map((g) => (
          <Button
            key={g}
            aria-pressed={g === gate}
            variant={g === gate ? "default" : "outline"}
            onClick={() => setGate(g as Gate)}
          >
            {g}
          </Button>
        ))}
      </div>
      <p className="text-sm leading-7">
        {rules[gate][bn ? 2 : 1]} <strong className="font-mono">F = {rules[gate][0]}</strong>
      </p>
      <Switches
        values={gate === "NOT" ? values.slice(0, 1) : values}
        set={(v) => setValues(v.length === 1 ? [v[0]!, values[1]!] : v)}
        bn={bn}
      />
      <div className="grid items-center gap-4 md:grid-cols-2">
        <Circuit
          label={`${gate} gate`}
          values={gate === "NOT" ? values.slice(0, 1) : values}
          nodes={[{ name: "F", gate, inputs: gate === "NOT" ? ["A"] : ["A", "B"], x: 140, y: 85 }]}
        />
        <Table
          headers={gate === "NOT" ? ["A", "F"] : ["A", "B", "F"]}
          rows={inputRows(gate === "NOT" ? 1 : 2).map((r) => [
            ...r,
            gateValue(gate, r[0]!, r[1] ?? 0),
          ])}
          selected={gate === "NOT" ? values[0]! : values[0]! * 2 + values[1]!}
        />
      </div>
      <p className="text-sm text-primary">
        {bn
          ? "তোমার ইনপুটের সারিটি রঙ দিয়ে দেখানো হয়েছে। সব ইনপুট দিয়ে চেষ্টা করো।"
          : "The highlighted row matches your switches. Try every input combination."}
      </p>
    </div>
  );
}
function Universal({ bn }: { bn: boolean }) {
  const [family, setFamily] = useState<"NAND" | "NOR">("NAND"),
    [target, setTarget] = useState<"XOR" | "XNOR">("XOR"),
    [values, setValues] = useState([0, 1]),
    [reveal, setReveal] = useState(1);
  const steps = universalNetwork(family, target, values[0]!, values[1]!);
  const shown = steps.slice(0, Math.min(reveal, steps.length));
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(["NAND", "NOR"] as const).map((f) => (
          <Button
            key={f}
            variant={family === f ? "default" : "outline"}
            onClick={() => {
              setFamily(f);
              setReveal(1);
            }}
          >
            {bn ? "শুধু" : "Only"} {f}
          </Button>
        ))}
        {(["XOR", "XNOR"] as const).map((t) => (
          <Button
            key={t}
            variant={target === t ? "default" : "outline"}
            onClick={() => {
              setTarget(t);
              setReveal(1);
            }}
          >
            {t}
          </Button>
        ))}
      </div>
      <p className="text-sm leading-7">
        {bn
          ? "NAND ও NOR universal: এক ধরনের গেট দিয়েই অন্য গেট বানানো যায়। একই সিগন্যাল দুই ইনপুটে দিলে সেটি NOT হয়। এখানে P, Q, R, S আগের গেটের ফল—নতুন ইনপুট নয়।"
          : "NAND and NOR are universal: one family can build other gates. Tying both inputs to the same signal makes NOT. P, Q, R and S below are earlier gate outputs, not extra inputs."}
      </p>
      <p className={box}>
        {family === "NAND"
          ? bn
            ? "প্রথম ৪টি NAND-এ XOR হয়। XNOR চাইলে একই XOR ফল দুই ইনপুটে দিয়ে পঞ্চম NAND-এ উল্টাও।"
            : "The first four NANDs produce XOR. For XNOR, feed that result into both inputs of a fifth NAND to invert it."
          : bn
            ? "প্রথম ৪টি NOR-এ XNOR হয়। XOR চাইলে একই XNOR ফল দুই ইনপুটে দিয়ে পঞ্চম NOR-এ উল্টাও।"
            : "The first four NORs produce XNOR. For XOR, feed that result into both inputs of a fifth NOR to invert it."}
      </p>
      <Switches values={values} set={setValues} bn={bn} />
      <p className="text-sm leading-7">
        {family === "NAND"
          ? bn
            ? "কেন কাজ করে? Q শুধু A=1, B=0 হলে 0; R শুধু A=0, B=1 হলে 0। শেষ NAND তাই ইনপুট দুটি ভিন্ন হলেই 1 দেয়—এটাই XOR।"
            : "Why it works: Q is 0 only for A=1, B=0; R is 0 only for A=0, B=1. The last NAND turns either of these cases into 1, so different inputs give XOR=1."
          : bn
            ? "কেন কাজ করে? Q=A′B, R=AB′—এরা আলাদা ইনপুটের দুটি অবস্থা চেনে। শেষ NOR এদের OR উল্টে দেয়, তাই সমান ইনপুটে 1 আসে—এটাই XNOR।"
            : "Why it works: Q=A′B and R=AB′ detect the two cases with different inputs. The last NOR inverts their OR, giving 1 for matching inputs: XNOR."}
      </p>
      <Circuit
        values={values}
        label={`${target} using only ${family}`}
        nodes={shown.map((s) => ({ ...s, gate: family }))}
      />
      <ol className="space-y-2">
        {shown.map((s, i) => (
          <li key={s.name} className="rounded-lg bg-muted/50 p-3 text-sm">
            <span className="font-mono">
              {i + 1}. {s.name} = {s.inputs.join(` ${family} `)} = {s.value}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              {i === 0
                ? bn
                  ? "A ও B থেকে প্রথম মধ্যবর্তী ফল।"
                  : "Combine A and B to get the shared intermediate result."
                : i === 1
                  ? bn
                    ? "A এবং P-কে পরের গেটে দাও।"
                    : "Feed A and P to the next gate."
                  : i === 2
                    ? bn
                      ? "B এবং P-কে আরেকটি গেটে দাও।"
                      : "Feed B and P to another gate."
                    : i === 3
                      ? bn
                        ? "Q ও R-কে মিলিয়ে ফল বের করো।"
                        : "Combine Q and R."
                      : bn
                        ? "একই ফল দুই ইনপুটে: আউটপুট উল্টে যায়।"
                        : "Same result on both inputs: this inverts the output."}
            </p>
          </li>
        ))}
      </ol>
      <Button variant="outline" onClick={() => setReveal(reveal >= steps.length ? 1 : reveal + 1)}>
        {reveal >= steps.length
          ? bn
            ? "ধাপগুলো আবার দেখি"
            : "Restart the steps"
          : bn
            ? "পরের গেট যুক্ত করি"
            : "Connect the next gate"}
      </Button>
      <Table
        headers={["A", "B", `Only ${family}`, target]}
        rows={inputRows(2).map(([a, b]) => [
          a!,
          b!,
          universalNetwork(family, target, a!, b!).at(-1)!.value,
          gateValue(target, a!, b!),
        ])}
        selected={values[0]! * 2 + values[1]!}
      />
      <p className="text-sm text-primary">
        {bn
          ? "সম্পূর্ণ সার্কিটের ফল ও লক্ষ্য গেটের ফল প্রতিটি সারিতে একই।"
          : "The completed circuit and target gate agree in every row."}{" "}
        {steps.length} {family} {bn ? "গেট ব্যবহৃত" : "gates used"}.
      </p>
    </div>
  );
}
function Compound({ bn }: { bn: boolean }) {
  const [mode, setMode] = useState(0),
    [values, setValues] = useState([0, 1, 1]);
  const names = ["AND-OR (AO)", "OR-AND (OA)", "AND-OR-Invert (AOI)", "OR-AND-Invert (OAI)"];
  const first: Gate = mode % 2 === 0 ? "AND" : "OR",
    second: Gate = mode % 2 === 0 ? "OR" : "AND";
  const nodes: Node[] = [
    { name: "P", gate: first, inputs: ["A", "B"], x: 140, y: 70 },
    { name: "Q", gate: second, inputs: ["P", "C"], x: 285, y: 150 },
  ];
  if (mode >= 2) nodes.push({ name: "F", gate: "NOT", inputs: ["Q"], x: 425, y: 150 });
  const evaluate = (a: number, b: number, c: number) => {
    const v = gateValue(second, gateValue(first, a, b), c);
    return mode >= 2 ? 1 - v : v;
  };
  return (
    <div className="space-y-5">
      <p className="text-sm leading-7">
        {bn
          ? "Compound মানে কয়েকটি মৌলিক অপারেশন একসঙ্গে। NAND = AND + NOT, NOR = OR + NOT; XOR/XNOR-ও মৌলিক গেট দিয়ে তৈরি হয়। তাই বিভাগগুলো একে অপরের সঙ্গে মিলে যেতে পারে। আরও উদাহরণ: AO, OA, AOI ও OAI।"
          : "Compound means combining basic operations. NAND is AND followed by NOT; NOR is OR followed by NOT. XOR/XNOR can also be built from basic gates, so these categories overlap. Further examples are AO, OA, AOI and OAI."}
      </p>
      <div className="flex flex-wrap gap-2">
        {names.map((name, i) => (
          <Button
            key={name}
            variant={i === mode ? "default" : "outline"}
            onClick={() => setMode(i)}
          >
            {name}
          </Button>
        ))}
      </div>
      <p className="font-mono">F = {["AB + C", "(A+B)C", "(AB+C)′", "((A+B)C)′"][mode]}</p>
      <Switches values={values} set={setValues} bn={bn} />
      <Circuit nodes={nodes} values={values} label={names[mode]!} />
      <Table
        headers={["A", "B", "C", "F"]}
        rows={inputRows(3).map(([a, b, c]) => [a!, b!, c!, evaluate(a!, b!, c!)])}
        selected={values[0]! * 4 + values[1]! * 2 + values[2]!}
      />
    </div>
  );
}
export function LessonVisual({
  lesson,
  bn,
  onPractice,
  preview = false,
}: {
  lesson: number;
  bn: boolean;
  onPractice: () => void;
  preview?: boolean;
}) {
  const pages =
    lesson === 0
      ? bn
        ? ["পরিচিতি ও সূত্র", "ডি মর্গ্যানের দুই সূত্র"]
        : ["Introduction & laws", "De Morgan’s two laws"]
      : lesson === 1
        ? bn
          ? ["সারণি তৈরি", "ডি মর্গ্যানের প্রমাণ"]
          : ["Build a truth table", "Prove De Morgan"]
        : lesson === 2
          ? bn
            ? ["ধাপে ধাপে সরলীকরণ"]
            : ["Simplify step by step"]
          : bn
            ? ["গেটের বিভাগ", "প্রতিটি গেট", "যৌগিক গেট", "NAND/NOR দিয়ে XOR/XNOR"]
            : ["Gate families", "Explore every gate", "Compound gates", "XOR/XNOR from NAND/NOR"];
  const [page, setPage] = useState(0);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {pages.map((name, i) => (
          <Button
            key={name}
            variant={page === i ? "default" : "outline"}
            aria-pressed={page === i}
            onClick={() => setPage(i)}
            className="h-auto whitespace-normal text-left"
          >
            {i + 1}. {name}
          </Button>
        ))}
      </div>
      <div
        key={page}
        className="space-y-5 animate-in fade-in duration-200 motion-reduce:animate-none"
      >
        {lesson === 0 &&
          (page === 0 ? (
            <>
              <h3 className="text-xl font-bold">
                {bn ? "বুলিয়ান বীজগণিত কী?" : "What is Boolean algebra?"}
              </h3>
              <p className="text-sm leading-7">
                {bn
                  ? "এটি সত্য/মিথ্যা বা চালু/বন্ধ নিয়ে হিসাবের নিয়ম। চলকের মান কেবল 0 বা 1। + মানে OR, · বা পাশাপাশি লেখা মানে AND, ′ মানে NOT। যেমন A=1, B=0 হলে A+B=1, AB=0, A′=0। Theorem বা সূত্র হলো এমন সমতা যা সব ইনপুটের জন্য সত্য।"
                  : "Boolean algebra is a system for reasoning about true/false or on/off. Variables take only 0 or 1. + means OR, · or adjacent letters mean AND, and ′ means NOT. For A=1, B=0: A+B=1, AB=0, A′=0. A theorem is an identity that holds for every input."}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {BOOLEAN_LAWS.map((l) => (
                  <article key={l.name} className={box}>
                    <h4 className="font-semibold">
                      {l.name} {bn && `· ${l.bn}`}
                    </h4>
                    <div className="my-3 space-y-1 font-mono text-sm">
                      {l.forms.map((f) => (
                        <p key={f}>{f}</p>
                      ))}
                    </div>
                    <p className="text-sm leading-6">{bn ? l.text : l.en}</p>
                    <p className="mt-3 rounded-lg bg-card p-2 font-mono text-xs leading-6">
                      {l.example}
                    </p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <DeMorgan bn={bn} />
          ))}
        {lesson === 1 && (page === 0 ? <TruthBuilder bn={bn} /> : <DeMorgan bn={bn} proof />)}
        {lesson === 2 && <Simplify bn={bn} />}
        {lesson === 3 &&
          (page === 0 ? (
            <>
              <p className="text-sm leading-7">
                {bn
                  ? "গেট ইনপুটের উপর একটি লজিক নিয়ম চালিয়ে আউটপুট দেয়। নিচে কাজ অনুযায়ী বিভাগ। Compound একটি বিস্তৃত বর্ণনা; universal ও exclusive গেটও মৌলিক অপারেশন মিলিয়ে তৈরি করা যায়।"
                  : "A gate applies a logic rule to inputs to produce an output. Here are useful families. Compound is a broader description; universal and exclusive gates can also be built by combining basic operations."}
              </p>
              <div className="mx-auto w-fit rounded-xl bg-destructive px-6 py-3 font-semibold text-destructive-foreground">
                {bn ? "লজিক গেট" : "Logic gates"}
              </div>
              <div aria-hidden="true" className="mx-auto h-6 w-px bg-primary/40" />
              <div className="grid gap-3 border-t-2 border-primary/20 pt-5 sm:grid-cols-2">
                {[
                  ["Basic", "মৌলিক", "AND · OR · NOT"],
                  ["Universal", "সার্বজনীন", "NAND · NOR"],
                  ["Exclusive", "বিশেষ", "XOR · XNOR"],
                  ["Compound", "যৌগিক", "NAND · NOR · XOR · XNOR; AO · OA · AOI · OAI"],
                ].map(([en, bengali, items]) => (
                  <div key={en} className={box}>
                    <h4 className="font-bold">{bn ? bengali : en}</h4>
                    <p className="mt-2 font-mono text-sm leading-6">{items}</p>
                  </div>
                ))}
              </div>
            </>
          ) : page === 1 ? (
            <GateExplorer bn={bn} />
          ) : page === 2 ? (
            <Compound bn={bn} />
          ) : (
            <Universal bn={bn} />
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
          <Button variant="destructive" onClick={onPractice}>
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
