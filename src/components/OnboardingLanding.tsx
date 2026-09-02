import { useState } from "react";
import {
  BookOpenCheck,
  CircuitBoard,
  Code2,
  Gauge,
  GraduationCap,
  Languages,
  PlayCircle,
  Rocket,
  Route,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n";

export type Familiarity = "new" | "some" | "confident";

export function OnboardingLanding({
  onEnter,
}: {
  onEnter: (destination: "learn" | "simulator", familiarity: Familiarity) => void;
}) {
  const { lang, setLang } = useLang();
  const bn = lang === "bn";
  const [choice, setChoice] = useState<Familiarity | null>(null);

  const features = [
    {
      icon: BookOpenCheck,
      title: bn ? "Concept বুঝি" : "Understand concepts",
      text: bn ? "Boolean value, logic gate ও প্রয়োজনীয় সূত্র সহজভাবে বোঝো।" : "Understand Boolean values, logic gates, and essential laws in plain language.",
    },
    {
      icon: Code2,
      title: bn ? "Expression পরীক্ষা করি" : "Test expressions",
      text: bn ? "Expression থেকে circuit, truth table ও live output দেখো।" : "Turn expressions into circuits, truth tables, and live outputs.",
    },
    {
      icon: Wrench,
      title: bn ? "নিজে circuit বানাই" : "Build circuits",
      text: bn ? "Gate বসাও, wire সংযোগ করো এবং input বদলে ফল দেখো।" : "Place gates, connect wires, and test the result by changing inputs.",
    },
    {
      icon: Route,
      title: bn ? "Challenge সমাধান করি" : "Solve challenges",
      text: bn ? "সহজ guided practice থেকে কঠিন circuit challenge পর্যন্ত এগিয়ে যাও।" : "Progress from guided beginner practice to harder circuit challenges.",
    },
  ];

  const paths = [
    { id: "new" as const, icon: GraduationCap, title: bn ? "একদম নতুন" : "New to the topic", text: bn ? "মূল বিষয় থেকে শুরু করি" : "Begin with the foundations" },
    { id: "some" as const, icon: Gauge, title: bn ? "কিছুটা পরিচিত" : "Somewhat familiar", text: bn ? "মূল concept ঝালিয়ে নিই" : "Review the core concepts" },
    { id: "confident" as const, icon: Rocket, title: bn ? "ভালোভাবে পরিচিত" : "Confident", text: bn ? "সরাসরি simulation-এ যাই" : "Go directly to simulation" },
  ];

  return (
    <main className="relative min-h-dvh overflow-x-hidden overflow-y-auto bg-[#f7f8fa] text-foreground">
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-destructive/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-1/3 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-destructive/5 blur-3xl" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between rounded-xl border border-white/80 bg-white/75 px-4 py-3 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <div className="flex items-center gap-3 font-display text-lg font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground shadow-md shadow-destructive/20"><CircuitBoard className="h-4 w-4" /></span>
            LogicLab
            <span className="hidden border-l border-border pl-3 text-xs font-medium text-muted-foreground sm:inline">{bn ? "একাদশ শ্রেণি · অধ্যায় ৩" : "Class 11 · Chapter 3"}</span>
          </div>
          <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-white/80 shadow-sm">
            <Languages className="ml-2 h-4 w-4 text-muted-foreground" />
            {(["en", "bn"] as const).map((item) => (
              <button key={item} onClick={() => setLang(item)} className={`px-3 py-1.5 text-xs font-semibold transition-colors ${lang === item ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-muted"}`} aria-pressed={lang === item}>
                {item === "en" ? "EN" : "বাংলা"}
              </button>
            ))}
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-5xl flex-1 gap-7 py-10 lg:py-12">
          <section className="rounded-2xl border border-white/80 bg-white/55 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)] backdrop-blur-md sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-destructive">{bn ? "Interactive digital logic learning" : "Interactive digital logic learning"}</p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.12] tracking-[-0.035em] sm:text-5xl lg:text-[3.1rem]">
              {bn ? "Boolean logic বুঝো এবং circuit তৈরি করো" : "Understand Boolean logic and build circuits"}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              {bn ? "একাদশ শ্রেণির Boolean expression ও digital logic শেখার জন্য ব্যাখ্যা, live simulation এবং hands-on practice একই জায়গায়।" : "Explanations, live simulation, and hands-on practice for learning Class 11 Boolean expressions and digital logic in one place."}
            </p>

            <div className="mt-9 grid gap-3 sm:auto-rows-fr sm:grid-cols-2 lg:grid-cols-4" aria-label={bn ? "অ্যাপের সুবিধা" : "App features"}>
              {features.map(({ icon: Icon, title, text }) => (
                <article key={title} className="flex h-full gap-3 rounded-xl border border-border/60 bg-white/65 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive"><Icon className="h-5 w-5" /></span>
                  <div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/90 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.11)] backdrop-blur-xl sm:p-7" aria-labelledby="path-title">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-destructive">{bn ? "শুরু করার আগে" : "Before you begin"}</p>
            <h2 id="path-title" className="mt-2 text-xl font-bold leading-snug">{bn ? "Boolean expression ও logic gate সম্পর্কে তোমার ধারণা কেমন?" : "How familiar are you with Boolean expressions and logic gates?"}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{bn ? "তোমার উত্তরের ভিত্তিতে উপযুক্ত জায়গা থেকে শুরু করব।" : "We’ll take you to the most suitable starting point."}</p>

            {!choice ? (
              <div className="mt-6 grid gap-3">
                {paths.map(({ id, icon: Icon, title, text }) => (
                  <button key={id} type="button" onClick={() => setChoice(id)} className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 border-border bg-white px-4 py-3.5 text-left shadow-sm transition hover:border-destructive/55 hover:bg-destructive/[0.035] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-destructive/15 bg-destructive/10 text-destructive transition group-hover:bg-destructive group-hover:text-destructive-foreground"><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1"><strong className="block text-sm font-semibold">{title}</strong><span className="mt-0.5 block text-xs text-muted-foreground">{text}</span></span>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-destructive"><span className="hidden sm:inline">{bn ? "বেছে নাও" : "Select"}</span><span className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-sm transition group-hover:bg-destructive group-hover:text-destructive-foreground" aria-hidden="true">→</span></span>
                  </button>
                ))}
              </div>
            ) : choice === "new" ? (
              <div className="mt-5">
                <div className="aspect-video overflow-hidden border border-border bg-black">
                  <iframe className="h-full w-full" src="https://www.youtube-nocookie.com/embed/j0K2GilD06A" title="Boolean expressions and logic gates introduction" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                </div>
                <h3 className="mt-4 text-sm font-semibold">{bn ? "শুরু করার আগে সংক্ষিপ্ত পরিচিতিটি দেখে নাও" : "Watch this short introduction before starting"}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{bn ? "Logic gate, AND, OR, NOT এবং truth table এর ভিত্তি ১০ মিনিটের মধ্যে।" : "The basics of logic gates, AND, OR, NOT, and truth tables in under ten minutes."}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Button variant="outline" onClick={() => onEnter("learn", "new")}>{bn ? "পরে দেখব" : "Watch later"}</Button>
                  <Button variant="destructive" onClick={() => onEnter("learn", "new")}><PlayCircle className="mr-2 h-4 w-4" />{bn ? "এবার শুরু করি" : "Continue"}</Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-destructive/15 bg-destructive/[0.04] p-5 shadow-sm">
                <h3 className="text-base font-semibold">{choice === "some" ? (bn ? "মূল conceptগুলো দ্রুত ঝালিয়ে নিই" : "Review the core concepts first") : (bn ? "তোমার শেখার journey শুরু করো" : "Start your learning journey")}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{choice === "some" ? (bn ? "তোমাকে Concept বুঝি section-এ নিয়ে যাওয়া হবে।" : "You’ll begin in the concept overview.") : (bn ? "তোমাকে সরাসরি Expression Simulator-এ নিয়ে যাওয়া হবে।" : "You’ll go directly to the Expression Simulator.")}</p>
                <Button variant="destructive" className="mt-4" onClick={() => onEnter(choice === "some" ? "learn" : "simulator", choice)}>{bn ? "Journey শুরু করি" : "Start journey"}</Button>
              </div>
            )}

            {choice && <Button type="button" variant="outline" size="sm" className="mt-4 self-start" onClick={() => setChoice(null)}>{bn ? "উত্তর পরিবর্তন করি" : "Change answer"}</Button>}
            <div className="mt-6 border-t border-border pt-5 text-center">
              <Button type="button" variant="outline" className="w-full border-destructive/25 bg-white text-xs text-foreground hover:border-destructive/60 hover:bg-destructive/[0.04] hover:text-destructive" onClick={() => onEnter("simulator", "confident")}>{bn ? "আগে ব্যবহার করেছি, সরাসরি অ্যাপে যাই" : "Used LogicLab before? Go directly to the app"}</Button>
            </div>
          </section>
        </div>

        <footer className="border-t border-border py-4 text-xs text-muted-foreground">{bn ? "একাদশ শ্রেণি · সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস" : "Class 11 · Number Systems and Digital Devices"}</footer>
      </div>
    </main>
  );
}
