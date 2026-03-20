import { FileSignature, Phone, Mail, User, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  type: "mandate" | "call" | "email" | "lead";
  title: string;
  description: string;
  time: string;
}

const typeIcons: Record<string, LucideIcon> = {
  mandate: FileSignature,
  call: Phone,
  email: Mail,
  lead: User,
};

const typeColors: Record<string, string> = {
  mandate: "bg-green-500/20 text-green-400",
  call: "bg-blue-500/20 text-blue-400",
  email: "bg-purple-500/20 text-purple-400",
  lead: "bg-orange-500/20 text-orange-400",
};

export function ActivityItem({ type, title, description, time }: ActivityItemProps) {
  const Icon = typeIcons[type];
  
  return (
    <div className="flex items-start gap-3">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", typeColors[type])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{title}</p>
        <p className="text-sm text-muted-foreground truncate">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{time}</span>
    </div>
  );
}
