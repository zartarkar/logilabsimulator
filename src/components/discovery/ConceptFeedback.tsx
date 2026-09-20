import { CheckCircle2, Lightbulb, ArrowRight, Table2 } from "lucide-react";
import { GateShape } from "@/components/circuit/GateShape";
import { GATES, gateCopy, shapes, type Gate } from "./model";
export function ConceptFeedback({
  step,
  gate,
  correct,
  bn,
  expanded,
  onExpand,
  onNext,
}: {
  step: number;
  gate: Gate;
  correct: boolean;
  bn: boolean;
  expanded: boolean;
  onExpand: () => void;
  onNext: () => void;
}) {
  const text =
    step === 0
      ? bn
        ? `${correct ? "ঠিক!" : "Almost!"} Digital logic-এ 1 = ON এবং 0 = OFF।`
        : `${correct ? "Exactly!" : "Almost!"} In digital logic, 1 = ON and 0 = OFF.`
      : step === 1
        ? correct
          ? bn
            ? "Nice! তিনটা basic gate-ই তুমি চিনতে পারো।"
            : "Nice! You recognize all three basic gates."
          : bn
            ? "আকৃতির ছোট পার্থক্যগুলো দেখো।"
            : "Notice the small differences in their shapes."
        : gateCopy[gate].rule[bn ? 0 : 1];
  return (
    <section className="ll-feedback" aria-label={bn ? "ব্যাখ্যা" : "Explanation"}>
      <div className={`ll-verdict ${correct ? "correct" : "recap"}`} role="status">
        {correct ? <CheckCircle2 size={19} /> : <Lightbulb size={19} />}
        <strong>
          {correct
            ? bn
              ? "দারুণ, ঠিক ধরেছো!"
              : "You’ve got it!"
            : bn
              ? "চলো, দেখে বুঝে নিই"
              : "Let’s see why"}
        </strong>
      </div>
      <h2>{text}</h2>
      {step === 0 ? (
        <>
          <p>
            {bn
              ? "ডিজিটাল সার্কিট দুই অবস্থায় তথ্য রাখে: সিগন্যাল থাকলে 1, না থাকলে 0। পাশের সুইচে বদলটা দেখো।"
              : "Digital circuits represent two states: a high signal is 1 and a low signal is 0. Watch the switch and light."}
          </p>
          <div className="ll-feedback-bits">
            <span>
              ON <b>1</b>
            </span>
            <span>
              OFF <b>0</b>
            </span>
          </div>
        </>
      ) : step === 1 ? (
        <div className="ll-shape-recap">
          {GATES.map((g) => (
            <div key={g}>
              <GateShape type={g} active={false} />
              <span>
                <b>{g}</b>
                {shapes[g][bn ? 0 : 1]}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <>
          <p>{gateCopy[gate].detail[bn ? 0 : 1]}</p>
          <div className="ll-formula">{gateCopy[gate].formula}</div>
          {expanded && (
            <table className="ll-truth-recap">
              <caption>{bn ? "সব input-এর ফল" : "Compare every input"}</caption>
              <thead>
                <tr>
                  <th>A</th>
                  {gate !== "NOT" && <th>B</th>}
                  <th>Output</th>
                </tr>
              </thead>
              <tbody>
                {gateCopy[gate].rows.map((row, i) => (
                  <tr
                    key={i}
                    className={
                      row.slice(0, -1).join() === gateCopy[gate].inputs.join() ? "active" : ""
                    }
                  >
                    {row.map((bit, j) => (
                      <td key={j}>{bit}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      <div className="ll-feedback-actions">
        {step >= 2 && !expanded && (
          <button type="button" onClick={onExpand}>
            <Table2 size={15} />
            {bn ? "পুরো truth table দেখি" : "View the full truth table"}
          </button>
        )}
        <button type="button" className="ll-primary" onClick={onNext}>
          {step === 4 ? bn ? "আমার ফলাফল দেখি" : "See my insight" : bn ? "পরের প্রশ্নে যাই" : "Next question"}
          <ArrowRight size={17} />
        </button>
      </div>
      <p className="ll-feedback-wait">{bn ? "সময় নিয়ে পড়ো। উপরের বাটনে চাপলেই পরের ধাপে যাবে।" : "Take your time. Only the button above moves you to the next step."}</p>
    </section>
  );
}
