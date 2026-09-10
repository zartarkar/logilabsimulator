import { UniversalGateExplorer } from "./UniversalGateExplorer";
import { ComplementLesson } from "./ComplementLesson";

export function DigitalLogicChapter({ bn }: { bn: boolean }) {
  const sections = [
    {
      title: bn ? "লজিক গেটের শ্রেণিবিভাগ" : "Types of logic gates",
      text: bn ? "মৌলিক গেট হলো AND, OR ও NOT। AND-এ সব ইনপুট 1 হলে ফল 1; OR-এ অন্তত একটি 1 হলেই ফল 1; NOT ইনপুটের পূরক দেয়। NAND হলো AND-এর পূরক এবং NOR হলো OR-এর পূরক। দুটি ইনপুটের XOR ভিন্ন মান শনাক্ত করে, XNOR সমান মান শনাক্ত করে। গেটের চিহ্নে ছোট বৃত্ত বা bubble দিয়ে পূরক বোঝানো হয়।" : "The basic gates are AND, OR and NOT. AND requires all inputs to be 1; OR requires at least one; NOT complements its input. NAND complements AND, and NOR complements OR. Two-input XOR detects different values, while XNOR detects equal values. A small circle, or bubble, on a gate symbol indicates inversion.",
    },
    {
      title: bn ? "NAND ও NOR কেন সার্বজনীন গেট?" : "Why are NAND and NOR universal gates?",
      text: bn ? "শুধু NAND গেট ব্যবহার করে, অথবা শুধু NOR গেট ব্যবহার করে NOT, AND ও OR তৈরি করা যায়। এই মৌলিক অপারেশন দিয়ে যেকোনো বুলিয়ান ফাংশন বাস্তবায়ন করা যায় বলে NAND ও NOR-কে সার্বজনীন বা universal gate বলা হয়। একই সার্কিটে NAND ও NOR দুটোই থাকা বাধ্যতামূলক নয়—যেকোনো এক ধরনের গেটই যথেষ্ট।" : "Using only NAND gates, or only NOR gates, we can construct NOT, AND and OR. These basic operations can implement any Boolean function, so NAND and NOR are called universal gates. You do not need both types together: either type alone is sufficient.",
    },
  ];
  return (
    <section className="space-y-6" aria-label={bn ? "ডিজিটাল লজিকের পাঠ" : "Digital logic lessons"}>
      <h3 className="font-display text-xl font-bold">{bn ? "আরও শিখি: গেট থেকে ডিজিটাল সার্কিট" : "Learn more: from gates to digital circuits"}</h3>
      <div className="grid gap-4 md:grid-cols-2">{sections.map(section => <article key={section.title} className="rounded-xl border border-border bg-card p-5"><h4 className="mb-3 font-bold">{section.title}</h4><p className="text-sm leading-7 text-muted-foreground">{section.text}</p></article>)}</div>
      <UniversalGateExplorer bn={bn} />
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h4 className="font-bold">{bn ? "বুলিয়ান ধ্রুবক, চলক ও দ্বৈত নীতি" : "Boolean constants, variables and duality"}</h4>
          <p className="text-sm leading-7 text-muted-foreground">{bn ? "0 ও 1 হলো ধ্রুবক; A, B, C হলো চলক। বুলিয়ান যোগ মানে OR, গুণ মানে AND। তাই 1+1 = 1, কিন্তু বাইনারি গাণিতিক যোগে 1+1 = 10। দ্বৈত নীতিতে + ও · এবং 0 ও 1 পরস্পর বদলালে একটি সূত্রের দ্বৈত সূত্র পাওয়া যায়; চলকের পূরক বদলাতে হয় না।" : "0 and 1 are constants; A, B and C are variables. Boolean addition means OR and multiplication means AND. Thus Boolean 1+1 = 1, whereas binary arithmetic 1+1 = 10. To form a dual, interchange + with · and 0 with 1; leave variables and their complements unchanged."}</p>
          <p className="rounded bg-muted p-3 font-mono text-sm">A+0 = A ↔ A·1 = A<br />A+1 = 1 ↔ A·0 = 0</p>
        </article>
        <article className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h4 className="font-bold">{bn ? "SOP ও POS: রাশি লেখার দুটি রূপ" : "SOP and POS: two expression forms"}</h4>
          <p className="text-sm leading-7 text-muted-foreground">{bn ? "SOP (Sum of Products)-এ AND করা পদগুলো OR করা হয়: AB + A'C। POS (Product of Sums)-এ OR করা পদগুলো AND করা হয়: (A+B)(A'+C)। এখানে sum ও product বুলিয়ান অপারেশন বোঝায়। কোনো রাশিতে শুধু একটি পদও থাকতে পারে।" : "In SOP (Sum of Products), AND terms are combined with OR: AB + A'C. In POS (Product of Sums), OR terms are combined with AND: (A+B)(A'+C). Sum and product refer to Boolean operations. A form may also contain just one term."}</p>
          <p className="text-sm leading-7 text-muted-foreground">{bn ? "মিনটার্মে সব চলক একবার করে AND আকারে থাকে। যে সারিতে F = 1, সেই সারির ইনপুট 1 হলে চলক, 0 হলে পূরক নিয়ে মিনটার্ম লেখো। যেমন A,B = 0,1 হলে A'B। সব এমন মিনটার্ম OR করলে canonical SOP হয়।" : "A minterm contains every variable once in an AND term. For each row where F = 1, use the variable for input 1 and its complement for input 0. The row A,B = 0,1 gives A'B. OR these minterms to obtain canonical SOP."}</p>
          <p className="text-sm leading-7 text-muted-foreground">{bn ? "ম্যাক্সটার্মে সব চলক OR আকারে থাকে। F = 0 সারির জন্য ইনপুট 0 হলে চলক, 1 হলে পূরক নাও। A,B = 0,1 সারিতে (A+B')। এমন ম্যাক্সটার্মগুলো AND করলে canonical POS হয়।" : "A maxterm contains every variable in an OR term. For rows where F = 0, use the variable for input 0 and its complement for input 1. The row A,B = 0,1 gives (A+B'). AND these maxterms to obtain canonical POS."}</p>
        </article>
      </div>
      <article className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h4 className="font-bold">{bn ? "ট্রুথ টেবিল থেকে সার্কিট" : "From truth table to circuit"}</h4>
        <p className="text-sm leading-7 text-muted-foreground">{bn ? "ধরো দুই ইনপুটের আউটপুট শুধু 01 ও 10 সারিতে 1। মিনটার্ম দুটি A'B ও AB', তাই F = A'B + AB'। এটি XOR। সার্কিটে প্রথমে NOT দিয়ে A' ও B', তারপর দুটি AND দিয়ে পদ দুটি, শেষে OR দিয়ে F তৈরি করো। সরলীকরণের আগে ও পরে সব ইনপুটে ফল মিলিয়ে দেখো।" : "Suppose a two-input output is 1 only for rows 01 and 10. The minterms are A'B and AB', so F = A'B + AB', which is XOR. Build A' and B' with NOT, the two products with AND, then combine them with OR. Verify all input combinations before and after simplifying."}</p>
      </article>
      <ComplementLesson bn={bn} />
    </section>
  );
}
