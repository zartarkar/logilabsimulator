export type PracticeTourStage = "levels" | "expressions" | "guide";

/** A tour sample that never changes the learner's circuit or challenge progress. */
export function PracticeTourPreview({ stage, bn }: { stage: PracticeTourStage; bn: boolean }) {
  return (
    <div className="space-y-2 text-xs" aria-label={bn ? "চ্যালেঞ্জের নমুনা" : "Challenge preview"}>
      <p className="text-[10px] text-muted-foreground">
        {bn ? "টিউটোরিয়ালের নমুনা" : "Tutorial preview"}
      </p>
      {stage === "levels" ? (
        <>
          <p className="font-semibold">
            {bn ? "চ্যালেঞ্জ শুরু করো → স্তর বেছে নাও" : "Start a challenge → choose a level"}
          </p>
          <div className="flex flex-wrap gap-1">
            {(bn ? ["সহজ", "মধ্যম", "কঠিন"] : ["Easy", "Intermediate", "Hard"]).map((label, i) => (
              <span
                key={label}
                className={`rounded border px-2 py-1 ${i === 0 ? "border-primary bg-primary/10" : "border-border"}`}
              >
                {label}
              </span>
            ))}
          </div>
        </>
      ) : stage === "expressions" ? (
        <>
          <p className="font-semibold">{bn ? "সহজ → রাশি" : "Easy → expression"}</p>
          {["F = AB", "F = A+B", "F = A XOR B"].map((text) => (
            <div key={text} className="rounded border px-2 py-1 font-mono">
              {text}
            </div>
          ))}
          <p className="text-muted-foreground">
            {bn
              ? "মধ্যম / কঠিন: সার্কিট বানাও → যাচাই করো"
              : "Intermediate / Hard: build → Check circuit"}
          </p>
        </>
      ) : (
        <>
          <p className="font-mono">F = AB · {bn ? "ধাপ ১/৬" : "Step 1/6"}</p>
          <p className="font-semibold">{bn ? "AND গেট যোগ করো।" : "Add an AND gate."}</p>
          <p className="text-muted-foreground">
            {bn ? "উপাদানের তালিকায় AND চাপো।" : "Tap AND in the component list."}
          </p>
          <div className="flex flex-wrap gap-1">
            {(bn ? ["আগের", "পরের", "রিসেট", "বাদ দাও"] : ["Back", "Next", "Reset", "Skip"]).map(
              (label) => (
                <span key={label} className="rounded border px-2 py-1">
                  {label}
                </span>
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}
