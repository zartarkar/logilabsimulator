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
  const weak = GATES.filter((g) => knowledge[`behavior${g}`] !== true);
  const unknownShapes = GATES.filter((g) => knowledge[`recognize${g}`] !== true);
  const sentence = !knowledge.binaryUnderstanding
    ? bn
      ? "ON = 1, OFF = 0 — এই ভিত্তিটা আরেকটু ঝালাই করে শুরু করি।"
      : "Begin by strengthening the foundation: ON = 1, OFF = 0."
    : weak.length
      ? bn
        ? `${weak.join(" ও ")}-এর behavior একটু অনুশীলন করলে আরও পরিষ্কার হবে।`
        : `A little practice with ${weak.join(" and ")} behavior will make things clearer.`
      : unknownShapes.length
        ? bn
          ? `সিগন্যালের ধারণা পরিষ্কার! ${unknownShapes.join(" ও ")}-এর আকৃতি একটু ঝালাই করে নাও।`
          : `Your signal understanding is clear! Revisit the ${unknownShapes.join(" and ")} shapes.`
        : bn
          ? "গেট চিনতে ও সিগন্যাল বুঝতে পারছো। এবার নিজের expression দিয়ে পরীক্ষা করো!"
          : "You recognize the gates and understand their signals. Try your own expression!";
  return (
    <div className="ll-result">
      <span className="ll-eyebrow">
        <Sparkles size={16} />
        {bn ? "তোমার পরের ধাপ" : "YOUR NEXT STEP"}
      </span>
      <h1 tabIndex={-1} data-discovery-focus>
        {skipped
          ? bn
            ? "নিজের পথ বেছে নাও"
            : "Choose your starting point"
          : bn
            ? "তোমার Logic Insight"
            : "Your Logic Insight"}
      </h1>
      {!skipped && (
        <>
          <p>{sentence}</p>
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
                            ? "একটু ঝালাই করি"
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
                <small>{bn ? "তোমার জন্য ভালো starting point" : "Recommended for you"}</small>
              )}
              <strong>{label}</strong>
            </span>
            <ArrowRight size={18} />
          </button>
        ))}
      </div>
      <p className="ll-fineprint">
        {bn
          ? "সব বিভাগই খোলা। চাইলে অন্য পথেও শুরু করতে পারো।"
          : "Every section is open. You can start with any of them."}
      </p>
    </div>
  );
}
