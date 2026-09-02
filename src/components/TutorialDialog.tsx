import { driver, type DriveStep } from "driver.js";
import { useLang } from "@/i18n";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export function TutorialDialog({ className = "", onOpenOnboarding }: { className?: string; onOpenOnboarding?: () => void }) {
  const { t, lang } = useLang();

  const startTour = () => {
    const steps: DriveStep[] = [];
    const addVisibleStep = (selector: string, popover: NonNullable<DriveStep["popover"]>) => {
      const element = document.querySelector<HTMLElement>(selector);
      if (!element || element.getClientRects().length === 0) return;
      steps.push({ element, popover });
    };

    addVisibleStep('[data-tour="header-title"]', {
      title: t("classLine"), description: t("chapterLine"), side: "bottom", align: "start",
    });
    addVisibleStep('[data-tour="navigation"]', {
      title: lang === "bn" ? "নেভিগেশন" : "Navigation",
      description: lang === "bn" ? "সিমুলেটর, বিল্ডার, প্র্যাকটিস এবং শেখার প্যানেলের মধ্যে পরিবর্তন করুন।" : "Switch between the Simulator, Builder, Practice, and Learning panels.",
      side: "bottom", align: "center",
    });
    addVisibleStep('[data-tour="expression-editor"]', {
      title: t("step1t"), description: t("step1d"), side: "right", align: "start",
    });
    addVisibleStep('[data-tour="generate-button"]', {
      title: t("step3t"), description: t("step3d"), side: "right", align: "center",
    });
    addVisibleStep('[data-tour="input-controls"]', {
      title: t("step2t"), description: t("step2d"), side: "right", align: "start",
    });
    addVisibleStep('[data-tour="simulator-canvas"]', {
      title: t("circuitCanvas"),
      description: lang === "bn" ? "এখানে সার্কিটটি দেখা যাবে এবং ইনপুট পরিবর্তন করলে সিগন্যালের অবস্থা বোঝা যাবে।" : "Your circuit appears here and updates as you change its inputs.",
      side: "left", align: "center",
    });
    addVisibleStep('[data-tour="builder-palette"]', {
      title: lang === "bn" ? "কম্পোনেন্ট" : "Components",
      description: lang === "bn" ? "এখান থেকে প্রয়োজনীয় গেট, ইনপুট এবং আউটপুট বেছে নিন।" : "Choose the gates, inputs, and outputs you need from here.",
      side: "bottom", align: "start",
    });
    addVisibleStep('[data-tour="builder-canvas"]', {
      title: lang === "bn" ? "সার্কিট ক্যানভাস" : "Circuit canvas",
      description: lang === "bn" ? "এখানে কম্পোনেন্ট বসিয়ে তাদের handle ব্যবহার করে সংযোগ করুন।" : "Place components here and connect them using their handles.",
      side: "top", align: "center",
    });
    addVisibleStep('[data-tour="learn-panel"]', {
      title: lang === "bn" ? "শেখার প্যানেল" : "Learning resources",
      description: lang === "bn" ? "এখানে Boolean সূত্র ও logic gate সম্পর্কে বিস্তারিত পাওয়া যাবে।" : "Explore Boolean laws, gate rules, and explanations here.",
      side: "top", align: "center",
    });

    driver({
      showProgress: true,
      smoothScroll: true,
      allowClose: true,
      overlayClickBehavior: "close",
      nextBtnText: lang === "bn" ? "পরবর্তী" : "Next",
      prevBtnText: lang === "bn" ? "পূর্ববর্তী" : "Previous",
      doneBtnText: lang === "bn" ? "শেষ" : "Done",
      steps,
    }).drive();
  };

  return (
    <Button size="sm" variant="outline" className={`gap-1 ${className}`} onClick={onOpenOnboarding ?? startTour} aria-label={t("tutorial")} title={t("tutorial")}>
      <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> {t("tutorial")}
    </Button>
  );
}
