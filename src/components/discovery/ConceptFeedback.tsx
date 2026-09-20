import { CheckCircle2, XCircle, ArrowRight, Table2 } from "lucide-react";
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
        ? "Digital logic এ ON = 1 এবং OFF = 0।"
        : "In digital logic, ON = 1 and OFF = 0."
      : step === 1
        ? correct
          ? bn
            ? "তিনটি গেটের নাম সঠিকভাবে মেলানো হয়েছে।"
            : "All three gate names are matched correctly."
          : bn
            ? "গেটগুলোর আকৃতির পার্থক্য দেখো।"
            : "Notice the small differences in their shapes."
        : gateCopy[gate].rule[bn ? 0 : 1];
  return (
    <section
      className="ll-feedback"
      data-result={correct ? "correct" : "incorrect"}
      aria-label={bn ? "ব্যাখ্যা" : "Explanation"}
    >
      <div className={`ll-verdict ${correct ? "correct" : "recap"}`} role="status">
        {correct ? <CheckCircle2 size={19} /> : <XCircle size={19} />}
        <strong>
          {correct
            ? bn
              ? "সঠিক উত্তর"
              : "Correct answer"
            : bn
              ? "ভুল উত্তর। সঠিক ব্যাখ্যা দেখো।"
              : "Incorrect answer. See the explanation."}
        </strong>
      </div>
      {step >= 2 && (
        <div className="ll-selected-output">
          <span>{bn ? "তোমার উত্তর" : "Your answer"}</span>
          <strong>{correct ? gateCopy[gate].output : 1 - gateCopy[gate].output}</strong>
          {correct ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
        </div>
      )}
      <h2>{text}</h2>
      {step === 0 ? (
        <>
          <p>
            {bn
              ? "ডিজিটাল সার্কিটে HIGH সিগন্যালকে 1 এবং LOW সিগন্যালকে 0 দিয়ে প্রকাশ করা হয়। সুইচে চাপ দিয়ে পরিবর্তন দেখো।"
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
          <div className="ll-formula">
            <small>{bn ? "সঠিক output" : "Correct output"}</small>
            {gateCopy[gate].formula}
          </div>
          {expanded && (
            <table className="ll-truth-recap">
              <caption>{bn ? "সব input এর ফল" : "Compare every input"}</caption>
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
            {bn ? "Truth table দেখো" : "View truth table"}
          </button>
        )}
        <button type="button" className="ll-primary" onClick={onNext}>
          {step === 4 ? (bn ? "ফলাফল দেখো" : "View results") : bn ? "পরবর্তী" : "Next"}
          <ArrowRight size={17} />
        </button>
      </div>
    </section>
  );
}
