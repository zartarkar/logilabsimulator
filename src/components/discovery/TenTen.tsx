import { useEffect, useState, type CSSProperties } from "react";

const restingPlaces = [
  [50, 0],
  [24, 1],
  [75, 0],
  [40, 2],
  [65, 1],
] as const;

export function TenTen({
  scene,
  reaction,
  paused,
  bn,
}: {
  scene: number;
  reaction: "idle" | "yes" | "learn";
  paused: boolean;
  bn: boolean;
}) {
  const [position, setPosition] = useState(0);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      clearInterval(timer);
      if (!paused && !preference.matches)
        timer = setInterval(
          () => setPosition((value) => (value + 1) % restingPlaces.length),
          12000,
        );
    };
    update();
    preference.addEventListener("change", update);
    return () => {
      clearInterval(timer);
      preference.removeEventListener("change", update);
    };
  }, [paused]);
  const [x, y] = restingPlaces[position]!;
  return (
    <div
      className={`ll-guide ll-guide--${scene} ${paused ? "ll-guide--paused" : ""}`}
      aria-label={bn ? "টেন টেন" : "Ten Ten"}
      role="img"
      style={{ "--guide-x": `${x}%`, "--guide-y": y } as CSSProperties}
    >
      <div className={`ll-guide-body ll-guide-body--${reaction}`}>
        <div className="ll-guide-sprite" />
      </div>
      <span className="ll-guide-shadow" />
    </div>
  );
}
