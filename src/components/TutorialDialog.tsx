import { driver } from "driver.js";
import { useLang } from "@/i18n";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export function TutorialDialog() {
  const { t, lang } = useLang();

  const startTour = () => {
    const d = driver({
      showProgress: true,
      nextBtnText: lang === 'bn' ? 'পরবর্তী' : 'Next',
      prevBtnText: lang === 'bn' ? 'পূর্ববর্তী' : 'Previous',
      doneBtnText: lang === 'bn' ? 'শেষ' : 'Done',
      steps: [
        {
          element: '.flex.items-center.gap-2',
          popover: {
            title: t("classLine"),
            description: t("chapterLine"),
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: 'nav.flex',
          popover: {
            title: lang === 'bn' ? 'নেভিগেশন' : 'Navigation',
            description: lang === 'bn' ? 'সিমুলেটর, বিল্ডার এবং লার্নিং প্যানেলের মধ্যে পরিবর্তন করুন।' : 'Switch between the Simulator, Builder, and Learning panels.',
            side: "bottom",
            align: 'center'
          }
        },
        {
          element: 'textarea#expr',
          popover: {
            title: t("step1t"),
            description: t("step1d"),
            side: "right",
            align: 'start'
          }
        },
        {
          element: '.inputs-panel-container',
          popover: {
            title: t("step2t"),
            description: t("step2d"),
            side: "right",
            align: 'start'
          }
        },
        {
          element: 'button.bg-destructive',
          popover: {
            title: t("step3t"),
            description: t("step3d"),
            side: "top",
            align: 'center'
          }
        },
        {
          element: '.calculation-panel-container',
          popover: {
            title: t("step4t"),
            description: t("step4d"),
            side: "right",
            align: 'start'
          }
        },
        {
          element: '.min-h-\\[280px\\]',
          popover: {
            title: t("circuitCanvas"),
            description: lang === 'bn' ? 'এখানে আপনার সার্কিটটি দেখা যাবে। সিগন্যাল অনুসরণ করতে তারের ওপর মাউস রাখুন।' : 'This is where your circuit is visualized. Hover over wires to trace signals.',
            side: "left",
            align: 'center'
          }
        },
        {
          element: '.truth-table-tabs',
          popover: {
            title: t("step5t"),
            description: t("step5d"),
            side: "top",
            align: 'center'
          }
        }
      ]
    });

    d.drive();
  };

  return (
    <Button size="sm" variant="outline" className="gap-1" onClick={startTour}>
      <GraduationCap className="h-4 w-4" /> {t("tutorial")}
    </Button>
  );
}
