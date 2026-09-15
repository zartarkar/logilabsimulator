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
      <p className="text-sm leading-6">
        {bn
          ? "বুলিয়ান অ্যালজেবরায় 1 মানে সত্য বা চালু, 0 মানে মিথ্যা বা বন্ধ। AND (AB): সব ইনপুট 1 হলে ফল 1। OR (A+B): যেকোনো ইনপুট 1 হলে ফল 1। NOT (A′): ইনপুটের বিপরীত মান।"
          : "Boolean algebra uses 1 for true/on and 0 for false/off. AND (AB): all inputs must be 1. OR (A+B): any input can be 1. NOT (A′): invert the input."}
      </p>
      <h3 className="border-t pt-6 font-display text-xl font-bold">
        {bn ? "বুলিয়ান উপপাদ্য (Boolean Theorems)" : "Boolean Theorems"}
      </h3>
      <p className="text-sm leading-7">
        {bn
          ? "বুলিয়ান অ্যালজেবরার বিভিন্ন রাশি সরলীকরণ এবং লজিক সার্কিটের কার্যপ্রণালি বিশ্লেষণের জন্য কিছু নির্দিষ্ট সূত্র বা উপপাদ্য ব্যবহার করা হয়। গুরুত্বপূর্ণ বুলিয়ান উপপাদ্যগুলো হলো, "
          : "Specific laws or theorems help simplify Boolean expressions and analyse logic circuits. The important Boolean theorems are:"}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {theorems.map((law, i) => (
          <article key={law.en} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <h4 className="font-semibold">
              {bn ? String(i + 1).replace(/\d/g, (d) => "০1২৩৪৫৬৭৮৯"[Number(d)]!) : i + 1}.{" "}
              {bn ? law.bn : law.en}
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
