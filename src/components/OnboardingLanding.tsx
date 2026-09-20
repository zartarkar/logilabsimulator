import { useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CircuitBoard,
  Gauge,
  GraduationCap,
  Languages,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n";
import { IntroLearning } from "@/components/IntroLearning";

export type Familiarity = "new" | "some" | "confident";

function CircuitPreview({ bn }: { bn: boolean }) {
  const [inputs, setInputs] = useState([1, 0]);
  const output = inputs[0]! & inputs[1]!;
  return (
    <div className="rounded-xl border border-emerald-200 bg-white/90 p-4">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-emerald-800">
          {bn ? "একবার চালিয়ে দেখো" : "Give it a try"}
        </span>
        <span className="font-mono text-muted-foreground">F = A · B</span>
      </div>
      <div className="my-4 flex items-center justify-center gap-3">
        <div className="space-y-2">
          {inputs.map((value, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={value === 1}
              aria-label={`${i === 0 ? "A" : "B"} = ${value}`}
              onClick={() => setInputs((previous) => previous.map((v, j) => (i === j ? 1 - v : v)))}
              className={`block min-h-10 w-16 rounded-lg border font-mono text-sm font-bold transition-colors ${value ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600"}`}
            >
              {i === 0 ? "A" : "B"} = {value}
            </button>
          ))}
        </div>
        <svg aria-hidden="true" viewBox="0 0 135 90" className="h-24 min-w-0 max-w-32 flex-1">
          <path
            d="M0 22H32V32H46 M0 68H32V58H46 M96 45H124"
            fill="none"
            stroke="#059669"
            strokeWidth="2"
          />
          <path
            d="M46 20H70A25 25 0 0 1 70 70H46Z"
            fill="#ecfdf5"
            stroke="#059669"
            strokeWidth="2"
          />
          <text x="67" y="49" textAnchor="middle" fontSize="12" fill="#065f46">
            AND
          </text>
          <circle cx="125" cy="45" r="8" fill={output ? "#10b981" : "#cbd5e1"} />
        </svg>
        <output aria-live="polite" className="font-mono text-sm font-bold text-emerald-800">
          F={output}
        </output>
      </div>
      <p className="text-center text-xs leading-5 text-muted-foreground">
        {bn
          ? "A ও B চাপো। দুটিই 1 হলে বাতি জ্বলবে।"
          : "Tap A and B. Both must be 1 to light the LED."}
      </p>
    </div>
  );
}

export function OnboardingLanding({
  onEnter,
}: {
  onEnter: (destination: "simulator", familiarity: Familiarity, startGuide?: boolean) => void;
}) {
  const { lang, setLang } = useLang();
  const bn = lang === "bn";
  const [choice, setChoice] = useState<Familiarity | null>(null);
  const [showIntroVideo, setShowIntroVideo] = useState(true);
  const [showLessons, setShowLessons] = useState(true);
  const [suggestion, setSuggestion] = useState<Familiarity | null>(null);

  if (showLessons)
    return (
      <IntroLearning
        onComplete={(result) => {
          setSuggestion(result);
          setChoice(result);
          setShowLessons(false);
        }}
      />
    );

  const paths = [
    {
      id: "new" as const,
      icon: GraduationCap,
      title: bn ? "একদম নতুন" : "New to the topic",
      text: bn ? "মূল বিষয় থেকে শুরু করি" : "Begin with the foundations",
    },
    {
      id: "some" as const,
      icon: Gauge,
      title: bn ? "কিছুটা পরিচিত" : "Somewhat familiar",
      text: bn ? "মূল concept ঝালিয়ে নিই" : "Review the core concepts",
    },
    {
      id: "confident" as const,
      icon: Rocket,
      title: bn ? "ভালোভাবে পরিচিত" : "Confident",
      text: bn ? "সরাসরি simulation এ যাই" : "Go directly to simulation",
    },
  ];

  return (
    <main className="relative min-h-dvh overflow-x-hidden overflow-y-auto bg-[#f7f8fa] text-foreground">
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-destructive/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-1/3 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-destructive/5 blur-3xl" />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between rounded-xl border border-white/80 bg-white/75 px-4 py-3 shadow-[0_10px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl">
          <div className="flex items-center gap-3 font-display text-lg font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground shadow-md shadow-destructive/20">
              <CircuitBoard className="h-4 w-4" />
            </span>
            LogicLab
            <span className="hidden border-l border-border pl-3 text-xs font-medium text-muted-foreground sm:inline">
              {bn ? "একাদশ ও দ্বাদশ শ্রেণি · অধ্যায় ৩" : "Class 11 to 12 · Chapter 3"}
            </span>
          </div>
          <div className="flex items-center overflow-hidden rounded-lg border border-border/80 bg-white/80 shadow-sm">
            <Languages className="ml-2 h-4 w-4 text-muted-foreground" />
            {(["en", "bn"] as const).map((item) => (
              <button
                key={item}
                onClick={() => setLang(item)}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${lang === item ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-muted"}`}
                aria-pressed={lang === item}
              >
                {item === "en" ? "EN" : "বাংলা"}
              </button>
            ))}
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-4xl flex-1 content-start gap-7 py-6 sm:py-10">
          <section
            className="rounded-2xl border border-white/90 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.11)] backdrop-blur-xl sm:p-7"
            aria-labelledby="path-title"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-destructive">
              {choice && choice !== "new"
                ? bn
                  ? "তোমার পরবর্তী ধাপ"
                  : "Your next step"
                : bn
                  ? "শুরু করার আগে"
                  : "Before you begin"}
            </p>
            <h1
              id="path-title"
              className="mt-3 max-w-3xl text-2xl font-bold leading-snug sm:text-4xl"
            >
              {choice === "some"
                ? bn
                  ? "চেনা ধারণা, এবার হাতে কলমে"
                  : "Put familiar ideas into practice"
                : choice === "confident"
                  ? bn
                    ? "এবার তোমার যুক্তিতে সার্কিট বানাও"
                    : "Turn your logic into a circuit"
                  : bn
                    ? "Boolean expression ও logic gate সম্পর্কে তোমার ধারণা কেমন?"
                    : "How familiar are you with Boolean expressions and logic gates?"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {choice && choice !== "new"
                ? bn
                  ? "রাশি লিখো, সার্কিট দেখো, ইনপুট বদলে ফল মেলাও।"
                  : "Write an expression, see its circuit and test the inputs."
                : bn
                  ? "তোমার উত্তরের ভিত্তিতে উপযুক্ত জায়গা থেকে শুরু করব।"
                  : "We’ll take you to the most suitable starting point."}
            </p>

            {suggestion && (
              <p className="my-4 flex items-center gap-2 text-xs text-emerald-800">
                <Gauge className="h-4 w-4 shrink-0" />
                {bn
                  ? `অনুশীলনের পরামর্শ: ${paths.find((path) => path.id === suggestion)?.title}। চাইলে পথ বদলাতে পারো।`
                  : `Suggested from your practice: ${paths.find((path) => path.id === suggestion)?.title}. You can change your path.`}
              </p>
            )}
            <button
              className="mb-4 text-sm font-medium text-destructive underline underline-offset-4"
              onClick={() => setShowLessons(true)}
            >
              {bn ? "ছোট পাঠ ও অনুশীলন আবার করি" : "Try the guided lessons again"}
            </button>

            {!choice ? (
              <div className="mt-6 grid gap-3">
                {paths.map(({ id, icon: Icon, title, text }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setChoice(id)}
                    className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 border-border bg-white px-4 py-3.5 text-left shadow-sm transition hover:border-destructive/55 hover:bg-destructive/[0.035] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-destructive/15 bg-destructive/10 text-destructive transition group-hover:bg-destructive group-hover:text-destructive-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm font-semibold">{title}</strong>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{text}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-destructive">
                      <span className="hidden sm:inline">{bn ? "বেছে নাও" : "Select"}</span>
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive/10 text-sm transition group-hover:bg-destructive group-hover:text-destructive-foreground"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : choice === "new" ? (
              <div className="mt-5 space-y-5">
                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                  <div className="px-4 py-3">
                    <h3 className="text-sm font-semibold">
                      {bn
                        ? "চাইলে আগে সংক্ষিপ্ত পরিচিতিটি দেখে নাও"
                        : "Watch a short introduction if you would like"}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {bn
                        ? "ভিডিওটিতে লজিক গেট, AND, OR, NOT এবং সত্যক সারণির প্রাথমিক ধারণা দেওয়া হয়েছে।"
                        : "This video introduces logic gates, AND, OR, NOT, and truth tables."}
                    </p>
                  </div>
                  {showIntroVideo ? (
                    <>
                      <div className="aspect-video overflow-hidden border-y border-border bg-black">
                        <iframe
                          className="h-full w-full"
                          src="https://www.youtube-nocookie.com/embed/j0K2GilD06A"
                          title="Boolean expressions and logic gates introduction"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowIntroVideo(false)}
                        className="w-full px-4 py-3 text-center text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {bn ? "ভিডিওটি পরে দেখব" : "I will watch the video later"}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowIntroVideo(true)}
                      className="w-full border-t border-border px-4 py-3 text-center text-xs font-semibold text-destructive hover:bg-destructive/[0.04]"
                    >
                      {bn ? "ভিডিওটি এখন দেখো" : "Watch the video now"}
                    </button>
                  )}
                </div>

                <div className="rounded-xl border-2 border-destructive/20 bg-destructive/[0.04] p-4 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-destructive">
                      {bn ? "পরবর্তী ধাপ" : "Next step"}
                    </p>
                    <h3 className="mt-1 text-sm font-bold">
                      {bn ? "রাশি থেকে সার্কিট তৈরি করি" : "Turn an expression into a circuit"}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {bn
                        ? "সিমুলেটরে রাশি লিখে গেট ও আউটপুট পরীক্ষা করো।"
                        : "Enter an expression in the simulator and explore its gates and output."}
                    </p>
                  </div>
                  <Button
                    className="mt-3 w-full shrink-0 sm:mt-0 sm:w-auto"
                    variant="destructive"
                    onClick={() => onEnter("simulator", "new")}
                  >
                    <BookOpenCheck className="mr-2 h-4 w-4" />
                    {bn ? "সিমুলেটরে যাই" : "Open simulator"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-3 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50">
                <div className="grid items-center gap-5 p-4 sm:grid-cols-2 sm:p-6">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      <CircuitBoard className="h-3.5 w-3.5" />
                      {bn ? "এক্সপ্রেশন সিমুলেটর" : "Expression Simulator"}
                    </span>
                    <h2 className="mt-4 text-xl font-bold leading-snug">
                      {bn ? "একটি রাশি থেকে শুরু করো" : "Start with an expression"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {choice === "some"
                        ? bn
                          ? "AND দিয়ে শুরু করো। তারপর নিজের রাশিতে গেটের কাজ মিলিয়ে নাও।"
                          : "Start with AND, then explore how gates work in your own expression."
                        : bn
                          ? "নিজের রাশি পরীক্ষা করো। এরপর বিল্ডারে গিয়ে চ্যালেঞ্জ সমাধান করো।"
                          : "Test your own expression, then try a challenge in the builder."}
                    </p>
                    <Button
                      variant="destructive"
                      className="mt-5 gap-2"
                      onClick={() => onEnter("simulator", choice)}
                    >
                      {bn ? "সিমুলেটরে শুরু করি" : "Open simulator"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <CircuitPreview bn={bn} />
                </div>
                <ol className="grid grid-cols-3 divide-x divide-emerald-200 border-t border-emerald-200 bg-white/70 text-center">
                  {(bn
                    ? ["রাশি লিখো", "সার্কিট দেখো", "ফল যাচাই করো"]
                    : ["Write", "Build", "Test"]
                  ).map((label, i) => (
                    <li key={label} className="px-2 py-3 text-xs font-semibold">
                      <span className="mr-1.5 font-mono text-emerald-600">0{i + 1}</span>
                      {label}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {choice && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 self-start"
                onClick={() => setChoice(null)}
              >
                {bn ? "উত্তর পরিবর্তন করি" : "Change answer"}
              </Button>
            )}
            <div className="mt-6 border-t border-border pt-5 text-center">
              <Button
                type="button"
                variant="outline"
                className="w-full border-destructive/25 bg-white text-xs text-foreground hover:border-destructive/60 hover:bg-destructive/[0.04] hover:text-destructive"
                onClick={() => onEnter("simulator", "confident", false)}
              >
                {bn
                  ? "আগে ব্যবহার করেছি, সরাসরি অ্যাপে যাই"
                  : "Used LogicLab before? Go directly to the app"}
              </Button>
            </div>
          </section>
        </div>

        <footer className="border-t border-border py-4 text-xs text-muted-foreground">
          {bn
            ? "একাদশ ও দ্বাদশ শ্রেণি · সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস"
            : "Class 11 to 12 · Number Systems and Digital Devices"}
        </footer>
      </div>
    </main>
  );
}
