import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CircuitBoard,
  GraduationCap,
  Languages,
  Pause,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";
import { useLang } from "@/i18n";
import { browserStorage } from "@/lib/browserStorage";
import { BinaryScene, BinaryChoices } from "./BinaryScene";
import { RecognitionScene } from "./RecognitionScene";
import { SignalScene } from "./SignalScene";
import { TenTen } from "./TenTen";
import { ConceptFeedback } from "./ConceptFeedback";
import { StepInstructions } from "./StepInstructions";
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
  const { lang, setLang } = useLang();
  const bn = lang === "bn";
  const [step, setStep] = useState(-1);
  const [knowledge, setKnowledge] = useState<Knowledge>({ ...initialKnowledge });
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const lock = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const gate = GATES[step - 2] ?? "AND";
  useEffect(() => {
    panel.current
      ?.querySelector<HTMLElement>("[data-discovery-focus]")
      ?.focus({ preventScroll: true });
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
  function skip() {
    setFeedback(null);
    setSkipped(true);
    setStep(5);
  }
  function inspect() {
    setExpanded(true);
  }
  function toggleMotion() {
    setPaused((value) => !value);
  }
  const stage = Math.min(2, Math.max(0, step));
  const labels = bn
    ? ["Binary intuition", "গেট চিনি", "গেটের কাজ"]
    : ["Binary intuition", "Gate recognition", "Gate behavior"];
  return (
    <main className={`ll-discovery ${paused ? "ll-motion-paused" : ""}`}>
      <header className="ll-header">
        <a href="/" aria-label="LogicLab home">
          <span>
            <CircuitBoard size={21} />
          </span>
          LogicLab<small>{bn ? "দেখে শেখো, করে বোঝো" : "Learn by making it happen"}</small>
        </a>
        <div>
          <button
            type="button"
            onClick={toggleMotion}
            aria-pressed={paused}
            aria-label={paused ? "Resume animations" : "Pause animations"}
          >
            {paused ? <Play size={17} /> : <Pause size={17} />}
          </button>
          <button type="button" onClick={() => setLang(bn ? "en" : "bn")}>
            <Languages size={17} />
            {bn ? "EN" : "বাংলা"}
          </button>
          {step < 5 && (
            <button type="button" onClick={skip}>
              {bn ? "এড়িয়ে যাই" : "Skip"}
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </header>
      <div className="ll-topline">
        <span>
          <span className="ll-live-dot" />
          {bn ? "তোমার লজিক ল্যাব" : "YOUR LOGIC LAB"}
        </span>
        <span>{bn ? "ছোট্ট পরীক্ষা, নতুন আবিষ্কার" : "Small experiments. New discoveries."}</span>
      </div>
      <div className={`ll-workbench ${step === 5 ? "ll-workbench-result" : ""}`}>
        <section
          className="ll-canvas"
          aria-label={bn ? "ইন্টারেক্টিভ সিমুলেশন" : "Interactive simulation"}
        >
          <div className="ll-canvas-top">
            <span>
              <Zap size={14} />
              {step === 5 ? "LOGIC INSIGHT" : "LIVE EXPERIMENT"}
            </span>
            <span>{step >= 2 && step < 5 ? `${gate} GATE` : "01 · LOGIC LAB"}</span>
          </div>
          <TenTen
            scene={step < 0 ? 0 : step === 5 ? 6 : step + 1}
            reaction={feedback === null ? "idle" : feedback ? "yes" : "learn"}
            paused={paused}
            bn={bn}
          />
          {step < 1 ? (
            <BinaryScene revealed={feedback !== null} bn={bn} />
          ) : step === 1 ? (
            <RecognitionScene
              bn={bn}
              revealed={feedback !== null}
              onComplete={(answers) =>
                answer(
                  { recognizeAND: answers.AND, recognizeOR: answers.OR, recognizeNOT: answers.NOT },
                  Object.values(answers).every(Boolean),
                )
              }
            />
          ) : step < 5 ? (
            <SignalScene gate={gate} revealed={feedback !== null} bn={bn} />
          ) : (
            <div className="ll-finish-scene">
              <div className="ll-finish-orbit" />
              <span className="ll-finish-label">
                {bn ? "প্রতিটি আবিষ্কারে, আরও এক ধাপ।" : "Every discovery is a step forward."}
              </span>
              <h2>{bn ? "এবার তোমার পালা।" : "Make it your own."}</h2>
              <p>{bn ? "শেখো। সিমুলেট করো। তৈরি করো।" : "Learn. Simulate. Build."}</p>
            </div>
          )}
          <div className="ll-canvas-bottom">
            <span>
              <i />
              {bn ? "সিগন্যাল চালু" : "SIGNAL ON"}
            </span>
            <span>
              <i />
              {bn ? "সিগন্যাল বন্ধ" : "SIGNAL OFF"}
            </span>
            <span>{bn ? "করে দেখে শেখো" : "EXPLORE TO UNDERSTAND"}</span>
          </div>
        </section>
        <div className="ll-panel" ref={panel}>
          {step === 5 ? (
            <DiscoveryResult
              knowledge={knowledge}
              skipped={skipped}
              bn={bn}
              onEnter={(destination) => onEnter(destination, assess(knowledge).familiarity, false)}
            />
          ) : (
            <>
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
              {feedback !== null ? (
                <ConceptFeedback
                  step={step}
                  gate={gate}
                  correct={feedback}
                  bn={bn}
                  expanded={expanded}
                  onExpand={inspect}
                  onNext={next}
                />
              ) : (
                <div className="ll-prompt" key={step}>
                  <h1 tabIndex={-1} data-discovery-focus>
                    {step < 0
                      ? bn
                        ? "একটু খেলি, লজিক বুঝি।"
                        : "A little play. A little logic."
                      : step === 0
                        ? bn
                          ? "ON আর OFF — কোন মান?"
                          : "ON and OFF. Which values?"
                        : step === 1
                          ? bn
                            ? "গেটের নাম ও আকৃতি মেলাও"
                            : "Match each gate name to its shape"
                          : bn
                            ? `${gate} গেটের output বেছে নাও`
                            : `Choose the ${gate} gate’s output`}
                  </h1>
                  <p>
                    {step < 0
                      ? bn
                        ? "প্রথমে ON/OFF-এর মান বেছে নেবে, তারপর তিনটি গেটের নাম মেলাবে, শেষে গেটের output বলবে। প্রতিটি উত্তরের পর চিত্রসহ ব্যাখ্যা দেখাবে।"
                        : "First choose the values for ON/OFF, then match three gate names, and finally predict their outputs. Each answer reveals an explanation with a diagram."
                      : step === 0
                        ? bn
                          ? "Digital logic-এ ON এবং OFF কোন values দিয়ে প্রকাশ করা হয়?"
                          : "Which values represent ON and OFF in digital logic?"
                        : step === 1
                          ? bn
                            ? "সিমুলেশনের তিনটি ছবির মধ্যে কোনটি AND, কোনটি OR আর কোনটি NOT, তা বেছে নিতে হবে।"
                            : "Identify which of the three symbols in the simulation is AND, OR and NOT."
                          : bn
                            ? `${gate} গেটে ${gateCopy[gate].inputs.join(" ও ")} input দেওয়া আছে। প্রশ্নচিহ্নের জায়গায় output কত হবে?`
                            : `The ${gate} gate has input${gate === "NOT" ? "" : "s"} ${gateCopy[gate].inputs.join(" and ")}. What value replaces the question mark at the output?`}
                  </p>
                  {step >= 0 && <StepInstructions step={step} bn={bn} />}
                  {step < 0 ? (
                    <>
                      <div className="ll-start-note">
                        <span>01</span>
                        <p>
                          {bn
                            ? "ব্যাখ্যা পড়া হলে ‘পরের প্রশ্নে যাই’ চাপবে। নিজে না চাপা পর্যন্ত পরের প্রশ্ন আসবে না।"
                            : "Read the explanation, then press ‘Next question’. Nothing advances until you choose to continue."}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="ll-primary ll-start"
                        onClick={() => setStep(0)}
                      >
                        {bn ? "শুরু করি" : "Let’s begin"}
                        <ArrowRight size={18} />
                      </button>
                      <p className="ll-fineprint">
                        {bn
                          ? "কোনো চাপ নেই — নিজের গতিতে শেখো।"
                          : "No pressure. Make progress at your own pace."}
                      </p>
                    </>
                  ) : step === 0 ? (
                    <BinaryChoices
                      disabled={false}
                      bn={bn}
                      onAnswer={(correct) => answer({ binaryUnderstanding: correct }, correct)}
                    />
                  ) : step === 1 ? null : (
                    <div
                      className="ll-output-choices"
                      aria-label={bn ? "আউটপুট বেছে নাও" : "Choose the output"}
                    >
                      {[0, 1].map((value) => (
                        <button
                          key={value}
                          type="button"
                          aria-label={`Output ${value}`}
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
                  )}
                </div>
              )}
              <div className="ll-panel-footer">
                <RotateCcw size={14} />
                {bn
                  ? "ভুল হলেও সমস্যা নেই, কারণটা দেখে শিখবো।"
                  : "Every attempt is a chance to understand."}
              </div>
            </>
          )}
        </div>
      </div>
      <footer className="ll-page-footer">
        <span>{bn ? "একাদশ–দ্বাদশ শ্রেণি · ডিজিটাল ডিভাইস" : "Class 11–12 · Digital devices"}</span>
        <span>LogicLab · {bn ? "যুক্তি দিয়ে শুরু" : "Start with curiosity"}</span>
      </footer>
    </main>
  );
}
