import { browserStorage } from "@/lib/browserStorage";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";

type Dict = Record<string, { en: string; bn: string }>;

export const DICT: Dict = {
  classLine: { en: "Class 11–12", bn: "একাদশ–দ্বাদশ শ্রেণি" },
  chapterLine: {
    en: "Chapter 3: Number Systems & Digital Devices",
    bn: "অধ্যায় ৩: সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস",
  },
  appTitle: { en: "Boolean Logic Simulator", bn: "বুলিয়ান লজিক সিমুলেটর" },
  tabCircuit: { en: "Expression Simulator", bn: "এক্সপ্রেশন সিমুলেটর" },
  tabBuild: { en: "Build Your Own Circuit", bn: "নিজের সার্কিট বানাও" },
  tabLearn: { en: "Learn the Basics", bn: "নিজে শিখি" },
  tabPractice: { en: "Practice", bn: "প্র্যাকটিস" },
  tutorial: { en: "Tutorial", bn: "টিউটোরিয়াল" },
  tutorialTitle: { en: "How to use this app", bn: "অ্যাপটি কীভাবে ব্যবহার করবে" },
  tutorialIntro: {
    en: "Follow these steps to go from a Boolean expression to a working circuit.",
    bn: "একটি বুলিয়ান এক্সপ্রেশন থেকে সম্পূর্ণ সার্কিট বানাতে এই ধাপগুলো অনুসরণ করো।",
  },
  step1t: { en: "1. Write the expression", bn: "1. এক্সপ্রেশন লেখো" },
  step1d: {
    en: "Type a Boolean expression such as F = XYZ + XY' in the input box on the left. You can also pick a ready-made example.",
    bn: "বাঁ পাশের ইনপুট বক্সে F = XYZ + XY' এর মতো এক্সপ্রেশন লেখো, অথবা তৈরি উদাহরণ থেকে বেছে নাও।",
  },
  step2t: { en: "2. Set the input values", bn: "২. ইনপুট মান ঠিক করো" },
  step2d: {
    en: "Toggle each variable between 0 (OFF) and 1 (ON), or use Randomize / All 0 / All 1.",
    bn: "প্রতিটি ভেরিয়েবলকে ০ (OFF) বা 1 (ON) করো, অথবা Randomize / All 0 / All 1 ব্যবহার করো।",
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
  original: { en: "Original", bn: "মূল এক্সপ্রেশন" },
  simplified: { en: "Simplified", bn: "সরলীকৃত" },
  preparingSimplification: { en: "Preparing simplified expression...", bn: "সরলীকৃত এক্সপ্রেশন তৈরি হচ্ছে..." },
  equivalenceVerified: { en: "Equivalence verified on every input combination", bn: "প্রতিটি ইনপুট সমন্বয়ের জন্য সমতা যাচাই করা হয়েছে" },
  notVerified: { en: "Not verified. Original kept.", bn: "যাচাই করা যায়নি। মূল এক্সপ্রেশন রাখা হয়েছে।" },
  gates: { en: "gates", bn: "গেট" },
  depth: { en: "depth", bn: "গভীরতা" },
  ast: { en: "AST & validation", bn: "AST ও যাচাই" },
  gate: { en: "Gate", bn: "গেট" },
  analysis: { en: "Analysis", bn: "বিশ্লেষণ" },
  circuitCanvas: { en: "Circuit canvas", bn: "সার্কিট ক্যানভাস" },
  emptyCanvas: {
    en: "Enter a Boolean expression and press Generate to build the circuit.",
    bn: "একটি বুলিয়ান এক্সপ্রেশন লিখে Generate চাপলে সার্কিট তৈরি হবে।",
  },
  components: { en: "Components", bn: "কম্পোনেন্ট" },
  mobileMoveInstruction: {
    en: "Tap an element, then tap an empty canvas spot to move it",
    bn: "একটি element-এ tap করে canvas-এর খালি জায়গায় tap করলে সেটি সরবে",
  },
  builderTruth: { en: "Truth table of your circuit", bn: "তোমার সার্কিটের ট্রুথ টেবিল" },
  builderTruthEmpty: {
    en: "Add input switches and an output LED to see the truth table.",
    bn: "ট্রুথ টেবিল দেখতে ইনপুট সুইচ ও আউটপুট LED যোগ করো।",
  },
  randomize: { en: "Randomize", bn: "এলোমেলো" },
  all0: { en: "All 0", bn: "সব ০" },
  all1: { en: "All 1", bn: "সব 1" },
  parseFirst: { en: "Parse an expression to detect its variables.", bn: "ভেরিয়েবল দেখতে একটি এক্সপ্রেশন পার্স করো।" },
  uploadCircuit: { en: "Upload/Take Photo", bn: "আপলোড/ছবি তুলুন" },
  processingImage: { en: "Processing image...", bn: "ছবি প্রসেস করা হচ্ছে..." },
  imageSuccess: { en: "Circuit recognized!", bn: "সার্কিট শনাক্ত করা হয়েছে!" },
  imageError: { en: "Failed to recognize circuit.", bn: "সার্কিট শনাক্ত করা যায়নি।" },
  // Practice Challenge 1: AND Gate
  practiceAnd1Title: { en: "Practice 1: Build an AND gate", bn: "প্রাকটিস 1: AND গেট তৈরি করো" },
  practiceAnd1Summary: {
    en: "Create a circuit that outputs 1 only when both inputs are 1.",
    bn: "এমন সার্কিট বানাও যা শুধুমাত্র যখন দুটি ইনপুট 1 হয় তখনই আউটপুট 1 দেয়।",
  },
  practiceAnd1Hint: {
    en: "The output should be 1 only when both A and B are 1.",
    bn: "আউটপুট শুধুমাত্র তখনই 1 হবে যখন A এবং B দুটোই 1 হয়।",
  },
  practiceAnd1Inst0: {
    en: "Add two input switches labeled A and B.",
    bn: "A এবং B নামের দুটি ইনপুট সুইচ যোগ করো।",
  },
  practiceAnd1Inst1: {
    en: "Add one AND gate and one output LED.",
    bn: "একটি AND গেট এবং একটি আউটপুট LED যোগ করো।",
  },
  practiceAnd1Inst2: {
    en: "Connect A and B to the AND gate, then connect the gate output to the LED.",
    bn: "A এবং B কে AND গেটের সাথে সংযুক্ত করো, তারপর গেটের আউটপুট LED তে সংযুক্ত করো।",
  },
  practiceAnd1Guide0Msg: { en: "Choose this element: AND gate.", bn: "এই উপাদান বেছে নাও: AND গেট।" },
  practiceAnd1Guide0Detail: {
    en: "Select the AND gate from the component section first.",
    bn: "প্রথমে কম্পোনেন্ট সেকশন থেকে AND গেট নির্বাচন করো।",
  },
  practiceAnd1Guide1Msg: { en: "Now choose this element: Input switch.", bn: "এখন এই উপাদান বেছে নাও: ইনপুট সুইচ।" },
  practiceAnd1Guide1Detail: {
    en: "Add the first signal source that represents input A.",
    bn: "প্রথম সিগন্যাল সোর্স যোগ করো যা ইনপুট A প্রতিনিধিত্ব করে।",
  },
  practiceAnd1Guide2Msg: { en: "Add another input switch for B.", bn: "B এর জন্য আরেকটি ইনপুট সুইচ যোগ করো।" },
  practiceAnd1Guide2Detail: {
    en: "You need two input switches for A and B.",
    bn: "তোমার A এবং B এর জন্য দুটি ইনপুট সুইচ প্রয়োজন।",
  },
  practiceAnd1Guide3Msg: { en: "Choose this element: Output LED.", bn: "এই উপাদান বেছে নাও: আউটপুট LED।" },
  practiceAnd1Guide3Detail: {
    en: "Add the output LED that will show the final result.",
    bn: "আউটপুট LED যোগ করো যা চূড়ান্ত ফলাফল দেখাবে।",
  },
  practiceAnd1Guide4Msg: { en: "Complete all three wire connections.", bn: "তিনটি তারের সংযোগ সম্পূর্ণ করো।" },
  practiceAnd1Guide4Detail: {
    en: "Connect A and B to the AND gate, then connect the AND gate to the output LED.",
    bn: "A ও B থেকে AND গেটে তার দাও, তারপর AND গেট থেকে আউটপুট LED-তে তার দাও।",
  },
  practiceAnd1Guide5Msg: { en: "Toggle the input values and check the result.", bn: "ইনপুট মান টগল করো এবং ফলাফল দেখো।" },
  practiceAnd1Guide5Detail: {
    en: "Set inputs to 1 and 1 to see the LED turn on.",
    bn: "ইনপুট 1 এবং 1 করো LED চালু হতে দেখার জন্য।",
  },
  // Practice Challenge 2: OR Gate
  practiceOr2Title: { en: "Practice 2: Build an OR gate", bn: "প্রাকটিস ২: OR গেট তৈরি করো" },
  practiceOr2Summary: {
    en: "Create a circuit that outputs 1 when either input is 1.",
    bn: "এমন সার্কিট বানাও যা যেকোনো ইনপুট 1 হলে আউটপুট 1 দেয়।",
  },
  practiceOr2Hint: {
    en: "The output should be 0 only when both inputs are 0.",
    bn: "আউটপুট শুধুমাত্র তখনই ০ হবে যখন উভয় ইনপুট ০ হয়।",
  },
  practiceOr2Inst0: {
    en: "Place two input switches and one OR gate.",
    bn: "দুটি ইনপুট সুইচ এবং একটি OR গেট রাখো।",
  },
  practiceOr2Inst1: {
    en: "Wire both inputs to the OR gate.",
    bn: "উভয় ইনপুট OR গেটে তার সংযুক্ত করো।",
  },
  practiceOr2Inst2: {
    en: "Connect the OR output to the output LED.",
    bn: "OR গেটের আউটপুট আউটপুট LED তে সংযুক্ত করো।",
  },
  practiceOr2Guide0Msg: { en: "Choose this element: OR gate.", bn: "এই উপাদান বেছে নাও: OR গেট।" },
  practiceOr2Guide0Detail: {
    en: "Select the OR gate from the component section.",
    bn: "কম্পোনেন্ট সেকশন থেকে OR গেট নির্বাচন করো।",
  },
  practiceOr2Guide1Msg: { en: "Add input switch A.", bn: "ইনপুট সুইচ A যোগ করো।" },
  practiceOr2Guide1Detail: {
    en: "The OR gate needs both inputs connected.",
    bn: "OR গেটের উভয় ইনপুট সংযুক্ত দরকার।",
  },
  practiceOr2Guide2Msg: { en: "Add input switch B.", bn: "ইনপুট সুইচ B যোগ করো।" },
  practiceOr2Guide2Detail: {
    en: "The OR gate needs both inputs connected.",
    bn: "OR গেটের উভয় ইনপুট সংযুক্ত দরকার।",
  },
  practiceOr2Guide3Msg: { en: "Choose this element: Output LED.", bn: "এই উপাদান বেছে নাও: আউটপুট LED।" },
  practiceOr2Guide3Detail: {
    en: "Attach the LED to the OR output to read the final value.",
    bn: "চূড়ান্ত মান পড়ার জন্য LED কে OR আউটপুটে সংযুক্ত করো।",
  },
  practiceOr2Guide4Msg: { en: "Complete all three wire connections.", bn: "তিনটি তারের সংযোগ সম্পূর্ণ করো।" },
  practiceOr2Guide4Detail: {
    en: "Connect A and B to the OR gate, then connect the OR gate to the output LED.",
    bn: "A ও B থেকে OR গেটে তার দাও, তারপর OR গেট থেকে আউটপুট LED-তে তার দাও।",
  },
  // Practice Challenge 3: XOR Gate
  practiceXor3Title: { en: "Practice 3: Build an XOR gate", bn: "প্রাকটিস ৩: XOR গেট তৈরি করো" },
  practiceXor3Summary: {
    en: "Create a circuit that outputs 1 when exactly one input is on.",
    bn: "এমন সার্কিট বানাও যা ঠিক একটি ইনপুট 1 হলে আউটপুট 1 দেয়।",
  },
  practiceXor3Hint: {
    en: "XOR is true when the two inputs differ.",
    bn: "XOR সত্য তখনই যখন দুটি ইনপুট আলাদা হয়।",
  },
  practiceXor3Inst0: {
    en: "Use two input switches and one XOR gate.",
    bn: "দুটি ইনপুট সুইচ এবং একটি XOR গেট ব্যবহার করো।",
  },
  practiceXor3Inst1: {
    en: "Connect each input to the XOR gate.",
    bn: "প্রতিটি ইনপুট XOR গেটে সংযুক্ত করো।",
  },
  practiceXor3Inst2: {
    en: "Route the XOR result to the output LED.",
    bn: "XOR ফলাফল আউটপুট LED তে পাঠাও।",
  },
  practiceXor3Guide0Msg: { en: "Choose this element: XOR gate.", bn: "এই উপাদান বেছে নাও: XOR গেট।" },
  practiceXor3Guide0Detail: {
    en: "This gate outputs 1 only when the two inputs differ.",
    bn: "এই গেট শুধুমাত্র তখনই 1 দেয় যখন দুটি ইনপুট আলাদা হয়।",
  },
  practiceXor3Guide1Msg: { en: "Add input switch A.", bn: "ইনপুট সুইচ A যোগ করো।" },
  practiceXor3Guide1Detail: {
    en: "You need one signal for A and one for B.",
    bn: "তোমার A এর জন্য একটি এবং B এর জন্য একটি সিগন্যাল দরকার।",
  },
  practiceXor3Guide2Msg: { en: "Add input switch B.", bn: "ইনপুট সুইচ B যোগ করো।" },
  practiceXor3Guide2Detail: {
    en: "You need one signal for A and one for B.",
    bn: "তোমার A এর জন্য একটি এবং B এর জন্য একটি সিগন্যাল দরকার।",
  },
  practiceXor3Guide3Msg: { en: "Choose this element: Output LED.", bn: "এই উপাদান বেছে নাও: আউটপুট LED।" },
  practiceXor3Guide3Detail: {
    en: "This will show whether exactly one input is on.",
    bn: "এটি দেখাবে যে ঠিক একটি ইনপুট চালু আছে কিনা।",
  },
  practiceXor3Guide4Msg: { en: "Complete all three wire connections.", bn: "তিনটি তারের সংযোগ সম্পূর্ণ করো।" },
  practiceXor3Guide4Detail: {
    en: "Connect A and B to the XOR gate, then connect the XOR gate to the output LED.",
    bn: "A ও B থেকে XOR গেটে তার দাও, তারপর XOR গেট থেকে আউটপুট LED-তে তার দাও।",
  },
};

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof DICT) => string;
}

const LangContext = createContext<Ctx>({ lang: "bn", setLang: () => {}, t: (k) => DICT[k]?.bn ?? String(k) });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    const stored = browserStorage.getItem("logiclab-lang");
    if (stored === "bn" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    browserStorage.setItem("logiclab-lang", l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: keyof typeof DICT) => DICT[key]?.[lang] ?? String(key), [lang]);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
