import { useCircuitStore } from "@/store/useCircuitStore";
import type { AstNode } from "@/logic/types";

function Tree({ node, depth = 0 }: { node: AstNode; depth?: number }) {
  const label =
    node.kind === "VAR" ? `VAR ${node.name}` : node.kind === "CONST" ? `CONST ${node.value}` : node.kind;
  return (
    <div style={{ paddingLeft: depth * 16 }} className="font-mono text-xs">
      <span className="text-muted-foreground">{depth ? "└─ " : ""}</span>
      <span className="font-semibold">{label}</span>
      <span className="ml-2 text-muted-foreground">{node.expr}</span>
      {"children" in node && node.children.map((c) => <Tree key={c.id} node={c} depth={depth + 1} />)}
    </div>
  );
}

export function AstPanel() {
  const { parsed, validation, graph } = useCircuitStore();
  if (!parsed) return <p className="p-4 text-sm text-muted-foreground">Parse an expression to inspect its AST.</p>;
  return (
    <div className="space-y-3 p-4">
      {validation && graph && (
        <div className="rounded-lg border border-border bg-card p-3 text-xs">
          <div>Nodes: {graph.nodes.length} · Edges: {graph.edges.length}</div>
          <div>Acyclic: {validation.acyclic ? "yes" : "no"} · Structure: {validation.ok ? "valid" : validation.issues.join("; ")}</div>
          <div>AST output equals circuit output: {validation.equivalent ? "yes" : "NO — mismatch"}</div>
        </div>
      )}
      <Tree node={parsed.ast} />
    </div>
  );
}
