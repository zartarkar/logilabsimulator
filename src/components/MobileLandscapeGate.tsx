import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, RotateCw, Smartphone } from "lucide-react";
import { useLang } from "@/i18n";

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
};

export function MobileLandscapeGate() {
  const { lang } = useLang();
  const bn = lang === "bn";
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
      setMessage(bn
        ? `${fullscreenFailed ? "Fullscreen permission পাওয়া যায়নি। " : ""}এই browser automatic landscape lock করতে দেয় না। Orientation lock বন্ধ করে ফোনটি পাশে ঘোরাও।`
        : `${fullscreenFailed ? "Fullscreen permission was denied. " : ""}This browser does not allow automatic landscape lock. Turn off orientation lock and rotate your phone sideways.`);
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
          {canAutoLock
            ? (bn ? "Device landscape mode-এ নাও" : "Turn your device to landscape")
            : (bn ? "ফোনটি পাশে ঘোরাও" : "Rotate your phone sideways")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {canAutoLock
            ? (bn ? "Button চাপলে supported browser স্বয়ংক্রিয়ভাবে landscape mode চালু করবে।" : "Tap the button and supported browsers will switch to landscape automatically.")
            : (bn ? "এই browser automatic rotation support করে না। Phone orientation lock বন্ধ করে device ঘোরালেই simulator খুলবে।" : "This browser does not support automatic rotation. Turn off phone orientation lock and rotate the device to open the simulator.")}
        </p>
        {canAutoLock ? (
          <Button className="mt-5 w-full" onClick={enterLandscape}>
            <RotateCw className="mr-2 h-4 w-4" /> {bn ? "Landscape mode চালু করো" : "Enter landscape mode"}
          </Button>
        ) : (
          <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-left text-xs leading-relaxed text-amber-900">
            <strong className="block">{bn ? "যেভাবে খুলবে" : "How to continue"}</strong>
            <span>{bn ? "Control Center থেকে rotation lock বন্ধ করো, তারপর ফোনটি পাশে ঘোরাও।" : "Turn off rotation lock in Control Center, then rotate your phone sideways."}</span>
            {isEmbeddedBrowser && <span className="mt-2 flex items-start gap-1.5"><ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />{bn ? "Messenger menu থেকে Open in Browser ব্যবহার করলে layout আরও ভালো কাজ করবে।" : "For a better layout, use Open in Browser from the Messenger menu."}</span>}
          </div>
        )}
        {message && <p className="mt-3 rounded-lg bg-muted p-2 text-xs text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
