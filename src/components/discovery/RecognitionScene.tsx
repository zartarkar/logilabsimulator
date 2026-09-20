import { useState } from "react";
import { Check, X } from "lucide-react";
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
        ? `${label}: ${bn ? "সঠিক মিল" : "Correct match"}`
        : bn
          ? "এই মিলটি সঠিক নয়। বাকি নামগুলো মেলাও; শেষে সঠিক আকৃতি দেখানো হবে।"
          : "This match is incorrect. Place the remaining names to see the correct shapes.",
    );
    if (Object.keys(next).length === 3)
      onComplete(Object.fromEntries(GATES.map((g) => [g, next[g] === g])) as Record<Gate, boolean>);
  }
  return (
    <div className="ll-recognition">
      <div className="ll-scene-caption">
        {revealed
          ? bn
            ? "সঠিক নাম ও আকৃতি দেখো"
            : "Correct names and shapes"
          : bn
            ? "নাম বেছে নিয়ে সঠিক ছবিতে চাপো"
            : "Choose a name, then tap its matching shape"}
      </div>
      <div
        className="ll-gate-labels"
        aria-label={bn ? "গেটের নাম নির্বাচন করো" : "Select a gate name"}
      >
        {GATES.map((gate) => (
          <button
            type="button"
            key={gate}
            draggable={!Object.values(attempts).includes(gate)}
            disabled={Object.values(attempts).includes(gate)}
            aria-pressed={selected === gate}
            onClick={() => {
              setSelected(gate);
              setAnnouncement("");
            }}
            onDragStart={(e) => {
              setSelected(gate);
              e.dataTransfer.setData("text/plain", gate);
            }}
          >
            {gate}
            <span aria-hidden="true">⠿</span>
          </button>
        ))}
      </div>
      <p className="ll-match-direction" id="ll-match-direction" role="status">
        {revealed
          ? bn
            ? "মেলানো সম্পন্ন। ব্যাখ্যা পড়ে ‘পরবর্তী’ চাপো।"
            : "Matching complete. Read the explanation, then select ‘Next’."
          : selected
            ? bn
              ? `${selected} নির্বাচিত। নিচে ${selected} গেটের ছবিতে চাপো।`
              : `${selected} selected. Tap its shape below.`
            : bn
              ? placed
                ? "বাকি নামগুলোর একটি নির্বাচন করো।"
                : "উপরের AND, OR বা NOT বাটনে চাপো।"
              : placed
                ? "Select a remaining name."
                : "Select AND, OR or NOT above."}
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
              aria-label={`${bn ? "আকৃতি" : "Shape"} ${i + 1}: ${shapes[gate][bn ? 0 : 1]}${attempts[gate] ? (attempts[gate] === gate ? (bn ? ", সঠিক মিল" : ", correct match") : bn ? ", সঠিক নয়" : ", incorrect match") : ""}`}
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
                    {attempts[gate] === gate ? <Check size={16} /> : <X size={16} />}{" "}
                    {revealed ? gate : attempts[gate]}
                  </>
                ) : bn ? (
                  selected ? (
                    `${selected} বসাও`
                  ) : (
                    "আগে নাম নির্বাচন করো"
                  )
                ) : selected ? (
                  `Place ${selected}`
                ) : (
                  "Choose a name first"
                )}
              </span>
            </button>
            {revealed && <p>{shapes[gate][bn ? 0 : 1]}</p>}
          </div>
        ))}
      </div>
      <p className="ll-canvas-hint">
        {bn
          ? `সম্পন্ন: ${placed}/৩ · নাম টেনে ছবিতে ছেড়েও মেলাতে পারবে।`
          : `Names placed: ${placed}/3 · You can also drag a name onto its shape.`}
      </p>
      <span role="status" className="ll-match-announcement">
        {announcement}
      </span>
    </div>
  );
}
