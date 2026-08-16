import { useEffect, useState, useMemo, useRef } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
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
  Camera,
  Upload,
} from "lucide-react";
import { z } from "zod";
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
import { recognizeCircuitFromImage } from "@/services/circuit-recognition.functions";
import { performClientOCR } from "@/services/ocr-client";
import { useServerFn } from "@tanstack/react-start";

import { EXAMPLES } from "@/logic/examples";
import { analyze } from "@/logic/analysis";
import bgAsset from "@/assets/background.jpg.asset.json";

const searchSchema = z.object({
  q: z.string().optional(),
  tab: z.enum(["circuit", "build", "learn"]).optional(),
  v: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: (search) => searchSchema.parse(search),
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
  const { q, tab: qTab, v: qValues } = useSearch({ from: "/" });
  const navigate = useNavigate({ from: "/" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognizeFn = useServerFn(recognizeCircuitFromImage);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);

  // Sync state with query param on initial load or URL change
  useEffect(() => {
    let changed = false;
    const updates: any = {};
    
    if (q !== undefined && q !== s.expression) {
      updates.expression = q;
      changed = true;
    }
    
    if (qTab !== undefined && qTab !== s.tab) {
      updates.tab = qTab;
      changed = true;
    }

    if (qValues !== undefined) {
      const parsedValues: Record<string, 0 | 1> = {};
      qValues.split(',').forEach(pair => {
        const name = pair.slice(0, -1);
        const val = pair.slice(-1) === '1' ? 1 : 0;
        if (name) parsedValues[name] = val;
      });
      
      // Check if values actually changed to avoid infinite loop
      const valuesChanged = Object.entries(parsedValues).some(([k, v]) => s.values[k] !== v);
      if (valuesChanged) {
        updates.values = { ...s.values, ...parsedValues };
        changed = true;
      }
    }

    if (changed) {
      useCircuitStore.setState(updates);
      if (updates.expression !== undefined) {
        s.generate();
      }
    }
  }, [q, qTab, qValues]);

  // Update query param when state changes
  useEffect(() => {
    const valuesStr = Object.entries(s.values)
      .map(([k, v]) => `${k}${v}`)
      .join(',');
    
    if (s.expression !== q || s.tab !== qTab || valuesStr !== qValues) {
      navigate({ 
        search: { 
          q: s.expression,
          tab: s.tab,
          v: valuesStr || undefined
        },
        replace: true
      });
    }
  }, [s.expression, s.tab, s.values]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRecognitionError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64DataUrl = reader.result as string;
      const base64 = base64DataUrl.split(",")[1];
      if (!base64) return;

      const processPromise = (async () => {
        try {
          // 1. Try AI Recognition via Server Function (High Quality)
          const res = await recognizeFn({ data: { base64Image: base64 } });
          
          if (res.success && res.expression) {
            return res;
          }
          
          // 2. If AI fails or is not configured, fallback to Browser-side OCR
          console.log("AI recognition failed or not configured, trying browser-side OCR...");
          const ocrText = await performClientOCR(base64DataUrl);
          
          // Clean and format OCR text
          let cleaned = ocrText
            .replace(/\n/g, ' ')
            .replace(/[^\w\s'+.()!]/g, '')
            .trim();
          
          if (cleaned.length < 2) {
            throw new Error(res.error || t("imageError"));
          }

          if (!cleaned.includes('=') && !cleaned.includes('F')) {
            cleaned = "F = " + cleaned;
          }

          return {
            success: true,
            expression: cleaned,
            explanation: "Extracted via browser-side OCR."
          };
        } catch (error: any) {
          const errMsg = error?.message || t("imageError");
          setRecognitionError(errMsg);
          throw error;
        }
      })();

      toast.promise(processPromise, {
        loading: t("processingImage"),
        success: (res) => {
          if (res.success && res.expression) {
            s.setExpression(res.expression);
            s.generate();
            return t("imageSuccess");
          }
          throw new Error(t("imageError"));
        },
        error: (err) => err instanceof Error ? err.message : t("imageError"),
      });
    };
    reader.readAsDataURL(file);
  };

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
    <div className="flex h-screen flex-col bg-transparent text-foreground">
      <Toaster />
      <header className="shrink-0 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex flex-col gap-3 px-4 py-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:py-1">
          <div className="flex items-center justify-between lg:justify-start gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <CircuitBoard className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-destructive">
                  {t("classLine")}
                </div>
                <div className="font-display text-sm font-extrabold leading-none">{t("chapterLine")}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 lg:hidden">
              <TutorialDialog />
              <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={toggle} aria-label="Toggle theme">
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <nav className="flex justify-center gap-1">
            {(
              [
                { id: "circuit", label: t("tabCircuit") },
                { id: "build", label: t("tabBuild") },
                { id: "learn", label: t("tabLearn") },
              ] as const
            ).map((x) => (
              <button
                key={x.id}
                onClick={() => s.setTab(x.id)}
                className={`rounded-full px-3 py-1.5 text-xs sm:px-4 sm:text-sm font-semibold transition-colors nav-tab-${x.id} ${
                  s.tab === x.id
                    ? "bg-destructive text-destructive-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {x.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center justify-center lg:justify-end gap-2">
            <div className="flex items-center overflow-hidden rounded-full border border-border bg-background/50">
              <Languages className="mx-1.5 h-3.5 w-3.5 text-muted-foreground" />
              {(["en", "bn"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`px-3 py-1 text-xs font-bold transition-colors ${
                    lang === l ? "button-lang-active" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {l === "en" ? "EN" : "বাং"}
                </button>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-1">
              <TutorialDialog />
              <Button size="sm" variant="outline" className="h-9 w-9 p-0" onClick={toggle} aria-label="Toggle theme">
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {s.tab === "learn" ? (
        <main className="min-h-0 flex-1 overflow-y-auto learn-panel-container bg-transparent">
          <LearnPanel />
        </main>
      ) : s.tab === "build" ? (
        <main className="min-h-0 flex-1 overflow-hidden bg-transparent">
          <SandboxBuilder />
        </main>
      ) : (
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            {/* LEFT: controls */}
            <section className="w-full shrink-0 overflow-y-auto border-b border-border bg-card/60 backdrop-blur-sm p-3 lg:w-[26rem] lg:border-b-0 lg:border-r lg:max-h-full max-h-[50vh]">
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

              {/* Secret missing warning with action button */}
              {!s.error && recognitionError && recognitionError.includes("GOOGLE_GENERATIVE_AI_API_KEY") && (
                <div role="alert" className="mt-3 rounded-lg border-2 border-amber-500/60 bg-amber-500/10 p-3 text-sm">
                  <div className="font-semibold text-amber-600 dark:text-amber-400">Configuration Required</div>
                  <p className="mt-1 text-foreground/90">
                    The image recognition feature requires a Google AI API Key to work.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-3 w-full border-amber-500/50 hover:bg-amber-500/20"
                    onClick={() => {
                      // Use window.dispatchLovableTool if available (it often is in these environments)
                      // or just show instructions since I can't guarantee parent postMessage will be caught here
                      // without proper handler. However, I can trigger the add_secret tool from my side!
                      toast.info("Opening secret addition form...");
                      // I will call add_secret from the agent side in a separate tool call if this button is just UI.
                      // For now, let's just make it a trigger for the user to look at the chat.
                      alert("Please click 'Add Secret' in the Lovable chat interface to configure the GOOGLE_GENERATIVE_AI_API_KEY.");
                    }}
                  >
                    Add API Key
                  </Button>
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
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="image-upload-button"
                  onClick={() => fileInputRef.current?.click()}
                  title={t("uploadCircuit")}
                >
                  <Camera className="h-3.5 w-3.5 mr-1" />
                  <Upload className="h-3.5 w-3.5" />
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
              <div className="flex flex-wrap items-center gap-3 border-b border-border bg-card/60 backdrop-blur-sm px-3 py-1.5 text-xs">
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
              <div className="relative min-h-[350px] flex-1 lg:min-h-0">
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

          <div className="h-[40vh] shrink-0 border-t border-border bg-card/80 backdrop-blur-md lg:h-[36vh]">
            <Tabs defaultValue="truth" className="flex h-full flex-col truth-table-tabs">
              <TabsList className="m-2 w-fit">
                <TabsTrigger value="truth" className="data-[state=active]:button-red">{t("truthTable")}</TabsTrigger>
                <TabsTrigger value="simplify" className="data-[state=active]:button-red">{t("simplification")}</TabsTrigger>
                <TabsTrigger value="ast" className="data-[state=active]:button-red">{t("ast")}</TabsTrigger>
                <TabsTrigger value="gate" className="data-[state=active]:button-red">{t("gate")}</TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:button-red">{t("analysis")}</TabsTrigger>
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
