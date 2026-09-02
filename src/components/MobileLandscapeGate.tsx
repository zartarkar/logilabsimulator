import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCw, Smartphone } from "lucide-react";
import { useLang } from "@/i18n";

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
};

export function MobileLandscapeGate() {
  const { lang } = useLang();
  const bn = lang === "bn";
  const [needsLandscape, setNeedsLandscape] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 900px)");
    const portrait = window.matchMedia("(orientation: portrait)");
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
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      const orientation = screen.orientation as LockableOrientation;
      if (!orientation.lock) throw new Error("unsupported");
      await orientation.lock("landscape");
    } catch {
      setMessage(bn
        ? "এই browser automatic landscape lock support করে না। ফোনটি পাশে ঘোরাও এবং orientation lock বন্ধ রাখো।"
        : "This browser cannot lock landscape automatically. Rotate your phone sideways and make sure orientation lock is off.");
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
        <h2 id="landscape-title" className="text-xl font-bold">
          {bn ? "Device landscape mode-এ নাও" : "Turn your device to landscape"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {bn ? "Circuit canvas ও controls ভালোভাবে ব্যবহার করতে ফোনটি পাশে ঘোরাও।" : "Rotate your phone sideways for the best circuit canvas and control layout."}
        </p>
        <Button className="mt-5 w-full" onClick={enterLandscape}>
          <RotateCw className="mr-2 h-4 w-4" /> {bn ? "Landscape mode চালু করো" : "Enter landscape mode"}
        </Button>
        {message && <p className="mt-3 rounded-lg bg-muted p-2 text-xs text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
