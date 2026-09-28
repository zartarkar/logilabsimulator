import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import { useLang } from "@/i18n";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

type TourTab = "concepts" | "simulator" | "builder";

export interface TutorialHandle {
  start: () => void;
  startAutomatically: (finishTab: TourTab) => void;
}

export const TutorialDialog = forwardRef<
  TutorialHandle,
  { className?: string; hideTrigger?: boolean; onSelectTab: (tab: TourTab) => void; autoStart: TourTab | null; onAutoStarted: () => void }
>(function TutorialDialog({ className = "", hideTrigger = false, onSelectTab, autoStart, onAutoStarted }, ref) {
  const { t, lang } = useLang();
  const bn = lang === "bn";
  const startupTimer = useRef<number | undefined>(undefined);
  const navigationTimer = useRef<number | undefined>(undefined);
  const activeDriver = useRef<ReturnType<typeof driver> | null>(null);
  useEffect(() => () => {
    window.clearTimeout(startupTimer.current);
    window.clearTimeout(navigationTimer.current);
    activeDriver.current?.destroy();
    activeDriver.current = null;
  }, []);

  const startTour = useCallback(
    (finishTab?: TourTab, onStarted?: () => void) => {
      onSelectTab("concepts");

      window.clearTimeout(startupTimer.current);
      startupTimer.current = window.setTimeout(() => {
        const steps: DriveStep[] = [
          {
            popover: {
              title: bn ? "LogicLab এর সম্পূর্ণ গাইড" : "The complete LogicLab guide",
              description: bn
                ? "এই গাইডে কনসেপ্ট ঝালাই, রাশি পরীক্ষা, সার্কিট তৈরি ও চ্যালেঞ্জের ব্যবহার দেখানো হবে। গাইড নিজেই প্রয়োজনীয় পাতায় নিয়ে যাবে।"
                : "This guide covers concept review, testing expressions, building circuits and using challenges. It opens each workspace as you go.",
            },
          },
          {
            element: ".nav-tab-concepts",
            popover: {
              title: bn ? "কনসেপ্ট ঝালাই" : "Concept refresher",
              description: bn
                ? "এই বাটন থেকে ধারণা ও সূত্র ঝালিয়ে নিতে পারো। পরের ধাপে পুরো পাতাটি দেখব।"
                : "Use this button to review concepts and laws. Next, we’ll explore the full page.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: '[data-tour="concept-map"]',
            popover: {
              title: bn ? "কনসেপ্ট ঝালাই" : "Concept refresher",
              description: bn
                ? "এই মেনু থেকে পছন্দের বিষয় খোলো। পরের ধাপে একটি পাঠ খুলে দেখানো হবে।"
                : "Open any topic from this menu. Next, we’ll expand one lesson as an example.",
              side: "bottom",
              align: "center",
            },
          },
          ...([
            ["signals", "বুলিয়ান অপারেশন ও লজিক গেট", "Boolean operations and gates"],
          ] as const).map(([id, titleBn, titleEn]): DriveStep => ({
            element: `[data-tour="concept-${id}"]`,
            onHighlightStarted: () => {
              window.dispatchEvent(new CustomEvent("logiclab:tutorial-concept", { detail: id }));
              window.setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" });
                tutorial.refresh();
              }, 80);
            },
            popover: {
              title: bn ? titleBn : titleEn,
              description: bn ? "এই অংশের ব্যাখ্যা ও উদাহরণ দেখো; একই শিরোনামে আবার চাপলে অংশটি বন্ধ হবে।" : "Explore this section’s explanation and examples; tap its heading again to collapse it.",
              side: "bottom",
              align: "start",
            },
          })),
          {
            element: '[data-tour="navigation"]',
            popover: {
              title: bn ? "এবার রাশি পরীক্ষা করি" : "Now test an expression",
              description: bn
                ? "পরবর্তী ধাপে গাইড তোমাকে এক্সপ্রেশন সিমুলেটরে নিয়ে যাবে।"
                : "The next step opens the Expression Simulator.",
              side: "bottom",
              align: "center",
            },
          },

          {
            element: '[data-tour="expression-editor"]',
            popover: {
              title: bn ? "১. বুলিয়ান রাশি লিখো" : "1. Enter a Boolean expression",
              description: bn
                ? "নিজের রাশি লিখতে পারো অথবা নিচের প্রস্তুত উদাহরণ থেকে বেছে নিতে পারো। বন্ধনী ও পরিপূরক চিহ্নও ব্যবহার করা যাবে।"
                : "Enter your own expression or choose a prepared example. Parentheses and complement notation are supported.",
              side: "right",
              align: "start",
            },
          },
          {
            element: '[data-tour="generate-button"]',
            popover: {
              title: bn ? "রাশি থেকে সার্কিট তৈরি করো" : "Turn it into a circuit",
              description: bn
                ? "তৈরি করো বোতাম চাপলে রাশিটি স্বয়ংক্রিয়ভাবে সঠিক গেট ও তারের সার্কিটে রূপ নেবে।"
                : "Generate converts the expression into the corresponding gates and wires automatically.",
              side: "right",
              align: "center",
            },
          },
          {
            element: '[data-tour="truth-table-button"]',
            popover: {
              title: bn ? "সব ইনপুটের ফল যাচাই করো" : "Check every input combination",
              description: bn
                ? "সত্যক সারণিতে প্রতিটি সম্ভাব্য ইনপুট এবং তার আউটপুট একসঙ্গে দেখা যায়।"
                : "The truth table shows every possible input combination and its output.",
              side: "right",
              align: "center",
            },
          },
          {
            element: '[data-tour="simplification-button"]',
            popover: {
              title: bn ? "রাশিটি সরল করো" : "Simplify the expression",
              description: bn
                ? "ধাপে ধাপে ব্যবহৃত সূত্রসহ রাশিটির ছোট ও সমতুল্য রূপ দেখো।"
                : "See a shorter equivalent expression with the law used at each step.",
              side: "right",
              align: "center",
            },
          },
          {
            element: '[data-tour="simulator-canvas"]',
            popover: {
              title: bn ? "সার্কিটের ফল সরাসরি দেখো" : "Watch the circuit respond",
              description: bn
                ? "ইনপুট পরিবর্তন করে সক্রিয় তার অনুসরণ করো। মোবাইলে ক্যানভাস স্থির থাকবে। পুরো সার্কিট দেখতে Fit চাপো।"
                : "Change inputs and follow active wires. The mobile canvas stays fixed; use Fit to see the whole circuit.",
              side: "left",
              align: "center",
            },
          },
          {
            element: ".nav-tab-builder",
            popover: {
              title: bn ? "এবার নিজে সার্কিট বানাই" : "Now build one yourself",
              description: bn
                ? "পরবর্তী ধাপে গাইড সার্কিট নির্মাণ ও অনুশীলনের অংশ খুলবে।"
                : "The next step opens the circuit builder and practice workspace.",
              side: "bottom",
              align: "center",
            },
          },

          {
            element: '[data-tour="practice-panel"]',
            onHighlightStarted: () =>
              window.dispatchEvent(
                new CustomEvent("logiclab:tutorial-practice", { detail: "levels" }),
              ),
            popover: {
              title: bn ? "চ্যালেঞ্জ শুরু ও স্তর বাছাই" : "Start a challenge and choose a level",
              description: bn
                ? "চ্যালেঞ্জ মোড খুলে সহজ, মধ্যম বা কঠিন—এই তিনটি স্তরের একটি নির্বাচন করো।"
                : "Open challenge mode and choose one of three levels: Easy, Intermediate or Hard.",
              side: "right",
              align: "start",
            },
          },
          {
            element: '[data-tour="builder-palette"]',
            onHighlightStarted: () =>
              window.dispatchEvent(new CustomEvent("logiclab:tutorial-practice", { detail: null })),
            popover: {
              title: bn ? "উপাদান যোগ ও মুছে ফেলো" : "Add and remove components",
              description: bn
                ? "ইনপুট, আউটপুট বা গেট চাপলে তা কাজের জায়গায় যোগ হবে। কোনো উপাদান বেছে মুছতেও পারবে।"
                : "Tap an input, output, or gate to add it. Select a component when you need to remove it.",
              side: "right",
              align: "center",
            },
          },
          {
            element: '[data-tour="builder-canvas"]',
            popover: {
              title: bn ? "তার দিয়ে সার্কিট সম্পূর্ণ করো" : "Wire the circuit",
              description: bn
                ? "OUT → IN চাপলে তার জোড়ে। ভুল তার চাপলে মুছে যায়। ফাঁকা জায়গা টেনে সরাও।"
                : "Tap OUT → IN to wire. Tap a wire to remove it. Drag empty space to pan.",
              side: "left",
              align: "center",
            },
          },
          {
            element: '[data-tour="builder-fit"]',
            popover: {
              title: bn ? "পুরো সার্কিট পর্দায় আনো" : "Fit the complete circuit",
              description: bn
                ? "সার্কিট পর্দার বাইরে চলে গেলে এই বোতাম চাপলে সব উপাদান আবার দৃশ্যমান হবে।"
                : "If parts move off screen, use this button to bring the complete circuit back into view.",
              side: "bottom",
              align: "end",
            },
          },
          {
            popover: {
              title: bn ? "তুমি প্রস্তুত" : "You are ready",
              description: bn
                ? "ধারণা শেখা, রাশি পরীক্ষা, সার্কিট তৈরি এবং ভুল শনাক্ত করা সবই এখন এক জায়গায় করতে পারবে। প্রয়োজন হলে Tutorial চাপলে এই সম্পূর্ণ গাইড আবার শুরু হবে।"
                : "You can now learn concepts, test expressions, build circuits, and diagnose mistakes in one place. Press Tutorial any time to replay this complete guide.",
              ...(finishTab
                ? {
                    onNextClick: (
                      _element: Element | undefined,
                      _step: DriveStep,
                      options: { driver: { destroy: () => void } },
                    ) => {
                      onSelectTab("concepts");
                      options.driver.destroy();
                      window.setTimeout(
                        () =>
                          document
                            .querySelector<HTMLElement>('[data-tour="concepts"]')
                            ?.scrollTo({ top: 0, behavior: "instant" }),
                        450,
                      );
                    },
                  }
                : {}),
            },
          },
        ];

        const moveToStep = (index: number) => {
          if (index < 0 || index >= steps.length) return;
          window.clearTimeout(navigationTimer.current);
          const tab: TourTab = index < 5 ? "concepts" : index < 11 ? "simulator" : "builder";
          onSelectTab(tab);
          window.dispatchEvent(new CustomEvent("logiclab:tutorial-practice", { detail: null }));
          // This lesson starts collapsed, so open it before waiting for visibility.
          if (index === 3) {
            window.dispatchEvent(new CustomEvent("logiclab:tutorial-concept", { detail: "signals" }));
          }
          // Wait for the actual control, including after phone rotation.
          const waitForTarget = () => {
            const selector = steps[index]?.element;
            const target = typeof selector === "string" ? document.querySelector(selector) : null;
            const blocked = document.querySelector('[aria-labelledby="landscape-title"]');
            if (blocked || (selector && (!target || target.getClientRects().length === 0))) {
              navigationTimer.current = window.setTimeout(waitForTarget, 100);
              return;
            }
            tutorial.drive(index);
          };
          navigationTimer.current = window.setTimeout(waitForTarget, 0);
        };
        activeDriver.current?.destroy();
        const tutorial = driver({
          steps,
          onNextClick: (_element, _step, { driver: activeTour }) => {
            const next = (activeTour.getActiveIndex() ?? 0) + 1;
            if (next >= steps.length) activeTour.destroy();
            else moveToStep(next);
          },
          onPrevClick: (_element, _step, { driver: activeTour }) => {
            moveToStep((activeTour.getActiveIndex() ?? 0) - 1);
          },
          onDestroyed: () => {
            window.clearTimeout(navigationTimer.current);
            window.dispatchEvent(new CustomEvent("logiclab:tutorial-practice", { detail: null }));
          },
          showProgress: true,
          animate: false,
          smoothScroll: false,
          allowClose: true,
          overlayClickBehavior: "close",
          stagePadding: 8,
          stageRadius: 12,
          popoverClass: "app-tutorial-popover",
          nextBtnText: bn ? "পরবর্তী" : "Next",
          prevBtnText: bn ? "পূর্ববর্তী" : "Previous",
          doneBtnText: bn ? "শুরু করি" : "Start exploring",
          progressText: bn ? "{{current}} / {{total}}" : "{{current}} of {{total}}",
        });
        activeDriver.current = tutorial;
        tutorial.drive(0);
        onStarted?.();
      }, 0);
    },
    [bn, onSelectTab],
  );

  const startAutomatically = useCallback(
    (finishTab: TourTab, onStarted?: () => void) => {
      window.clearTimeout(startupTimer.current);
      const startWhenVisible = () => {
        const landscapePrompt = document.querySelector('[aria-labelledby="landscape-title"]');
        if (landscapePrompt) {
          startupTimer.current = window.setTimeout(startWhenVisible, 350);
          return;
        }
        startTour(finishTab, onStarted);
      };
      startWhenVisible();
    },
    [startTour],
  );

  // Own startup in the mounted guide. If React replays effects or remounts
  // during navigation, the pending request survives until drive() succeeds.
  useEffect(() => {
    if (!autoStart) return;
    startAutomatically(autoStart, onAutoStarted);
    return () => window.clearTimeout(startupTimer.current);
  }, [autoStart, onAutoStarted, startAutomatically]);

  useImperativeHandle(ref, () => ({ startAutomatically, start: () => startTour() }), [
    startAutomatically,
    startTour,
  ]);

  if (hideTrigger) return null;

  return (
    <Button
      size="sm"
      variant="outline"
      className={`gap-1 ${className}`}
      onClick={() => startTour()}
      aria-label={t("tutorial")}
      title={t("tutorial")}
    >
      <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {t("tutorial")}
    </Button>
  );
});
