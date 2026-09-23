import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Hand } from "lucide-react";

/** A visual example over the actual ports; it never intercepts a wiring gesture. */
export function WiringGesture({
  sourceId,
  targetId,
  bn,
}: {
  sourceId: string;
  targetId: string;
  bn: boolean;
}) {
  const overlay = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<number[] | null>(null);
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      const container = overlay.current?.parentElement;
      const source = container?.querySelector(
        `[data-id="${CSS.escape(sourceId)}"] .react-flow__handle.source`,
      );
      const target = container?.querySelector(
        `[data-id="${CSS.escape(targetId)}"] .react-flow__handle[data-handleid="in-0"]`,
      );
      if (container && source && target) {
        const bounds = container.getBoundingClientRect();
        const a = source.getBoundingClientRect();
        const b = target.getBoundingClientRect();
        const next = [
          a.x + a.width / 2 - bounds.x,
          a.y + a.height / 2 - bounds.y,
          b.x + b.width / 2 - bounds.x,
          b.y + b.height / 2 - bounds.y,
        ];
        setPoints((previous) =>
          previous?.every((value, i) => Math.abs(value - next[i]!) < 0.5) ? previous : next,
        );
      } else setPoints(null);
      frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [sourceId, targetId]);
  return (
    <div
      ref={overlay}
      className="wiring-gesture"
      role="img"
      aria-label={
        bn
          ? "ইনপুটের OUT বিন্দু থেকে গেটের IN বিন্দু পর্যন্ত টেনে তার যুক্ত করো।"
          : "Drag from the input OUT port to the gate IN port to connect a wire."
      }
    >
      {points && (
        <>
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path
              d={`M ${points[0]} ${points[1]} L ${points[2]} ${points[3]}`}
              fill="none"
              stroke="#e11d48"
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity=".65"
            />
            <circle
              cx={points[0]}
              cy={points[1]}
              r="10"
              fill="none"
              stroke="#e11d48"
              strokeWidth="2"
            />
            <circle
              cx={points[2]}
              cy={points[3]}
              r="10"
              fill="none"
              stroke="#e11d48"
              strokeWidth="2"
            />
          </svg>
          <span
            className="wiring-gesture-hand"
            style={
              {
                left: points[0],
                top: points[1],
                "--wire-dx": `${points[2]! - points[0]!}px`,
                "--wire-dy": `${points[3]! - points[1]!}px`,
              } as CSSProperties
            }
            aria-hidden="true"
          >
            <Hand size={32} fill="white" stroke="#e11d48" strokeWidth={2} />
          </span>
        </>
      )}
    </div>
  );
}
