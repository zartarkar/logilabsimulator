import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

type Dict = Record<string, { en: string; bn: string }>;

export const DICT: Dict = {
  classLine: { en: "Class 11", bn: "একাদশ শ্রেণি" },
  chapterLine: {
    en: "Chapter 3: Number Systems & Digital Devices",
    bn: "অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
  },
  appTitle: { en: "Boolean Logic Simulator", bn: "বুলিয়ান লজিক সিমুলেটর" },
  tabCircuit: { en: "Expression Simulator", bn: "এক্সপ্রেশন সিমুলেটর" },
  tabBuild: { en: "Build Your Own Circuit", bn: "নিজের সার্কিট বানাও" },
  tabLearn: { en: "Learn", bn: "শেখো" },
  tutorial: { en: "Tutorial", bn: "টিউটোরিয়াল" },
  tutorialTitle: { en: "How to use this app", bn: "অ্যাপটি কীভাবে ব্যবহার করবে" },
  tutorialIntro: {
    en: "Follow these steps to go from a Boolean expression to a working circuit.",
    bn: "একটি বুলিয়ান এক্সপ্রেশন থেকে সম্পূর্ণ সার্কিট বানাতে এই ধাপগুলো অনুসরণ করো।",
  },
  step1t: { en: "1. Write the expression", bn: "১. এক্সপ্রেশন লেখো" },
  step1d: {
    en: "Type a Boolean expression such as F = XYZ + XY' in the input box on the left. You can also pick a ready-made example.",
    bn: "বাঁ পাশের ইনপুট বক্সে F = XYZ + XY' এর মতো এক্সপ্রেশন লেখো, অথবা তৈরি উদাহরণ থেকে বেছে নাও।",
  },
  step2t: { en: "2. Set the input values", bn: "২. ইনপুট মান ঠিক করো" },
  step2d: {
    en: "Toggle each variable between 0 (OFF) and 1 (ON), or use Randomize / All 0 / All 1.",
    bn: "প্রতিটি ভেরিয়েবলকে ০ (OFF) বা ১ (ON) করো, অথবা Randomize / All 0 / All 1 ব্যবহার করো।",
  },
  step3t: { en: "3. Press Generate", bn: "৩. Generate চাপো" },
  step3d: {
    en: "The circuit is drawn on the right. Active wires light up so you can trace the signal.",
    bn: "ডান পাশে সার্কিট আঁকা হবে। চালু তার জ্বলে উঠবে, ফলে সিগন্যাল অনুসরণ করা যাবে।",
  },
  step4t: { en: "4. Follow the step-by-step simulation", bn: "৪. ধাপে ধাপে সিমুলেশন দেখো" },
  step4d: {
    en: "Every gate evaluation is shown in order underneath the inputs, ending with the final output.",
    bn: "ইনপুটের নিচে প্রতিটি গেটের হিসাব ক্রমানুসারে দেখানো হয়, শেষে চূড়ান্ত আউটপুট।",
  },
  step5t: { en: "5. Check truth table & simplification", bn: "৫. ট্রুথ টেবিল ও সরলীকরণ দেখো" },
  step5d: {
    en: "The bottom panel shows the full truth table and the Quine–McCluskey simplification steps.",
    bn: "নিচের প্যানেলে পূর্ণ ট্রুথ টেবিল এবং কুইন–ম্যাক্লাস্কি সরলীকরণের ধাপ দেখা যায়।",
  },
  step6t: { en: "6. Build your own circuit", bn: "৬. নিজের সার্কিট বানাও" },
  step6d: {
    en: "In the builder tab, add gates and switches, drag wires between them, click a part to delete it, and read its truth table.",
    bn: "বিল্ডার ট্যাবে গেট ও সুইচ যোগ করো, তার টেনে সংযোগ দাও, কোনো অংশ মুছতে সেটিতে ক্লিক করো এবং ট্রুথ টেবিল দেখো।",
  },
  expression: { en: "Boolean expression", bn: "বুলিয়ান এক্সপ্রেশন" },
  generate: { en: "Generate", bn: "তৈরি করো" },
  parse: { en: "Parse", bn: "পার্স" },
  simplify: { en: "Simplify", bn: "সরলীকরণ" },
  inputValues: { en: "Input values", bn: "ইনপুট মান" },
  stepSim: { en: "Step-by-step simulation", bn: "ধাপে ধাপে সিমুলেশন" },
  examples: { en: "Examples", bn: "উদাহরণ" },
  settings: { en: "Settings", bn: "সেটিংস" },
  truthTable: { en: "Truth table", bn: "ট্রুথ টেবিল" },
  simplification: { en: "Simplification", bn: "সরলীকরণ" },
  ast: { en: "AST & validation", bn: "AST ও যাচাই" },
  gate: { en: "Gate", bn: "গেট" },
  analysis: { en: "Analysis", bn: "বিশ্লেষণ" },
  circuitCanvas: { en: "Circuit canvas", bn: "সার্কিট ক্যানভাস" },
  emptyCanvas: {
    en: "Enter a Boolean expression and press Generate to build the circuit.",
    bn: "একটি বুলিয়ান এক্সপ্রেশন লিখে Generate চাপলে সার্কিট তৈরি হবে।",
  },
  components: { en: "Components", bn: "কম্পোনেন্ট" },
  builderTruth: { en: "Truth table of your circuit", bn: "তোমার সার্কিটের ট্রুথ টেবিল" },
  builderTruthEmpty: {
    en: "Add input switches and an output LED to see the truth table.",
    bn: "ট্রুথ টেবিল দেখতে ইনপুট সুইচ ও আউটপুট LED যোগ করো।",
  },
  randomize: { en: "Randomize", bn: "এলোমেলো" },
  all0: { en: "All 0", bn: "সব ০" },
  all1: { en: "All 1", bn: "সব ১" },
  parseFirst: { en: "Parse an expression to detect its variables.", bn: "ভেরিয়েবল দেখতে একটি এক্সপ্রেশন পার্স করো।" },
};

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof DICT) => string;
}

const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => DICT[k]?.en ?? String(k) });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("logiclab-lang");
    if (stored === "bn" || stored === "en") setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("logiclab-lang", l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: keyof typeof DICT) => DICT[key]?.[lang] ?? String(key), [lang]);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
