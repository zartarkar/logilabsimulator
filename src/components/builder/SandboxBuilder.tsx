import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
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

function simulate(nodes: SBNode[], edges: Edge[]): Record<string, 0 | 1> {
  const incoming = new Map<string, { src: string; port: number }[]>();
  for (const n of nodes) incoming.set(n.id, []);
  for (const e of edges) {
    const port = Number((e.targetHandle ?? "in-0").split("-")[1] ?? 0);
    incoming.get(e.target)?.push({ src: e.source, port });
  }
  const values: Record<string, 0 | 1> = {};
  for (const n of nodes) {
    values[n.id] = n.kind === "INPUT" ? n.inputValue : n.kind === "CONST1" ? 1 : 0;
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
  const [counter, setCounter] = useState(0);
  const { screenToFlowPosition } = useReactFlow();

  const values = useMemo(() => simulate(nodes, edges), [nodes, edges]);

  const addNode = useCallback(
    (kind: CircuitNodeType) => {
      const id = `sb${counter + 1}`;
      setCounter((c) => c + 1);
      const center = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      const i = counter;
      const spot = {
        x: center.x - 300 + (i % 4) * 200,
        y: center.y - 180 + Math.floor(i / 4) * 130,
      };
      const label =
        kind === "INPUT" ? String.fromCharCode(65 + (counter % 26)) : kind === "OUTPUT" ? "OUT" : kind;
      setNodes((ns) => [
        ...ns,
        { id, kind, label, x: spot.x, y: spot.y, inputValue: 0 },
      ]);
    },
    [counter, screenToFlowPosition],
  );

  const removeNode = useCallback((id: string) => {
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setEdges((es) => es.filter((e) => e.source !== id && e.target !== id));
  }, []);

  const rfNodes: Node[] = useMemo(
    () =>
      nodes.map((n) => ({
        id: n.id,
        type: rfType(n.kind),
        position: { x: n.x, y: n.y },
        data: {
          gateType: n.kind,
          label: n.label,
          expr: n.label,
          value: values[n.id] ?? 0,
          inputCount: ARITY[n.kind] ?? 2,
          showLabels: true,
          onToggle:
            n.kind === "INPUT"
              ? () =>
                  setNodes((ns) =>
                    ns.map((x) => (x.id === n.id ? { ...x, inputValue: x.inputValue ? 0 : 1 } : x)),
                  )
              : undefined,
          onDelete: () => removeNode(n.id),
        } satisfies GateNodeData,
      })),
    [nodes, values, removeNode],
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
    setNodes((ns) => {
      let next = ns;
      for (const c of changes) {
        if (c.type === "position" && c.position) {
          const pos = c.position;
          next = next.map((n) => (n.id === c.id ? { ...n, x: pos.x, y: pos.y } : n));
        } else if (c.type === "remove") {
          removed.push(c.id);
          next = next.filter((n) => n.id !== c.id);
        }
      }
      return next;
    });
    if (removed.length)
      setEdges((es) => es.filter((e) => !removed.includes(e.source) && !removed.includes(e.target)));
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <aside className="flex shrink-0 flex-row gap-2 overflow-x-auto border-b border-border bg-card p-3 md:w-52 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r">
        <h3 className="hidden text-xs font-semibold uppercase text-muted-foreground md:block">Components</h3>
        <button
          onClick={() => addNode("INPUT")}
          className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          Input switch
        </button>
        <button
          onClick={() => addNode("OUTPUT")}
          className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          Output LED
        </button>
        {PALETTE.map((g) => (
          <button
            key={g}
            onClick={() => addNode(g)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
            aria-label={`Add ${g} gate`}
          >
            <span className="scale-[0.5] origin-left -mr-6">
              <GateShape type={g} active={false} />
            </span>
            <span className="font-mono text-xs">{g}</span>
          </button>
        ))}
        <button onClick={() => addNode("CONST0")} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
          Constant 0
        </button>
        <button onClick={() => addNode("CONST1")} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">
          Constant 1
        </button>
        <Button
          variant="outline"
          size="sm"
          className="md:mt-2"
          onClick={() => {
            setNodes([]);
            setEdges([]);
            toast.success("Canvas cleared");
          }}
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Clear all
        </Button>
      </aside>
      <div className="min-h-0 flex-1">
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
          deleteKeyCode={["Backspace", "Delete"]}
          proOptions={{ hideAttribution: true }}
          fitView
        >
          <Background gap={18} size={1} color="var(--grid-dot)" />
          <Controls className="!bg-card !text-foreground" />
          <MiniMap pannable className="!bg-card" nodeColor={(n) => (((n.data as GateNodeData)?.value === 1 ? "#16a34a" : "#94a3b8"))} maskColor="rgba(100,116,139,0.15)" />
        </ReactFlow>
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
