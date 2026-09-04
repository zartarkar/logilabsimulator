import { forwardRef, useCallback, useImperativeHandle } from "react";
import { driver, type DriveStep } from "driver.js";
import { useLang } from "@/i18n";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

type TourTab = "learn" | "simulator" | "builder";

export interface TutorialHandle {
  startAutomatically: (finishTab: "learn" | "simulator") => void;
}

export const TutorialDialog = forwardRef<TutorialHandle, { className?: string; onSelectTab: (tab: TourTab) => void }>(function TutorialDialog({ className = "", onSelectTab }, ref) {
  const { t, lang } = useLang();
  const bn = lang === "bn";

  const startTour = useCallback((finishTab?: "learn" | "simulator") => {
    onSelectTab("learn");

    window.setTimeout(() => {
      const goTo = (tab: TourTab) => (_element: Element | undefined, _step: DriveStep, options: { driver: { moveNext: () => void } }) => {
        onSelectTab(tab);
        window.setTimeout(() => options.driver.moveNext(), 350);
      };

      const steps: DriveStep[] = [
        { popover: { title: bn ? "LogicLab-এর সম্পূর্ণ গাইড" : "The complete LogicLab guide", description: bn ? "এই গাইডে শুরু থেকে শেষ পর্যন্ত প্রতিটি অংশের কাজ দেখানো হবে। গাইড নিজে থেকেই প্রয়োজনীয় পর্দায় নিয়ে যাবে।" : "This tour walks through every part of LogicLab from beginning to end and opens each workspace at the right time." } },
        { element: '[data-tour="navigation"]', popover: { title: bn ? "তিনটি শেখার ধাপ" : "Three stages of learning", description: bn ? "প্রথমে ধারণা বোঝো, এরপর রাশি পরীক্ষা করো, তারপর নিজে সার্কিট তৈরি ও অনুশীলন করো। এখান থেকে যেকোনো অংশে যেতে পারবে।" : "Learn the concepts first, test expressions next, then build and practise circuits yourself. Use these tabs to move between stages.", side: "bottom", align: "center" } },

        { element: '[data-tour="learn-intro"]', popover: { title: bn ? "১. ভিত্তি তৈরি করো" : "1. Build the foundation", description: bn ? "ডিজিটাল লজিকে ০, ১, ইনপুট, গেট এবং আউটপুট কীভাবে সম্পর্কিত তা এখান থেকে বোঝো।" : "Understand how 0, 1, inputs, gates, and outputs work together in digital logic.", side: "bottom", align: "center" } },
        { element: '[data-tour="learn-overview"]', popover: { title: bn ? "পুরো অধ্যায়ের মানচিত্র" : "A map of the chapter", description: bn ? "চারটি ছোট ধারণা দেখায় কীভাবে ইনপুট থেকে গেট, রাশি এবং সর্বশেষ আউটপুট পাওয়া যায়।" : "Four short ideas show the journey from inputs through gates and expressions to the final output.", side: "top", align: "center" } },
        { element: '[data-tour="learn-gates"]', popover: { title: bn ? "গেট নিজে পরীক্ষা করো" : "Test every gate yourself", description: bn ? "গেট বেছে ইনপুট ০ বা ১ করো। আউটপুট সঙ্গে সঙ্গে বদলাবে, তাই শুধু মুখস্থ না করে নিয়মটি বুঝতে পারবে।" : "Choose a gate and toggle its inputs. The output changes instantly, helping you understand instead of memorise.", side: "top", align: "center" } },
        { element: '[data-tour="learn-laws"]', popover: { title: bn ? "সরলীকরণের সূত্র শেখো" : "Learn the simplification laws", description: bn ? "প্রতিটি সূত্র খুলে তার রূপ ও সহজ ব্যাখ্যা দেখো। এগুলো রাশি ছোট করতে কাজে লাগবে।" : "Open each law to see its form and explanation. These laws help reduce expressions.", side: "top", align: "center" } },
        { element: '[data-tour="navigation"]', popover: { title: bn ? "এবার রাশি পরীক্ষা করি" : "Now test an expression", description: bn ? "পরবর্তী ধাপে গাইড তোমাকে এক্সপ্রেশন সিমুলেটরে নিয়ে যাবে।" : "The next step opens the Expression Simulator.", side: "bottom", align: "center", onNextClick: goTo("simulator") } },

        { element: '[data-tour="expression-editor"]', popover: { title: bn ? "২. বুলিয়ান রাশি লিখো" : "2. Enter a Boolean expression", description: bn ? "নিজের রাশি লিখতে পারো অথবা নিচের প্রস্তুত উদাহরণ থেকে বেছে নিতে পারো। বন্ধনী ও পরিপূরক চিহ্নও ব্যবহার করা যাবে।" : "Enter your own expression or choose a prepared example. Parentheses and complement notation are supported.", side: "right", align: "start" } },
        { element: '[data-tour="generate-button"]', popover: { title: bn ? "রাশি থেকে সার্কিট তৈরি করো" : "Turn it into a circuit", description: bn ? "তৈরি করো বোতাম চাপলে রাশিটি স্বয়ংক্রিয়ভাবে সঠিক গেট ও তারের সার্কিটে রূপ নেবে।" : "Generate converts the expression into the corresponding gates and wires automatically.", side: "right", align: "center" } },
        { element: '[data-tour="truth-table-button"]', popover: { title: bn ? "সব ইনপুটের ফল যাচাই করো" : "Check every input combination", description: bn ? "সত্যক সারণিতে প্রতিটি সম্ভাব্য ইনপুট এবং তার আউটপুট একসঙ্গে দেখা যায়।" : "The truth table shows every possible input combination and its output.", side: "right", align: "center" } },
        { element: '[data-tour="simplification-button"]', popover: { title: bn ? "রাশিটি সরল করো" : "Simplify the expression", description: bn ? "ধাপে ধাপে ব্যবহৃত সূত্রসহ রাশিটির ছোট ও সমতুল্য রূপ দেখো।" : "See a shorter equivalent expression with the law used at each step.", side: "right", align: "center" } },
        { element: '[data-tour="simulator-canvas"]', popover: { title: bn ? "সার্কিটের ফল সরাসরি দেখো" : "Watch the circuit respond", description: bn ? "ইনপুট পরিবর্তন করে সক্রিয় তার অনুসরণ করো। ফাঁকা জায়গা টেনে সার্কিট সরানো এবং দুই আঙুলে বড় বা ছোট করা যাবে।" : "Change inputs and follow active wires. Drag empty space to pan and pinch to zoom.", side: "left", align: "center" } },
        { element: '[data-tour="navigation"]', popover: { title: bn ? "এবার নিজে সার্কিট বানাই" : "Now build one yourself", description: bn ? "পরবর্তী ধাপে গাইড সার্কিট নির্মাণ ও অনুশীলনের অংশ খুলবে।" : "The next step opens the circuit builder and practice workspace.", side: "bottom", align: "center", onNextClick: goTo("builder") } },

        { element: '[data-tour="practice-panel"]', popover: { title: bn ? "৩. লক্ষ্যভিত্তিক অনুশীলন" : "3. Goal-based practice", description: bn ? "চ্যালেঞ্জ চালু করে সহজ, মধ্যম বা কঠিন স্তর বেছে নাও। সহজ স্তরে ধাপে ধাপে সহায়তা থাকবে এবং অন্য স্তরে নিজের সার্কিট যাচাই করা যাবে।" : "Start a challenge and choose beginner, intermediate, or hard. Beginner includes guided steps; the other levels let you check your own solution.", side: "right", align: "start" } },
        { element: '[data-tour="builder-palette"]', popover: { title: bn ? "উপাদান যোগ ও মুছে ফেলো" : "Add and remove components", description: bn ? "ইনপুট, আউটপুট বা গেট চাপলে তা কাজের জায়গায় যোগ হবে। কোনো উপাদান বেছে মুছতেও পারবে।" : "Tap an input, output, or gate to add it. Select a component when you need to remove it.", side: "right", align: "center" } },
        { element: '[data-tour="builder-canvas"]', popover: { title: bn ? "তার দিয়ে সার্কিট সম্পূর্ণ করো" : "Wire the circuit", description: bn ? "এক উপাদানের সংযোগবিন্দু থেকে অন্যটির সংযোগবিন্দুতে টেনে তার দাও। ভুল তার একবার চাপলেই মুছে যাবে। ফাঁকা জায়গা টেনে পুরো সার্কিট সরাতে পারবে।" : "Drag from one connection point to another to create a wire. Tap an incorrect wire to remove it, and drag empty space to pan.", side: "left", align: "center" } },
        { element: '[data-tour="builder-fit"]', popover: { title: bn ? "পুরো সার্কিট পর্দায় আনো" : "Fit the complete circuit", description: bn ? "সার্কিট পর্দার বাইরে চলে গেলে এই বোতাম চাপলে সব উপাদান আবার দৃশ্যমান হবে।" : "If parts move off screen, use this button to bring the complete circuit back into view.", side: "bottom", align: "end" } },
        { popover: {
          title: bn ? "তুমি প্রস্তুত" : "You are ready",
          description: bn ? "ধারণা শেখা, রাশি পরীক্ষা, সার্কিট তৈরি এবং ভুল শনাক্ত করা সবই এখন এক জায়গায় করতে পারবে। প্রয়োজন হলে Tutorial চাপলে এই সম্পূর্ণ গাইড আবার শুরু হবে।" : "You can now learn concepts, test expressions, build circuits, and diagnose mistakes in one place. Press Tutorial any time to replay this complete guide.",
          ...(finishTab ? { onNextClick: (_element: Element | undefined, _step: DriveStep, options: { driver: { destroy: () => void } }) => {
            onSelectTab(finishTab);
            options.driver.destroy();
          }} : {}),
        } },
      ];

      const tutorial = driver({
        steps, showProgress: true, animate: true, smoothScroll: true, allowClose: true,
        overlayClickBehavior: "close", stagePadding: 8, stageRadius: 12,
        popoverClass: "app-tutorial-popover",
        nextBtnText: bn ? "পরবর্তী" : "Next", prevBtnText: bn ? "পূর্ববর্তী" : "Previous",
        doneBtnText: bn ? "শুরু করি" : "Start exploring",
        progressText: bn ? "{{current}} / {{total}}" : "{{current}} of {{total}}",
      });
      tutorial.drive();
      // Replaying the tutorial from the header must not consume the one-time
      // automatic tutorial intended for a user's first landing-page entry.
      if (finishTab) localStorage.setItem("logiclab-auto-tutorial-shown-v3", "true");
    }, 300);
  }, [bn, onSelectTab]);

  const startAutomatically = useCallback((finishTab: "learn" | "simulator") => {
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
  }, [startTour]);

  useImperativeHandle(ref, () => ({ startAutomatically }), [startAutomatically]);

  return <Button size="sm" variant="outline" className={`gap-1 ${className}`} onClick={() => startTour()} aria-label={t("tutorial")} title={t("tutorial")}><GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {t("tutorial")}</Button>;
});
