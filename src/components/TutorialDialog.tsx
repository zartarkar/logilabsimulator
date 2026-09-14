import { forwardRef, useCallback, useImperativeHandle } from "react";
import { driver, type DriveStep } from "driver.js";
import { useLang } from "@/i18n";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

type TourTab = "concepts" | "simulator" | "builder";

export interface TutorialHandle {
  startAutomatically: (finishTab: "concepts") => void;
}

export const TutorialDialog = forwardRef<
  TutorialHandle,
  { className?: string; onSelectTab: (tab: TourTab) => void }
>(function TutorialDialog({ className = "", onSelectTab }, ref) {
  const { t, lang } = useLang();
  const bn = lang === "bn";

  const startTour = useCallback(
    (finishTab?: "concepts") => {
      onSelectTab("concepts");

      window.setTimeout(() => {
        const goTo =
          (tab: TourTab) =>
          (
            _element: Element | undefined,
            _step: DriveStep,
            options: { driver: { moveNext: () => void } },
          ) => {
            onSelectTab(tab);
            window.setTimeout(() => options.driver.moveNext(), 350);
          };

        const steps: DriveStep[] = [
          {
            popover: {
              title: bn ? "LogicLab-এর সম্পূর্ণ গাইড" : "The complete LogicLab guide",
              description: bn
                ? "এই গাইডে শুরু থেকে শেষ পর্যন্ত প্রতিটি অংশের কাজ দেখানো হবে। গাইড নিজে থেকেই প্রয়োজনীয় পর্দায় নিয়ে যাবে।"
                : "This tour walks through every part of LogicLab from beginning to end and opens each workspace at the right time.",
            },
          },
          {
            element: '[data-tour="concept-demo"]',
            popover: {
              title: bn ? "সুইচ বদলে নিয়ম বুঝি" : "Discover a rule with switches",
              description: bn
                ? "এই সুইচগুলো চাপলে বাতির অবস্থা বদলাবে। দুটিই চালু থাকা আর যেকোনো একটি চালু থাকার নিয়ম তুলনা করো। এখান থেকেই অধ্যায়ের ধারণা শুরু।"
                : "Tap the switches and compare requiring both switches with requiring either one. This everyday decision introduces the chapter.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: '[data-tour="concept-map"]',
            popover: {
              title: bn ? "একই পাতায় ধারণাগুলোর সম্পর্ক" : "Explore the connected ideas",
              description: bn
                ? "এই লিংকগুলো দিয়ে সংকেত, সারণি, সূত্র, সরলীকরণ ও সার্বজনীন গেটের ব্যাখ্যায় যাওয়া যায়।"
                : "These links lead to signals, possible input states, laws, simplification and universal gates.",
              side: "bottom",
            },
          },
          {
            element: '[data-tour="concept-signals"] h2',
            popover: {
              title: bn ? "ইনপুট বদলে গেটের ফল দেখো" : "See how gates respond",
              description: bn
                ? "প্রতিটি গেটের নিচে তার নিজস্ব ইনপুট বোতাম আছে। A বা B চাপলে শুধু সেই গেটের মান ও আউটপুট বদলাবে। NOT গেটে একটি ইনপুট আছে।"
                : "Each gate has its own input buttons below it. Tap A or B to change only that gate's inputs and output. NOT has one input.",
              side: "bottom",
            },
          },
          {
            element: '[data-tour="concept-tables"] h2',
            popover: {
              title: bn ? "চারটি বা আটটি অবস্থা কেন?" : "Why four or eight states?",
              description: bn
                ? "ইনপুটের কার্ডে চাপ দিয়ে সম্ভাবনাগুলো দেখো। দুই ইনপুটে চার, তিন ইনপুটে আটটি অবস্থা হয়। দরকার হলে নিচের সারণি খুলে সব ফল মেলাও।"
                : "Tap the input cards to explore four states for two inputs and eight for three. Expand the tables when you want to check every result.",
              side: "bottom",
            },
          },
          {
            element: '[data-tour="concept-laws"] h2',
            popover: {
              title: bn ? "সূত্র থেকে ছোট সার্কিট" : "From laws to simpler circuits",
              description: bn
                ? "এখানে সূত্রের কার্ড, তারপর ডি মর্গ্যানের ব্যাখ্যা ও সরলীকরণের ধাপ আছে। সবশেষে NAND বা NOR দিয়ে একই কাজ করার পদ্ধতি দেখো।"
                : "Read the law cards, then follow De Morgan and the simplification steps. The final section shows how NAND or NOR alone can do the same work.",
              side: "bottom",
            },
          },

          {
            element: '[data-tour="navigation"]',
            popover: {
              title: bn ? "এবার রাশি পরীক্ষা করি" : "Now test an expression",
              description: bn
                ? "পরবর্তী ধাপে গাইড তোমাকে এক্সপ্রেশন সিমুলেটরে নিয়ে যাবে।"
                : "The next step opens the Expression Simulator.",
              side: "bottom",
              align: "center",
              onNextClick: goTo("simulator"),
            },
          },

          {
            element: '[data-tour="expression-editor"]',
            popover: {
              title: bn ? "1. বুলিয়ান রাশি লিখো" : "1. Enter a Boolean expression",
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
              onNextClick: goTo("builder"),
            },
          },

          {
            element: '[data-tour="practice-panel"]',
            popover: {
              title: bn ? "২. লক্ষ্যভিত্তিক অনুশীলন" : "2. Goal-based practice",
              description: bn
                ? "চ্যালেঞ্জ চালু করে সহজ, মধ্যম বা কঠিন স্তর বেছে নাও। সহজ স্তরে ধাপে ধাপে সহায়তা থাকবে এবং অন্য স্তরে নিজের সার্কিট যাচাই করা যাবে।"
                : "Start a challenge and choose beginner, intermediate, or hard. Beginner includes guided steps; the other levels let you check your own solution.",
              side: "right",
              align: "start",
            },
          },
          {
            element: '[data-tour="builder-palette"]',
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
                ? "প্রথমে ডান পাশের OUT বিন্দুতে, তারপর পরের গেটের বাম পাশের IN বিন্দুতে চাপো। টেনেও তার জোড়া যায়। ভুল তার একবার চাপলেই মুছে যাবে। ফাঁকা জায়গা টেনে পুরো সার্কিট সরাতে পারবে।"
                : "Tap an OUT dot, then an IN dot to connect them, or drag between the dots. Tap an incorrect wire to remove it, and drag empty space to pan.",
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
                      onSelectTab(finishTab);
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

        const tutorial = driver({
          steps,
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
        tutorial.drive();
      }, 300);
    },
    [bn, onSelectTab],
  );

  const startAutomatically = useCallback(
    (finishTab: "concepts") => {
      let timer: number;
      const startWhenVisible = () => {
        const landscapePrompt = document.querySelector('[aria-labelledby="landscape-title"]');
        if (landscapePrompt) {
          timer = window.setTimeout(startWhenVisible, 350);
          return;
        }
        timer = window.setTimeout(() => startTour(finishTab), 250);
      };
      startWhenVisible();
    },
    [startTour],
  );

  useImperativeHandle(ref, () => ({ startAutomatically }), [startAutomatically]);

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
