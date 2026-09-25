import { useState, createContext, useContext } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const AccordionContext = createContext(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(
      "Accordion compound components must be used within Accordion",
    );
  }
  return context;
}

function generateId(value) {
  return `accordion-${value}`;
}

export function Accordion({ children, className }) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}

export function AccordionItem({
  children,
  value,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const handleToggle = () => {
    if (isControlled) {
      onOpenChange?.(!isOpen);
    } else {
      setUncontrolledOpen(!isOpen);
    }
  };

  const triggerId = `${generateId(value)}-trigger`;
  const contentId = `${generateId(value)}-content`;

  return (
    <div
      className={cn("rounded-lg border border-border bg-card", className)}
      data-state={isOpen ? "open" : "closed"}
      data-accordion-item={value}
    >
      <AccordionContext.Provider
        value={{ isOpen, onToggle: handleToggle, triggerId, contentId }}
      >
        {children}
      </AccordionContext.Provider>
    </div>
  );
}

export function AccordionTrigger({ children, className, icon: Icon }) {
  const { isOpen, onToggle, triggerId, contentId } = useAccordionContext();

  return (
    <button
      id={triggerId}
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3",
        "text-sm font-semibold text-foreground",
        "transition-colors hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "rounded-lg",
        className,
      )}
      aria-expanded={isOpen}
      aria-controls={contentId}
    >
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className="size-4 text-muted-foreground" />}
        <span>{children}</span>
      </div>
      <ChevronDown
        className={cn(
          "size-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180",
        )}
      />
    </button>
  );
}

export function AccordionContent({ children, className }) {
  const { isOpen, contentId, triggerId } = useAccordionContext();

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      className={cn(
        "grid transition-all duration-200 ease-in-out",
        isOpen
          ? "grid-rows-[1fr] opacity-100 overflow-visible"
          : "grid-rows-[0fr] opacity-0 overflow-hidden",
      )}
    >
      <div className="min-h-0">
        <div className={cn("border-t border-border px-4 py-4", className)}>
          {children}
        </div>
      </div>
    </div>
  );
}
