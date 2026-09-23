import type { PointerEvent as ReactPointerEvent } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GateShape } from "./GateShape";
import type { CircuitNodeType } from "@/logic/types";
import { cn } from "@/lib/utils";
import { GripVertical, Lightbulb, ToggleLeft } from "lucide-react";

export interface GateNodeData extends Record<string, unknown> {
  gateType: CircuitNodeType;
  label: string;
  expr: string;
  value: 0 | 1;
  inputCount: number;
  showLabels: boolean;
  critical?: boolean;
  highlighted?: boolean;
  diagnosticError?: string | undefined;
  onToggle?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
  /**
   * iOS uses a custom pointer-based drag (see SandboxBuilder) instead of
   * React Flow's built-in node dragging, which reliably made nodes vanish
   * on iOS Safari. Undefined on platforms that use the built-in drag.
   */
  onNodePointerDown?: ((e: ReactPointerEvent) => void) | undefined;
  onNodePointerMove?: ((e: ReactPointerEvent) => void) | undefined;
  onNodePointerUp?: ((e: ReactPointerEvent) => void) | undefined;
}

const DELETE_BTN =
  "nodrag absolute -right-2 -top-2 z-[60] h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-xs text-destructive shadow-md hidden group-hover:flex";

function DiagnosticBadge({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <div className="pointer-events-none absolute bottom-[calc(100%+0.75rem)] left-1/2 z-40 w-max max-w-64 -translate-x-1/2 rounded-lg border border-destructive/40 bg-destructive px-2 py-1.5 text-center text-[10px] font-semibold leading-tight text-destructive-foreground shadow-lg">
      <span className="mr-1">!</span>{message}
    </div>
  );
}

function InputHandles({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: Math.max(count, 1) }).map((_, i) => (
        <Handle
          key={i}
          id={`in-${i}`}
          type="target"
          position={Position.Left}
          style={{ top: `${((i + 1) / (Math.max(count, 1) + 1)) * 100}%` }}
          className="!h-2 !w-2 !border-2 !border-border !bg-background pointer-coarse:!h-5 pointer-coarse:!w-5"
        />
      ))}
    </>
  );
}

export function GateNode({ data, selected }: NodeProps & { data: GateNodeData }) {
  const active = data.value === 1;
  return (
    <div
      className={cn(
        "group relative flex h-12 w-16 flex-col items-center text-foreground",
        data.highlighted && "drop-shadow-[0_0_8px_var(--signal-on)]",
        data.critical && "text-[var(--signal-on)]",
        selected && "text-primary drop-shadow-[0_0_6px_var(--signal-on)]",
        data.diagnosticError && "rounded-lg ring-2 ring-destructive drop-shadow-[0_0_8px_var(--destructive)]",
        data.onNodePointerDown && "nopan",
      )}
      title={`${data.gateType} · ${data.expr}`}
      onPointerDown={data.onNodePointerDown}
      onPointerMove={data.onNodePointerMove}
      onPointerUp={data.onNodePointerUp}
      onPointerCancel={data.onNodePointerUp}
    >
      <DiagnosticBadge message={data.diagnosticError} />
      <InputHandles count={data.inputCount} />
      <GateShape type={data.gateType} active={active} />
      <svg aria-hidden="true" viewBox="0 0 68 48" className="pointer-events-none absolute inset-0 h-12 w-16 overflow-visible">
        {Array.from({ length: Math.max(data.inputCount, 1) }, (_, i) => {
          const y = ((i + 1) / (Math.max(data.inputCount, 1) + 1)) * 48;
          const curved = ["OR", "NOR", "XOR", "XNOR"].includes(data.gateType);
          const x = curved ? 6 + 40 * ((y - 2) / 44) * (1 - (y - 2) / 44) : ["NOT", "BUFFER"].includes(data.gateType) ? 10 : 8;
          return <path key={i} d={`M0 ${y} H${x}`} stroke="var(--signal-off)" strokeWidth="1.5" fill="none" />;
        })}
        <path d={`M${["NAND", "NOR", "XNOR"].includes(data.gateType) ? 64 : data.gateType === "NOT" ? 56 : data.gateType === "AND" ? 54 : data.gateType === "BUFFER" ? 50 : 52} 24 H68`} stroke="var(--signal-off)" strokeWidth="1.5" fill="none" />
      </svg>
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-2 !border-border !bg-background pointer-coarse:!h-5 pointer-coarse:!w-5"
      />
      {data.showLabels && data.expr && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-max max-w-32 rounded bg-background/95 px-1 py-0.5 text-center font-mono text-[9px] font-semibold leading-tight text-foreground shadow-sm">
          {data.expr} = {data.value}
        </div>
      )}
      {data.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.();
          }}
          aria-label={`Delete ${data.gateType} gate`}
          className={cn(DELETE_BTN, (selected || data.diagnosticError) && "!flex")}
        >
          ×
        </button>
      )}
    </div>
  );
}

export function InputNode({ data, selected }: NodeProps & { data: GateNodeData }) {
  const on = data.value === 1;
  return (
    <div
      className={cn(
        "group relative flex items-center gap-2",
        selected && "ring-2 ring-primary rounded-lg",
        data.diagnosticError && "ring-2 ring-destructive rounded-lg",
        data.onNodePointerDown && "nopan",
      )}
      onPointerDown={data.onNodePointerDown}
      onPointerMove={data.onNodePointerMove}
      onPointerUp={data.onNodePointerUp}
      onPointerCancel={data.onNodePointerUp}
    >
      <DiagnosticBadge message={data.diagnosticError} />
      <button
        onClick={data.onToggle}
        aria-label={`Toggle input ${data.label}, currently ${data.value}`}
        aria-pressed={on}
        className={cn(
          "nodrag flex h-10 items-center gap-2 rounded-lg border-2 px-2 font-mono text-xs font-bold transition-colors",
          on
            ? "border-[var(--signal-on)] bg-[var(--signal-on)]/15 text-foreground"
            : "border-border bg-card text-muted-foreground",
        )}
      >
        <ToggleLeft className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <span className="text-foreground">{data.label}</span>
        <span
          className={cn(
            "flex h-6 w-9 items-center rounded-full p-0.5 transition-colors",
            on ? "bg-[var(--signal-on)] justify-end" : "bg-muted justify-start",
          )}
        >
          <span className="h-5 w-5 rounded-full bg-background shadow" />
        </span>
        <span className="tabular-nums">{data.value} · {on ? "ON" : "OFF"}</span>
      </button>
      {data.onNodePointerDown && <span title="Drag to move input" className="input-drag-grip flex h-11 w-7 cursor-grab items-center justify-center rounded bg-muted text-muted-foreground"><GripVertical className="h-5 w-5" /></span>}
      <Handle id="out" type="source" position={Position.Right} className="!h-2 !w-2 !border-2 !border-border !bg-background pointer-coarse:!h-5 pointer-coarse:!w-5" />
      {data.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.();
          }}
          aria-label="Delete input"
          className={cn(DELETE_BTN, (selected || data.diagnosticError) && "!flex")}
        >
          ×
        </button>
      )}
    </div>
  );
}

export function OutputNode({ data, selected }: NodeProps & { data: GateNodeData }) {
  const on = data.value === 1;
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center gap-1",
        selected && "rounded-lg ring-2 ring-primary",
        data.diagnosticError && "rounded-lg ring-2 ring-destructive",
        data.onNodePointerDown && "nopan",
      )}
      onPointerDown={data.onNodePointerDown}
      onPointerMove={data.onNodePointerMove}
      onPointerUp={data.onNodePointerUp}
      onPointerCancel={data.onNodePointerUp}
    >
      <DiagnosticBadge message={data.diagnosticError} />
      <InputHandles count={1} />
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border-2 px-3 py-2",
          on ? "border-[var(--signal-on)] bg-[var(--signal-on)]/15" : "border-border bg-card",
        )}
      >
        <span
          className={cn(
            "h-4 w-4 rounded-full border",
            on
              ? "border-[var(--signal-on)] bg-[var(--signal-on)] shadow-[0_0_10px_var(--signal-on)]"
              : "border-border bg-muted",
          )}
        />
        <Lightbulb className={cn("h-4 w-4 shrink-0", on ? "text-[var(--signal-on)]" : "text-muted-foreground")} aria-hidden="true" />
        <span className="font-mono text-xs font-bold">{data.label}</span>
        <span className="font-mono text-[10px] font-bold tabular-nums">{data.value}</span>
        <span className={cn("text-[10px] font-semibold", on ? "text-[var(--signal-on)]" : "text-muted-foreground")}>
          {on ? "ON" : "OFF"}
        </span>
      </div>
      {data.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.();
          }}
          aria-label="Delete output"
          className={cn(DELETE_BTN, (selected || data.diagnosticError) && "!flex")}
        >
          ×
        </button>
      )}
    </div>
  );
}

export function ConstNode({ data, selected }: NodeProps & { data: GateNodeData }) {
  const on = data.value === 1;
  return (
    <div
      className={cn(
        "group relative flex flex-col items-center",
        selected && "rounded-lg ring-2 ring-primary",
        data.onNodePointerDown && "nopan",
      )}
      onPointerDown={data.onNodePointerDown}
      onPointerMove={data.onNodePointerMove}
      onPointerUp={data.onNodePointerUp}
      onPointerCancel={data.onNodePointerUp}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md border-2 font-mono text-sm font-bold",
          on ? "border-[var(--signal-on)] bg-[var(--signal-on)]/15" : "border-border bg-card text-muted-foreground",
        )}
      >
        {data.value}
      </div>
      <Handle id="out" type="source" position={Position.Right} className="!h-2 !w-2 !border-2 !border-border !bg-background pointer-coarse:!h-5 pointer-coarse:!w-5" />
      <span className="mt-0.5 text-[10px] text-muted-foreground">{data.value === 1 ? "ON" : "OFF"}</span>
      {data.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.();
          }}
          aria-label="Delete constant"
          className={cn(DELETE_BTN, selected && "!flex")}
        >
          ×
        </button>
      )}
    </div>
  );
}

export const nodeTypes = {
  gate: GateNode,
  input: InputNode,
  output: OutputNode,
  constant: ConstNode,
} as const;
