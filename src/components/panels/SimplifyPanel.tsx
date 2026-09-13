import { useLang } from "@/i18n";
import { useCircuitStore } from "@/store/useCircuitStore";

export function SimplifyPanel() {
  const { parsed, simplified } = useCircuitStore();
  const { lang, t } = useLang();

  if (!parsed)
    return (
      <p className="p-4 text-sm text-muted-foreground">
        {lang === "bn" ? "প্রথমে একটি রাশি তৈরি করো।" : "Generate an expression first."}
      </p>
    );

  return (
    <div className="font-sans text-sm leading-6">
      {!simplified && (
        <p className="text-sm text-muted-foreground">{t("preparingSimplification")}</p>
      )}
      {simplified && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Step
            number={1}
            title={lang === "bn" ? "মূল রাশি" : "Original expression"}
            expression={parsed.normalized}
          />
          {simplified.derivation?.canonicalExpression && (
            <Step
              number={2}
              title={
                lang === "bn"
                  ? "যেসব ইনপুটে ফল 1, সেসব গুণফল পদ লিখি"
                  : "Write the product terms whose output is 1"
              }
              expression={simplified.derivation.canonicalExpression}
            />
          )}
          {simplified.derivation?.primeTerms.length ? (
            <Step
              number={3}
              title={lang === "bn" ? "পাশাপাশি পদগুলো একত্র করি" : "Combine adjacent terms"}
              law={
                lang === "bn"
                  ? "ব্যবহৃত সূত্র: XY + XY′ = X(Y + Y′), Y + Y′ = 1, X·1 = X"
                  : "Applied identities: XY + XY′ = X(Y + Y′), Y + Y′ = 1, X·1 = X"
              }
              expression={simplified.derivation.primeTerms.join(" + ")}
            />
          ) : null}
          <Step
            number={simplified.derivation?.primeTerms.length ? 4 : 2}
            title={lang === "bn" ? "চূড়ান্ত সরল রূপ" : "Final simplified form"}
            law={
              lang === "bn"
                ? "অপ্রয়োজনীয় পুনরাবৃত্ত পদ বাদ দেওয়া হয়েছে"
                : "Redundant repeated terms have been removed"
            }
            expression={simplified.expression}
            final
          />
        </div>
      )}
    </div>
  );
}

function Step({
  number,
  title,
  expression,
  law,
  final = false,
}: {
  number: number;
  title: string;
  expression: string;
  law?: string;
  final?: boolean;
}) {
  return (
    <div
      className={`flex gap-2 border-b border-border p-3 last:border-b-0 ${final ? "bg-emerald-50/70" : ""}`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-bold ${final ? "bg-emerald-600 text-white" : "bg-muted text-foreground"}`}
      >
        {number}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold leading-6 text-foreground">{title}</div>
        {law && <div className="mt-1 text-xs leading-5 text-muted-foreground">{law}</div>}
        <div
          className={`mt-2 overflow-x-auto rounded-md px-3 py-2 font-mono text-sm leading-6 ${final ? "bg-white font-bold text-emerald-700" : "bg-muted/60 text-foreground"}`}
        >
          F = {expression}
        </div>
      </div>
    </div>
  );
}
