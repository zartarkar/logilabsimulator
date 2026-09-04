import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, RotateCw, Smartphone } from "lucide-react";

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
};

export function MobileLandscapeGate() {
  const [needsLandscape, setNeedsLandscape] = useState(false);
  const [message, setMessage] = useState("");
  const [canAutoLock, setCanAutoLock] = useState<boolean | null>(null);
  const [isEmbeddedBrowser, setIsEmbeddedBrowser] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 900px)");
    const portrait = window.matchMedia("(orientation: portrait)");
    const userAgent = navigator.userAgent;
    setCanAutoLock(typeof (screen.orientation as LockableOrientation | undefined)?.lock === "function");
    setIsEmbeddedBrowser(/FBAN|FBAV|Instagram|Messenger/i.test(userAgent));
    const update = () => {
      setNeedsLandscape(mobile.matches && portrait.matches);
      if (!portrait.matches) setMessage("");
    };
    update();
    mobile.addEventListener("change", update);
    portrait.addEventListener("change", update);
    window.addEventListener("orientationchange", update);
    return () => {
      mobile.removeEventListener("change", update);
      portrait.removeEventListener("change", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  const enterLandscape = async () => {
    let fullscreenFailed = false;
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      fullscreenFailed = true;
    }

    try {
      const orientation = screen.orientation as LockableOrientation;
      if (!orientation.lock) throw new Error("unsupported");
      await orientation.lock("landscape");
    } catch {
      setMessage(`${fullscreenFailed ? "Fullscreen চালু করা যায়নি। " : ""}এই browser স্বয়ংক্রিয়ভাবে Landscape Mode চালু করতে দেয় না। Auto Rotation চালু করে মোবাইলটি ঘুরিয়ে নিন।\n${fullscreenFailed ? "Fullscreen could not be enabled. " : ""}This browser cannot switch to Landscape Mode automatically. Turn on Auto Rotation and rotate your phone.`);
    }
  };

  if (!needsLandscape) return null;

  return (
    <div className="fixed inset-0 z-[1000000001] flex items-center justify-center bg-background/95 p-5 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="landscape-title">
      <div className="w-full max-w-sm rounded-2xl border border-primary/30 bg-card p-6 text-center shadow-2xl">
        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Smartphone className="h-10 w-10" />
          <RotateCw className="absolute -right-1 top-0 h-7 w-7 animate-pulse" />
        </div>
        <h2 id="landscape-title" className="text-xl font-bold leading-snug">
          আপনার মোবাইলের Auto Rotation চালু করে Landscape Mode-এ নিন
        </h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-foreground/75">
          Turn on Auto Rotation and rotate your phone to Landscape Mode
        </p>
        <div className="mx-auto mt-4 h-px w-16 bg-border" />
        <div className="mt-4 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          <p>{canAutoLock ? "নিচের button চাপলে supported browser স্বয়ংক্রিয়ভাবে Landscape Mode চালু করার চেষ্টা করবে।" : "Auto Rotation চালু করে মোবাইলটি ঘুরিয়ে নিলেই simulator খুলবে।"}</p>
          <p className="text-xs">{canAutoLock ? "Tap the button below to let supported browsers switch automatically." : "Turn on Auto Rotation, then rotate your phone to open the simulator."}</p>
        </div>
        {canAutoLock ? (
          <Button className="mt-5 w-full" onClick={enterLandscape}>
            <RotateCw className="mr-2 h-4 w-4" /> Landscape Mode-এ নিন · Enter Landscape Mode
          </Button>
        ) : (
          <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-left text-xs leading-relaxed text-amber-900">
            <strong className="block">যেভাবে খুলবেন · How to continue</strong>
            <span className="mt-1 block">Control Center থেকে Rotation Lock বন্ধ করে মোবাইলটি পাশে ঘুরিয়ে নিন।</span>
            <span className="mt-1 block">Turn off Rotation Lock in Control Center, then rotate your phone sideways.</span>
            {isEmbeddedBrowser && <span className="mt-2 flex items-start gap-1.5"><ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>Messenger menu থেকে Open in Browser নির্বাচন করলে layout আরও ভালো কাজ করবে।<br />For a better layout, select Open in Browser from the Messenger menu.</span></span>}
          </div>
        )}
        {message && <p className="mt-3 whitespace-pre-line rounded-lg bg-muted p-2 text-xs text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
