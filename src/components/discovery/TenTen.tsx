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
  return (
    <div
      className={`ll-guide ll-guide--${scene} ${paused ? "ll-guide--paused" : ""}`}
      aria-label={bn ? "টেন টেন" : "Ten Ten"}
      role="img"
    >
      <div className={`ll-guide-body ll-guide-body--${reaction}`}>
        <div className="ll-guide-sprite" />
      </div>
      <span className="ll-guide-shadow" />
    </div>
  );
}
