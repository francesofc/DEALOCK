import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
}

export function KPICard({ title, value, change, trend, icon: Icon }: KPICardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span
          className={cn(
            "text-sm font-medium",
            trend === "up" ? "text-green-400" : "text-red-400"
          )}
        >
          {change}
        </span>
        <span className="text-sm text-muted-foreground">vs last month</span>
      </div>
    </div>
  );
}
