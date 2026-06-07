import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface ActionItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  destructive?: boolean;
}

export function ActionSheet({
  open,
  onOpenChange,
  title,
  description,
  actions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  actions: ActionItem[];
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex flex-col gap-2 mt-6">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                action.onClick();
                onOpenChange(false);
              }}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-accent",
                action.destructive && "text-destructive hover:bg-destructive/10",
              )}
            >
              <span className="size-5 shrink-0">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
