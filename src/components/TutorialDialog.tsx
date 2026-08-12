import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { useLang } from "@/i18n";

const STEPS = [
  ["step1t", "step1d"],
  ["step2t", "step2d"],
  ["step3t", "step3d"],
  ["step4t", "step4d"],
  ["step5t", "step5d"],
  ["step6t", "step6d"],
] as const;

export function TutorialDialog() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <GraduationCap className="h-4 w-4" /> {t("tutorial")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("tutorialTitle")}</DialogTitle>
          <DialogDescription>{t("tutorialIntro")}</DialogDescription>
        </DialogHeader>
        <ol className="space-y-3">
          {STEPS.map(([title, desc]) => (
            <li key={title} className="rounded-lg border border-border bg-card p-3">
              <div className="text-sm font-semibold">{t(title)}</div>
              <p className="mt-1 text-sm text-muted-foreground">{t(desc)}</p>
            </li>
          ))}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
