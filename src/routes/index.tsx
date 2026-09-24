import { browserStorage } from "@/lib/browserStorage";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
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
  Menu,
  GraduationCap,
} from "lucide-react";
import { z } from "zod";
import { useCircuitStore } from "@/store/useCircuitStore";
import { CircuitCanvas } from "@/components/circuit/CircuitCanvas";
import { InputsPanel } from "@/components/panels/InputsPanel";
import { CalculationPanel } from "@/components/panels/CalculationPanel";
import { AnalysisPanel } from "@/components/panels/AnalysisPanel";
import { TruthTablePanel } from "@/components/panels/TruthTablePanel";
import { SimplifyPanel } from "@/components/panels/SimplifyPanel";
import { AstPanel } from "@/components/panels/AstPanel";
import { SandboxBuilder } from "@/components/builder/SandboxBuilder";
import { ConceptsPage } from "@/components/ConceptsPage";
import { MobileLandscapeGate } from "@/components/MobileLandscapeGate";
import { DiscoveryLanding } from "@/components/discovery/DiscoveryLanding";
import type { Destination } from "@/components/discovery/model";
import type { Familiarity } from "@/logic/introLearning";
import { TutorialDialog, type TutorialHandle } from "@/components/TutorialDialog";
import { LanguageProvider, useLang } from "@/i18n";
import { recognizeCircuitFromImage } from "@/services/circuit-recognition.functions";
import { performClientOCR } from "@/services/ocr-client";
import { useServerFn } from "@tanstack/react-start";

import { EXAMPLES } from "@/logic/examples";
import { analyze } from "@/logic/analysis";
import bgAsset from "@/assets/background.jpg.asset.json";

const searchSchema = z.object({
  q: z.string().catch("").optional(),
  tab: z.enum(["concepts", "simulator", "builder", "learn", "practice", "circuit"]).catch("simulator").optional(),
  v: z.string().catch("").optional(),
  circuit: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/")({
  validateSearch: (search) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "LogicLab: Boolean Expression to Logic Circuit Simulator" },
      {
        name: "description",
        content:
          "Turn any Boolean expression into an interactive logic-gate circuit. Live simulation, truth tables, Quine McCluskey simplification and a free-build gate sandbox.",
      },
      { property: "og:title", content: "LogicLab: Boolean Logic Circuit Simulator" },
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
  // Dark mode disabled as requested
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    browserStorage.removeItem("logiclab-theme");
  }, []);

  return { dark: false, toggle: () => {} };
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
  const tutorialRef = useRef<TutorialHandle>(null);
  const recognizeFn = useServerFn(recognizeCircuitFromImage);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [showTruthTable, setShowTruthTable] = useState(false);
  const [showSimplification, setShowSimplification] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [autoTourRequested, setAutoTourRequested] = useState(false);
  const [autoTourEndTab, setAutoTourEndTab] = useState<Destination>("concepts");

  useEffect(() => {
    // A shared workspace link must not bypass a new visitor's introduction.
    setShowOnboarding(browserStorage.getItem("logiclab-onboarding-complete") !== "true");
  }, [qTab]);

  const enterApp = (destination: Destination, familiarity: Familiarity, startGuide = false) => {
    browserStorage.setItem("logiclab-onboarding-complete", "true");
    browserStorage.setItem("logiclab-familiarity", familiarity);
    setAutoTourEndTab(destination);
    // Starting a journey explicitly requests guidance, even after an earlier tour.
    setAutoTourRequested(startGuide);
    s.setTab(destination);
    navigate({ search: { ...qSearch, tab: destination }, replace: true });
    setShowOnboarding(false);
  };

  const selectTourTab = useCallback((tab: "concepts" | "simulator" | "builder") => {
    useCircuitStore.getState().setTab(tab);
    navigate({ search: previous => ({ ...previous, tab }), replace: true });
  }, [navigate]);

  useEffect(() => {
    if (showOnboarding !== false || !autoTourRequested) return;
    const timer = window.setInterval(() => {
      if (!tutorialRef.current) return;
      tutorialRef.current.startAutomatically(autoTourEndTab);
      window.clearInterval(timer);
      setAutoTourRequested(false);
    }, 150);
    return () => window.clearInterval(timer);
  }, [showOnboarding, autoTourRequested, autoTourEndTab]);

  useEffect(() => {
    if (showSimplification && s.parsed && !s.simplified) {
      s.runSimplify();
    }
  }, [showSimplification, s.parsed, s.simplified, s.runSimplify]);

  // Sync state with query param on initial load or URL change
  useEffect(() => {
    let changed = false;
    const updates: any = {};
    
    if (q !== undefined && q !== s.expression) {
      updates.expression = q;
      changed = true;
    }
    
    if (qTab !== undefined && qTab !== s.tab) {
      const normalizedTab = qTab === 'circuit' || qTab === 'learn' ? 'simulator' : qTab;
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
    // Keep the public root URL untouched while the landing page is visible.
    // Otherwise this effect adds ?tab=simulator and immediately dismisses it.
    if (showOnboarding !== false || s.tab === "builder" || s.tab === "practice") return;

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
      const search: any = { tab: currentTab === 'simulator' ? 'simulator' : currentTab, ...(qSearch.circuit ? { circuit: qSearch.circuit } : {}) };
      
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
  }, [showOnboarding, s.expression, s.tab, s.values, s.parsed, q, qTab, qValues]);

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
    const saved = browserStorage.getItem("logiclab-project");
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
    browserStorage.setItem(
      "logiclab-project",
      JSON.stringify({ expression: s.expression, values: s.values, mode: s.mode }),
    );
  }, [s.expression, s.values, s.mode]);

  const stats = s.graph ? analyze(s.graph) : null;
  const outputValue = s.graph ? (s.nodeValues[s.graph.outputId] ?? 0) : 0;

  const examplesContent = (
    <div className="mt-2 grid grid-cols-1 gap-1.5">
      {EXAMPLES.map((g) => (
        <div key={g.label} className="rounded-md border border-border/40 bg-background/40 p-1.5">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">{g.label}</div>
          <div className="flex flex-wrap gap-1">
            {g.items.map((it) => (
              <button
                key={it.expr}
                onClick={() => {
                  useCircuitStore.setState({ expression: it.expr, values: {} });
                  s.generate();
                  toast.success("Example loaded");
                }}
                className="rounded-sm border border-border bg-card px-2 py-0.5 font-mono text-[10px] shadow-sm transition-colors hover:bg-accent"
              >
                {it.expr.replace(/^F = /, "")}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  if (showOnboarding === null) {
    return <div className="h-dvh bg-background" aria-label="Loading LogicLab" />;
  }

  if (showOnboarding) {
    return (
      <>
        <Toaster />
        <DiscoveryLanding onEnter={enterApp} />
      </>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-transparent text-foreground">
      {s.tab !== "concepts" && <MobileLandscapeGate />}
      <Toaster />
      <header className="app-header relative z-50 shrink-0 border-b border-border bg-card sm:sticky sm:top-0 sm:bg-card/90 sm:shadow-sm sm:backdrop-blur-md">
        <div className="app-header-inner flex flex-col gap-2 px-3 py-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:px-4">
          <div className="flex items-start justify-between gap-2 sm:contents">
            <div className="app-header-title min-w-0 flex-1 sm:col-start-1 sm:row-start-1 sm:min-w-0 sm:justify-self-start">
              <div data-tour="header-title" className="flex min-w-0 flex-col items-start text-left">
                <div className="text-xs font-extrabold uppercase tracking-wider text-destructive sm:text-sm">
                  {t("classLine")}
                </div>
                <div className="font-display text-[11px] font-black leading-tight tracking-tight sm:truncate sm:text-base">
                  {t("chapterLine")}
                </div>
              </div>
            </div>

            <div className="app-header-actions flex shrink-0 items-center gap-0.5 sm:col-start-3 sm:row-start-1 sm:static sm:justify-self-end sm:gap-3">
              <TutorialDialog ref={tutorialRef} onSelectTab={selectTourTab} hideTrigger />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10" aria-label={lang === "bn" ? "মেনু খুলুন" : "Open menu"}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onSelect={() => window.setTimeout(() => tutorialRef.current?.start(), 100)}>
                    <GraduationCap className="h-4 w-4" />{t("tutorial")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="flex items-center gap-2"><Languages className="h-4 w-4" />{lang === "bn" ? "ভাষা" : "Language"}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={lang} onValueChange={(value) => setLang(value as "en" | "bn")}>
                    <DropdownMenuRadioItem value="bn">বাংলা</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <nav data-tour="navigation" className="app-header-nav flex min-w-0 max-w-full justify-center gap-1.5 overflow-x-auto no-scrollbar sm:col-start-2 sm:row-start-1 sm:justify-center sm:gap-1 sm:overflow-visible" aria-label="Primary navigation">
              {(
                [
                  { id: "concepts", label: lang === "bn" ? "কনসেপ্ট ঝালাই" : "Concept refresher" },
                  { id: "simulator", label: t("tabCircuit") },
                  { id: "builder", label: t("tabBuild") },
                ] as const
              ).map((x) => (
                <button
                  key={x.id}
                  onClick={() => {
                    const targetTab = x.id === "simulator" ? "simulator" : x.id;
                    s.setTab(targetTab as any);
                    navigate({ search: { ...qSearch, tab: targetTab }, replace: true });
                  }}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors sm:px-4 sm:py-1.5 sm:text-xs nav-tab-${x.id} ${
                    s.tab === x.id || (x.id === "builder" && s.tab === "practice")
                      ? "bg-destructive text-destructive-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {x.label}
                </button>
              ))}
          </nav>
        </div>
      </header>

      {s.tab === "concepts" ? <ConceptsPage /> : s.tab === "builder" || s.tab === "practice" ? (
        <main className="min-h-0 flex-1 overflow-hidden bg-transparent flex flex-col builder-layout">
          <SandboxBuilder isPracticeMode={s.tab === "practice"} />
        </main>
      ) : (
        <main className="simulator-layout mobile-scroll-container flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar lg:flex-row lg:overflow-hidden">
          {/* LEFT: Controls & Input */}
          <section className="simulator-sidebar flex w-full shrink-0 flex-col border-b border-border bg-card/60 backdrop-blur-sm lg:w-[26rem] lg:overflow-y-auto lg:border-b-0 lg:border-r no-scrollbar">
            <div className="p-3 space-y-4">
              <div data-tour="expression-editor">
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
                <div className="mt-2 flex flex-col gap-2">
                  <Button data-tour="generate-button" size="sm" variant="destructive" className="w-full font-bold button-red" onClick={s.generate}>
                    <Play className="mr-1 h-3.5 w-3.5" /> {t("generate")}
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button data-tour="truth-table-button"
                      size="sm" 
                      variant={showTruthTable ? "destructive" : "outline"} 
                      className={`flex-1 text-[10px] h-8 ${showTruthTable ? "button-red" : ""}`}
                      onClick={() => {
                        setShowTruthTable((open) => {
                          setShowExamples(open);
                          return !open;
                        });
                        setShowSimplification(false);
                      }}
                    >
                      {t("truthTable")}
                    </Button>
                    <Button data-tour="simplification-button"
                      size="sm" 
                      variant={showSimplification ? "destructive" : "outline"} 
                      className={`flex-1 text-[10px] h-8 ${showSimplification ? "button-red" : ""}`}
                      onClick={() => {
                        setShowSimplification((open) => {
                          setShowExamples(open);
                          return !open;
                        });
                        setShowTruthTable(false);
                      }}
                    >
                      {t("simplification")}
                    </Button>
                  </div>
                </div>
              </div>

              {s.error && (
                <div role="alert" className="rounded-lg border-2 border-destructive/60 bg-destructive/10 p-2 text-sm">
                  <div className="font-semibold text-destructive">{s.error.type}</div>
                  <p>{s.error.message}</p>
                </div>
              )}

              <div className="lg:hidden">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground">{t("inputValues")}</h3>
                <div data-tour="input-controls" className="-mx-3 mt-1 inputs-panel-container">
                  <InputsPanel />
                </div>
              </div>

              {showTruthTable && (
                <div className="rounded-lg border border-border bg-background/50 overflow-hidden flex flex-col">
                  <div className="bg-muted/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b border-border flex justify-between items-center">
                    {t("truthTable")}
                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => { setShowTruthTable(false); setShowExamples(true); }}>×</Button>
                  </div>
                  <div>
                    <TruthTablePanel />
                  </div>
                </div>
              )}

              {showSimplification && (
                <div className="rounded-lg border border-border bg-background/50 overflow-hidden flex flex-col">
                  <div className="bg-muted/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b border-border flex justify-between items-center">
                    {t("simplification")}
                    <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => { setShowSimplification(false); setShowExamples(true); }}>×</Button>
                  </div>
                  <div className="p-3">
                    <SimplifyPanel />
                  </div>
                </div>
              )}

              {showExamples && (
                <>
                  <div data-tour="examples" className="mt-2 hidden lg:block">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">{t("examples")}</h3>
                    {examplesContent}
                  </div>
                  <details className="mt-2 lg:hidden">
                    <summary className="cursor-pointer text-xs font-semibold uppercase text-muted-foreground hover:text-foreground transition-colors">
                      {t("examples")}
                    </summary>
                    {examplesContent}
                  </details>
                </>
              )}
            </div>
          </section>

          {/* RIGHT: Canvas (Full Height) */}
          <section data-tour="simulator-canvas" className="simulator-canvas relative flex min-h-[28rem] flex-none flex-1 overflow-hidden bg-transparent lg:min-h-0 lg:flex-1">
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
          </section>
        </main>
      )}
    </div>
  );
}
