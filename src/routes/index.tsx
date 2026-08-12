import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  CircuitBoard,
  Sun,
  Moon,
  Play,
  Zap,
  FileJson,
  Image as ImageIcon,
  FileCode2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useCircuitStore } from "@/store/useCircuitStore";
import { CircuitCanvas } from "@/components/circuit/CircuitCanvas";
import { InputsPanel } from "@/components/panels/InputsPanel";
import { InspectorPanel } from "@/components/panels/InspectorPanel";
import { CalculationPanel } from "@/components/panels/CalculationPanel";
import { AnalysisPanel } from "@/components/panels/AnalysisPanel";
import { TruthTablePanel } from "@/components/panels/TruthTablePanel";
import { SimplifyPanel } from "@/components/panels/SimplifyPanel";
import { AstPanel } from "@/components/panels/AstPanel";
import { SandboxBuilder } from "@/components/builder/SandboxBuilder";
import { LearnPanel } from "@/components/panels/LearnPanel";

import { EXAMPLES } from "@/logic/examples";
import { analyze } from "@/logic/analysis";
import { exportJson, exportPng, exportSvg } from "@/lib/export";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LogicLab — Boolean Expression to Logic Circuit Simulator" },
      {
        name: "description",
        content:
          "Turn any Boolean expression into an interactive logic-gate circuit. Live simulation, truth tables, Quine–McCluskey simplification and a free-build gate sandbox.",
      },
      { property: "og:title", content: "LogicLab — Boolean Logic Circuit Simulator" },
      {
        property: "og:description",
        content:
          "Parse Boolean expressions, generate gate-level circuits, toggle inputs and watch every wire switch ON/OFF in real time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("logiclab-theme");
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    setDark((d) => {
      const next = !d;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("logiclab-theme", next ? "dark" : "light");
      return next;
    });
  };
  return { dark, toggle };
}

function App() {
  const s = useCircuitStore();
  const { dark, toggle } = useTheme();
  const [sidebar, setSidebar] = useState(true);
  const [tab, setTab] = useState<"circuit" | "build" | "learn">("circuit");

  useEffect(() => {
    const saved = localStorage.getItem("logiclab-project");
    if (saved) {
      try {
        const data = JSON.parse(saved) as { expression?: string; values?: Record<string, 0 | 1>; mode?: "single-letter" | "named" };
        if (data.expression) useCircuitStore.setState({ expression: data.expression, values: data.values ?? {}, mode: data.mode ?? "single-letter" });
      } catch {
        /* ignore corrupt autosave */
      }
    }
    useCircuitStore.getState().generate();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "logiclab-project",
      JSON.stringify({ expression: s.expression, values: s.values, mode: s.mode }),
    );
  }, [s.expression, s.values, s.mode]);

  const stats = s.graph ? analyze(s.graph) : null;
  const outputValue = s.graph ? (s.nodeValues[s.graph.outputId] ?? 0) : 0;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Toaster />
      <header className="shrink-0 border-b border-border bg-card">
        <div className="flex flex-wrap items-center gap-3 px-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <CircuitBoard className="h-5 w-5" />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-destructive">
                ICT Learning Tool
              </div>
              <h1 className="font-display text-xl font-extrabold leading-tight tracking-tight">
                Boolean Logic Simulator
              </h1>
            </div>
          </div>
          <p className="hidden max-w-md text-sm text-muted-foreground md:block">
            Type an expression, watch the gates light up, build your own circuits and master Boolean laws.
          </p>
          <div className="ml-auto flex items-center gap-1">
            {tab === "circuit" && (
              <Button size="sm" variant="ghost" onClick={() => setSidebar((v) => !v)} aria-label="Toggle sidebar">
                {sidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>
            )}
            {s.graph && tab === "circuit" && (
              <>
                <Button size="sm" variant="outline" onClick={() => exportSvg(s.graph!, s.parsed?.name ?? "circuit")}>
                  <FileCode2 className="mr-1 h-3.5 w-3.5" /> SVG
                </Button>
                <Button size="sm" variant="outline" onClick={() => void exportPng(s.graph!, s.parsed?.name ?? "circuit")}>
                  <ImageIcon className="mr-1 h-3.5 w-3.5" /> PNG
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    exportJson(
                      {
                        expression: s.expression,
                        normalized: s.parsed?.normalized,
                        mode: s.mode,
                        values: s.values,
                        twoInputMode: s.twoInputMode,
                        shareSubexpressions: s.shareSubexpressions,
                        nodes: s.graph!.nodes,
                        edges: s.graph!.edges,
                      },
                      s.parsed?.name ?? "circuit",
                    )
                  }
                >
                  <FileJson className="mr-1 h-3.5 w-3.5" /> JSON
                </Button>
              </>
            )}
            <Button size="sm" variant="ghost" onClick={toggle} aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <nav className="flex flex-wrap gap-1 px-4 py-3">
          {(
            [
              { id: "circuit", label: "Expression Simulator" },
              { id: "build", label: "Build Your Own Circuit" },
              { id: "learn", label: "Learn" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {tab === "learn" ? (
        <main className="min-h-0 flex-1 overflow-y-auto">
          <LearnPanel />
        </main>
      ) : tab === "build" ? (
        <main className="min-h-0 flex-1">
          <SandboxBuilder />
        </main>
      ) : (

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          {sidebar && (
            <aside className="w-full shrink-0 overflow-y-auto border-b border-border bg-card p-3 lg:w-72 lg:border-b-0 lg:border-r">
              <Label htmlFor="expr" className="text-xs font-semibold uppercase text-muted-foreground">
                Boolean expression
              </Label>
              <Textarea
                id="expr"
                value={s.expression}
                onChange={(e) => s.setExpression(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    s.generate();
                  }
                }}
                rows={3}
                className="mt-1 font-mono text-sm"
                placeholder="F = XYZ+XY+X'Y'Z"
              />
              <div className="mt-2 flex gap-2">
                <Button size="sm" className="flex-1" onClick={s.generate}>
                  <Play className="mr-1 h-3.5 w-3.5" /> Generate
                </Button>
                <Button size="sm" variant="outline" onClick={s.parseOnly}>
                  Parse
                </Button>
                <Button size="sm" variant="outline" onClick={s.runSimplify} aria-label="Simplify">
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-3 space-y-2 rounded-lg border border-border p-2 text-sm">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mode" className="text-xs">
                    Single-letter mode {s.mode === "single-letter" ? "(XYZ = X·Y·Z)" : "(named vars)"}
                  </Label>
                  <Switch
                    id="mode"
                    checked={s.mode === "single-letter"}
                    onCheckedChange={(v) => s.setMode(v ? "single-letter" : "named")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="two" className="text-xs">Two-input gate mode</Label>
                  <Switch id="two" checked={s.twoInputMode} onCheckedChange={(v) => s.setOption("twoInputMode", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="share" className="text-xs">Share subexpressions</Label>
                  <Switch id="share" checked={s.shareSubexpressions} onCheckedChange={(v) => s.setOption("shareSubexpressions", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="labels" className="text-xs">Show signal labels</Label>
                  <Switch id="labels" checked={s.showLabels} onCheckedChange={(v) => s.setOption("showLabels", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="anim" className="text-xs">Animate signals</Label>
                  <Switch id="anim" checked={s.animate} onCheckedChange={(v) => s.setOption("animate", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Layout</Label>
                  <div className="flex gap-1">
                    {(["LR", "TB"] as const).map((d) => (
                      <Button key={d} size="sm" variant={s.direction === d ? "default" : "outline"} onClick={() => s.setDirection(d)}>
                        {d}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {s.error && (
                <div role="alert" className="mt-3 rounded-lg border-2 border-destructive/60 bg-destructive/10 p-2 text-sm">
                  <div className="font-semibold text-destructive">{s.error.type}</div>
                  <p>{s.error.message}</p>
                  {s.error.suggestion && <p className="mt-1 text-xs text-muted-foreground">Try: {s.error.suggestion}</p>}
                </div>
              )}

              <div className="mt-3">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">Examples</h3>
                {EXAMPLES.map((g) => (
                  <div key={g.label} className="mt-2">
                    <div className="text-[11px] font-medium text-muted-foreground">{g.label}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {g.items.map((it) => (
                        <button
                          key={it.expr}
                          onClick={() => {
                            useCircuitStore.setState({ expression: it.expr, values: {} });
                            s.generate();
                            toast.success("Example loaded");
                          }}
                          className="rounded border border-border bg-background px-2 py-1 font-mono text-[11px] hover:bg-muted"
                        >
                          {it.expr.replace(/^F = /, "")}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}

          <main className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-3 py-1.5 text-xs">
              <span className="font-mono">{s.parsed?.normalized ?? "—"}</span>
              {stats && (
                <span className="text-muted-foreground">
                  {stats.gateCount} gates · {stats.wireCount} wires · depth {stats.depth} · {stats.delay} ns
                </span>
              )}
              <span
                className={`ml-auto rounded px-2 py-0.5 font-mono font-bold ${
                  outputValue === 1
                    ? "bg-[var(--signal-on)] text-[var(--signal-on-fg)]"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.parsed?.name ?? "F"} = {outputValue} · {outputValue === 1 ? "ON" : "OFF"}
              </span>
            </div>
            <div className="min-h-[280px] flex-1">
              {s.graph ? (
                <CircuitCanvas
                  graph={s.graph}
                  nodeValues={s.nodeValues}
                  edgeValues={s.edgeValues}
                  showLabels={s.showLabels}
                  animate={s.animate}
                  criticalPath={stats?.criticalPath}
                  selectedId={s.selectedId}
                  onSelect={s.select}
                  onToggleInput={(name) => s.setValue(name, s.values[name] === 1 ? 0 : 1)}
                />
              ) : (
                <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
                  Enter a Boolean expression and press Generate to build the circuit.
                </div>
              )}
            </div>
            <div className="h-[38vh] shrink-0 border-t border-border bg-card lg:h-[34vh]">
              <Tabs defaultValue="truth" className="flex h-full flex-col">
                <TabsList className="m-2 w-fit">
                  <TabsTrigger value="truth">Truth table</TabsTrigger>
                  <TabsTrigger value="simplify">Simplification</TabsTrigger>
                  <TabsTrigger value="ast">AST &amp; validation</TabsTrigger>
                </TabsList>
                <TabsContent value="truth" className="min-h-0 flex-1 overflow-hidden">
                  <TruthTablePanel />
                </TabsContent>
                <TabsContent value="simplify" className="min-h-0 flex-1 overflow-auto">
                  <SimplifyPanel />
                </TabsContent>
                <TabsContent value="ast" className="min-h-0 flex-1 overflow-auto">
                  <AstPanel />
                </TabsContent>
              </Tabs>
            </div>
          </main>

          <aside className="w-full shrink-0 overflow-y-auto border-t border-border bg-card lg:w-80 lg:border-l lg:border-t-0">
            <Tabs defaultValue="inputs">
              <TabsList className="m-2 w-fit">
                <TabsTrigger value="inputs">Inputs</TabsTrigger>
                <TabsTrigger value="inspector">Gate</TabsTrigger>
                <TabsTrigger value="calc">Steps</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>
              <TabsContent value="inputs">
                <InputsPanel />
              </TabsContent>
              <TabsContent value="inspector">
                <InspectorPanel />
              </TabsContent>
              <TabsContent value="calc">
                <CalculationPanel />
              </TabsContent>
              <TabsContent value="analysis">
                <AnalysisPanel />
              </TabsContent>
            </Tabs>
          </aside>
        </div>
      )}
    </div>
  );
}
