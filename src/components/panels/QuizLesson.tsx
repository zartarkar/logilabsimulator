interface Lesson {
  title: [string, string];
  paragraphs: [string, string][];
  example: string;
}

const lessons: Record<number, Lesson> = {
  1: {
    title: ["AND: all conditions must be true", "AND: সব শর্ত সত্য হতে হবে"],
    paragraphs: [
      ["A binary input can only be 0 or 1. AND acts like two switches in series: the output turns on only when both switches are on. Write it as A·B or AB.", "বাইনারি ইনপুটের মান শুধু 0 বা 1। AND হলো পরপর বসানো দুটি সুইচের মতো: দুটোই চালু থাকলে আউটপুট চালু হয়। একে A·B বা AB লেখা হয়।"],
      ["If even one input is 0, the output is 0. With more than two inputs, the same rule applies: every input must be 1.", "একটি ইনপুটও 0 হলে আউটপুট 0। দুইয়ের বেশি ইনপুট হলেও একই নিয়ম: সব ইনপুট 1 হতে হবে।"],
    ],
    example: "0·0 = 0   |   0·1 = 0   |   1·0 = 0   |   1·1 = 1",
  },
  2: {
    title: ["OR: at least one true condition", "OR: অন্তত একটি শর্ত সত্য"],
    paragraphs: [
      ["OR acts like two switches in parallel: either switch can turn the output on. A + B means logical OR, not ordinary arithmetic addition.", "OR হলো পাশাপাশি দুটি বিকল্প পথে বসানো সুইচের মতো: যেকোনো একটি চালু হলেই আউটপুট চালু হয়। A + B মানে লজিক্যাল OR, সাধারণ গাণিতিক যোগ নয়।"],
      ["The output is 0 only when all inputs are 0. In Boolean algebra, 1 + 1 is 1 because the output still means ON.", "সব ইনপুট 0 হলেই শুধু আউটপুট 0। বুলিয়ান বীজগণিতে 1 + 1 = 1, কারণ ফল তখনও চালু অবস্থাই বোঝায়।"],
    ],
    example: "0+0 = 0   |   0+1 = 1   |   1+0 = 1   |   1+1 = 1",
  },
  3: {
    title: ["Build a truth table step by step", "ধাপে ধাপে ট্রুথ টেবিল তৈরি"],
    paragraphs: [
      ["A truth table lists every possible input combination and its output. Each independent binary input has two choices. For n inputs, multiply 2 by itself n times: the number of rows is 2ⁿ.", "ট্রুথ টেবিলে ইনপুটের সম্ভাব্য সব সমন্বয় ও প্রতিটির আউটপুট থাকে। প্রতিটি স্বাধীন বাইনারি ইনপুটের দুটি সম্ভাব্য মান। nটি ইনপুটের জন্য 2 কে n বার গুণ করতে হয়: সারির সংখ্যা 2ⁿ।"],
      ["One input gives 2 rows; two give 4; three give 8; four give 16. Count input variables, not gates or output columns. Write combinations in binary order, then calculate each output using the gate rules.", "একটি ইনপুটে 2টি, দুটিতে 4টি, তিনটিতে 8টি এবং চারটিতে 16টি সারি হয়। গেট বা আউটপুট কলাম নয়, ইনপুট চলক গুনতে হবে। বাইনারি ক্রমে সমন্বয় লিখে গেটের নিয়ম দিয়ে প্রতিটি আউটপুট বের করো।"],
    ],
    example: "n = 3 → 2³ = 2 × 2 × 2 = 8",
  },
  4: {
    title: ["NOT and De Morgan's first theorem", "NOT এবং ডি মর্গ্যানের প্রথম সূত্র"],
    paragraphs: [
      ["NOT flips a value: 0 becomes 1 and 1 becomes 0. An apostrophe means NOT. A' flips A, while (A + B)' flips the result of the whole bracket.", "NOT মান উল্টে দেয়: 0 হয় 1, আর 1 হয় 0। ঊর্ধ্বকমা দিয়ে NOT বোঝায়। A' শুধু A কে উল্টায়, কিন্তু (A + B)' পুরো বন্ধনীর ফল উল্টায়।"],
      ["To remove NOT from an OR bracket, change OR to AND and complement both inputs. For A = 0 and B = 0, both sides below give 1. Complementing the inputs without changing the operator is incorrect.", "OR এর বন্ধনীর বাইরের NOT সরাতে OR বদলে AND করো এবং উভয় ইনপুটের পূরক নাও। A = 0 ও B = 0 হলে নিচের দুই পাশই 1 হয়। অপারেটর না বদলে শুধু ইনপুটের পূরক নিলে ভুল হবে।"],
    ],
    example: "(A + B)' = A'·B'   |   (0 + 0)' = 1·1 = 1",
  },
  5: {
    title: ["Expand an expression with distribution", "বণ্টন সূত্র দিয়ে রাশি বিস্তৃত করো"],
    paragraphs: [
      ["AND distributes over OR. Multiply the term outside the brackets by each term inside, then OR the results together. Keep the outside term in both products.", "AND, OR এর উপর বণ্টিত হয়। বন্ধনীর বাইরের পদ দিয়ে ভেতরের প্রতিটি পদ গুণ করে ফলগুলো OR করো। দুটি গুণফলেই বাইরের পদটি থাকবে।"],
      ["For example, X(Y + Z) becomes XY + XZ. Boolean algebra also has A + BC = (A + B)(A + C). Both forms preserve the output for every input combination.", "যেমন, X(Y + Z) হয় XY + XZ। বুলিয়ান বীজগণিতে A + BC = (A + B)(A + C) ও সত্য। উভয় রূপে সব ইনপুট সমন্বয়ের জন্য আউটপুট একই থাকে।"],
    ],
    example: "A·(B + C) = A·B + A·C",
  },
  6: {
    title: ["Compare XOR, XNOR, NAND and NOR", "XOR, XNOR, NAND ও NOR তুলনা করো"],
    paragraphs: [
      ["For two inputs, XOR outputs 1 when the inputs differ. XNOR is NOT XOR: it outputs 1 when the inputs match. Unlike OR, XOR gives 0 for inputs 1 and 1.", "দুটি ইনপুট ভিন্ন হলে XOR এর আউটপুট 1। XNOR হলো XOR এর পূরক: ইনপুট সমান হলে আউটপুট 1। OR এর বিপরীতে XOR এ 1 ও 1 দিলে ফল 0।"],
      ["NAND is NOT AND, so it is 0 only for 11. NOR is NOT OR, so it is 1 only for 00. Calculate the basic gate first, then flip its output.", "NAND হলো AND এর পূরক, তাই শুধু 11 তে এর ফল 0। NOR হলো OR এর পূরক, তাই শুধু 00 তে এর ফল 1। আগে মূল গেটের ফল বের করে সেটি উল্টে দাও।"],
    ],
    example: "A = 0, B = 1 → XOR = 1, XNOR = 0",
  },
  7: {
    title: ["A variable and its complement", "চলক ও তার পূরক"],
    paragraphs: [
      ["A and A' always have opposite values. One is 1 and the other is 0. Their OR is therefore always 1, and their AND is always 0.", "A ও A' এর মান সবসময় বিপরীত। একটি 1 হলে অন্যটি 0। তাই তাদের OR সবসময় 1 এবং AND সবসময় 0।"],
      ["Do not confuse complement with repetition: A + A = A and A·A = A. Taking the complement twice also returns A: (A')' = A.", "পূরক ও পুনরাবৃত্তি এক নয়: A + A = A এবং A·A = A। দুবার পূরক নিলেও A ফিরে আসে: (A')' = A।"],
    ],
    example: "A + A' = 1   |   A·A' = 0   |   (A')' = A",
  },
  8: {
    title: ["Simplify with absorption", "শোষণ সূত্র দিয়ে সরল করো"],
    paragraphs: [
      ["In A + AB, the AB term cannot change the result already decided by A. If A is 0, both terms are 0. If A is 1, the OR is already 1 regardless of B.", "A + AB তে A ফল নির্ধারণ করে ফেলে; AB আর সেটি বদলাতে পারে না। A = 0 হলে দুটি পদই 0। A = 1 হলে B যা ই হোক, OR এর ফল 1।"],
      ["So A + AB simplifies to A. The paired absorption rule is A(A + B) = A. Simplification removes unnecessary operations while preserving every truth-table output.", "তাই A + AB সরল করলে A হয়। শোষণের অন্য সূত্র A(A + B) = A। সরলীকরণ অপ্রয়োজনীয় অপারেশন কমায়, কিন্তু ট্রুথ টেবিলের প্রতিটি আউটপুট একই রাখে।"],
    ],
    example: "X + XY = X   |   X(X + Y) = X",
  },
  9: {
    title: ["De Morgan's second theorem", "ডি মর্গ্যানের দ্বিতীয় সূত্র"],
    paragraphs: [
      ["To complement an AND expression, change AND to OR and complement both inputs. This is also another way to describe a NAND gate.", "AND রাশির পূরক নিতে AND বদলে OR করো এবং উভয় ইনপুটের পূরক নাও। এটি NAND গেট প্রকাশেরও আরেকটি উপায়।"],
      ["Check A = 1, B = 0: AB is 0, so (AB)' is 1. On the other side, A' + B' = 0 + 1 = 1. Both De Morgan rules change the operator as well as the inputs.", "A = 1, B = 0 দিয়ে দেখো: AB = 0, তাই (AB)' = 1। অন্য পাশে A' + B' = 0 + 1 = 1। ডি মর্গ্যানের দুটি সূত্রেই ইনপুটের সঙ্গে অপারেটরও বদলায়।"],
    ],
    example: "(A·B)' = A' + B'",
  },
  10: {
    title: ["Solve a circuit expression in stages", "ধাপে ধাপে সার্কিটের রাশি সমাধান"],
    paragraphs: [
      ["For F = AB + A'C, first substitute the input values. Compute NOT, then each AND term, and finally OR the intermediate results. Parentheses, if present, are evaluated first.", "F = AB + A'C এর জন্য আগে ইনপুটের মান বসাও। NOT, তারপর প্রতিটি AND পদ, সবশেষে মধ্যবর্তী ফলগুলো OR করো। বন্ধনী থাকলে সেটির কাজ আগে হবে।"],
      ["Worked example: A = 1, B = 0, C = 1. Step 1: A' = 0. Step 2: AB = 1·0 = 0 and A'C = 0·1 = 0. Step 3: F = 0 + 0 = 0. Try the same method below with different inputs.", "সমাধানসহ উদাহরণ: A = 1, B = 0, C = 1। ধাপ 1: A' = 0। ধাপ 2: AB = 1·0 = 0 এবং A'C = 0·1 = 0। ধাপ 3: F = 0 + 0 = 0। নিচের প্রশ্নে ভিন্ন ইনপুট দিয়ে একই পদ্ধতি প্রয়োগ করো।"],
    ],
    example: "Inputs → NOT → AND terms → OR → F",
  },
};

export function QuizLesson({ questionId, bn }: { questionId: number; bn: boolean }) {
  const lesson = lessons[questionId];
  if (!lesson) return null;
  const language = bn ? 1 : 0;
  return (
    <section className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-5 sm:p-6">
      <p className="text-xs font-semibold text-primary">{bn ? "আগে শিখি" : "Learn first"}</p>
      <h3 className="text-lg font-bold">{lesson.title[language]}</h3>
      {lesson.paragraphs.map((paragraph, index) => <p key={index} className="text-sm leading-7 text-foreground">{paragraph[language]}</p>)}
      <p className="rounded-lg bg-card p-3 font-mono text-sm leading-7">{lesson.example}</p>
      {questionId === 3 && (
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm">
            <caption className="mb-2 text-left text-sm text-muted-foreground">{bn ? "উদাহরণ: F = A·B·C, আটটি সমন্বয় ও ফল" : "Example: F = A·B·C, eight combinations and outputs"}</caption>
            <thead><tr>{["A", "B", "C", "F = A·B·C"].map(label => <th key={label} scope="col" className="border-b p-2">{label}</th>)}</tr></thead>
            <tbody>{Array.from({ length: 8 }, (_, row) => <tr key={row} className="border-b border-border/60"><td className="p-2">{(row >> 2) & 1}</td><td>{(row >> 1) & 1}</td><td>{row & 1}</td><td>{row === 7 ? 1 : 0}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      {questionId === 6 && (
        <div className="overflow-x-auto">
          <table className="w-full text-center text-sm">
            <caption className="mb-2 text-left text-muted-foreground">{bn ? "দুটি ইনপুটের গেটগুলোর তুলনা" : "Compare gates with two inputs"}</caption>
            <thead><tr>{["A", "B", "XOR", "XNOR", "NAND", "NOR"].map(label => <th key={label} scope="col" className="border-b p-2">{label}</th>)}</tr></thead>
            <tbody>{[[0, 0, 0, 1, 1, 1], [0, 1, 1, 0, 1, 0], [1, 0, 1, 0, 1, 0], [1, 1, 0, 1, 0, 0]].map((row, index) => <tr key={index} className="border-b border-border/60">{row.map((value, column) => <td key={column} className="p-2">{value}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
      <p className="text-sm font-medium text-primary">{bn ? "এবার এই পাঠের প্রশ্নটির উত্তর দাও ↓" : "Now answer the question about this lesson ↓"}</p>
    </section>
  );
}
