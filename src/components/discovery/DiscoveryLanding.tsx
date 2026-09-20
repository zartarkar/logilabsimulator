import { useEffect, useRef, useState } from "react";
import { ArrowRight, CircuitBoard, GraduationCap, Languages, Pause, Play, Zap } from "lucide-react";
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
          LogicLab<small>{bn ? "পর্যবেক্ষণ ও অনুশীলন" : "Observe and practise"}</small>
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
              {bn ? "এড়িয়ে যাও" : "Skip"}
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </header>
      <div className="ll-topline">
        <span>
          <span className="ll-live-dot" />
          {bn ? "লজিক গেট অনুশীলন" : "LOGIC GATE PRACTICE"}
        </span>
        <span>
          {bn ? "ON/OFF · গেটের আকৃতি · গেটের output" : "ON/OFF · Gate shapes · Gate outputs"}
        </span>
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
          {step !== 5 && (
            <TenTen
              scene={step < 0 ? 0 : step === 5 ? 6 : step + 1}
              reaction={feedback === null ? "idle" : feedback ? "yes" : "learn"}
              paused={paused}
              bn={bn}
            />
          )}
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
              <div className="ll-finish-orbit">
                <TenTen scene={6} reaction="idle" paused={true} bn={bn} />
              </div>
              <span className="ll-finish-label">
                {bn ? "প্রাথমিক অনুশীলন সম্পন্ন" : "Practice complete"}
              </span>
              <h2>{bn ? "পরবর্তী বিভাগ নির্বাচন করো" : "Select your next section"}</h2>
              <p>
                {bn
                  ? "কনসেপ্ট · সিমুলেশন · সার্কিট তৈরি"
                  : "Concepts · Simulation · Circuit building"}
              </p>
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
            <span>{bn ? "ইন্টারেক্টিভ সিমুলেশন" : "INTERACTIVE SIMULATION"}</span>
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
              {step >= 0 && (
                <div className="ll-step-label">
                  <GraduationCap size={17} />
                  {bn ? `ধাপ ${stage + 1}/৩` : `EXPERIMENT ${stage + 1} OF 3`}
                </div>
              )}
              {step >= 0 && (
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
              )}
              {step === 0 ? (
                <div className="ll-prompt ll-binary-question">
                  <h1 tabIndex={-1} data-discovery-focus>
                    {bn
                      ? "সার্কিটের ON আর OFF বোঝায় কোন মান দিয়ে?"
                      : "Which values represent ON and OFF in a circuit?"}
                  </h1>
                  <BinaryChoices
                    answer={feedback}
                    bn={bn}
                    onAnswer={(correct) => answer({ binaryUnderstanding: correct }, correct)}
                  />
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
              ) : feedback !== null ? (
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
                <div className={`ll-prompt ${step < 0 ? "ll-welcome" : ""}`} key={step}>
                  <h1 tabIndex={-1} data-discovery-focus>
                    {step < 0
                      ? bn
                        ? "LogicLab এ স্বাগতম!"
                        : "Welcome to LogicLab!"
                      : step === 1
                        ? bn
                          ? "গেটের নাম ও আকৃতি মেলাও"
                          : "Match each gate name to its shape"
                        : bn
                          ? `${gate} গেটের output নির্ধারণ করো`
                          : `Choose the ${gate} gate’s output`}
                    {step < 0 && <span aria-hidden="true"> 🎉</span>}
                  </h1>
                  {step < 0 && (
                    <div className="ll-step-label ll-welcome-label">
                      <GraduationCap size={17} />
                      {bn ? "শুরু করার আগে" : "BEFORE YOU BEGIN"}
                    </div>
                  )}
                  {step !== 1 && (
                    <p>
                      {step < 0
                        ? bn
                          ? "শুরু করার আগে, লজিক সার্কিট নিয়ে তোমার ধারণা যাচাই করো।"
                          : "Before you begin, check your understanding of logic circuits."
                        : step === 1
                          ? bn
                            ? "প্রতিটি ছবির সঠিক নাম নির্বাচন করো।"
                            : "Assign the correct name to each symbol."
                          : bn
                            ? `${gate} গেটে ${gateCopy[gate].inputs.join(" ও ")} input দেওয়া আছে। প্রশ্নচিহ্নের জায়গায় output কত হবে?`
                            : `The ${gate} gate has input${gate === "NOT" ? "" : "s"} ${gateCopy[gate].inputs.join(" and ")}. What value replaces the question mark at the output?`}
                    </p>
                  )}
                  {step >= 0 && <StepInstructions step={step} bn={bn} />}
                  {step < 0 ? (
                    <>
                      <p className="ll-welcome-detail">
                        {bn
                          ? "সার্কিট ON/OFF, লজিক গেটের symbol এবং গেটের কাজ, এই তিন ধাপে নিজের জন্য উপযুক্ত শুরুর পথ নির্বাচন করো।"
                          : "Circuit ON/OFF, logic gate symbols and gate behavior, use these three steps to choose the right starting point for you."}
                      </p>
                      <button
                        type="button"
                        className="ll-primary ll-start"
                        onClick={() => setStep(0)}
                      >
                        {bn ? "শুরু করি" : "Let’s start"}
                        <ArrowRight size={18} />
                      </button>
                    </>
                  ) : step === 1 ? null : (
                    <div
                      className="ll-output-choices"
                      aria-label={bn ? "আউটপুট নির্বাচন করো" : "Choose the output"}
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
            </>
          )}
        </div>
      </div>
      <footer className="ll-page-footer">
        <span>
          {bn ? "একাদশ ও দ্বাদশ শ্রেণি · ডিজিটাল ডিভাইস" : "Class 11 to 12 · Digital devices"}
        </span>
        <span>LogicLab · {bn ? "যুক্তি দিয়ে শুরু" : "Start with curiosity"}</span>
      </footer>
    </main>
  );
}
