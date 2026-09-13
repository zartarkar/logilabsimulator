export type Bit = 0 | 1;
export type Gate = "AND" | "OR" | "NOT" | "NAND" | "NOR" | "XOR" | "XNOR";
export function gateValue(gate: Gate, a: number, b = 0): number {
  switch (gate) {
    case "AND":
      return a & b;
    case "OR":
      return a | b;
    case "NOT":
      return 1 - a;
    case "NAND":
      return Number(!(a & b));
    case "NOR":
      return Number(!(a | b));
    case "XOR":
      return a ^ b;
    case "XNOR":
      return Number(a === b);
  }
}
export function inputRows(n: number) {
  return Array.from({ length: 2 ** n }, (_, row) =>
    Array.from({ length: n }, (_, i) => (row >> (n - i - 1)) & 1),
  );
}
export function universalNetwork(
  family: "NAND" | "NOR",
  target: "XOR" | "XNOR",
  a: number,
  b: number,
) {
  const p = gateValue(family, a, a), q = gateValue(family, b, b);
  const cross = (family === "NAND") === (target === "XOR");
  const rInputs = cross ? (family === "NAND" ? ["P", "B"] : ["A", "Q"]) : ["A", "B"];
  const sInputs = cross ? (family === "NAND" ? ["A", "Q"] : ["P", "B"]) : ["P", "Q"];
  const values: Record<string, number> = { A:a, B:b, P:p, Q:q };
  const r = gateValue(family, values[rInputs[0]!]!, values[rInputs[1]!]!);
  const s = gateValue(family, values[sInputs[0]!]!, values[sInputs[1]!]!);
  return [
    {name:"P",inputs:["A","A"],value:p,x:140,y:25},
    {name:"Q",inputs:["B","B"],value:q,x:140,y:235},
    {name:"R",inputs:rInputs,value:r,x:310,y:60},
    {name:"S",inputs:sInputs,value:s,x:310,y:220},
    {name:"Y",inputs:["R","S"],value:gateValue(family,r,s),x:480,y:140},
  ];
}
export const BOOLEAN_LAWS = [
  {
    name: "Identity",
    bn: "অভেদ",
    forms: ["A + 0 = A", "A·1 = A"],
    example: "1 + 0 = 1; 0·1 = 0",
    en: "OR with 0 and AND with 1 leave A unchanged.",
    text: "0 দিয়ে OR, 1 দিয়ে AND করলে A বদলায় না।",
  },
  {
    name: "Complement",
    bn: "পূরক",
    forms: ["A + A′ = 1", "A·A′ = 0", "(A′)′ = A"],
    example: "A = 0: 0 + 1 = 1; 0·1 = 0",
    en: "A and NOT A are opposites. One is always 1 and the other 0. Two inversions return A.",
    text: "A ও NOT A বিপরীত। একটি 1, অন্যটি 0। দুবার উল্টালে A ফিরে আসে।",
  },
  {
    name: "Idempotent",
    bn: "পুনরাবৃত্তি",
    forms: ["A + A = A", "A·A = A"],
    example: "1 + 1 = 1; 0·0 = 0",
    en: "Repeating the same signal does not change it. Boolean OR is not arithmetic addition.",
    text: "একই সংকেত আবার নিলে মান বদলায় না। বুলিয়ান OR সাধারণ যোগ নয়।",
  },
  {
    name: "Annulment",
    bn: "আধিপত্য",
    forms: ["A + 1 = 1", "A·0 = 0"],
    example: "0 + 1 = 1; 1·0 = 0",
    en: "1 forces OR on; 0 forces AND off.",
    text: "OR এ 1 থাকলে ফল 1; AND এ 0 থাকলে ফল 0।",
  },
  {
    name: "Commutative",
    bn: "বিনিময়",
    forms: ["A + B = B + A", "AB = BA"],
    example: "0 + 1 = 1 + 0; 0·1 = 1·0",
    en: "Swap the order of inputs; the result stays the same.",
    text: "ইনপুটের ক্রম বদলালেও ফল একই।",
  },
  {
    name: "Associative",
    bn: "সংযোগ",
    forms: ["(A + B) + C = A + (B + C)", "(AB)C = A(BC)"],
    example: "(1 + 0) + 0 = 1 + (0 + 0) = 1",
    en: "For the same operation, regroup inputs without changing their values.",
    text: "একই অপারেশনে বন্ধনীর গ্রুপ বদলানো যায়।",
  },
  {
    name: "Distributive",
    bn: "বণ্টন",
    forms: ["A(B + C) = AB + AC", "A + BC = (A + B)(A + C)"],
    example: "1(0 + 1) = 1·0 + 1·1 = 1",
    en: "AND distributes over OR. In Boolean algebra OR also distributes over AND.",
    text: "AND কে OR এর উপর ছড়িয়ে দাও। বুলিয়ান বীজগণিতে OR ও AND এর উপর বণ্টিত হয়।",
  },
  {
    name: "Absorption",
    bn: "শোষণ",
    forms: ["A + AB = A", "A(A + B) = A"],
    example: "1 + 1·0 = 1; 0(0 + 1) = 0",
    en: "A already decides the result; the extra term adds nothing.",
    text: "A ই ফল নির্ধারণ করে, অতিরিক্ত পদটি আর কিছু বদলায় না।",
  },
  {
    name: "De Morgan I",
    bn: "ডি মর্গ্যান 1",
    forms: ["(A + B)′ = A′B′"],
    example: "(0 + 1)′ = 0; 0′·1′ = 1·0 = 0",
    en: "NOT an OR means AND of the inverted inputs.",
    text: "পুরো OR এর উল্টো = ইনপুট দুটো উল্টে AND।",
  },
  {
    name: "De Morgan II",
    bn: "ডি মর্গ্যান ২",
    forms: ["(AB)′ = A′ + B′"],
    example: "(0·1)′ = 1; 0′ + 1′ = 1 + 0 = 1",
    en: "NOT an AND means OR of the inverted inputs.",
    text: "পুরো AND এর উল্টো = ইনপুট দুটো উল্টে OR।",
  },
];
