import { cn } from "@/lib/utils";

interface PipelineStageProps {
  name: string;
  count: number;
  active?: boolean;
}

export function PipelineStage({ name, count, active }: PipelineStageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center p-3 rounded-lg border transition-colors",
        active
          ? "bg-primary/10 border-primary/50"
          : "bg-card border-border hover:border-border/80"
      )}
    >
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-xs text-muted-foreground text-center mt-1">{name}</span>
    </div>
  );
}
