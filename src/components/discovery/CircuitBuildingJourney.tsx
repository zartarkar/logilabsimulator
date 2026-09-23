import { SandboxBuilder } from "@/components/builder/SandboxBuilder";
import { useEffect, useState } from "react";
import { CircuitBoard, ArrowRight } from "lucide-react";
import { TenTen } from "./TenTen";
import { MobileLandscapeGate } from "@/components/MobileLandscapeGate";

export function CircuitBuildingJourney({
  bn,
  onComplete,
  onStart,
}: {
  bn: boolean;
  onComplete: () => void;
  onStart: () => void;
}) {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [started]);
  if (!started)
    return (
      <section className="ll-build-invitation">
        <div className="ll-card-mascot ll-card-mascot-left"><TenTen scene={5} reaction="idle" paused bn={bn} /></div>
        <span className="ll-welcome-icon">
          <CircuitBoard size={32} aria-hidden="true" />
        </span>
        <span className="ll-eyebrow">{bn ? "এবার হাতে কলমে" : "TIME TO BUILD"}</span>
        <h1>{bn ? "চলো একটি লজিক সার্কিট তৈরি করি" : "Let’s build a logic circuit"}</h1>
        <button type="button" className="ll-primary" onClick={() => { setStarted(true); onStart(); }}>
          {bn ? "সার্কিট তৈরি শুরু করি" : "Start building"}
          <ArrowRight size={18} />
        </button>
      </section>
    );
  return (
    <section className="ll-builder-journey" aria-label={bn ? "সার্কিট তৈরি" : "Build a circuit"}>
      <MobileLandscapeGate />
      <div className="ll-builder-workspace">
        <SandboxBuilder isPracticeMode onOnboardingComplete={onComplete} />
      </div>
    </section>
  );
}
