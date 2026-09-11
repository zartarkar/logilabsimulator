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
  const g = (x: number, y: number) => gateValue(family, x, y);
  const p = g(a, b),
    q = g(a, p),
    r = g(b, p),
    s = g(q, r);
  const steps = [
    { name: "P", inputs: ["A", "B"], value: p, x: 170, y: 140 },
    { name: "Q", inputs: ["A", "P"], value: q, x: 340, y: 70 },
    { name: "R", inputs: ["B", "P"], value: r, x: 340, y: 220 },
    { name: "S", inputs: ["Q", "R"], value: s, x: 510, y: 140 },
  ];
  if ((family === "NAND" && target === "XNOR") || (family === "NOR" && target === "XOR"))
    steps.push({ name: "F", inputs: ["S", "S"], value: g(s, s), x: 680, y: 140 });
  return steps;
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
    text: "OR-এ 1 থাকলে ফল 1; AND-এ 0 থাকলে ফল 0।",
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
    text: "AND-কে OR-এর উপর ছড়িয়ে দাও। বুলিয়ান বীজগণিতে OR-ও AND-এর উপর বণ্টিত হয়।",
  },
  {
    name: "Absorption",
    bn: "শোষণ",
    forms: ["A + AB = A", "A(A + B) = A"],
    example: "1 + 1·0 = 1; 0(0 + 1) = 0",
    en: "A already decides the result; the extra term adds nothing.",
    text: "A-ই ফল নির্ধারণ করে, অতিরিক্ত পদটি আর কিছু বদলায় না।",
  },
  {
    name: "De Morgan I",
    bn: "ডি মর্গ্যান ১",
    forms: ["(A + B)′ = A′B′"],
    example: "(0 + 1)′ = 0; 0′·1′ = 1·0 = 0",
    en: "NOT an OR means AND of the inverted inputs.",
    text: "পুরো OR-এর উল্টো = ইনপুট দুটো উল্টে AND।",
  },
  {
    name: "De Morgan II",
    bn: "ডি মর্গ্যান ২",
    forms: ["(AB)′ = A′ + B′"],
    example: "(0·1)′ = 1; 0′ + 1′ = 1 + 0 = 1",
    en: "NOT an AND means OR of the inverted inputs.",
    text: "পুরো AND-এর উল্টো = ইনপুট দুটো উল্টে OR।",
  },
];
