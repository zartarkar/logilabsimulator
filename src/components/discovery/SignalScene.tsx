import { GateShape } from "@/components/circuit/GateShape";
import { gateCopy, type Gate } from "./model";
export function SignalScene({
  gate,
  revealed,
  bn,
}: {
  gate: Gate;
  revealed: boolean;
  bn: boolean;
}) {
  const info = gateCopy[gate];
  const positions = gate === "NOT" ? [180] : [155, 205];
  const inputEdge = gate === "AND" ? 266 : gate === "OR" ? 276 : 270;
  return (
    <div className={`ll-signal-scene ${revealed ? "ll-signal-reveal" : ""}`} key={gate}>
      <div className="ll-scene-caption">
        {bn ? "ইনপুট থেকে আউটপুট, সিগন্যালের যাত্রা" : "From input to output. Follow the signal."}
      </div>
      <svg
        className="ll-circuit-diagram"
        viewBox="0 0 580 310"
        role="img"
        aria-label={`${gate}: ${info.inputs.join(", ")} → ${revealed ? info.output : "?"}`}
      >
        <defs>
          <filter id="ll-glow">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        {info.inputs.map((value, i) => (
          <g key={i}>
            <text
              x={gate === "NOT" ? 80 : 38}
              y={positions[i]! + (gate === "NOT" ? -30 : 4)}
              className="ll-svg-label"
            >
              {gate === "NOT" ? "INPUT" : i ? "B" : "A"}
            </text>
            <path d={`M102 ${positions[i]} H${inputEdge}`} className="ll-trace" />
            <path
              d={`M102 ${positions[i]} H${inputEdge}`}
              pathLength="1"
              className={`ll-signal ll-signal-input ${value ? "high" : "low"}`}
            />
            <circle
              cx="80"
              cy={positions[i]}
              r="22"
              className={`ll-input-node ${value ? "high" : ""}`}
            />
            <text x="80" y={positions[i]! + 6} className="ll-svg-value">
              {value}
            </text>
          </g>
        ))}
        <path d="M354 180 H477" className="ll-trace" />
        <path
          d="M354 180 H477"
          pathLength="1"
          className={`ll-signal ll-signal-output ${info.output ? "high" : "low"}`}
        />
        <g transform="translate(250 132)">
          <GateShape
            type={gate}
            active={revealed}
            width={136}
            height={96}
            className="ll-circuit-gate"
          />
        </g>
        <text x="316" y="110" className="ll-svg-gate-name">
          {gate}
        </text>
        <g className={revealed ? "ll-output-settled" : ""}>
          <circle
            cx="500"
            cy="180"
            r="25"
            className={revealed && info.output ? "ll-output-node high" : "ll-output-node"}
          />
          <text x="500" y="186" className="ll-svg-value">
            {revealed ? info.output : "?"}
          </text>
        </g>
        <text x="500" y="235" className="ll-svg-label">
          OUTPUT
        </text>
      </svg>
      <div className="ll-equation">
        {revealed
          ? info.formula
          : `${gate === "NOT" ? "NOT 1" : info.inputs.join(gate === "AND" ? " · " : " + ")} = ?`}
      </div>
      {revealed && <p className="ll-canvas-rule">{info.rule[bn ? 0 : 1]}</p>}
    </div>
  );
}
