const recipes = {
  NAND: [
    {
      gate: "NOT",
      steps: ["P = NAND(A, A) = A′"],
      en: "Connect A to both inputs. The output is NOT A.",
      bn: "একটি NAND গেটের দুই ইনপুটেই A দাও। আউটপুট হবে A-এর পূরক।",
    },
    {
      gate: "AND",
      steps: ["P = NAND(A, B) = (AB)′", "F = NAND(P, P) = AB"],
      en: "First obtain NOT(AB), then invert it using a second NAND.",
      bn: "প্রথম NAND-এ (AB)′ পাওয়া যায়। এই ফল দ্বিতীয় NAND-এর দুই ইনপুটে দিলে AB পাওয়া যায়।",
    },
    {
      gate: "OR",
      steps: ["P = NAND(A, A) = A′", "Q = NAND(B, B) = B′", "F = NAND(P, Q) = (A′B′)′ = A+B"],
      en: "Invert A and B separately, then feed the outputs into a third NAND.",
      bn: "দুটি NAND দিয়ে A ও B-এর পূরক নাও। পূরক দুটি তৃতীয় NAND-এ দিলে (A′B′)′ = A+B পাওয়া যায়।",
    },
  ],
  NOR: [
    {
      gate: "NOT",
      steps: ["P = NOR(A, A) = A′"],
      en: "Connect A to both inputs. The output is NOT A.",
      bn: "একটি NOR গেটের দুই ইনপুটেই A দাও। আউটপুট হবে A-এর পূরক।",
    },
    {
      gate: "AND",
      steps: ["P = NOR(A, A) = A′", "Q = NOR(B, B) = B′", "F = NOR(P, Q) = (A′+B′)′ = AB"],
      en: "Invert A and B separately, then feed the outputs into a third NOR.",
      bn: "দুটি NOR দিয়ে A ও B-এর পূরক নাও। পূরক দুটি তৃতীয় NOR-এ দিলে (A′+B′)′ = AB পাওয়া যায়।",
    },
    {
      gate: "OR",
      steps: ["P = NOR(A, B) = (A+B)′", "F = NOR(P, P) = A+B"],
      en: "First obtain NOT(A+B), then invert it using a second NOR.",
      bn: "প্রথম NOR-এ (A+B)′ পাওয়া যায়। এই ফল দ্বিতীয় NOR-এর দুই ইনপুটে দিলে A+B পাওয়া যায়।",
    },
  ],
};

export function UniversalGateBasics({ bn }: { bn: boolean }) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold">
        {bn ? "NAND ও NOR দিয়ে মৌলিক গেট তৈরি" : "Build basic gates using NAND and NOR"}
      </h3>
      <p>
        {bn
          ? "NAND(A, B) মানে একটি NAND গেটের দুই ইনপুটে A ও B দেওয়া। NOR(A, B)-ও একইভাবে পড়তে হবে। P ও Q মধ্যবর্তী গেটের আউটপুট, যা পরের গেটের ইনপুট হবে। প্রতিটি লাইনে একটি গেটের সংযোগ দেখানো হয়েছে।"
          : "NAND(A, B) means connecting A and B to a NAND gate's two inputs. Read NOR(A, B) the same way. P and Q are intermediate outputs that feed later gates. Each line describes one gate connection."}
      </p>
      <div className="grid gap-5 lg:grid-cols-2">
        {(["NAND", "NOR"] as const).map((family) => (
          <div key={family} className="space-y-4">
            <h4 className="rounded-lg bg-primary/5 p-3 font-semibold">
              {bn ? `শুধু ${family} গেট ব্যবহার করে` : `Using only ${family} gates`}
            </h4>
            {recipes[family].map((recipe) => (
              <article key={recipe.gate} className="space-y-3 rounded-xl border bg-white p-5">
                <h5 className="font-bold">
                  {family} → {recipe.gate}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({recipe.steps.length} {bn ? "টি গেট" : "gates"})
                  </span>
                </h5>
                <p className="text-sm leading-7">{bn ? recipe.bn : recipe.en}</p>
                <ol className="space-y-2">
                  {recipe.steps.map((step, i) => (
                    <li key={step} className="flex gap-2 text-sm">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <span className="font-mono break-words">{step}</span>
                    </li>
                  ))}
                </ol>
              </article>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
