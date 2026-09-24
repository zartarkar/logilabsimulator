import { useState } from "react";
import { CheckCircle2, Lightbulb, Power, XCircle } from "lucide-react";
export function BinaryScene({ revealed, bn }: { revealed: boolean; bn: boolean }) {
  const [on, setOn] = useState(true);
  return (
    <div className="ll-binary-scene">
      <div className="ll-scene-caption">
        {bn ? "একটি সিগন্যাল। দুটি অবস্থা।" : "One signal. Two states."}
      </div>
      <div className={`ll-power-circuit ${on ? "is-on" : ""}`}>
        <div className="ll-power-source">
          <span>{bn ? "ইনপুট" : "INPUT"}</span>
          <button
            type="button"
            aria-pressed={on}
            aria-label={bn ? "সুইচ চালু বা বন্ধ করো" : "Toggle the input switch"}
            onClick={() => setOn(!on)}
          >
            <Power size={28} />
          </button>
          <strong>{on ? "ON" : "OFF"}</strong>
        </div>
        <div className="ll-power-wire">
          <span />
          <i />
          <i />
          <i />
        </div>
        <div className="ll-bulb">
          <Lightbulb strokeWidth={1.5} />
          <strong>{revealed ? Number(on) : "?"}</strong>
          <span>{bn ? "সিগন্যাল" : "SIGNAL"}</span>
        </div>
      </div>
      <p className="ll-canvas-hint">
        {bn ? "সুইচে চাপ দিয়ে ON/OFF অবস্থা দেখো" : "Tap the switch to observe ON/OFF"}
      </p>
      {revealed && (
        <div className="ll-binary-key">
          <span>
            <i className="on" />1 = ON
          </span>
          <span>
            <i />0 = OFF
          </span>
        </div>
      )}
    </div>
  );
}
export function BinaryChoices({
  answer,
  bn,
  onAnswer,
}: {
  answer: boolean | null;
  bn: boolean;
  onAnswer: (correct: boolean) => void;
}) {
  return (
    <div
      className="ll-binary-choices"
      aria-label={bn ? "সঠিক অপশন নির্বাচন করো" : "Choose the correct option"}
    >
      {[true, false].map((correct) => (
        <button
          type="button"
          key={String(correct)}
          disabled={answer !== null}
          data-result={answer === correct ? (correct ? "correct" : "incorrect") : undefined}
          onClick={() => onAnswer(correct)}
          aria-label={`ON = ${correct ? 1 : 0}, OFF = ${correct ? 0 : 1}`}
        >
          <span className="ll-choice-label">
            {correct ? "A" : "B"}
            {answer === correct && (
              <span>
                {correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {correct ? (bn ? "সঠিক" : "Correct") : bn ? "সঠিক নয়" : "Incorrect"}
              </span>
            )}
          </span>
          <span className="ll-choice-state">
            <span className="ll-mini-switch on" />
            ON <b>{correct ? 1 : 0}</b>
          </span>
          <span className="ll-choice-state">
            <span className="ll-mini-switch" />
            OFF <b>{correct ? 0 : 1}</b>
          </span>
        </button>
      ))}
    </div>
  );
}
