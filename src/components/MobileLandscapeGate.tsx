import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, RotateCw, Smartphone } from "lucide-react";
import { isLandscape } from "@/logic/mobileOrientation";

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
};

export function MobileLandscapeGate() {
  const [needsLandscape, setNeedsLandscape] = useState(false);
  const [message, setMessage] = useState("");
  const [canAutoLock, setCanAutoLock] = useState<boolean | null>(null);
  const [isEmbeddedBrowser, setIsEmbeddedBrowser] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ownsLock = useRef(false);

  const updateViewport = useCallback(() => {
    // Read the actual layout after rotation; orientationchange can fire before
    // the browser updates either its media query or viewport dimensions.
    const width = document.documentElement.clientWidth || window.innerWidth;
    const height = window.innerHeight;
    const landscape = isLandscape({
      width,
      height,
      type: screen.orientation?.type,
      legacyAngle: typeof window.orientation === "number" ? window.orientation : undefined,
      mediaLandscape: window.matchMedia("(orientation: landscape)").matches,
    });
    setNeedsLandscape(width <= 900 && !landscape);
    if (landscape) setMessage("");
  }, []);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 900px)");
    const portrait = window.matchMedia("(orientation: portrait)");
    const userAgent = navigator.userAgent;
    setCanAutoLock(
      typeof (screen.orientation as LockableOrientation | undefined)?.lock === "function",
    );
    setIsEmbeddedBrowser(/FBAN|FBAV|Instagram|Messenger/i.test(userAgent));
    let frame = 0;
    let settled = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      clearTimeout(settled);
      frame = requestAnimationFrame(updateViewport);
      settled = window.setTimeout(updateViewport, 300);
    };
    updateViewport();
    const subscribe = (query: MediaQueryList) => {
      if (query.addEventListener) {
        query.addEventListener("change", update);
        return () => query.removeEventListener("change", update);
      }
      query.addListener(update);
      return () => query.removeListener(update);
    };
    const unsubscribeMobile = subscribe(mobile);
    const unsubscribePortrait = subscribe(portrait);
    window.addEventListener("orientationchange", update);
    window.addEventListener("resize", update);
    window.addEventListener("pageshow", update);
    screen.orientation?.addEventListener?.("change", update);
    window.visualViewport?.addEventListener("resize", update);
    document.addEventListener("fullscreenchange", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      unsubscribeMobile();
      unsubscribePortrait();
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("pageshow", update);
      screen.orientation?.removeEventListener?.("change", update);
      window.visualViewport?.removeEventListener("resize", update);
      document.removeEventListener("fullscreenchange", update);
      document.removeEventListener("visibilitychange", update);
      cancelAnimationFrame(frame);
      clearTimeout(settled);
      if (ownsLock.current) screen.orientation?.unlock?.();
    };
  }, [updateViewport]);

  useEffect(() => {
    if (!needsLandscape) return;
    // Embedded browsers sometimes omit rotation/resize events entirely.
    const timer = window.setInterval(updateViewport, 500);
    return () => window.clearInterval(timer);
  }, [needsLandscape, updateViewport]);

  const enterLandscape = async () => {
    if (switching) return;
    setSwitching(true);
    setMessage("");
    let enteredFullscreen = false;
    try {
      const orientation = screen.orientation as LockableOrientation | undefined;
      if (!orientation?.lock) throw new Error("unsupported");
      try {
        await orientation.lock("landscape");
      } catch {
        // Some Android browsers require fullscreen before allowing a lock.
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          enteredFullscreen = true;
        }
        await orientation.lock("landscape");
      }
      ownsLock.current = true;
      updateViewport();
    } catch {
      if (enteredFullscreen && document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }
      setMessage(
        "এই browser থেকে সরাসরি ঘোরানো যাচ্ছে না। ফোনের Auto Rotation চালু করে Rotation Lock বন্ধ করো, তারপর ফোনটি পাশে ঘোরাও।\nTurn on Auto Rotation, turn off Rotation Lock, then rotate your phone sideways.",
      );
    } finally {
      setSwitching(false);
    }
  };

  if (!needsLandscape) return null;

  return (
    <div
      className="fixed inset-0 z-[1000000001] flex h-dvh items-center justify-center overflow-y-auto bg-background/95 p-3 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="landscape-title"
    >
      <div className="max-h-full w-full max-w-sm overflow-y-auto overscroll-contain rounded-2xl border border-primary/30 bg-card p-6 text-center shadow-2xl">
        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Smartphone className="h-10 w-10" />
          <RotateCw className="absolute -right-1 top-0 h-7 w-7 animate-pulse" />
        </div>
        <h2 id="landscape-title" className="text-xl font-bold leading-snug">
          তোমার মোবাইলের Auto Rotation চালু করে Landscape Mode এ নিন
        </h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-foreground/75">
          Turn on Auto Rotation and rotate your phone to Landscape Mode
        </p>
        <div className="mx-auto mt-4 h-px w-16 bg-border" />
        <div className="mt-4 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
          <p>
            {canAutoLock
              ? "নিচের button চাপলে supported browser স্বয়ংক্রিয়ভাবে Landscape Mode চালু করার চেষ্টা করবে।"
              : "Auto Rotation চালু করে মোবাইলটি ঘুরিয়ে নিলেই simulator খুলবে।"}
          </p>
          <p className="text-xs">
            {canAutoLock
              ? "Tap the button below to let supported browsers switch automatically."
              : "Turn on Auto Rotation, then rotate your phone to open the simulator."}
          </p>
        </div>
        {canAutoLock ? (
          <Button
            disabled={switching}
            className="mt-5 h-auto min-h-11 w-full whitespace-normal py-3"
            onClick={enterLandscape}
          >
            <RotateCw className="mr-2 h-4 w-4" /> Landscape Mode এ নিন · Enter Landscape Mode
          </Button>
        ) : (
          <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-left text-xs leading-relaxed text-amber-900">
            <strong className="block">যেভাবে খুলবেন · How to continue</strong>
            <span className="mt-1 block">
              Control Center থেকে Rotation Lock বন্ধ করে মোবাইলটি পাশে ঘুরিয়ে নিন।
            </span>
            <span className="mt-1 block">
              Turn off Rotation Lock in Control Center, then rotate your phone sideways.
            </span>
            {isEmbeddedBrowser && (
              <span className="mt-2 flex items-start gap-1.5">
                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Messenger menu থেকে Open in Browser নির্বাচন করলে layout আরও ভালো কাজ করবে।
                  <br />
                  For a better layout, select Open in Browser from the Messenger menu.
                </span>
              </span>
            )}
          </div>
        )}
        {message && (
          <p className="mt-3 whitespace-pre-line rounded-lg bg-muted p-2 text-xs text-muted-foreground">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
