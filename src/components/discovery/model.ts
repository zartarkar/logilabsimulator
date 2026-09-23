import { suggestFamiliarity } from "@/logic/introLearning";
export const GATES = ["AND", "OR", "NOT"] as const;
export type Gate = (typeof GATES)[number];
export type Destination = "concepts" | "simulator" | "builder";
export type Knowledge = { binaryUnderstanding: boolean | null } & Record<
  `recognize${Gate}` | `behavior${Gate}`,
  boolean | null
>;
export const initialKnowledge: Knowledge = {
  binaryUnderstanding: null,
  recognizeAND: null,
  recognizeOR: null,
  recognizeNOT: null,
  behaviorAND: null,
  behaviorOR: null,
  behaviorNOT: null,
};
export const DISCOVERY_KEY = "logiclab-discovery-v1";
export function assess(knowledge: Knowledge) {
  const values = Object.values(knowledge);
  const score = values.filter((value) => value === true).length;
  const complete = values.every((value) => value !== null);
  const familiarity = suggestFamiliarity(score, 7);
  // Binary is foundational; multiple gate gaps need a recap before expressions.
  const destination: Destination =
    knowledge.binaryUnderstanding !== true || score < 6 ? "concepts" : "simulator";
  return { score, complete, familiarity, destination };
}
export const gateCopy = {
  AND: {
    inputs: [1, 1],
    output: 1,
    formula: "1 · 1 = 1",
    rule: ["সব input 1 হলে AND এর output 1।", "AND outputs 1 only when every input is 1."],
    detail: [
      "দুটি শর্তই একসঙ্গে পূরণ হতে হবে: একটি input OFF হলেই output 0।",
      "Both conditions must hold. If either input is OFF, the output becomes 0.",
    ],
    rows: [
      [0, 0, 0],
      [0, 1, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
  },
  OR: {
    inputs: [0, 1],
    output: 1,
    formula: "0 + 1 = 1",
    rule: ["অন্তত একটি input 1 হলেই OR এর output 1।", "OR outputs 1 when at least one input is 1."],
    detail: [
      "এখানে A বন্ধ হলেও B চালু। তাই output চালু থাকে; শুধু দুটিই OFF হলে output 0।",
      "A is OFF, but B is ON, so the output is ON. Only two OFF inputs give 0.",
    ],
    rows: [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
  },
  NOT: {
    inputs: [1],
    output: 0,
    formula: "NOT 1 = 0",
    rule: ["NOT input কে উল্টে দেয়: 1 → 0।", "NOT flips its input: 1 → 0."],
    detail: [
      "এটির একটি input। input 0 দিলে output 1; input 1 দিলে output 0।",
      "It has one input. Input 0 gives output 1; input 1 gives output 0.",
    ],
    rows: [
      [0, 1],
      [1, 0],
    ],
  },
} as const;
export const shapes = {
  AND: [
    "ইনপুট প্রান্ত সরলরেখাবিশিষ্ট এবং আউটপুট প্রান্ত অর্ধবৃত্তাকার।",
    "Flat input side, rounded output side.",
  ],
  OR: [
    "ইনপুট প্রান্ত অবতল এবং আউটপুট প্রান্ত সূচালো।",
    "Curved input side, pointed output side.",
  ],
  NOT: [
    "ত্রিভুজের আউটপুটে ক্ষুদ্র বৃত্তটি যৌক্তিক পূরক নির্দেশ করে।",
    "A triangle with a small output circle.",
  ],
} as const;
