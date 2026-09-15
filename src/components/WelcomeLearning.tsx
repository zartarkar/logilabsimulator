import { ArrowRight, BookOpen, CircuitBoard, Layers3, Sigma } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const topics = [
  {
    icon: Sigma,
    bn: "বুলিয়ান অ্যালজেবরা",
    en: "Boolean algebra",
    detailBn: "পরিচিতি, সূত্র ও ডি মর্গ্যান",
    detailEn: "The basics, laws and De Morgan",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Layers3,
    bn: "রাশি সরলীকরণ",
    en: "Simplification",
    detailBn: "উদাহরণে সূত্রের ব্যবহার দেখো",
    detailEn: "See the laws in worked examples",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: CircuitBoard,
    bn: "লজিক গেট",
    en: "Logic gates",
    detailBn: "চার বিভাগে গেটের চিত্র দেখো",
    detailEn: "Explore gates in four families",
    color: "bg-emerald-50 text-emerald-700",
  },
];

export function WelcomeLearning({
  open,
  onClose,
  onExplore,
  bn,
}: {
  open: boolean;
  onClose: () => void;
  onExplore: (lesson: number) => void;
  bn: boolean;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <DialogContent
        data-testid="learning-welcome"
        className="lesson-controls w-[calc(100%-1.5rem)] max-w-3xl max-h-[92dvh] overflow-y-auto rounded-3xl border-white bg-white p-0 gap-0 shadow-2xl sm:rounded-3xl motion-reduce:animate-none"
      >
        <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-rose-50 via-white to-emerald-50 px-6 pb-7 pt-8 sm:px-9">
          <div className="mb-6 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive text-white">
              <CircuitBoard className="h-4 w-4" />
            </span>{" "}
            LOGICLAB{" "}
            <span className="ml-2 border-l pl-3">
              {bn ? "তোমার শেখার সঙ্গী" : "Your learning companion"}
            </span>
          </div>
          <div className="grid items-center gap-5 sm:grid-cols-[1fr_160px]">
            <div>
              <DialogTitle className="text-3xl font-bold leading-[1.4] tracking-tight text-slate-900 sm:text-4xl">
                {bn ? "স্বাগতম, যুক্তির জগতে!" : "Welcome to a world of logic!"}
              </DialogTitle>
              <DialogDescription className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
                {bn
                  ? "ছোট ছোট পাঠে ধারণা বুঝে নাও, চিত্রে পরীক্ষা করো, তারপর সহজ প্রশ্নে নিজেকে যাচাই করো। নিজের গতিতেই এগিয়ে চলো।"
                  : "Learn in small lessons, explore ideas through diagrams, then try a few questions. Make progress at your own pace."}
              </DialogDescription>
            </div>
            <svg viewBox="0 0 180 150" aria-hidden="true" className="hidden w-full sm:block">
              <path
                d="M28 43H66V62H88 M28 110H66V90H88 M139 76H164"
                fill="none"
                stroke="#16a34a"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <rect x="3" y="27" width="42" height="32" rx="10" fill="white" stroke="#e2e8f0" />
              <rect x="3" y="94" width="42" height="32" rx="10" fill="white" stroke="#e2e8f0" />
              <text x="24" y="48" textAnchor="middle" fill="#334155" fontSize="15">
                1
              </text>
              <text x="24" y="115" textAnchor="middle" fill="#334155" fontSize="15">
                1
              </text>
              <path
                d="M88 46H109A30 30 0 0 1 109 106H88Z"
                fill="white"
                stroke="#e11d48"
                strokeWidth="2.5"
              />
              <text x="110" y="81" textAnchor="middle" fill="#e11d48" fontSize="12">
                AND
              </text>
              <circle cx="163" cy="76" r="10" fill="#16a34a" />
              <circle cx="163" cy="76" r="16" fill="none" stroke="#bbf7d0" strokeWidth="3" />
            </svg>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs font-medium text-slate-500">
            <BookOpen className="h-4 w-4" />
            {bn
              ? "৩টি পাঠ · মোট ৪টি প্রশ্ন · হাতে কলমে শেখা"
              : "3 lessons · 4 questions total · Learn by doing"}
          </p>
        </div>
        <div className="px-6 py-6 sm:px-9">
          <h3 className="mb-4 text-sm font-semibold text-slate-800">
            {bn ? "কোন বিষয়টি আগে দেখে নিতে চাও?" : "What would you like to explore?"}
          </h3>
          <div className="grid auto-cols-[minmax(210px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2">
            {topics.map((topic, index) => (
              <button
                type="button"
                key={topic.en}
                onClick={() => onExplore(index)}
                className="group flex min-h-24 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-rose-300 hover:bg-rose-50/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-destructive"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${topic.color}`}
                >
                  <topic.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold leading-6 text-slate-900">
                    {bn ? topic.bn : topic.en}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {bn ? topic.detailBn : topic.detailEn}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-rose-600" />
              </button>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-6 text-slate-500">
              {bn
                ? "একদম নতুন? প্রথম পাঠ থেকে শুরু করো।"
                : "New to this? Start with the first lesson."}
            </p>
            <Button
              variant="destructive"
              onClick={() => onExplore(0)}
              className="h-12 rounded-xl px-5"
            >
              {bn ? "শেখা শুরু করি" : "Let’s start learning"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full rounded-lg py-2 text-center text-xs text-slate-500 underline underline-offset-4 hover:text-slate-900"
          >
            {bn ? "আগে পুরো শেখার পথ দেখি" : "See the full learning path first"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
