import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatLauncherButton({ onClick, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open chat"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-dark-blue text-white shadow-[0_8px_24px_rgba(15,23,42,0.24)] transition-transform hover:scale-105",
        className,
      )}
    >
      <Sparkles className="h-6 w-6" />
    </button>
  );
}
