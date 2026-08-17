import { useMemo, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes, type GateNodeData } from "./nodes";
import type { CircuitGraph } from "@/logic/types";

function rfType(t: string) {
  if (t === "INPUT") return "input";
  if (t === "OUTPUT") return "output";
  if (t === "CONST0" || t === "CONST1") return "constant";
  return "gate";
}

interface Props {
  graph: CircuitGraph;
  nodeValues: Record<string, 0 | 1>;
  edgeValues: Record<string, 0 | 1>;
  showLabels: boolean;
  animate: boolean;
  criticalPath?: string[] | undefined;
  selectedId?: string | null | undefined;
  onSelect?: (id: string | null) => void;
  onToggleInput?: (name: string) => void;
  minimap?: boolean;
  className?: string;
}

function Inner({
  graph,
  nodeValues,
  edgeValues,
  showLabels,
  animate,
  criticalPath = [],
  selectedId,
  onSelect,
  onToggleInput,
  minimap = false,
}: Props) {
  const { fitView } = useReactFlow();
  const flowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fit = () => {
      if (!flowRef.current) return;
      const { width, height } = flowRef.current.getBoundingClientRect();
      // On mobile, if the height is much larger than width (portrait), 
      // or if it's generally small, we use more aggressive padding.
      const isMobile = window.innerWidth < 768;
      const padding = isMobile ? 0.05 : 0.24;
      
      requestAnimationFrame(() => fitView({ padding, duration: 220 }));
    };
    
    fit();

    const element = flowRef.current;
    if (!element) return;
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fitView, graph]);

  const nodes: Node[] = useMemo(
    () =>
      graph.nodes.map((n) => ({
        id: n.id,
        type: rfType(n.type),
        position: { x: n.x, y: n.y },
        selected: selectedId === n.id,
        draggable: true,
        data: {
          gateType: n.type,
          label: n.label,
          expr: n.expr,
          value: nodeValues[n.id] ?? 0,
          inputCount: n.inputs.length,
          showLabels,
          critical: criticalPath.includes(n.id),
          onToggle: n.type === "INPUT" ? () => onToggleInput?.(n.label) : undefined,
        } satisfies GateNodeData,
      })),
    [graph, nodeValues, showLabels, criticalPath, selectedId, onToggleInput],
  );

  const edges: Edge[] = useMemo(
    () =>
      graph.edges.map((e) => {
        const on = edgeValues[e.id] === 1;
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          targetHandle: `in-${e.targetPort}`,
          sourceHandle: "out",
          type: "smoothstep",
          animated: animate && on,
          label: showLabels ? String(edgeValues[e.id] ?? 0) : undefined,
          labelBgPadding: [3, 1] as [number, number],
          labelBgBorderRadius: 3,
          labelStyle: { fontSize: 10, fontFamily: "ui-monospace, monospace", fill: "var(--foreground)" },
          labelBgStyle: { fill: "var(--background)", fillOpacity: 0.85 },
          style: {
            stroke: on ? "var(--signal-on)" : "var(--signal-off)",
            strokeWidth: on ? 2.4 : 1.4,
            strokeDasharray: on ? undefined : "4 3",
          },
        };
      }),
    [graph, edgeValues, showLabels, animate],
  );

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => onSelect?.(node.id),
    [onSelect],
  );

  return (
    <div ref={flowRef} className="h-full min-h-0 w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={() => onSelect?.(null)}
        fitView
        fitViewOptions={{ padding: 0.24 }}
        minZoom={0.15}
        maxZoom={2.5}
        panOnScroll={false}
        zoomOnPinch={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
      >
        <Background gap={18} size={1} color="var(--grid-dot)" />
        <Controls onFitView={() => fitView({ padding: 0.24 })} className="!bg-card !text-foreground" />
        {minimap && (
          <MiniMap
            pannable
            zoomable
            className="!bg-card"
            nodeColor={(n) => ((n.data as GateNodeData)?.value === 1 ? "#16a34a" : "#94a3b8")}
            maskColor="rgba(100,116,139,0.15)"
          />
        )}
      </ReactFlow>
    </div>
  );
}

export function CircuitCanvas(props: Props) {
  return (
    <div className={props.className ?? "h-full w-full"}>
      <ReactFlowProvider>
        <Inner {...props} />
      </ReactFlowProvider>
    </div>
  );
}
