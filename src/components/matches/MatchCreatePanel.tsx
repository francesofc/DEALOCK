"use client";

import { useState, useEffect } from "react";
import { MatchOpportunity, MatchScore, TargetType } from "@/types/database";
import { Star, AlertCircle, Check } from "lucide-react";
import { getBuyers, getLeads, getMandates } from "@/lib/data";

interface MatchCreatePanelProps {
  onChange: (data: Partial<MatchOpportunity>) => void;
}

const scoreOptions: { value: MatchScore; label: string; color: string }[] = [
  { value: "excellent", label: "Excellent", color: "text-violet-400" },
  { value: "good", label: "Good", color: "text-emerald-400" },
  { value: "fair", label: "Fair", color: "text-amber-400" },
  { value: "weak", label: "Weak", color: "text-white/40" },
];

const priorityOptions = [
  { value: "urgent", label: "Urgent", color: "bg-red-500/20 text-red-400" },
  { value: "high", label: "High", color: "bg-orange-500/20 text-orange-400" },
  { value: "medium", label: "Medium", color: "bg-blue-500/20 text-blue-400" },
  { value: "low", label: "Low", color: "bg-white/10 text-white/60" },
];

export function MatchCreatePanel({ onChange }: MatchCreatePanelProps) {
  const [buyers, setBuyers] = useState<{ id: string; name: string }[]>([]);
  const [targets, setTargets] = useState<{ id: string; label: string; type: TargetType }[]>([]);
  
  const [formData, setFormData] = useState<Partial<MatchOpportunity>>({
    buyer_id: "",
    target_type: "mandate",
    target_id: "",
    match_score: "good",
    score_value: 75,
    match_reasons: [],
    blockers: [],
    recommended_action: "",
    status: "identified",
    priority: "medium",
    notes: "",
  });

  const [newReason, setNewReason] = useState("");
  const [newBlocker, setNewBlocker] = useState("");

  useEffect(() => {
    async function loadData() {
      const [buyersData, leadsData, mandatesData] = await Promise.all([
        getBuyers(),
        getLeads(),
        getMandates(),
      ]);
      
      setBuyers(buyersData.map(b => ({ id: b.id, name: b.name })));
      
      const targetList = [
        ...mandatesData.map(m => ({ 
          id: m.id, 
          label: `Mandate: ${m.title || m.city || 'Untitled'}`, 
          type: "mandate" as TargetType 
        })),
        ...leadsData.map(l => ({ 
          id: l.id, 
          label: `Seller: ${l.owner_name} (${l.city})`, 
          type: "seller" as TargetType 
        })),
      ];
      setTargets(targetList);
    }
    loadData();
  }, []);

  const updateField = <K extends keyof MatchOpportunity>(field: K, value: MatchOpportunity[K]) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const addReason = () => {
    if (!newReason.trim()) return;
    const updated = { 
      ...formData, 
      match_reasons: [...(formData.match_reasons || []), newReason.trim()] 
    };
    setFormData(updated);
    onChange(updated);
    setNewReason("");
  };

  const removeReason = (index: number) => {
    const updated = { 
      ...formData, 
      match_reasons: formData.match_reasons?.filter((_, i) => i !== index) || [] 
    };
    setFormData(updated);
    onChange(updated);
  };

  const addBlocker = () => {
    if (!newBlocker.trim()) return;
    const updated = { 
      ...formData, 
      blockers: [...(formData.blockers || []), newBlocker.trim()] 
    };
    setFormData(updated);
    onChange(updated);
    setNewBlocker("");
  };

  const removeBlocker = (index: number) => {
    const updated = { 
      ...formData, 
      blockers: formData.blockers?.filter((_, i) => i !== index) || [] 
    };
    setFormData(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Buyer Selection */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 uppercase tracking-wider">Buyer</label>
        <select
          value={formData.buyer_id}
          onChange={(e) => updateField("buyer_id", e.target.value)}
          className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
        >
          <option value="" className="bg-[#0d0d0f]">Select buyer...</option>
          {buyers.map(buyer => (
            <option key={buyer.id} value={buyer.id} className="bg-[#0d0d0f]">
              {buyer.name}
            </option>
          ))}
        </select>
      </div>

      {/* Target Selection */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 uppercase tracking-wider">Target Property</label>
        <select
          value={formData.target_id}
          onChange={(e) => {
            const target = targets.find(t => t.id === e.target.value);
            updateField("target_id", e.target.value);
            updateField("target_type", target?.type || "mandate");
          }}
          className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
        >
          <option value="" className="bg-[#0d0d0f]">Select target...</option>
          {targets.map(target => (
            <option key={target.id} value={target.id} className="bg-[#0d0d0f]">
              {target.label}
            </option>
          ))}
        </select>
      </div>

      {/* Score Selection */}
      <div className="space-y-3">
        <label className="text-xs text-white/50 uppercase tracking-wider">Match Score</label>
        <div className="grid grid-cols-4 gap-2">
          {scoreOptions.map((score) => (
            <button
              key={score.value}
              type="button"
              onClick={() => {
                updateField("match_score", score.value);
                updateField("score_value", 
                  score.value === "excellent" ? 90 :
                  score.value === "good" ? 75 :
                  score.value === "fair" ? 60 : 45
                );
              }}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                formData.match_score === score.value
                  ? "bg-white/10 border-white/30"
                  : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]"
              }`}
            >
              <Star className={`w-4 h-4 ${score.color}`} />
              <span className="text-xs">{score.label}</span>
            </button>
          ))}
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={formData.score_value}
          onChange={(e) => updateField("score_value", parseInt(e.target.value))}
          className="w-full"
        />
        <div className="text-center text-sm text-white/60">{formData.score_value}% fit</div>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <label className="text-xs text-white/50 uppercase tracking-wider">Priority</label>
        <div className="flex gap-2">
          {priorityOptions.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => updateField("priority", p.value as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                formData.priority === p.value
                  ? p.color + " ring-1 ring-white/20"
                  : "bg-white/[0.03] text-white/60 hover:bg-white/[0.06]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Match Reasons */}
      <div className="space-y-2">
        <label className="text-xs text-white/50 uppercase tracking-wider">Match Reasons</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            placeholder="e.g., Budget alignment"
            className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30"
            onKeyDown={(e) => e.key === "Enter" && addReason()}
          />
          <button
            type="button"
            onClick={addReason}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
        {formData.match_reasons && formData.match_reasons.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.match_reasons.map((reason, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs"
              >
                {reason}
                <button
                  type="button"
                  onClick={() => removeReason(i)}
                  className="hover:text-emerald-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Blockers */}
      <div className="space-y-2">
        <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Blockers (if any)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newBlocker}
            onChange={(e) => setNewBlocker(e.target.value)}
            placeholder="e.g., Price gap"
            className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30"
            onKeyDown={(e) => e.key === "Enter" && addBlocker()}
          />
          <button
            type="button"
            onClick={addBlocker}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
        {formData.blockers && formData.blockers.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.blockers.map((blocker, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs"
              >
                {blocker}
                <button
                  type="button"
                  onClick={() => removeBlocker(i)}
                  className="hover:text-amber-300"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Action */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 uppercase tracking-wider">Recommended Action</label>
        <input
          type="text"
          value={formData.recommended_action}
          onChange={(e) => updateField("recommended_action", e.target.value)}
          placeholder="e.g., Schedule viewing this week"
          className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30"
        />
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 uppercase tracking-wider">Notes</label>
        <textarea
          value={formData.notes || ""}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Additional context..."
          rows={3}
          className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 resize-none"
        />
      </div>
    </div>
  );
}
