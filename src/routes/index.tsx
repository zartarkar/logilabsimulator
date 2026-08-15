import { useEffect, useState, useMemo } from "react";
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
  Languages,
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
import { TutorialDialog } from "@/components/TutorialDialog";
import { LanguageProvider, useLang } from "@/i18n";

import { EXAMPLES } from "@/logic/examples";
import { analyze } from "@/logic/analysis";
import bgAsset from "@/assets/background.jpg.asset.json";

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
  component: Page,
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

function Page() {
  return (
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );
}

function App() {
  const s = useCircuitStore();
  const { dark, toggle } = useTheme();
  const { lang, setLang, t } = useLang();
  const [tab, setTab] = useState<"circuit" | "build" | "learn">("circuit");

  useEffect(() => {
    const bgUrl = dark 
      ? "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070" 
      : "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070";
    document.body.style.setProperty('--bg-image', `url(${bgUrl})`);
  }, [dark]);

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
        <div className="grid items-center gap-3 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <CircuitBoard className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-destructive">
                {t("classLine")}
              </div>
              <div className="font-display text-sm font-extrabold">{t("chapterLine")}</div>
            </div>
          </div>

          <nav className="flex flex-wrap justify-center gap-1">
            {(
              [
                { id: "circuit", label: t("tabCircuit") },
                { id: "build", label: t("tabBuild") },
                { id: "learn", label: t("tabLearn") },
              ] as const
            ).map((x) => (
              <button
                key={x.id}
                onClick={() => setTab(x.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors nav-tab-${x.id} ${
                  tab === x.id
                    ? "bg-destructive text-destructive-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {x.label}
              </button>
            ))}
          </nav>

            <div className="flex items-center justify-end gap-1">
              <TutorialDialog />
              <div className="flex items-center overflow-hidden rounded-full border border-border">
                <Languages className="mx-1.5 h-3.5 w-3.5 text-muted-foreground" />
                {(["en", "bn"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    aria-pressed={lang === l}
                    className={`px-2.5 py-1 text-xs font-bold transition-colors ${
                      lang === l ? "button-lang-active" : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {l === "en" ? "EN" : "বাং"}
                  </button>
                ))}
              </div>
              <Button size="sm" variant="outline" onClick={toggle} aria-label="Toggle theme">
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
        </div>
      </header>

      {tab === "learn" ? (
        <main className="min-h-0 flex-1 overflow-y-auto learn-panel-container">
          <LearnPanel />
        </main>
      ) : tab === "build" ? (
        <main className="min-h-0 flex-1">
          <SandboxBuilder />
        </main>
      ) : (
        <main className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            {/* LEFT: controls */}
            <section className="w-full shrink-0 overflow-y-auto border-b border-border bg-card p-3 lg:w-[26rem] lg:border-b-0 lg:border-r">
              <Label htmlFor="expr" className="text-xs font-semibold uppercase text-muted-foreground">
                {t("expression")}
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

              {s.error && (
                <div role="alert" className="mt-3 rounded-lg border-2 border-destructive/60 bg-destructive/10 p-2 text-sm">
                  <div className="font-semibold text-destructive">{s.error.type}</div>
                  <p>{s.error.message}</p>
                  {s.error.suggestion && <p className="mt-1 text-xs text-muted-foreground">Try: {s.error.suggestion}</p>}
                </div>
              )}

              <h3 className="mt-4 text-xs font-semibold uppercase text-muted-foreground">{t("inputValues")}</h3>
              <div className="-mx-4 inputs-panel-container">
                <InputsPanel />
              </div>

              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="destructive" className="flex-1 font-bold button-red" onClick={s.generate}>
                  <Play className="mr-1 h-3.5 w-3.5" /> {t("generate")}
                </Button>
                <Button size="sm" variant="outline" onClick={s.parseOnly}>
                  {t("parse")}
                </Button>
                <Button size="sm" variant="outline" onClick={s.runSimplify} aria-label={t("simplify")}>
                  <Zap className="h-3.5 w-3.5" />
                </Button>
              </div>

              <h3 className="mt-4 text-xs font-semibold uppercase text-muted-foreground">{t("stepSim")}</h3>
              <div className="-mx-4 calculation-panel-container">
                <CalculationPanel />
              </div>

              <details className="mt-4 rounded-lg border border-border p-2 text-sm">
                <summary className="cursor-pointer text-xs font-semibold uppercase text-muted-foreground">
                  {t("settings")}
                </summary>
                <div className="mt-2 space-y-2">
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
              </details>

              <details className="mt-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase text-muted-foreground">
                  {t("examples")}
                </summary>
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
              </details>
            </section>

            {/* RIGHT: canvas */}
            <section className="flex min-h-0 flex-1 flex-col">
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
                    minimap={false}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
                    {t("emptyCanvas")}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="h-[36vh] shrink-0 border-t border-border bg-card">
            <Tabs defaultValue="truth" className="flex h-full flex-col truth-table-tabs">
              <TabsList className="m-2 w-fit">
                <TabsTrigger value="truth">{t("truthTable")}</TabsTrigger>
                <TabsTrigger value="simplify">{t("simplification")}</TabsTrigger>
                <TabsTrigger value="ast">{t("ast")}</TabsTrigger>
                <TabsTrigger value="gate">{t("gate")}</TabsTrigger>
                <TabsTrigger value="analysis">{t("analysis")}</TabsTrigger>
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
              <TabsContent value="gate" className="min-h-0 flex-1 overflow-auto">
                <InspectorPanel />
              </TabsContent>
              <TabsContent value="analysis" className="min-h-0 flex-1 overflow-auto">
                <AnalysisPanel />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      )}
    </div>
  );
}
