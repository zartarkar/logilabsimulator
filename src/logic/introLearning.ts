import { gateValue, type Gate } from "./lessonCurriculum";
export type Familiarity = "new" | "some" | "confident";
type Copy = { en: string; bn: string };
const copy = (en: string, bn: string): Copy => ({ en, bn });
export const QUESTION_COUNTS = [5, 5, 5, 5] as const;
export const questionOffset = (lesson: number) =>
  QUESTION_COUNTS.slice(0, lesson).reduce<number>((sum, count) => sum + count, 0);
export const INTRO_LESSONS = [
  {
    title: copy("Boolean algebra", "বুলিয়ান বীজগণিত"),
    contents: copy(
      "Meaning · All essential laws · De Morgan I & II",
      "পরিচিতি · প্রয়োজনীয় সব সূত্র · ডি মর্গ্যান ১ ও ২",
    ),
    practice: copy(
      "Apply laws and recognize equivalent expressions",
      "সূত্র প্রয়োগ ও সমতুল্য রাশি চেনা",
    ),
    text: copy(
      "Learn each law with examples, then explore both De Morgan identities using live circuits.",
      "উদাহরণসহ প্রতিটি সূত্র শেখো, তারপর লাইভ সার্কিটে ডি মর্গ্যানের দুই সূত্র বোঝো।",
    ),
    example: "(A+B)′ = A′B′; (AB)′ = A′+B′",
  },
  {
    title: copy("Truth tables", "ট্রুথ টেবিল"),
    contents: copy(
      "2/3 variables · Expressions to tables · Proof of both De Morgan laws",
      "২/৩টি চলক · রাশি থেকে সারণি · দুই ডি মর্গ্যান সূত্রের প্রমাণ",
    ),
    practice: copy("Count rows and calculate expression outputs", "সারি গণনা ও রাশির আউটপুট হিসাব"),
    text: copy(
      "Build tables column by column and prove identities by checking every possible input.",
      "কলাম ধরে সারণি তৈরি করো এবং সব ইনপুটে ফল মিলিয়ে সূত্র প্রমাণ করো।",
    ),
    example: "2² = 4; 2³ = 8; F = AB + A′C",
  },
  {
    title: copy("Simplifying logic functions", "লজিক ফাংশন সরলীকরণ"),
    contents: copy(
      "Factoring · Complement · Absorption · Worked examples",
      "সাধারণ পদ · পূরক · শোষণ · ধাপে ধাপে উদাহরণ",
    ),
    practice: copy("Choose the simplified expression", "সরল রাশি বেছে নাও"),
    text: copy(
      "Read all simplification steps together, with the law used at each step.",
      "প্রতিটি ধাপে ব্যবহৃত সূত্রের ব্যাখ্যাসহ সরলীকরণের সব ধাপ একসঙ্গে দেখো।",
    ),
    example: "AB + AB′ = A(B+B′) = A",
  },
  {
    title: copy("Logic gates & universal circuits", "লজিক গেট ও সার্বজনীন সার্কিট"),
    contents: copy(
      "Families · Every gate & truth table · Compound gates · NAND/NOR-only XOR and XNOR",
      "বিভাগ · প্রতিটি গেট ও সারণি · যৌগিক গেট · শুধু NAND/NOR দিয়ে XOR ও XNOR",
    ),
    practice: copy(
      "Predict gate outputs and follow universal circuits",
      "গেটের ফল ও সার্বজনীন সার্কিটের ধাপ হিসাব",
    ),
    text: copy(
      "Toggle inputs, compare outputs with truth tables, and build XOR/XNOR using one gate family.",
      "ইনপুট বদলে সারণির সঙ্গে ফল মেলাও এবং এক ধরনের গেট দিয়ে XOR/XNOR বানাও।",
    ),
    example: "4 NAND → XOR; 5 NAND → XNOR; 4 NOR → XNOR; 5 NOR → XOR",
  },
];
export type IntroQuestionKind = "choice" | "number" | "table";
export function makeIntroQuestion(
  lesson: number,
  challenge: boolean,
  random = Math.random,
  step = 0,
) {
  let prompt: Copy, answer: string, options: string[], explanation: Copy;
  let kind: IntroQuestionKind = "choice";
  let row: { a: number; b: number; gate: string } | undefined;
  const a = Math.floor(random() * 2),
    b = Math.floor(random() * 2);
  const x = random() < 0.5 ? "A" : "X",
    y = x === "A" ? "B" : "Y";
  if (lesson === 0) {
    const expressions = [`${x} + 0`, `(${x} + ${y})′`, `(${x}${y})′`, `${x}·${x}′`, `(${x}′)′`];
    const correct = [x, `${x}′${y}′`, `${x}′ + ${y}′`, "0", x];
    answer = correct[step]!;
    prompt = copy(
      `Which expression equals ${expressions[step]}?`,
      `${expressions[step]} এর সমান রাশি কোনটি?`,
    );
    options = Array.from(
      new Set([
        answer,
        "1",
        step === 3 ? x : "0",
        step === 1 ? `${x}′ + ${y}′` : step === 2 ? `${x}′${y}′` : `${x}′`,
      ]),
    );
    explanation = copy(
      `${expressions[step]} = ${answer}. ${["Identity: OR with 0 leaves the input unchanged.", "De Morgan I: invert both inputs and change OR to AND.", "De Morgan II: invert both inputs and change AND to OR.", "Complement: a value and its opposite cannot both be 1.", "Double complement: inverting twice returns the original input."][step]}`,
      `${expressions[step]} = ${answer}। ${["অভেদ: 0 দিয়ে OR করলে মান বদলায় না।", "ডি মর্গ্যান ১: ইনপুট উল্টে OR বদলে AND করো।", "ডি মর্গ্যান ২: ইনপুট উল্টে AND বদলে OR করো।", "পূরক: একটি মান ও তার বিপরীত একসঙ্গে 1 হতে পারে না।", "দ্বি পূরক: দুবার উল্টালে মূল ইনপুট ফিরে আসে।"][step]}`,
    );
  } else if (lesson === 1) {
    kind = "number";
    if (step === 0) {
      const n = challenge ? 3 : 2;
      answer = String(2 ** n);
      prompt = copy(
        `How many rows for ${n} independent binary variables?`,
        `${n}টি স্বাধীন বাইনারি চলকের জন্য কত সারি?`,
      );
      explanation = copy(
        `Each input has two choices: 2^${n} = ${answer}.`,
        `প্রতি ইনপুটের দুটি মান: 2^${n} = ${answer}।`,
      );
      options = ["2", "4", "8", "16"];
    } else if (step === 1) {
      answer = String(a | (1 - b));
      prompt = copy(`A=${a}, B=${b}. Find F = A + B′.`, `A=${a}, B=${b}। F = A + B′ কত?`);
      explanation = copy(
        `B′=${1 - b}; F=${a} OR ${1 - b}=${answer}.`,
        `B′=${1 - b}; F=${a} OR ${1 - b}=${answer}।`,
      );
      options = ["0", "1"];
    } else if (step === 2) {
      const c = challenge ? 1 : 0;
      answer = String((a & b) | ((1 - a) & c));
      prompt = copy(
        `A=${a}, B=${b}, C=${c}. Find F = AB + A′C.`,
        `A=${a}, B=${b}, C=${c}। F = AB + A′C কত?`,
      );
      explanation = copy(
        `AB=${a & b}, A′C=${(1 - a) & c}; OR them: ${answer}.`,
        `AB=${a & b}, A′C=${(1 - a) & c}; OR করলে ${answer}।`,
      );
      options = ["0", "1"];
    } else {
      const op = step === 3 ? "OR" : "AND";
      answer = String(Number(!gateValue(op, a, b)));
      options = ["0", "1"];
      prompt = copy(
        `A=${a}, B=${b}. Fill the truth-table output for ${step === 3 ? "(A + B)′" : "(AB)′"}.`,
        `A=${a}, B=${b} হলে ট্রুথ টেবিলে ${step === 3 ? "(A + B)′" : "(AB)′"} এর আউটপুট কত?`,
      );
      explanation = copy(
        `First ${op}: ${gateValue(op, a, b)}. Then invert: ${answer}. De Morgan gives the same result using ${step === 3 ? "A′B′" : "A′ + B′"}.`,
        `আগে ${op} করলে ${gateValue(op, a, b)}। ফল উল্টালে ${answer}। ডি মরগ্যানের সূত্রে ${step === 3 ? "A′B′" : "A′ + B′"} দিয়েও একই ফল পাওয়া যায়।`,
      );
    }
  } else if (lesson === 2) {
    const expressions = [
      `${x}${y} + ${x}${y}′`,
      `${x} + ${x}′${y}`,
      `(${x}+${y})(${x}+${y}′)`,
      `(${x}+${y})′ + ${x}′${y}`,
      `${x} + ${x}${y}`,
    ];
    answer = [x, `${x} + ${y}`, x, `${x}′`, x][step]!;
    prompt = copy(`Simplify ${expressions[step]}.`, `${expressions[step]} সরল করো।`);
    options = Array.from(new Set([answer, step === 3 ? x : `${x}′`, y, "0"]));
    explanation = copy(
      `${expressions[step]} = ${answer}. ${["Factor the shared input; Y + Y′ = 1.", "Distribute, then use the complement and identity laws.", "Reverse distribution gives X + YY′ = X + 0 = X.", "De Morgan, then factor X′; Y′ + Y = 1.", "Absorption: the first term already determines the result."][step]}`,
      `${expressions[step]} = ${answer}। ${["সাধারণ পদ নাও; Y + Y′ = 1।", "বণ্টন, তারপর পূরক ও অভেদ সূত্র।", "উল্টো বণ্টনে X + YY′ = X + 0 = X।", "ডি মর্গ্যান, তারপর X′ সাধারণ নাও; Y′ + Y = 1।", "পরিশোষণ: প্রথম পদই ফল নির্ধারণ করে।"][step]}`,
    );
  } else if (step === 4) {
    answer = "5";
    options = ["2", "3", "4", "5"];
    prompt = copy(
      "In the construction you learned, how many NAND gates make XNOR?",
      "শেখানো নির্মাণে শুধু NAND দিয়ে XNOR বানাতে মোট কতটি গেট লাগে?",
    );
    explanation = copy(
      "Four NAND gates make XOR. A fifth NAND with tied inputs inverts XOR to XNOR.",
      "চারটি NAND দিয়ে XOR হয়। এর ফল পঞ্চম NAND এর দুই ইনপুটে দিলে উল্টে XNOR হয়।",
    );
  } else {
    const gate: Gate =
      step === 0 ? (challenge ? "NOR" : "AND") : step === 1 ? "XOR" : step === 2 ? "XOR" : "XNOR";
    answer = String(gateValue(gate, a, b));
    options = ["0", "1"];
    kind = "table";
    row = { a, b, gate };
    prompt =
      step < 2
        ? copy(
            `A=${a}, B=${b}: complete the ${gate} output.`,
            `A=${a}, B=${b}: ${gate} এর আউটপুট পূরণ করো।`,
          )
        : copy(
            `A=${a}, B=${b}. The four-${step === 2 ? "NAND" : "NOR"} construction is complete. What is its ${gate} output?`,
            `A=${a}, B=${b}। চারটি ${step === 2 ? "NAND" : "NOR"} দিয়ে সার্কিট সম্পূর্ণ। এর ${gate} আউটপুট কত?`,
          );
    explanation = copy(
      `${gate}(${a},${b}) = ${answer}. ${step === 2 ? "Four NAND gates produce XOR; one more tied-input NAND inverts it to XNOR." : step === 3 ? "Four NOR gates produce XNOR; one more tied-input NOR inverts it to XOR." : gate === "XOR" ? "XOR is 1 for different inputs." : gate === "AND" ? "AND needs both inputs to be 1." : "NOR is 1 only for 00."}`,
      `${gate}(${a},${b}) = ${answer}। ${step === 2 ? "চারটি NAND এ XOR; একই ফল দুই ইনপুটে দিয়ে আরেকটি NAND এ XNOR হয়।" : step === 3 ? "চারটি NOR এ XNOR; একই ফল দুই ইনপুটে দিয়ে আরেকটি NOR এ XOR হয়।" : gate === "XOR" ? "ভিন্ন ইনপুটে XOR এর ফল 1।" : gate === "AND" ? "AND এ দুটি ইনপুটই 1 চাই।" : "শুধু 00 তে NOR এর ফল 1।"}`,
    );
  }
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [options[i], options[j]] = [options[j]!, options[i]!];
  }
  return { prompt, answer, options, explanation, kind, row };
}
export function suggestFamiliarity(correct: number, total = 8): Familiarity {
  return correct / total >= 0.875 ? "confident" : correct / total >= 0.5 ? "some" : "new";
}
export function checkIntroAnswer(question: ReturnType<typeof makeIntroQuestion>, value: string) {
  return value.trim().replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d))) === question.answer;
}
