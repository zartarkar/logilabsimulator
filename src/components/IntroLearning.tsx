import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CircuitBoard,
  Languages,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LessonVisual } from "@/components/LessonVisual";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLang } from "@/i18n";
import {
  INTRO_LESSONS,
  QUESTION_COUNTS,
  questionOffset,
  checkIntroAnswer,
  makeIntroQuestion,
  suggestFamiliarity,
  type Familiarity,
} from "@/logic/introLearning";

const TOTAL = questionOffset(INTRO_LESSONS.length);

export function IntroLearning({
  onComplete,
}: {
  onComplete: (result: Familiarity | null) => void;
}) {
  const { lang, setLang } = useLang();
  const bn = lang === "bn";
  const [overview, setOverview] = useState(true);
  const [lesson, setLesson] = useState(0);
  const [activePhase, setPhase] = useState<"lesson" | "question" | "result">("lesson");
  const [preview, setPreview] = useState<number | null>(null);
  const phase = preview !== null ? "lesson" : activePhase;
  const displayLesson = preview ?? lesson;
  const [question, setQuestion] = useState(() => makeIntroQuestion(0, false));
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const current = INTRO_LESSONS[displayLesson]!;
  const score = answers.filter(Boolean).length;
  const result = suggestFamiliarity(score, TOTAL);
  const lessonCount = QUESTION_COUNTS[lesson]!;
  const answeredInLesson = answers.length - questionOffset(lesson);
  const completed = QUESTION_COUNTS.filter(
    (_, i) => answers.length >= questionOffset(i + 1),
  ).length;
  const labels = {
    new: bn ? "একদম নতুন" : "Fresh start",
    some: bn ? "কিছুটা পরিচিত" : "Somewhat familiar",
    confident: bn ? "ভালোভাবে পরিচিত" : "Well acquainted",
  };
  useEffect(() => {
    if (overview && preview === null) heading.current?.focus();
  }, [overview, preview]);

  function startQuestion() {
    if (preview !== null) {
      setPreview(null);
      setOverview(false);
      return;
    }
    setQuestion(makeIntroQuestion(lesson, false));
    setValue("");
    setSubmitted(false);
    setPhase("question");
  }
  function submit() {
    if (submitted || !value.trim()) return;
    setAnswers((previous) => [...previous, checkIntroAnswer(question, value)]);
    setSubmitted(true);
  }
  function next() {
    if (answeredInLesson < lessonCount) {
      // Cover each taught skill, using the previous answer to select a variant.
      setQuestion(
        makeIntroQuestion(lesson, answers[answers.length - 1]!, Math.random, answeredInLesson),
      );
      setValue("");
      setSubmitted(false);
    } else if (lesson === INTRO_LESSONS.length - 1) {
      setPhase("result");
    } else {
      setLesson(lesson + 1);
      setPhase("lesson");
      setValue("");
      setSubmitted(false);
    }
  }
  const title = bn ? "দেখে, বুঝে, নিজে করে শিখি" : "See it. Try it. Make it click.";
  const field = (table = false) => (
    <Input
      id="intro-answer"
      aria-label={bn ? "তোমার উত্তর" : "Your answer"}
      autoComplete="off"
      required
      pattern={table ? "[01০১]" : "[0-9০ ৯]+"}
      inputMode="numeric"
      value={value}
      disabled={submitted}
      onChange={(event) => setValue(event.target.value)}
      placeholder={table ? "0 / 1" : "0"}
      className={`bg-card font-mono text-lg ${table ? "mx-auto w-24 text-center" : "max-w-xs"}`}
    />
  );

  return (
    <div className="lesson-controls relative min-h-dvh overflow-x-hidden bg-[#f7f8fa] text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-destructive/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-96 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-3 font-display text-lg font-bold">
            <span className="rounded-lg bg-destructive p-2 text-destructive-foreground">
              <CircuitBoard className="h-4 w-4" />
            </span>
            LogicLab
            <span className="hidden border-l pl-3 text-xs font-medium text-muted-foreground sm:inline">
              {bn ? "একাদশ শ্রেণি · অধ্যায় ৩" : "Class 11 · Chapter 3"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            {(["en", "bn"] as const).map((item) => (
              <button
                key={item}
                aria-pressed={lang === item}
                onClick={() => setLang(item)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${lang === item ? "bg-destructive text-destructive-foreground" : "hover:bg-muted"}`}
              >
                {item === "en" ? "EN" : "বাংলা"}
              </button>
            ))}
          </div>
        </header>

        <main className="py-8 sm:py-12">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setOverview(true)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <BookOpenCheck className="h-4 w-4" />
              {bn ? "বিষয়ের পরিচিতি" : "Topic overview"}
            </button>
            <button
              onClick={() => onComplete(null)}
              className="text-xs text-muted-foreground underline underline-offset-4"
            >
              {bn ? "পরে শিখব, হোম পেজে যাই" : "Learn later, explore the app"}
            </button>
          </div>
          <div className="mb-8 max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-destructive">
              {bn ? "বুলিয়ান লজিক ও ডিজিটাল সার্কিট" : "Boolean logic & digital circuits"}
            </p>
            <h1
              ref={heading}
              tabIndex={-1}
              className="font-display text-3xl font-bold leading-tight tracking-tight outline-none sm:text-4xl"
            >
              {title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
              {bn
                ? "বুলিয়ান লজিকের চারটি বিষয় এক নজরে। পাঠে ক্লিক করে পপআপে ডায়াগ্রাম ও ইনপুট বদলে ধারণাটি বোঝো, তারপর অনুশীলন করো।"
                : "Four topics that bring Boolean logic to life. Open a lesson, play with its diagrams, then put your understanding into practice."}
            </p>
          </div>

          <>
            <div className="mb-7 grid gap-3 sm:grid-cols-3">
              {[
                [
                  bn ? "০১ · বিষয়ের পরিচিতি" : "01 · Explore the topic",
                  bn ? "পাঠ ও বিষয়বস্তু দেখে নাও" : "Browse the content and lessons",
                ],
                [
                  bn ? "০২ · শিখি ও চেষ্টা করি" : "02 · Learn and practise",
                  bn
                    ? "৪টি পাঠ · বিষয়ভিত্তিক ২০টি প্রশ্ন"
                    : "4 lessons · 20 lesson-based questions",
                ],
                [
                  bn ? "০৩ · নিজের পথে এগোই" : "03 · Find your starting point",
                  bn ? "উৎসাহ ও পরবর্তী ধাপের পরামর্শ" : "Encouragement and a suggested next step",
                ],
              ].map(([label, text]) => (
                <div key={label} className="rounded-xl border border-border/70 bg-white/70 p-4">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
            <div className="relative grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-2">
              {INTRO_LESSONS.map((item, i) => (
                <button
                  type="button"
                  onClick={() => {
                    if (i === lesson && activePhase !== "result") {
                      setOverview(false);
                    } else {
                      setPreview(i);
                    }
                  }}
                  key={i}
                  className="group rounded-2xl border border-white bg-white/85 p-5 text-left shadow-[0_10px_35px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transform-none sm:p-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-sm font-bold text-destructive">
                      {i < completed ? (
                        <Check className="h-4 w-4" aria-label={bn ? "সম্পন্ন" : "Completed"} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                    <h2 className="font-display text-lg font-semibold">{item.title[lang]}</h2>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{item.contents[lang]}</p>
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs leading-5 text-primary">
                    <ListChecks className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{item.practice[lang]}</span>
                  </div>
                  <div
                    aria-hidden="true"
                    className="my-5 flex h-20 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary/5 to-destructive/5 font-mono text-sm"
                  >
                    <span className="rounded-lg border border-primary/20 bg-card px-3 py-2 text-primary">
                      {["(A+B)′", "A B C", "AB+AB′", "NAND"][i]}
                    </span>
                    <ArrowRight className="h-4 w-4 text-primary/50 transition-transform group-hover:translate-x-1" />
                    <span className="rounded-lg bg-primary/10 px-3 py-2 text-primary">
                      {["A′B′", "F", "A", "XOR / XNOR"][i]}
                    </span>
                  </div>
                  <span className="flex items-center justify-between border-t pt-4 text-sm font-semibold text-destructive">
                    {bn ? "দেখে শিখি" : "Explore this lesson"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-white/85 p-5 sm:p-6">
              <div>
                <h2 className="font-semibold">
                  {bn ? "নিজের গতিতে শেখো" : "Learn at your own pace"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {bn
                    ? "সময়সীমা নেই। যেকোনো সময় পাঠে ফিরে আসতে পারো।"
                    : "No timer. Come back to the lessons whenever you need."}
                </p>
              </div>
              <Button variant="destructive" onClick={() => setOverview(false)}>
                {phase === "result"
                  ? bn
                    ? "ফলাফলে ফিরি"
                    : "Return to my result"
                  : answers.length
                    ? bn
                      ? "যেখানে ছিলাম, সেখান থেকে"
                      : "Continue learning"
                    : bn
                      ? "প্রথম পাঠ শুরু করি"
                      : "Start the first lesson"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
          <Dialog
            open={!overview || preview !== null}
            onOpenChange={(open) => {
              if (!open) {
                setOverview(true);
                setPreview(null);
              }
            }}
          >
            <DialogContent
              className="lesson-controls max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-4xl overflow-y-auto rounded-2xl border-white/80 bg-background p-5 shadow-2xl sm:rounded-2xl sm:p-8 motion-reduce:animate-none"
              onCloseAutoFocus={(event) => {
                event.preventDefault();
                heading.current?.focus();
              }}
            >
              <div className="pr-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-destructive">
                  LogicLab ·{" "}
                  {phase === "result"
                    ? bn
                      ? "তোমার শেখার পথ"
                      : "Your learning path"
                    : `${displayLesson + 1} / ${INTRO_LESSONS.length}`}
                </p>
                <DialogTitle className="font-display text-2xl font-bold leading-tight sm:text-3xl">
                  {phase === "result"
                    ? bn
                      ? "দারুণ, এগিয়ে চলি!"
                      : "Let’s keep you moving!"
                    : current.title[lang]}
                </DialogTitle>
                <DialogDescription className="mt-3 leading-6">
                  {phase === "result"
                    ? bn
                      ? "এই অনুশীলনের ভিত্তিতে পরামর্শ"
                      : "A suggestion based on your practice"
                    : current.contents[lang]}
                </DialogDescription>
              </div>
              <div className="flex gap-2" aria-label={bn ? "পাঠের অগ্রগতি" : "Lesson progress"}>
                {INTRO_LESSONS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${i < completed ? "bg-primary" : i === displayLesson ? "bg-destructive" : "bg-muted"}`}
                  />
                ))}
              </div>
              <section
                key={`${displayLesson}-${phase}-${phase === "question" ? Math.floor(answers.length - Number(submitted)) : 0}`}
                className="min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none"
              >
                {phase === "lesson" && (
                  <LessonVisual
                    key={displayLesson}
                    lesson={displayLesson}
                    bn={bn}
                    onPractice={startQuestion}
                    preview={preview !== null}
                  />
                )}
                {phase === "question" && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap justify-between gap-2 text-xs font-semibold text-destructive">
                      <span>{current.practice[lang]}</span>
                      <span>
                        {bn
                          ? `এই পাঠের প্রশ্ন ${submitted ? answeredInLesson : answeredInLesson + 1}/${lessonCount}`
                          : `Lesson question ${submitted ? answeredInLesson : answeredInLesson + 1} of ${lessonCount}`}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold leading-8">{question.prompt[lang]}</h2>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        submit();
                      }}
                      className="space-y-5"
                    >
                      {question.kind === "choice" ? (
                        <fieldset disabled={submitted} className="grid gap-3 sm:grid-cols-2">
                          <legend className="sr-only">
                            {bn ? "একটি উত্তর বেছে নাও" : "Choose one answer"}
                          </legend>
                          {question.options.map((option) => (
                            <label
                              key={option}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-4 text-sm transition ${value === option ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                            >
                              <input
                                type="radio"
                                name="intro-choice"
                                value={option}
                                checked={value === option}
                                onChange={() => setValue(option)}
                                className="accent-primary"
                              />
                              <span className="font-mono text-base">{option}</span>
                            </label>
                          ))}
                        </fieldset>
                      ) : question.kind === "table" && question.row ? (
                        <div className="overflow-x-auto rounded-xl border">
                          <table className="w-full text-center text-sm">
                            <caption className="p-3 text-left text-muted-foreground">
                              {bn ? "শেষ ঘরে আউটপুট লেখো।" : "Fill in the missing output."}
                            </caption>
                            <thead className="bg-muted/50">
                              <tr>
                                {["A", "B", question.row.gate].map((label) => (
                                  <th key={label} scope="col" className="p-3">
                                    {label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="p-4 font-mono">{question.row.a}</td>
                                <td className="p-4 font-mono">{question.row.b}</td>
                                <td className="p-4">{field(true)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div>
                          <label htmlFor="intro-answer" className="mb-2 block text-sm font-medium">
                            {bn ? "তোমার উত্তর" : "Your answer"}
                          </label>
                          {field()}
                        </div>
                      )}
                      {!submitted && (
                        <Button type="submit" variant="destructive" disabled={!value.trim()}>
                          {bn ? "উত্তর মিলিয়ে দেখি" : "Check my answer"}
                        </Button>
                      )}
                    </form>
                    {submitted && (
                      <div
                        role="status"
                        className="rounded-xl border border-primary/20 bg-primary/5 p-5"
                      >
                        <p className="font-semibold">
                          {checkIntroAnswer(question, value)
                            ? bn
                              ? "অভিনন্দন! 🎉"
                              : "Congratulations! 🎉"
                            : bn
                              ? "চেষ্টা করেছো, এবার নিয়মটা মিলিয়ে দেখি।"
                              : "Thanks for giving it a try. Let’s work through the rule."}
                        </p>
                        <p className="mt-2 text-sm leading-7">{question.explanation[lang]}</p>
                        {!checkIntroAnswer(question, value) && (
                          <p className="mt-2 text-sm font-semibold">
                            {bn ? "সঠিক উত্তর: " : "Correct answer: "}
                            {question.answer}
                          </p>
                        )}
                      </div>
                    )}
                    <Button variant="outline" onClick={() => setPreview(lesson)}>
                      <BookOpenCheck className="mr-2 h-4 w-4" />
                      {bn ? "ডায়াগ্রামে আবার দেখি" : "Revisit the visual lesson"}
                    </Button>
                    {submitted && (
                      <Button variant="destructive" onClick={next}>
                        {answers.length === TOTAL
                          ? bn
                            ? "আমার শেখার পথ দেখি"
                            : "Find my starting point"
                          : answeredInLesson === lessonCount
                            ? bn
                              ? "পরের পাঠে যাই"
                              : "Next lesson"
                            : bn
                              ? "পরবর্তী প্রশ্ন"
                              : "Next question"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                {phase === "result" && (
                  <div className="space-y-6">
                    <Sparkles className="h-9 w-9 text-destructive" />
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase text-destructive">
                        {bn ? "তোমার জন্য পরামর্শ" : "Suggested for you"}
                      </p>
                      <h2 className="font-display text-3xl font-bold">{labels[result]}</h2>
                    </div>
                    <p className="leading-7">
                      {result === "new"
                        ? bn
                          ? "দারুণ শুরু করেছো। ভিত্তি থেকে এগোলে প্রতিটি ধারণা আরও পরিষ্কার হবে।"
                          : "You’ve made a start. Build from the foundations and give each idea time to click."
                        : result === "some"
                          ? bn
                            ? "ধারণাগুলো তৈরি হচ্ছে! একটু ঝালিয়ে নিয়ে আরও অনুশীলন করো।"
                            : "Your understanding is taking shape! Review the core ideas and keep practising."
                          : bn
                            ? "পাঠগুলো ভালো বুঝেছো! এবার সার্কিটে প্রয়োগ করে দেখো।"
                            : "You’ve understood these lessons well! Put the ideas to work in a circuit."}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bn
                        ? `${TOTAL}টি প্রশ্নের মধ্যে ${score}টি সঠিক।`
                        : `${score} of ${TOTAL} answers correct.`}
                    </p>
                    <div className="divide-y rounded-xl border px-4">
                      {INTRO_LESSONS.map((item, i) => {
                        const count = answers
                          .slice(questionOffset(i), questionOffset(i + 1))
                          .filter(Boolean).length;
                        return (
                          <div
                            key={i}
                            className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                          >
                            <span>{item.title[lang]}</span>
                            <span className="text-xs text-muted-foreground">
                              {count}/{QUESTION_COUNTS[i]} ·{" "}
                              {count === QUESTION_COUNTS[i]
                                ? bn
                                  ? "সুন্দরভাবে বুঝেছো"
                                  : "Looking good"
                                : bn
                                  ? "আরেকটু চর্চা করি"
                                  : "Keep practising"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs leading-6 text-muted-foreground">
                      {bn
                        ? "এটি এই ছোট অনুশীলনের ভিত্তিতে শুরুর পরামর্শ। পরের পাতায় নিজের পছন্দের পথ বেছে নিতে পারো।"
                        : "This short practice suggests a starting point. You can choose a different path on the next page."}
                    </p>
                    <Button variant="destructive" onClick={() => onComplete(result)}>
                      {bn ? "হোম পেজে এগিয়ে যাই" : "Continue to the home page"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </section>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  setPreview(null);
                  setOverview(true);
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {bn ? "সব বিষয় দেখি" : "Back to the topic map"}
              </Button>
            </DialogContent>
          </Dialog>
        </main>
        <footer className="border-t py-4 text-xs text-muted-foreground">
          {bn
            ? "LogicLab · বুঝে শিখি, নিজে করে দেখি"
            : "LogicLab · Understand it. Try it. Build it."}
        </footer>
      </div>
    </div>
  );
}
