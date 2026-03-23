"use client";

import { useState, useEffect } from "react";
import { MatchOpportunity, MatchScore, TargetType, Mandate, Lead } from "@/types/database";
import { Star, AlertCircle, Check, Building2, UserCircle, FileCheck } from "lucide-react";
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
  // Data lists
  const [buyers, setBuyers] = useState<{ id: string; name: string }[]>([]);
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [sellers, setSellers] = useState<Lead[]>([]);
  
  // Form state with explicit target_type and target_id
  const [formData, setFormData] = useState<Partial<MatchOpportunity>>({
    buyer_id: "",
    target_type: undefined, // Must be explicitly selected
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

  // Load all reference data
  useEffect(() => {
    async function loadData() {
      const [buyersData, leadsData, mandatesData] = await Promise.all([
        getBuyers(),
        getLeads(),
        getMandates(),
      ]);
      
      setBuyers(buyersData.map(b => ({ id: b.id, name: b.name })));
      setSellers(leadsData);
      setMandates(mandatesData);
    }
    loadData();
  }, []);

  // Notify parent of changes
  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const updateField = <K extends keyof MatchOpportunity>(field: K, value: MatchOpportunity[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // When target_type changes, clear target_id
  const handleTargetTypeChange = (newType: TargetType | "") => {
    setFormData(prev => ({
      ...prev,
      target_type: newType as TargetType || undefined,
      target_id: "", // Reset target when type changes
    }));
  };

  const addReason = () => {
    if (!newReason.trim()) return;
    setFormData(prev => ({
      ...prev,
      match_reasons: [...(prev.match_reasons || []), newReason.trim()]
    }));
    setNewReason("");
  };

  const removeReason = (index: number) => {
    setFormData(prev => ({
      ...prev,
      match_reasons: prev.match_reasons?.filter((_, i) => i !== index) || []
    }));
  };

  const addBlocker = () => {
    if (!newBlocker.trim()) return;
    setFormData(prev => ({
      ...prev,
      blockers: [...(prev.blockers || []), newBlocker.trim()]
    }));
    setNewBlocker("");
  };

  const removeBlocker = (index: number) => {
    setFormData(prev => ({
      ...prev,
      blockers: prev.blockers?.filter((_, i) => i !== index) || []
    }));
  };

  // Get the selected target display info
  const getSelectedTarget = () => {
    if (!formData.target_id || !formData.target_type) return null;
    
    if (formData.target_type === 'mandate') {
      return mandates.find(m => m.id === formData.target_id);
    } else {
      return sellers.find(s => s.id === formData.target_id);
    }
  };

  const selectedTarget = getSelectedTarget();
  const isTargetMandate = (t: Mandate | Lead): t is Mandate => 'lead_id' in t;

  return (
    <div className="space-y-6">
      {/* ============================================
          STEP 1: BUYER SELECTION
          ============================================ */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 uppercase tracking-wider">Buyer</label>
        <select
          value={formData.buyer_id}
          onChange={(e) => updateField("buyer_id", e.target.value)}
          data-testid="buyer-select"
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

      {/* ============================================
          STEP 2: TARGET TYPE SELECTOR
          ============================================ */}
      <div className="space-y-2">
        <label className="text-xs text-white/50 uppercase tracking-wider">Target Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTargetTypeChange('mandate')}
            data-testid="target-type-mandate"
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
              formData.target_type === 'mandate'
                ? "bg-violet-500/10 border-violet-500/30"
                : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              formData.target_type === 'mandate' ? 'bg-violet-500/20' : 'bg-white/[0.06]'
            }`}>
              <FileCheck className={`w-5 h-5 ${
                formData.target_type === 'mandate' ? 'text-violet-400' : 'text-white/40'
              }`} />
            </div>
            <div>
              <p className={`font-medium ${formData.target_type === 'mandate' ? 'text-violet-300' : 'text-white/80'}`}>
                Mandate
              </p>
              <p className="text-xs text-white/40">Signed exclusivity</p>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => handleTargetTypeChange('seller')}
            data-testid="target-type-seller"
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
              formData.target_type === 'seller'
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              formData.target_type === 'seller' ? 'bg-emerald-500/20' : 'bg-white/[0.06]'
            }`}>
              <UserCircle className={`w-5 h-5 ${
                formData.target_type === 'seller' ? 'text-emerald-400' : 'text-white/40'
              }`} />
            </div>
            <div>
              <p className={`font-medium ${formData.target_type === 'seller' ? 'text-emerald-300' : 'text-white/80'}`}>
                Seller
              </p>
              <p className="text-xs text-white/40">Pre-mandate lead</p>
            </div>
          </button>
        </div>
      </div>

      {/* ============================================
          STEP 3: TARGET ID SELECTOR (Conditional)
          ============================================ */}
      {formData.target_type && (
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 uppercase tracking-wider">
            {formData.target_type === 'mandate' ? 'Select Mandate' : 'Select Seller'}
          </label>
          <select
            value={formData.target_id}
            onChange={(e) => updateField("target_id", e.target.value)}
            data-testid="target-select"
            className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            <option value="" className="bg-[#0d0d0f]">
              {formData.target_type === 'mandate' 
                ? 'Choose a mandate...' 
                : 'Choose a seller...'}
            </option>
            
            {formData.target_type === 'mandate' ? (
              mandates.map(mandate => (
                <option key={mandate.id} value={mandate.id} className="bg-[#0d0d0f]">
                  {mandate.title || mandate.city || 'Untitled'} 
                  {mandate.exclusive ? ' (Exclusive)' : ''}
                  {mandate.asking_price ? ` — €${(mandate.asking_price / 1000).toFixed(0)}k` : ''}
                </option>
              ))
            ) : (
              sellers.map(seller => (
                <option key={seller.id} value={seller.id} className="bg-[#0d0d0f]">
                  {seller.owner_name} — {seller.neighborhood}, {seller.city}
                  {seller.price ? ` (€${(seller.price / 1000).toFixed(0)}k)` : ''}
                </option>
              ))
            )}
          </select>
        </div>
      )}

      {/* ============================================
          SELECTED TARGET DISPLAY
          ============================================ */}
      {selectedTarget && (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              formData.target_type === 'mandate' ? 'bg-violet-500/15' : 'bg-emerald-500/15'
            }`}>
              {formData.target_type === 'mandate' ? (
                <FileCheck className="w-4 h-4 text-violet-400" />
              ) : (
                <UserCircle className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {isTargetMandate(selectedTarget) 
                  ? (selectedTarget.title || selectedTarget.city || 'Untitled Mandate')
                  : selectedTarget.owner_name}
              </p>
              <p className="text-xs text-white/50">
                {formData.target_type === 'mandate' ? 'Exclusive Mandate' : 'Seller Lead'}
                {isTargetMandate(selectedTarget) && selectedTarget.exclusive && ' • Exclusive'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {isTargetMandate(selectedTarget) 
                ? (selectedTarget.city || 'Unknown location')
                : `${selectedTarget.neighborhood}, ${selectedTarget.city}`}
            </span>
            {(isTargetMandate(selectedTarget) ? selectedTarget.asking_price : selectedTarget.price) && (
              <span>
                €{((isTargetMandate(selectedTarget) 
                  ? selectedTarget.asking_price 
                  : selectedTarget.price) || 0 / 1000).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ============================================
          MATCH CONFIGURATION
          ============================================ */}
      
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
