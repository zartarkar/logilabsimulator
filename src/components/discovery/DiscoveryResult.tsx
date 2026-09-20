import {
  ArrowRight,
  BookOpenCheck,
  CircuitBoard,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { assess, GATES, type Destination, type Knowledge } from "./model";
export function DiscoveryResult({
  knowledge,
  bn,
  skipped,
  onEnter,
}: {
  knowledge: Knowledge;
  bn: boolean;
  skipped: boolean;
  onEnter: (destination: Destination) => void;
}) {
  const result = assess(knowledge);
  const incorrect = Object.values(knowledge).filter((value) => value === false).length;
  const number = (value: number) => value.toLocaleString(bn ? "bn-BD" : "en-US");
  const weak = GATES.filter((g) => knowledge[`behavior${g}`] !== true);
  const unknownShapes = GATES.filter((g) => knowledge[`recognize${g}`] !== true);
  const sentence = !knowledge.binaryUnderstanding
    ? bn
      ? "প্রথমে ON = 1 ও OFF = 0 এর ধারণা পুনরালোচনা করো।"
      : "Begin by strengthening the foundation: ON = 1, OFF = 0."
    : weak.length
      ? bn
        ? `${weak.join(" ও ")} এর output নির্ধারণ অনুশীলন করো।`
        : `Practise determining the output of ${weak.join(" and ")} gates.`
      : unknownShapes.length
        ? bn
          ? `গেটের output সম্পর্কে ধারণা পরিষ্কার। ${unknownShapes.join(" ও ")} এর আকৃতি পুনরালোচনা করো।`
          : `Gate outputs are clear. Review the ${unknownShapes.join(" and ")} shapes.`
        : bn
          ? "গেটের আকৃতি ও output সঠিকভাবে নির্ধারণ করা হয়েছে। এবার Expression Simulator ব্যবহার করো।"
          : "Gate shapes and outputs were identified correctly. Continue with the Expression Simulator.";
  return (
    <div className="ll-result">
      <span className="ll-eyebrow">
        <Sparkles size={16} />
        {bn ? "পরবর্তী ধাপ" : "NEXT STEP"}
      </span>
      <h1 tabIndex={-1} data-discovery-focus>
        {skipped
          ? bn
            ? "বিভাগ নির্বাচন করো"
            : "Choose your starting point"
          : bn
            ? "Logic Insight"
            : "Your Logic Insight"}
      </h1>
      {!skipped && (
        <>
          <p>{sentence}</p>
          <dl className="ll-result-marks" aria-label={bn ? "অনুশীলনের ফলাফল" : "Practice results"}>
            <div>
              <dt>{bn ? "মোট নম্বর" : "Marks"}</dt>
              <dd>
                {number(result.score)} / {number(Object.keys(knowledge).length)}
              </dd>
            </div>
            <div className="ll-marks-correct">
              <dt>{bn ? "সঠিক উত্তর" : "Correct"}</dt>
              <dd>{number(result.score)}</dd>
            </div>
            <div className="ll-marks-incorrect">
              <dt>{bn ? "ভুল উত্তর" : "Incorrect"}</dt>
              <dd>{number(incorrect)}</dd>
            </div>
          </dl>
          <div className="ll-profile">
            {(
              [
                ["Binary Concept", [knowledge.binaryUnderstanding]],
                ["Gate Recognition", GATES.map((g) => knowledge[`recognize${g}`])],
                ["Gate Behavior", GATES.map((g) => knowledge[`behavior${g}`])],
              ] as const
            ).map(([label, values]) => {
              const clear = values.every(Boolean);
              const almost =
                values.filter(Boolean).length >= values.length - 1 && values.some(Boolean);
              return (
                <div key={label}>
                  {clear ? <CheckCircle2 size={18} /> : <Lightbulb size={18} />}
                  <span>
                    {label}
                    <strong>
                      {clear
                        ? bn
                          ? "পরিষ্কার"
                          : "Clear"
                        : almost
                          ? bn
                            ? "প্রায় হয়ে গেছে"
                            : "Almost there"
                          : bn
                            ? "পুনরালোচনা প্রয়োজন"
                            : "A little recap"}
                    </strong>
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
      <div className="ll-destinations">
        {(
          [
            ["concepts", "Concepts Jhalai", BookOpenCheck],
            ["simulator", "Expression Simulator", CircuitBoard],
            ["builder", "Build Own Circuit", CircuitBoard],
          ] as const
        ).map(([destination, label, Icon]) => (
          <button
            type="button"
            key={destination}
            onClick={() => onEnter(destination)}
            className={!skipped && result.destination === destination ? "recommended" : ""}
          >
            <Icon size={20} />
            <span>
              {!skipped && result.destination === destination && (
                <small>{bn ? "প্রস্তাবিত বিভাগ" : "Recommended section"}</small>
              )}
              <strong>{label}</strong>
            </span>
            <ArrowRight size={18} />
          </button>
        ))}
      </div>
      <p className="ll-fineprint">
        {bn
          ? "সব বিভাগ ব্যবহার করা যাবে। পছন্দের বিভাগ নির্বাচন করো।"
          : "Every section is open. You can start with any of them."}
      </p>
    </div>
  );
}
