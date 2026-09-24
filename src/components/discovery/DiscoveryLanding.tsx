import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircuitBoard, GraduationCap } from "lucide-react";
import { useLang } from "@/i18n";
import { browserStorage } from "@/lib/browserStorage";
import { BinaryScene, BinaryChoices } from "./BinaryScene";
import { RecognitionScene } from "./RecognitionScene";
import { SignalScene } from "./SignalScene";
import { TenTen } from "./TenTen";
import { ConceptFeedback } from "./ConceptFeedback";
import { StepInstructions } from "./StepInstructions";
import { CircuitBuildingJourney } from "./CircuitBuildingJourney";
import { CardMascot } from "./CardMascot";
import { DiscoveryResult } from "./DiscoveryResult";
import {
  assess,
  DISCOVERY_KEY,
  GATES,
  gateCopy,
  initialKnowledge,
  type Destination,
  type Knowledge,
} from "./model";
import type { Familiarity } from "@/logic/introLearning";
import "./discovery.css";

export function DiscoveryLanding({
  onEnter,
}: {
  onEnter: (destination: Destination, familiarity: Familiarity, startGuide?: boolean) => void;
}) {
  const { lang } = useLang();
  const bn = lang === "bn";
  const [step, setStep] = useState(-1);
  const [building, setBuilding] = useState(false);
  const [knowledge, setKnowledge] = useState<Knowledge>({ ...initialKnowledge });
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);
  const paused = false;
  const skipped = false;
  const lock = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const gate = GATES[step - 2] ?? "AND";
  useEffect(() => {
    panel.current
      ?.querySelector<HTMLElement>("[data-discovery-focus]")
      ?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);
  function next() {
    setFeedback(null);
    setExpanded(false);
    setStep((s) => s + 1);
    lock.current = false;
  }
  function answer(patch: Partial<Knowledge>, correct: boolean) {
    if (lock.current) return;
    lock.current = true;
    const updated = { ...knowledge, ...patch };
    setKnowledge(updated);
    setFeedback(correct);
    browserStorage.setItem(
      DISCOVERY_KEY,
      JSON.stringify({
        version: 1,
        signals: updated,
        ...assess(updated),
        updatedAt: new Date().toISOString(),
      }),
    );
  }
  function inspect() {
    setExpanded(true);
  }
  const stage = Math.min(2, Math.max(0, step));
  const labels = bn
    ? ["বাইনারি সংকেত", "গেটের প্রতীক", "গেটের কাজ"]
    : ["Binary intuition", "Gate recognition", "Gate behavior"];
  const exercise = step >= 0 && step < 5;
  const question =
    step === 0
      ? bn
        ? "সার্কিটের ON ও OFF অবস্থা কোন মান দ্বারা প্রকাশ করা হয়?"
        : "Which values represent ON and OFF in a circuit?"
      : step === 1
        ? bn
          ? "গেটের নাম ও প্রতীক মেলাও"
          : "Match each gate name to its symbol"
        : bn
          ? `${gate} গেটের আউটপুট নির্ধারণ করো`
          : `Choose the ${gate} gate’s output`;
  return (
    <main className={`ll-discovery ${exercise ? "ll-discovery-exercise" : ""}`}>
      <header className="ll-header">
        <a href="/" aria-label="LogicLab home">
          <span>
            <CircuitBoard size={21} />
          </span>
          LogicLab
          <small className={building ? "ll-building-title" : undefined}>{building ? (bn ? "এবার নিজে সার্কিট তৈরি করো" : "Build your own circuit") : (bn ? "পর্যবেক্ষণ ও অনুশীলন" : "Observe and practise")}</small>
        </a>
        {step !== 6 && (
          <button
            type="button"
            className="ll-skip"
            onClick={() => onEnter("concepts", assess(knowledge).familiarity, false)}
          >
            {bn ? "এড়িয়ে যাই" : "Skip onboarding"}
            <ArrowRight size={16} />
          </button>
        )}
      </header>
      {step < 0 ? (
        <section className="ll-workbench ll-workbench-welcome">
          <div className="ll-panel" ref={panel}>
            <div className="ll-prompt ll-welcome">
              <CardMascot bn={bn} />
              <div className="ll-step-label ll-welcome-label">
                {bn ? "দেখো · বোঝো · তৈরি করো" : "OBSERVE · UNDERSTAND · BUILD"}
              </div>
              <h1 tabIndex={-1} data-discovery-focus>
                {bn ? "LogicLab এ স্বাগতম!" : "Welcome to LogicLab!"}
              </h1>
              <p>
                {bn
                  ? "লজিক গেটের ধারণা বোঝো, অনুশীলন করো এবং নিজের হাতে একটি সার্কিট তৈরি করো।"
                  : "Explore logic gates, test your understanding and build your first circuit."}
              </p>
              <button type="button" className="ll-primary ll-start" onClick={next}>
                {bn ? "শুরু করি" : "Let’s start"}
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      ) : step === 5 ? (
        <CircuitBuildingJourney
          bn={bn}
          onStart={() => setBuilding(true)}
          onComplete={() => onEnter("simulator", assess(knowledge).familiarity, true)}
        />
      ) : step === 6 ? (
        <div className="ll-workbench ll-workbench-welcome">
          <div className="ll-panel" ref={panel}>
            <DiscoveryResult
              knowledge={knowledge}
              skipped={skipped}
              bn={bn}
              onEnter={(destination) => onEnter(destination, assess(knowledge).familiarity, true)}
            />
          </div>
        </div>
      ) : (
        <section
          className={`ll-experiment ${feedback !== null ? "ll-experiment-answered" : ""}`}
          ref={panel}
        >
          <div className="ll-experiment-heading">
            <div className="ll-step-label">
              <GraduationCap size={17} />
              {bn ? `ধাপ ${stage + 1}/৩` : `EXPERIMENT ${stage + 1} OF 3`}
            </div>
            <ol className="ll-progress" aria-label={bn ? "অগ্রগতি" : "Progress"}>
              {labels.map((label, i) => (
                <li
                  key={label}
                  aria-current={stage === i ? "step" : undefined}
                  className={stage > i ? "done" : ""}
                >
                  <span />
                  {label}
                </li>
              ))}
            </ol>
            <h1 tabIndex={-1} data-discovery-focus>
              {question}
            </h1>
            {feedback === null && <StepInstructions step={step} bn={bn} />}
          </div>
          <div
            className="ll-canvas"
            aria-label={bn ? "ইন্টারেক্টিভ সিমুলেশন" : "Interactive simulation"}
          >
            <TenTen
              scene={step + 1}
              reaction={feedback === null ? "idle" : feedback ? "yes" : "learn"}
              paused={paused}
              bn={bn}
            />
            {step === 0 ? (
              <BinaryScene revealed={feedback !== null} bn={bn} />
            ) : step === 1 ? (
              <RecognitionScene
                bn={bn}
                revealed={feedback !== null}
                onComplete={(answers) =>
                  answer(
                    {
                      recognizeAND: answers.AND,
                      recognizeOR: answers.OR,
                      recognizeNOT: answers.NOT,
                    },
                    Object.values(answers).every(Boolean),
                  )
                }
              />
            ) : (
              <SignalScene gate={gate} revealed={feedback !== null} bn={bn} />
            )}
          </div>
          <div className="ll-experiment-answer">
            {step === 0 ? (
              <BinaryChoices
                answer={feedback}
                bn={bn}
                onAnswer={(correct) => answer({ binaryUnderstanding: correct }, correct)}
              />
            ) : step >= 2 ? (
              <div
                className="ll-output-choices"
                aria-label={bn ? "আউটপুট নির্বাচন করো" : "Choose the output"}
              >
                {[0, 1].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Output ${value}`}
                    disabled={feedback !== null}
                    data-result={
                      feedback !== null &&
                      value === (feedback ? gateCopy[gate].output : 1 - gateCopy[gate].output)
                        ? feedback
                          ? "correct"
                          : "incorrect"
                        : undefined
                    }
                    onClick={() =>
                      answer(
                        { [`behavior${gate}`]: value === gateCopy[gate].output },
                        value === gateCopy[gate].output,
                      )
                    }
                  >
                    <span className={value ? "on" : ""} />
                    <strong>{value}</strong>
                    <small>{value ? "ON" : "OFF"}</small>
                  </button>
                ))}
              </div>
            ) : null}
            {feedback !== null && (
              <ConceptFeedback
                step={step}
                gate={gate}
                correct={feedback}
                bn={bn}
                expanded={expanded}
                onExpand={inspect}
                onNext={next}
              />
            )}
          </div>
        </section>
      )}
    </main>
  );
}
