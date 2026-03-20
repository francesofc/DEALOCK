import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
          {
            "bg-primary text-primary-foreground": variant === "default",
            "bg-secondary text-secondary-foreground": variant === "secondary",
            "border border-border text-foreground": variant === "outline",
            "bg-green-500/20 text-green-400 border border-green-500/30": variant === "success",
            "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30": variant === "warning",
            "bg-red-500/20 text-red-400 border border-red-500/30": variant === "destructive",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
