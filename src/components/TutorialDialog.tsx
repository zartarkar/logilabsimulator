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
        // --- 1. Common Header ---
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
        // --- 2. Expression Simulator (if active) ---
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
          element: 'button.bg-destructive, .button-red',
          popover: {
            title: t("step3t"),
            description: t("step3d"),
            side: "top",
            align: 'center'
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
        // --- 3. Build Your Own Circuit (if active) ---
        {
          element: '.sandbox-components-header',
          popover: {
            title: lang === 'bn' ? 'বিল্ডার প্যানেল' : 'Builder Palette',
            description: lang === 'bn' ? 'এখানে আপনার নিজের সার্কিট তৈরি করতে গেট এবং কম্পোনেন্ট সিলেক্ট করুন।' : 'Select gates and components here to build your own custom circuit.',
            side: "right",
            align: 'start'
          }
        },
        {
          element: '.react-flow',
          popover: {
            title: lang === 'bn' ? 'ক্যানভাস' : 'Canvas',
            description: lang === 'bn' ? 'গেটগুলো ড্র্যাগ করুন এবং তার দিয়ে কানেক্ট করুন।' : 'Drag gates around and connect them by their handles with wires.',
            side: "bottom",
            align: 'center'
          }
        },
        // --- 4. Learn (if active) ---
        {
          element: '.learn-panel-container',
          popover: {
            title: lang === 'bn' ? 'শেখার প্যানেল' : 'Learning Resources',
            description: lang === 'bn' ? 'এখানে আপনি বুলিয়ান সূত্র এবং লজিক গেট সম্পর্কে বিস্তারিত জানতে পারবেন।' : 'Explore Boolean laws, gate rules, and key pointers here.',
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
