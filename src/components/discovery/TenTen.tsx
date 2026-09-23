import { useEffect, useState, type CSSProperties } from "react";

const restingPlaces = [
  [8, 0],
  [45, 6],
  [92, 0],
  [70, 8],
  [35, 0],
  [8, 6],
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
        timer = setInterval(() => setPosition((value) => (value + 1) % restingPlaces.length), 6500);
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
