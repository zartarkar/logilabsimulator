import { SandboxBuilder } from "@/components/builder/SandboxBuilder";
import { useEffect, useState } from "react";
import { CircuitBoard, ArrowRight } from "lucide-react";

export function CircuitBuildingJourney({
  bn,
  onComplete,
}: {
  bn: boolean;
  onComplete: () => void;
}) {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [started]);
  if (!started)
    return (
      <section className="ll-build-invitation">
        <span className="ll-welcome-icon">
          <CircuitBoard size={32} aria-hidden="true" />
        </span>
        <span className="ll-eyebrow">{bn ? "এবার হাতে কলমে" : "TIME TO BUILD"}</span>
        <h1>{bn ? "চলো একটি লজিক সার্কিট তৈরি করি" : "Let’s build a logic circuit"}</h1>
        <button type="button" className="ll-primary" onClick={() => setStarted(true)}>
          {bn ? "সার্কিট তৈরি শুরু করি" : "Start building"}
          <ArrowRight size={18} />
        </button>
      </section>
    );
  return (
    <section className="ll-builder-journey" aria-label={bn ? "সার্কিট তৈরি" : "Build a circuit"}>
      <div className="ll-builder-intro">
        <h1 tabIndex={-1} data-discovery-focus>
          {bn ? "এবার নিজে সার্কিট তৈরি করো" : "Now build your own circuit"}
        </h1>
      </div>
      <div className="ll-builder-workspace">
        <SandboxBuilder isPracticeMode onOnboardingComplete={onComplete} />
      </div>
    </section>
  );
}
