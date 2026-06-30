import { useState, useRef, useEffect } from "react";
import { Sparkles, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

const AI_PROVIDERS: {
  name: string;
  shortName: string;
  url: (prompt: string) => string;
}[] = [
  {
    name: "Open in ChatGPT",
    shortName: "ChatGPT",
    url: (prompt: string) =>
      `https://chatgpt.com/?prompt=${encodeURIComponent(prompt)}`,
  },
  {
    name: "Open in Claude",
    shortName: "Claude",
    url: (prompt: string) =>
      `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  },

];

const buildPrompt = () => {
  const currentUrl = window.location.href;
  return `Please read and explain this documentation page: ${currentUrl}

Please provide a clear summary and help me understand the key concepts covered in this documentation.`;
};

export function AskAI() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleOpenAI = (provider: (typeof AI_PROVIDERS)[number]) => {
    window.open(provider.url(buildPrompt()), "_blank", "noopener");
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs sm:px-4 sm:text-sm font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Ask AI</span>
        <span className="hidden sm:inline">{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right animate-in fade-in zoom-in-95 slide-in-from-top-2 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg max-[400px]:fixed max-[400px]:left-4 max-[400px]:right-4 max-[400px]:top-auto max-[400px]:w-auto">
          {AI_PROVIDERS.map((provider) => (
            <button
              key={provider.shortName}
              type="button"
              onClick={() => handleOpenAI(provider)}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              {provider.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
