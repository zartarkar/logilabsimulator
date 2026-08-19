import type { PointerEvent as ReactPointerEvent } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { GateShape } from "./GateShape";
import type { CircuitNodeType } from "@/logic/types";
import { cn } from "@/lib/utils";

export interface GateNodeData extends Record<string, unknown> {
  gateType: CircuitNodeType;
  label: string;
  expr: string;
  value: 0 | 1;
  inputCount: number;
  showLabels: boolean;
  critical?: boolean;
  highlighted?: boolean;
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

function ValueBadge({ value }: { value: 0 | 1 }) {
  return (
    <span
      className={cn(
        "rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tabular-nums",
        value === 1
          ? "bg-[var(--signal-on)] text-[var(--signal-on-fg)]"
          : "bg-muted text-muted-foreground",
      )}
    >
      {value} · {value === 1 ? "ON" : "OFF"}
    </span>
  );
}

const DELETE_BTN =
  "absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full border border-border bg-background text-xs text-destructive shadow hidden group-hover:flex";

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
          className="!h-2 !w-2 !border-2 !border-border !bg-background"
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
        "group relative flex flex-col items-center text-foreground",
        data.highlighted && "drop-shadow-[0_0_8px_var(--signal-on)]",
        data.critical && "text-[var(--signal-on)]",
        selected && "text-primary drop-shadow-[0_0_6px_var(--signal-on)]",
        data.onNodePointerDown && "nopan",
      )}
      title={`${data.gateType} · ${data.expr}`}
      onPointerDown={data.onNodePointerDown}
      onPointerMove={data.onNodePointerMove}
      onPointerUp={data.onNodePointerUp}
      onPointerCancel={data.onNodePointerUp}
    >
      <InputHandles count={data.inputCount} />
      <GateShape type={data.gateType} active={active} />
      <Handle
        id="out"
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-2 !border-border !bg-background"
      />
      <div className="mt-0.5 flex items-center gap-1">
        <span className="text-[10px] font-semibold tracking-wide">{data.gateType}</span>
        {data.showLabels && <ValueBadge value={data.value} />}
      </div>
      {data.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.();
          }}
          aria-label={`Delete ${data.gateType} gate`}
          className={cn(DELETE_BTN, selected && "!flex")}
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
        data.onNodePointerDown && "nopan",
      )}
      onPointerDown={data.onNodePointerDown}
      onPointerMove={data.onNodePointerMove}
      onPointerUp={data.onNodePointerUp}
      onPointerCancel={data.onNodePointerUp}
    >
      <button
        onClick={data.onToggle}
        aria-label={`Toggle input ${data.label}, currently ${data.value}`}
        aria-pressed={on}
        className={cn(
          "flex h-10 items-center gap-2 rounded-lg border-2 px-2 font-mono text-xs font-bold transition-colors",
          on
            ? "border-[var(--signal-on)] bg-[var(--signal-on)]/15 text-foreground"
            : "border-border bg-card text-muted-foreground",
        )}
      >
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
      <Handle id="out" type="source" position={Position.Right} className="!h-2 !w-2 !border-2 !border-border !bg-background" />
      {data.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.();
          }}
          aria-label="Delete input"
          className={cn(DELETE_BTN, selected && "!flex")}
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
        data.onNodePointerDown && "nopan",
      )}
      onPointerDown={data.onNodePointerDown}
      onPointerMove={data.onNodePointerMove}
      onPointerUp={data.onNodePointerUp}
      onPointerCancel={data.onNodePointerUp}
    >
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
          className={cn(DELETE_BTN, selected && "!flex")}
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
      <Handle id="out" type="source" position={Position.Right} className="!h-2 !w-2 !border-2 !border-border !bg-background" />
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
