import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { GateShape } from "@/components/circuit/GateShape";
import { GATES, shapes, type Gate } from "./model";
export function RecognitionScene({
  bn,
  onComplete,
  revealed,
}: {
  bn: boolean;
  revealed: boolean;
  onComplete: (answers: Record<Gate, boolean>) => void;
}) {
  const [selected, setSelected] = useState<Gate | null>(null);
  const [attempts, setAttempts] = useState<Partial<Record<Gate, Gate>>>({});
  const [announcement, setAnnouncement] = useState("");
  const placed = Object.keys(attempts).length;
  function place(target: Gate, label: Gate | null) {
    if (!label || attempts[target] || Object.values(attempts).includes(label)) return;
    const next = { ...attempts, [target]: label };
    setAttempts(next);
    setSelected(null);
    setAnnouncement(
      label === target
        ? `${label}: ${bn ? "ঠিক মিলেছে!" : "Matched!"}`
        : bn
          ? "এই আকৃতিটা আবার দেখে নিই।"
          : "Let’s take another look at this shape.",
    );
    if (Object.keys(next).length === 3)
      onComplete(Object.fromEntries(GATES.map((g) => [g, next[g] === g])) as Record<Gate, boolean>);
  }
  return (
    <div className="ll-recognition">
      <div className="ll-scene-caption">
        {revealed ? bn ? "সঠিক নাম ও আকৃতিগুলো মিলিয়ে দেখো" : "Compare the correct names and shapes" : bn ? "১. একটি নাম বেছে নাও → ২. নিচের সঠিক ছবিতে চাপো" : "1. Choose a name → 2. Tap its matching shape below"}
      </div>
      <div className="ll-gate-labels" aria-label={bn ? "প্রথমে একটি গেটের নাম বেছে নাও" : "First choose a gate name"}>
        {GATES.map((gate) => (
          <button type="button" key={gate} draggable={!Object.values(attempts).includes(gate)} disabled={Object.values(attempts).includes(gate)} aria-pressed={selected === gate}
            onClick={() => { setSelected(gate); setAnnouncement(""); }}
            onDragStart={(e) => { setSelected(gate); e.dataTransfer.setData("text/plain", gate); }}>
            {gate}<span aria-hidden="true">⠿</span>
          </button>
        ))}
      </div>
      <p className="ll-match-direction" id="ll-match-direction" role="status">
        {revealed ? bn ? "তিনটি উত্তর দেওয়া হয়েছে। ব্যাখ্যা পড়ে ‘পরের প্রশ্নে যাই’ চাপো।" : "All three answers are recorded. Read the explanation, then press ‘Next question’."
          : selected ? bn ? `${selected} বেছে নিয়েছো। এখন নিচের যে ছবিটি ${selected} গেটের, সেটিতে চাপো।` : `${selected} selected. Now tap the shape below that represents ${selected}.`
          : bn ? `${placed ? "এবার বাকি" : "প্রথমে উপরের"} AND / OR / NOT নামের একটি বাটনে চাপো।` : `${placed ? "Choose a remaining" : "First choose an"} AND / OR / NOT name above.`}
      </p>
      <div className="ll-symbols">
        {(["OR", "NOT", "AND"] as Gate[]).map((gate, i) => (
          <div key={gate} className="ll-symbol-slot">
            <button
              type="button"
              disabled={!!attempts[gate] || !selected}
              aria-describedby="ll-match-direction"
              className={
                attempts[gate]
                  ? attempts[gate] === gate
                    ? "is-matched"
                    : "is-recap"
                  : selected
                    ? "is-target"
                    : ""
              }
              aria-label={`${bn ? "আকৃতি" : "Shape"} ${i + 1}: ${shapes[gate][bn ? 0 : 1]}`}
              onClick={() => place(gate, selected)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const label = e.dataTransfer.getData("text/plain") as Gate;
                if (GATES.includes(label)) place(gate, label);
              }}
            >
              <span aria-hidden="true">
                <GateShape type={gate} active={revealed || attempts[gate] === gate} />
              </span>
              <span className="ll-drop-label">
                {attempts[gate] ? (
                  <>
                    {attempts[gate] === gate ? <Check size={16} /> : <RotateCcw size={16} />}{" "}
                    {revealed ? gate : attempts[gate]}
                  </>
                ) : bn ? (
                  selected ? `${selected} বসাও` : "আগে নাম বেছে নাও"
                ) : (
                  selected ? `Place ${selected}` : "Choose a name first"
                )}
              </span>
            </button>
            {revealed && <p>{shapes[gate][bn ? 0 : 1]}</p>}
          </div>
        ))}
      </div>
      <p className="ll-canvas-hint">
        {bn
          ? `নাম বসানো হয়েছে: ${placed}/৩ · চাইলে নাম টেনেও ছবিতে ছেড়ে দিতে পারো।`
          : `Names placed: ${placed}/3 · You can also drag a name onto its shape.`}
      </p>
      <span role="status" className="ll-match-announcement">
        {announcement}
      </span>
    </div>
  );
}
