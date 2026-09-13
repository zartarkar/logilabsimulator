import { BOOLEAN_LAWS } from "@/logic/lessonCurriculum";
const theorems = [
  {
    bn: "পরিচিতি সূত্র (Identity Law)",
    en: "Identity Law",
    forms: ["A + 0 = A", "A · 1 = A"],
    example: 0,
  },
  {
    bn: "পূরক উপপাদ্য (Complement Law)",
    en: "Complement Law",
    forms: ["A + A̅ = 1", "A · A̅ = 0"],
    example: 1,
  },
  {
    bn: "অপরিবর্তনীয় সূত্র (Idempotent Law)",
    en: "Idempotent Law",
    forms: ["A + A = A", "A · A = A"],
    example: 2,
  },
  {
    bn: "কর্তৃত্ব সূত্র (Domination/Annulment Law)",
    en: "Domination/Annulment Law",
    forms: ["A + 1 = 1", "A · 0 = 0"],
    example: 3,
  },
  {
    bn: "বিনিময় উপপাদ্য (Commutative Law)",
    en: "Commutative Law",
    forms: ["A + B = B + A", "A · B = B · A"],
    example: 4,
  },
  {
    bn: "অনুষঙ্গ উপপাদ্য (Associative Law)",
    en: "Associative Law",
    forms: ["A + (B + C) = (A + B) + C", "A · (B · C) = (A · B) · C"],
    example: 5,
  },
  {
    bn: "বিভাজন উপপাদ্য (Distributive Law)",
    en: "Distributive Law",
    forms: ["A(B + C) = AB + AC", "A + BC = (A + B)(A + C)"],
    example: 6,
  },
  {
    bn: "পরিশোষণ উপপাদ্য (Absorption Law)",
    en: "Absorption Law",
    forms: ["A(A + B) = A", "A + (A · B) = A"],
    example: 7,
  },
  {
    bn: "ডি মরগ্যানের উপপাদ্য (De Morgan’s Law)",
    en: "De Morgan’s Law",
    forms: ["(A + B)̅ = A̅ · B̅", "(A · B)̅ = A̅ + B̅"],
    example: 8,
  },
  {
    bn: "দ্বি পূরক উপপাদ্য (Double Complement Law)",
    en: "Double Complement Law",
    forms: ["(A̅)̅ = A"],
    example: -1,
  },
];
export function BooleanIntroduction({ bn }: { bn: boolean }) {
  return (
    <div className="space-y-6">
      <h3 className="font-display text-2xl font-bold">
        {bn ? "বুলিয়ান অ্যালজেবরা" : "Boolean Algebra"}
      </h3>
      <p className="text-sm leading-8">
        {bn
          ? "বুলিয়ান অ্যালজেবরা মূলত সত্য মিথ্যা, হ্যাঁ না কিংবা চালু বন্ধ, এ ধরনের যৌক্তিক সিদ্ধান্তকে গাণিতিকভাবে প্রকাশ ও বিশ্লেষণের একটি পদ্ধতি। এখানে সাধারণত 1 দ্বারা সত্য (True) বা চালু (ON) এবং ০ দ্বারা মিথ্যা (False) বা বন্ধ (OFF) অবস্থা প্রকাশ করা হয়। কম্পিউটার, স্মার্টফোন, ক্যালকুলেটর, ট্রাফিক সিগন্যাল, অ্যালার্ম সিস্টেমসহ বিভিন্ন ডিজিটাল যন্ত্রের সিদ্ধান্ত গ্রহণ ও নিয়ন্ত্রণে বুলিয়ান অ্যালজেবরা ব্যবহৃত হয়।"
          : "Boolean algebra is a way to express and analyse logical decisions mathematically: true or false, yes or no, on or off. Usually, 1 represents True or ON, while 0 represents False or OFF. It is used for decisions and control in computers, smartphones, calculators, traffic lights, alarm systems and other digital devices."}
      </p>
      <p className="text-sm leading-8">
        {bn
          ? "বুলিয়ান অ্যালজেবরার প্রধান তিনটি লজিক্যাল অপারেশন হলো AND, OR ও NOT। AND অপারেশনকে · বা পাশাপাশি লিখে (যেমন, A·B বা AB) প্রকাশ করা হয় এবং সব ইনপুট 1 হলেই এর আউটপুট 1 হয়। OR অপারেশনকে + চিহ্ন দিয়ে (যেমন, A+B) প্রকাশ করা হয় এবং যেকোনো একটি ইনপুট 1 হলেই আউটপুট 1 হয়। অন্যদিকে, NOT একটি ইনপুটের বিপরীত মান প্রদান করে এবং একে A̅ বা A′ দ্বারা প্রকাশ করা হয়; অর্থাৎ ইনপুট 1 হলে আউটপুট ০ এবং ইনপুট ০ হলে আউটপুট 1 হয়। এই লজিকগুলো ব্যবহার করেই বিভিন্ন শর্ত অনুযায়ী ডিজিটাল সার্কিটের কার্যক্রম নিয়ন্ত্রণ করা হয়।"
          : "The three main logical operations are AND, OR and NOT. AND is written with · or adjacent letters, such as A·B or AB; its output is 1 only when all inputs are 1. OR is written with +, as in A+B; its output is 1 when at least one input is 1. NOT gives the opposite of its input and is written A̅ or A′: input 1 gives output 0, and input 0 gives output 1. These operations control how digital circuits respond to different conditions."}
      </p>
      <h3 className="border-t pt-6 font-display text-xl font-bold">
        {bn ? "বুলিয়ান উপপাদ্য (Boolean Theorems)" : "Boolean Theorems"}
      </h3>
      <p className="text-sm leading-7">
        {bn
          ? "বুলিয়ান অ্যালজেবরার বিভিন্ন রাশি সরলীকরণ এবং লজিক সার্কিটের কার্যপ্রণালি বিশ্লেষণের জন্য কিছু নির্দিষ্ট সূত্র বা উপপাদ্য ব্যবহার করা হয়। গুরুত্বপূর্ণ বুলিয়ান উপপাদ্যগুলো হলো, "
          : "Specific laws or theorems help simplify Boolean expressions and analyse logic circuits. The important Boolean theorems are:"}
      </p>
      <div className="space-y-4">
        {theorems.map((law, i) => (
          <article key={law.en} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h4 className="font-semibold">
              {bn ? String(i + 1).replace(/\d/g, (d) => "০1২৩৪৫৬৭৮৯"[Number(d)]!) : i + 1}.{" "}
              {bn ? "?????" : "Identity"}
            </h4>
            <div className="my-3 space-y-2 font-mono text-sm">
              {law.forms.map((form, j) => (
                <p key={form}>
                  {j === 0 ? "i)" : "ii)"} {form}
                </p>
              ))}
            </div>
            <p className="rounded-lg bg-card p-3 font-mono text-xs leading-6">
              {bn ? "উদাহরণ: " : "Example: "}
              {law.example === -1
                ? "A = 1 → A̅ = 0 → (A̅)̅ = 1 = A"
                : BOOLEAN_LAWS[law.example]!.example}
              {i === 8 && (
                <>
                  <br />
                  {BOOLEAN_LAWS[9]!.example}
                </>
              )}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
