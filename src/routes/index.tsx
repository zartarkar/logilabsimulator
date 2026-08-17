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
  PanelRightClose,
  PanelRightOpen,
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
  q: z.string().catch("").optional(),
  tab: z.enum(["simulator", "builder", "learn", "circuit"]).catch("simulator").optional(),
  v: z.string().catch("").optional(),
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
  const qSearch = useSearch({ from: "/" });
  const { q, tab: qTab, v: qValues } = qSearch;
  const navigate = useNavigate({ from: "/" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognizeFn = useServerFn(recognizeCircuitFromImage);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [canvasSidebarOpen, setCanvasSidebarOpen] = useState(true);

  // Sync state with query param on initial load or URL change
  useEffect(() => {
    let changed = false;
    const updates: any = {};
    
    if (q !== undefined && q !== s.expression) {
      updates.expression = q;
      changed = true;
    }
    
    if (qTab !== undefined && qTab !== s.tab) {
      const normalizedTab = qTab === 'circuit' ? 'simulator' : qTab;
      updates.tab = normalizedTab;
      changed = true;
    }

    if (qValues !== undefined) {
      const parsedValues: Record<string, 0 | 1> = {};
      qValues.split(',').forEach(pair => {
        const name = pair.slice(0, -1);
        const valStr = pair.slice(-1);
        const val = valStr === '1' ? 1 : 0;
        if (name) parsedValues[name] = val;
      });
      
      const valuesChanged = Object.entries(parsedValues).some(([k, v]) => s.values[k] !== v);
      if (valuesChanged) {
        updates.values = { ...s.values, ...parsedValues };
        changed = true;
      }
    }

    if (changed) {
      useCircuitStore.setState(updates);
      // Only generate if we actually have an expression either from URL or state
      const finalExpression = updates.expression ?? s.expression;
      if (finalExpression) {
        s.generate();
      }
    }
  }, [q, qTab, qValues]);

  useEffect(() => {
    const relevantVars = s.parsed?.variables || [];
    const valuesStr = Object.entries(s.values)
      .filter(([k]) => relevantVars.includes(k))
      .map(([k, v]) => `${k}${v}`)
      .join(',');
    
    const currentQ = s.expression || undefined;
    const currentTab = s.tab;
    const currentV = valuesStr || undefined;

    // Determine if we should include currentQ based on the tab
    // If we're in builder or learn, q might be irrelevant or we might want to hide it
    // The user said "jei tab e thakbo age oi tab name ashbe then the rest"
    // This implies /?tab=simulator&q=... or /?tab=builder...
    
    if (currentQ !== q || currentTab !== qTab || currentV !== qValues) {
      const search: any = { tab: currentTab === 'simulator' ? 'simulator' : currentTab };
      
      // Only include q if we are in the simulator tab or if it's already present
      if (currentTab === 'simulator' && currentQ) {
        search.q = currentQ;
      }
      
      if (currentV) {
        search.v = currentV;
      }

      navigate({ 
        search,
        replace: true
      });
    }
  }, [s.expression, s.tab, s.values, s.parsed, q, qTab, qValues]);

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
    if (saved && !q && !qTab && !qValues) {
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
    <div className="flex h-dvh flex-col bg-transparent pt-2 text-foreground sm:pt-3">
      <Toaster />
      <header className="sticky top-2 z-50 mx-2 shrink-0 rounded-lg border border-border bg-card/90 shadow-sm backdrop-blur-md sm:top-3 sm:mx-3">
        <div className="flex flex-col gap-3 px-4 py-3 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:py-1">
          <div className="flex items-center gap-4">
            <img src="https://cdn.10minuteschool.com/images/svg/Origin%20Labs%20Black.svg" alt="Origin Labs" className="h-8 w-auto" />
            <div className="leading-tight">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-destructive">
                {t("classLine")}
              </div>
              <div className="font-display text-sm font-extrabold leading-none">{t("chapterLine")}</div>
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
                { id: "simulator", label: t("tabCircuit") },
                { id: "builder", label: t("tabBuild") },
                { id: "learn", label: t("tabLearn") },
              ] as const
            ).map((x) => (
              <button
                key={x.id}
                onClick={() => { 
                  const targetTab = x.id === 'simulator' ? 'simulator' : x.id;
                  s.setTab(targetTab as any); 
                  navigate({ search: { ...qSearch, tab: targetTab }, replace: true }); 
                }}
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
      ) : s.tab === "builder" ? (
        <main className="min-h-0 flex-1 overflow-hidden bg-transparent">
          <SandboxBuilder />
        </main>
      ) : (
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
          <div className="flex flex-none flex-col lg:min-h-0 lg:flex-1 lg:flex-row lg:overflow-hidden">
            {/* LEFT: Controls & Input */}
            <section className="flex w-full shrink-0 flex-col border-b border-border bg-card/60 p-3 backdrop-blur-sm lg:w-[26rem] lg:overflow-y-auto lg:border-b-0 lg:border-r">
              <div>
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
                  rows={2}
                  className="mt-1 font-mono text-sm"
                  placeholder="F = XYZ+XY+X'Y'Z"
                />
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="destructive" className="flex-1 font-bold button-red" onClick={s.generate}>
                    <Play className="mr-1 h-3.5 w-3.5" /> {t("generate")}
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
              </div>

              {s.error && (
                <div role="alert" className="mt-3 rounded-lg border-2 border-destructive/60 bg-destructive/10 p-2 text-sm">
                  <div className="font-semibold text-destructive">{s.error.type}</div>
                  <p>{s.error.message}</p>
                </div>
              )}

              <div className="mt-4 flex-1">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">{t("inputValues")}</h3>
                <div className="-mx-3 inputs-panel-container">
                  <InputsPanel />
                </div>
              </div>

              {/* Analysis and stats removed as per request to simplify options */}
              
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

            {/* RIGHT: Canvas */}
            <section className="flex h-[min(72vh,34rem)] min-h-[25rem] w-full flex-none flex-col bg-transparent md:flex-row lg:h-auto lg:min-h-0 lg:flex-1">
              <div className="relative min-h-[22rem] min-w-0 flex-1 canvas-container">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-2 z-20 h-8 w-8 bg-card/90"
                  onClick={() => setCanvasSidebarOpen((open) => !open)}
                  aria-label={canvasSidebarOpen ? "Hide circuit sidebar" : "Show circuit sidebar"}
                  title={canvasSidebarOpen ? "Hide circuit sidebar" : "Show circuit sidebar"}
                >
                  {canvasSidebarOpen ? <PanelRightClose /> : <PanelRightOpen />}
                </Button>
                {s.graph && (
                  <div className="absolute bottom-2 right-2 z-10 rounded border border-border bg-card/90 px-2 py-1 font-mono text-[10px] backdrop-blur-sm">
                    {s.parsed?.name ?? "F"} = {s.nodeValues[s.graph.outputId] ?? 0} · {(s.nodeValues[s.graph.outputId] ?? 0) === 1 ? "ON" : "OFF"}
                  </div>
                )}
                <div className="absolute inset-0">
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
              </div>
              {canvasSidebarOpen && (
                <aside className="h-44 shrink-0 overflow-y-auto border-t border-border bg-card/80 backdrop-blur-sm md:h-auto md:w-64 md:border-l md:border-t-0" aria-label="Circuit inspector">
                  <div className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">
                    Circuit inspector
                  </div>
                  <InspectorPanel />
                </aside>
              )}
            </section>
          </div>

          {/* BOTTOM: Truth Table & Simplification */}
          <section className="h-[22rem] min-h-[22rem] shrink-0 border-t border-border bg-card/80 backdrop-blur-md overflow-hidden flex flex-col lg:h-[24rem] lg:min-h-0">
            <Tabs defaultValue="truth" className="flex flex-col h-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-2 h-10 shrink-0">
                <TabsTrigger value="truth" className="data-[state=active]:button-red h-8">{t("truthTable")}</TabsTrigger>
                <TabsTrigger value="simplify" className="data-[state=active]:button-red h-8">{t("simplification")}</TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-auto">
                <TabsContent value="truth" className="m-0 h-full">
                  <TruthTablePanel />
                </TabsContent>
                <TabsContent value="simplify" className="m-0 h-full p-4">
                  <SimplifyPanel />
                </TabsContent>
              </div>
            </Tabs>
          </section>
        </main>
      )}
    </div>
  );
}
