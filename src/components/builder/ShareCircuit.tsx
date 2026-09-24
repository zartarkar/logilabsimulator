import { useRef, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ShareCircuit({ circuit, bn }: { circuit: string | undefined; bn: boolean }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const copy = async () => {
    field.current?.select();
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setFailed(false);
    } catch {
      field.current?.focus();
      field.current?.select();
      const success = document.execCommand("copy");
      setCopied(success);
      setFailed(!success);
    }
  };
  return (
    <Dialog onOpenChange={(open) => {
      if (!open) return;
      const link = new URL(window.location.href);
      link.searchParams.set("tab", "builder");
      if (circuit) link.searchParams.set("circuit", circuit);
      else link.searchParams.delete("circuit");
      setUrl(link.href);
      setCopied(false);
      setFailed(false);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 bg-card/95 px-2.5 shadow-md" data-tour="builder-share">
          <Share2 className="h-3.5 w-3.5" />
          {bn ? "সার্কিট শেয়ার করো" : "Share your circuit"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-24px)] max-w-md" onOpenAutoFocus={(event) => event.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{bn ? "তোমার সার্কিট শেয়ার করো" : "Share your circuit"}</DialogTitle>
          <DialogDescription>{bn ? "লিংকে চাপ দিয়ে কপি করো। ব্রাউজারে লিংকটি খুললে একই সার্কিট দেখা যাবে।" : "Tap the link to copy it. Open it in a browser to see the same circuit."}</DialogDescription>
        </DialogHeader>
        <div className="flex min-w-0 items-center gap-2">
          <input ref={field} readOnly value={url} onClick={() => void copy()} onKeyDown={(event) => { if (event.key === "Enter") void copy(); }}
            aria-label={bn ? "সার্কিটের লিংক—কপি করতে চাপো" : "Circuit link—tap to copy"}
            className="h-11 min-w-0 flex-1 cursor-copy rounded-md border bg-muted/40 px-3 text-sm" />
          <Button size="icon" variant="outline" onClick={() => void copy()} aria-label={bn ? "লিংক কপি করো" : "Copy link"}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p role="status" className="min-h-5 text-sm text-muted-foreground">
          {copied ? (bn ? "লিংক কপি হয়েছে" : "Link copied") : failed ? (bn ? "লিংকটি নির্বাচন করা আছে—কপি অপশন ব্যবহার করো" : "The link is selected—use your browser’s Copy option") : ""}
        </p>
      </DialogContent>
    </Dialog>
  );
}
