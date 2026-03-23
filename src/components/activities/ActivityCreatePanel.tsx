"use client";

import { useState } from "react";
import { ActivityType } from "@/types/database";
import { Phone, MessageSquare, Calendar, Edit3, Clock, User } from "lucide-react";

interface ActivityCreatePanelProps {
  onChange: (data: { type: ActivityType; content: string; operator_name: string }) => void;
  defaultOperator?: string;
}

const activityTypes: { value: ActivityType; label: string; icon: React.ElementType }[] = [
  { value: "call", label: "Call", icon: Phone },
  { value: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { value: "meeting", label: "Meeting", icon: Calendar },
  { value: "note", label: "Note", icon: Edit3 },
  { value: "follow_up", label: "Follow Up", icon: Clock },
];

export function ActivityCreatePanel({ onChange, defaultOperator = "Agent" }: ActivityCreatePanelProps) {
  const [type, setType] = useState<ActivityType>("note");
  const [content, setContent] = useState("");
  const [operatorName, setOperatorName] = useState(defaultOperator);

  const updateParent = (newType?: ActivityType, newContent?: string, newOperator?: string) => {
    onChange({
      type: newType ?? type,
      content: newContent ?? content,
      operator_name: newOperator ?? operatorName,
    });
  };

  return (
    <div className="space-y-6">
      {/* Activity Type Selection */}
      <div className="space-y-3">
        <label className="text-xs text-white/50 uppercase tracking-wider">Activity Type</label>
        <div className="grid grid-cols-3 gap-2">
          {activityTypes.map((activityType) => {
            const Icon = activityType.icon;
            const isSelected = type === activityType.value;
            return (
              <button
                key={activityType.value}
                type="button"
                onClick={() => {
                  setType(activityType.value);
                  updateParent(activityType.value);
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-white/10 border-white/30 text-white"
                    : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white/80"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{activityType.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 uppercase tracking-wider">Details</label>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            updateParent(undefined, e.target.value);
          }}
          placeholder="What happened? What was discussed?"
          rows={4}
          className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all resize-none"
        />
      </div>

      {/* Operator */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 uppercase tracking-wider">Recorded By</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={operatorName}
            onChange={(e) => {
              setOperatorName(e.target.value);
              updateParent(undefined, undefined, e.target.value);
            }}
            placeholder="Your name"
            className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
