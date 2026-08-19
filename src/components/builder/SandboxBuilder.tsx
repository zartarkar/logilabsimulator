import { useCallback, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  addEdge,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes, type GateNodeData } from "@/components/circuit/nodes";
import { GateShape } from "@/components/circuit/GateShape";
import type { CircuitNodeType } from "@/logic/types";
import { evalGate } from "@/logic/evaluator";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLang } from "@/i18n";

interface SBNode {
  id: string;
  kind: CircuitNodeType;
  label: string;
  x: number;
  y: number;
  inputValue: 0 | 1;
}

const PALETTE: CircuitNodeType[] = [
  "AND",
  "OR",
  "NOT",
  "NAND",
  "NOR",
  "XOR",
  "XNOR",
  "BUFFER",
];

const ARITY: Record<string, number> = { NOT: 1, BUFFER: 1, OUTPUT: 1 };

function rfType(t: CircuitNodeType) {
  if (t === "INPUT") return "input";
  if (t === "OUTPUT") return "output";
  if (t === "CONST0" || t === "CONST1") return "constant";
  return "gate";
}

function simulate(nodes: SBNode[], edges: Edge[], override?: Record<string, 0 | 1>): Record<string, 0 | 1> {
  const incoming = new Map<string, { src: string; port: number }[]>();
  for (const n of nodes) incoming.set(n.id, []);
  for (const e of edges) {
    const port = Number((e.targetHandle ?? "in-0").split("-")[1] ?? 0);
    incoming.get(e.target)?.push({ src: e.source, port });
  }
  const values: Record<string, 0 | 1> = {};
  for (const n of nodes) {
    values[n.id] = n.kind === "INPUT" ? (override?.[n.id] ?? n.inputValue) : n.kind === "CONST1" ? 1 : 0;
  }
  // iterate until stable (bounded to avoid loops from user-made cycles)
  for (let pass = 0; pass < nodes.length + 2; pass++) {
    let changed = false;
    for (const n of nodes) {
      if (n.kind === "INPUT" || n.kind === "CONST0" || n.kind === "CONST1") continue;
      const ins = (incoming.get(n.id) ?? []).sort((a, b) => a.port - b.port).map((i) => values[i.src] ?? 0);
      const v = n.kind === "OUTPUT" ? (ins[0] ?? 0) : ins.length ? evalGate(n.kind, ins) : 0;
      if (values[n.id] !== v) {
        values[n.id] = v;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return values;
}

function Inner() {
  const [nodes, setNodes] = useState<SBNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { screenToFlowPosition } = useReactFlow();
  const paneRef = useRef<HTMLDivElement>(null);
  const nextIdRef = useRef(0);
  const isMobile = useIsMobile();
  const { t } = useLang();

  // Dragging a node reliably makes it vanish on iOS Safari (a native
  // gesture/rendering conflict that survived several targeted fixes).
  // Rather than keep chasing that, disable node dragging on iOS and offer
  // tap-to-place instead: select a node, then tap the canvas to move it
  // there. Android/desktop keep normal drag-and-drop, which isn't affected.
  const isIOS = useMemo(
    () =>
      typeof navigator !== "undefined" &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)),
    [],
  );

  const values = useMemo(() => simulate(nodes, edges), [nodes, edges]);

  const truth = useMemo(() => {
    const inputs = nodes.filter((n) => n.kind === "INPUT");
    const outputs = nodes.filter((n) => n.kind === "OUTPUT");
    if (!inputs.length || !outputs.length || inputs.length > 8) return null;
    const rows: { env: Record<string, 0 | 1>; out: Record<string, 0 | 1> }[] = [];
    for (let m = 0; m < 1 << inputs.length; m++) {
      const env: Record<string, 0 | 1> = {};
      inputs.forEach((n, i) => {
        env[n.id] = ((m >> (inputs.length - 1 - i)) & 1) as 0 | 1;
      });
      const sim = simulate(nodes, edges, env);
      const out: Record<string, 0 | 1> = {};
      for (const o of outputs) out[o.id] = sim[o.id] ?? 0;
      rows.push({ env, out });
    }
    return { inputs, outputs, rows };
  }, [nodes, edges]);

  const addNode = useCallback(
    (kind: CircuitNodeType) => {
      const seq = nextIdRef.current + 1;
      nextIdRef.current = seq;
      const id = `sb${seq}`;

      const rect = paneRef.current?.getBoundingClientRect();
      // Use center of the actual canvas container
      const center = screenToFlowPosition({
        x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
        y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
      });

      const label =
        kind === "INPUT" ? String.fromCharCode(65 + ((seq - 1) % 26)) : kind === "OUTPUT" ? "OUT" : kind;

      // The node is placed at the current viewport's center, so it's already
      // visible the moment it's added — no need to re-fit the view here.
      // An auto fitView on every add previously raced React Flow's node
      // measurement (timing that varies by browser/device) and could leave
      // the viewport panned/zoomed away from the node it just placed. The
      // "fit view" control in the canvas toolbar still lets users re-center
      // manually.
      setNodes((ns) => [
        ...ns,
        { id, kind, label, x: center.x, y: center.y, inputValue: 0 },
      ]);
    },
    [screenToFlowPosition],
  );

  const removeNode = useCallback((id: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
  }, []);

  // iOS tap-to-place: continuous touch-and-move on a node — whether handled
  // by React Flow's own drag or by a custom pointermove-driven equivalent —
  // reliably made the node vanish on iOS Safari. Only a fully discrete
  // interaction (a tap that ends, then a separate tap) has proven safe.
  // Tapping a node selects it (and stops the touch from also starting a
  // pane pan, via the "nopan" class in nodes.tsx); tapping empty canvas
  // afterward (onPaneClick, below) relocates the selected node there.
  const handleNodePointerDown = useCallback(
    (id: string, e: ReactPointerEvent) => {
      if (!isIOS) return;
      // Don't hijack taps that land on a connection handle — React Flow's
      // own click-to-connect (connectOnClick, on by default) needs those
      // untouched so wiring still works on iOS.
      if ((e.target as HTMLElement).closest?.(".react-flow__handle")) return;
      e.stopPropagation();
      setSelectedIds([id]);
    },
    [isIOS],
  );

  const onPaneClick = useCallback(
    (event: { clientX: number; clientY: number }) => {
      if (!isIOS || selectedIds.length !== 1) return;
      const id = selectedIds[0];
      const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, x: pos.x, y: pos.y } : n)));
    },
    [isIOS, selectedIds, screenToFlowPosition],
  );

  const rfNodes: Node[] = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        type: rfType(n.kind),
        position: { x: n.x, y: n.y },
        selected: selectedIds.includes(n.id),
        data: {
          gateType: n.kind,
          label: n.label,
          expr: n.label,
          value: values[n.id] ?? 0,
          inputCount: ARITY[n.kind] ?? 2,
          showLabels: true,
          onToggle:
            n.kind === "INPUT"
              ? () => {
                  setNodes((ns) =>
                    ns.map((x) => (x.id === n.id ? { ...x, inputValue: x.inputValue ? 0 : 1 } : x)),
                  );
                }
              : undefined,
          onDelete: () => removeNode(n.id),
          onNodePointerDown: isIOS ? (e: ReactPointerEvent) => handleNodePointerDown(n.id, e) : undefined,
        } satisfies GateNodeData,
      })),
    [nodes, values, removeNode, selectedIds, isIOS, handleNodePointerDown],
  );

  const styledEdges = edges.map((e) => {
    const on = values[e.source] === 1;
    return {
      ...e,
      type: "smoothstep",
      animated: on,
      label: String(values[e.source] ?? 0),
      labelStyle: { fontSize: 10, fontFamily: "ui-monospace, monospace", fill: "var(--foreground)" },
      labelBgStyle: { fill: "var(--background)", fillOpacity: 0.85 },
      style: {
        stroke: on ? "var(--signal-on)" : "var(--signal-off)",
        strokeWidth: on ? 2.4 : 1.4,
        strokeDasharray: on ? undefined : "4 3",
      },
    };
  });

  const onConnect = useCallback((c: Connection) => {
    setEdges((es) => {
      const filtered = es.filter((e) => !(e.target === c.target && e.targetHandle === c.targetHandle));
      return addEdge({ ...c, id: `${c.source}-${c.target}-${c.targetHandle}` }, filtered);
    });
  }, []);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    const removed: string[] = [];
    const selectedOn: string[] = [];
    const selectedOff: string[] = [];
    setNodes((ns) => {
      let next = ns;
      for (const c of changes) {
        if (c.type === "position" && c.position) {
          const pos = c.position;
          if (!Number.isFinite(pos.x) || !Number.isFinite(pos.y)) {
            toast.error(`Debug: invalid position for ${c.id}: (${pos.x}, ${pos.y})`);
            continue;
          }
          next = next.map((n) => (n.id === c.id ? { ...n, x: pos.x, y: pos.y } : n));
        } else if (c.type === "select") {
          (c.selected ? selectedOn : selectedOff).push(c.id);
        } else if (c.type === "remove") {
          toast.error(`Debug: ReactFlow requested removal of ${c.id}`);
          removed.push(c.id);
          next = next.filter((n) => n.id !== c.id);
        }
      }
      return next;
    });
    if (selectedOn.length || selectedOff.length) {
      setSelectedIds((prev) => [...new Set([...prev, ...selectedOn])].filter((id) => !selectedOff.includes(id)));
    }
    if (removed.length) {
      setSelectedIds((prev) => prev.filter((id) => !removed.includes(id)));
      setEdges((es) => es.filter((e) => !removed.includes(e.source) && !removed.includes(e.target)));
    }
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row bg-transparent sandbox-container overflow-hidden touch-none lg:touch-auto">
      <aside className="flex shrink-0 flex-row gap-2 overflow-x-auto border-b border-border bg-card/60 backdrop-blur-sm p-3 lg:w-48 lg:flex-col lg:overflow-y-auto lg:border-b-0 lg:border-r z-10 touch-auto no-scrollbar">
        <h3 className="hidden text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 lg:block mb-2">Components</h3>
        <button
          onClick={() => addNode("INPUT")}
          className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted bg-card text-foreground whitespace-nowrap"
        >
          Input switch
        </button>
        <button
          onClick={() => addNode("OUTPUT")}
          className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted bg-card text-foreground whitespace-nowrap"
        >
          Output LED
        </button>
        {PALETTE.map((g) => (
          <button
            key={g}
            onClick={() => addNode(g)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted bg-card text-foreground"
            aria-label={`Add ${g} gate`}
          >
            <span className="scale-[0.5] origin-left -mr-6">
              <GateShape type={g} active={false} />
            </span>
            <span className="font-mono text-xs">{g}</span>
          </button>
        ))}
        <button onClick={() => addNode("CONST0")} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted bg-card text-foreground whitespace-nowrap">
          Constant 0
        </button>
        <button onClick={() => addNode("CONST1")} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted bg-card text-foreground whitespace-nowrap">
          Constant 1
        </button>
        <Button
          variant="outline"
          size="sm"
          className="lg:mt-2"
          disabled={selectedIds.length === 0}
          onClick={() => {
            selectedIds.forEach(removeNode);
            setSelectedIds([]);
            toast.success("Selected components removed");
          }}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setNodes([]);
            setEdges([]);
            setSelectedIds([]);
            toast.success("Canvas cleared");
          }}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear
        </Button>
      </aside>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden relative">
        <div ref={paneRef} className="flex-1 relative">
          {/* Temporary debug readout: watch this count while reproducing the
              iOS vanishing-node bug. If it drops when a node disappears,
              React Flow is actually removing it (see toasts). If it stays
              the same, the node is still in state and this is a paint-only
              bug. Remove once the iOS issue is confirmed fixed. */}
          <div className="pointer-events-none absolute left-2 top-2 z-20 rounded-md border border-border bg-card/90 px-2 py-1 font-mono text-[10px] text-muted-foreground shadow">
            nodes: {nodes.length}
          </div>
          {isIOS && (
            <div className="pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-md border border-border bg-card/90 px-2.5 py-1 text-[11px] text-muted-foreground shadow">
              Tap an element, then tap another spot to move it
            </div>
          )}
          <ReactFlow
            nodes={rfNodes}
            edges={styledEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={(changes) => {
              const removed = changes.filter((c) => c.type === "remove").map((c) => c.id);
              if (removed.length) setEdges((es) => es.filter((e) => !removed.includes(e.id)));
            }}
            onConnect={onConnect}
            onPaneClick={onPaneClick}
            deleteKeyCode={["Backspace", "Delete"]}
            proOptions={{ hideAttribution: true }}
            fitView
            fitViewOptions={{ padding: 0.2, maxZoom: 1.2 }}
            minZoom={0.2}
            maxZoom={2.5}
            panOnScroll={!isMobile}
            selectionOnDrag={!isMobile}
            panOnDrag={isMobile ? true : [1, 2]}
            autoPanOnConnect={!isMobile}
            autoPanOnNodeDrag={!isMobile}
            nodesDraggable={!isIOS}
            zoomOnPinch
            zoomOnDoubleClick={false}
            nodeOrigin={[0.5, 0.5]}
          >
            <Background gap={18} size={1} color="var(--grid-dot)" />
            <Controls
              position="top-right"
              orientation="horizontal"
              showInteractive={false}
              className="!bg-card !text-foreground !shadow-md !rounded-md !m-2"
            />
          </ReactFlow>
        </div>
        
        {/* Overlaid Truth Table - reduced prominence as requested */}
        <details className="absolute bottom-4 left-4 right-4 z-20 group">
          <summary className="flex w-max cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2 text-xs font-bold shadow-lg backdrop-blur-sm hover:bg-card transition-all">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {t("builderTruth")}
          </summary>
          <div className="mt-2 max-h-48 overflow-auto rounded-xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-md">
            {truth ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {truth.inputs.map((n) => (
                        <th key={n.id} className="border-b border-border px-3 py-1 text-left font-mono text-xs">
                          {n.label}
                        </th>
                      ))}
                      {truth.outputs.map((n) => (
                        <th key={n.id} className="border-b border-border px-3 py-1 text-left font-mono text-xs font-bold">
                          {n.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {truth.rows.map((r, i) => (
                      <tr key={i} className="hover:bg-muted/60">
                        {truth.inputs.map((n) => (
                          <td key={n.id} className="border-b border-border/50 px-3 py-1 font-mono tabular-nums">
                            {r.env[n.id]}
                          </td>
                        ))}
                        {truth.outputs.map((n) => (
                          <td key={n.id} className="border-b border-border/50 px-3 py-1 font-mono font-bold tabular-nums">
                            {r.out[n.id]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("builderTruthEmpty")}</p>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}

export function SandboxBuilder() {
  return (
    <ReactFlowProvider>
      <Inner />
    </ReactFlowProvider>
  );
}
