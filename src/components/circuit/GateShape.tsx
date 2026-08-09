import type { CircuitNodeType } from "@/logic/types";

export const GATE_BODY_W = 64;
export const GATE_BODY_H = 48;

/** ANSI/MIL-style logic gate outlines drawn as SVG paths. */
export function GateShape({
  type,
  active,
  className,
}: {
  type: CircuitNodeType;
  active: boolean;
  className?: string;
}) {
  const stroke = "currentColor";
  const fill = active ? "var(--signal-fill)" : "var(--gate-fill)";
  const common = { stroke, strokeWidth: 2, fill, strokeLinejoin: "round" as const };

  const bubble = (cx: number) => <circle cx={cx} cy={24} r={5} {...common} />;

  const andBody = (
    <path d="M8 2 H32 A22 22 0 0 1 32 46 H8 Z" {...common} />
  );
  const orBody = (
    <path d="M6 2 Q26 24 6 46 Q34 46 52 24 Q34 2 6 2 Z" {...common} />
  );
  const xorExtra = <path d="M0 2 Q20 24 0 46" {...common} fill="none" />;
  const notBody = <path d="M10 3 L46 24 L10 45 Z" {...common} />;
  const bufBody = <path d="M10 3 L50 24 L10 45 Z" {...common} />;

  let content: React.ReactNode = null;
  switch (type) {
    case "AND":
      content = andBody;
      break;
    case "NAND":
      content = (
        <>
          {andBody}
          {bubble(59)}
        </>
      );
      break;
    case "OR":
      content = orBody;
      break;
    case "NOR":
      content = (
        <>
          {orBody}
          {bubble(59)}
        </>
      );
      break;
    case "XOR":
      content = (
        <>
          {xorExtra}
          {orBody}
        </>
      );
      break;
    case "XNOR":
      content = (
        <>
          {xorExtra}
          {orBody}
          {bubble(59)}
        </>
      );
      break;
    case "NOT":
      content = (
        <>
          {notBody}
          {bubble(51)}
        </>
      );
      break;
    case "BUFFER":
      content = bufBody;
      break;
    default:
      content = <rect x="8" y="6" width="48" height="36" rx="6" {...common} />;
  }

  return (
    <svg
      viewBox="0 0 68 48"
      width={GATE_BODY_W}
      height={GATE_BODY_H}
      className={className}
      role="img"
      aria-label={`${type} gate`}
    >
      {content}
    </svg>
  );
}
