"use client";

import { useState } from "react";
import { 
  Buyer, 
  BuyerStatus, 
  BuyerType, 
  ReadinessLevel, 
  SeriousnessLevel, 
  LanguagePreference,
  FinanceProfile 
} from "@/types/database";
import { useTranslation } from "@/lib/i18n";
import { User, MapPin, Euro, Clock, TrendingUp, FileText, Plus, X, Wallet, CheckCircle } from "lucide-react";

interface BuyerCreatePanelProps {
  onChange: (buyerData: Partial<Buyer>) => void;
  onFinanceChange?: (financeData: Partial<FinanceProfile>) => void;
}

const languages: { value: LanguagePreference; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "pt", label: "Portuguese" },
  { value: "es", label: "Spanish" },
];

const statuses: { value: BuyerStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "viewing_scheduled", label: "Viewing Scheduled" },
  { value: "offer_pending", label: "Offer Pending" },
  { value: "closed", label: "Closed" },
  { value: "inactive", label: "Inactive" },
];

const buyerTypes: { value: BuyerType; label: string }[] = [
  { value: "first_time", label: "First-time Buyer" },
  { value: "investor", label: "Investor" },
  { value: "relocating", label: "Relocating" },
  { value: "upgrading", label: "Upgrading" },
  { value: "downsizing", label: "Downsizing" },
];

const timelines: { value: ReadinessLevel; label: string }[] = [
  { value: "browsing", label: "Just browsing" },
  { value: "3_months", label: "Within 3 months" },
  { value: "1_month", label: "Within 1 month" },
  { value: "immediate", label: "Immediate" },
];

const seriousnessLevels: { value: SeriousnessLevel; label: string }[] = [
  { value: "low", label: "Browsing" },
  { value: "medium", label: "Interested" },
  { value: "high", label: "Serious" },
  { value: "very_high", label: "Committed" },
];

function FormSection({ 
  title, 
  icon: Icon, 
  children 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode 
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
        <Icon className="w-4 h-4 text-white/40" />
        <h3 className="text-sm font-medium text-white/80">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function FormField({ 
  label, 
  children,
  hint
}: { 
  label: string; 
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/50 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <p className="text-xs text-white/30">{hint}</p>}
    </div>
  );
}

function TextInput({ 
  value, 
  onChange, 
  placeholder,
  type = "text"
}: { 
  value: string | number; 
  onChange: (val: string) => void; 
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
    />
  );
}

function SelectInput({ 
  value, 
  onChange, 
  options 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#0d0d0f]">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function TextArea({ 
  value, 
  onChange, 
  placeholder,
  rows = 4
}: { 
  value: string | null; 
  onChange: (val: string) => void; 
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all resize-none"
    />
  );
}

function Toggle({ 
  checked, 
  onChange, 
  label 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full"
    >
      <div className={`
        w-10 h-5 rounded-full transition-colors relative
        ${checked ? 'bg-white' : 'bg-white/20'}
      `}>
        <div className={`
          w-4 h-4 rounded-full bg-[#0d0d0f] absolute top-0.5 transition-all
          ${checked ? 'left-[22px]' : 'left-0.5'}
        `} />
      </div>
      <span className="text-sm text-white/70">{label}</span>
    </button>
  );
}

// Array input for tags/areas
function ArrayInput({ 
  values, 
  onChange, 
  placeholder 
}: { 
  values: string[]; 
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const addItem = () => {
    if (input.trim() && !values.includes(input.trim())) {
      onChange([...values, input.trim()]);
      setInput("");
    }
  };

  const removeItem = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
        />
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-2 bg-white/[0.06] hover:bg-white/10 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value, idx) => (
            <span 
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/[0.06] rounded-full text-sm"
            >
              {value}
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-white/40 hover:text-white/70"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function BuyerCreatePanel({ onChange, onFinanceChange }: BuyerCreatePanelProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Buyer>>({
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "new" as BuyerStatus,
    buyer_type: "first_time" as BuyerType,
    timeline: "browsing" as ReadinessLevel,
    seriousness: "medium" as SeriousnessLevel,
    language_preference: "en" as LanguagePreference,
    target_areas: [],
    property_types: [],
    pre_approved: false,
    cash_buyer: false,
  });

  const [financeData, setFinanceData] = useState<Partial<FinanceProfile>>({
    id: crypto.randomUUID(),
    buyer_id: formData.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "incomplete",
    completion_percentage: 0,
  });

  const updateField = <K extends keyof Buyer>(field: K, value: Buyer[K]) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const updateFinanceField = <K extends keyof FinanceProfile>(field: K, value: FinanceProfile[K]) => {
    const updated = { ...financeData, [field]: value, buyer_id: formData.id };
    setFinanceData(updated);
    onFinanceChange?.(updated);
  };

  return (
    <div className="space-y-8">
      {/* Identity Section */}
      <FormSection icon={User} title="Identity">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full Name">
            <TextInput
              value={formData.name || ""}
              onChange={(v) => updateField("name", v)}
              placeholder="e.g. Jean Dupont"
            />
          </FormField>
          <FormField label="Buyer Type">
            <SelectInput
              value={formData.buyer_type || "first_time"}
              onChange={(v) => updateField("buyer_type", v as BuyerType)}
              options={buyerTypes}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Phone">
            <TextInput
              value={formData.phone || ""}
              onChange={(v) => updateField("phone", v)}
              placeholder="+33 6 12 34 56 78"
            />
          </FormField>
          <FormField label="Email">
            <TextInput
              value={formData.email || ""}
              onChange={(v) => updateField("email", v)}
              placeholder="jean@example.com"
            />
          </FormField>
        </div>

        <FormField label="Preferred Language">
          <SelectInput
            value={formData.language_preference || "en"}
            onChange={(v) => updateField("language_preference", v as LanguagePreference)}
            options={languages}
          />
        </FormField>
      </FormSection>

      {/* Search Criteria Section */}
      <FormSection icon={MapPin} title="Search Criteria">
        <FormField label="Target Areas">
          <ArrayInput
            values={formData.target_areas || []}
            onChange={(v) => updateField("target_areas", v)}
            placeholder="Add area and press Enter"
          />
        </FormField>

        <FormField label="Property Types">
          <ArrayInput
            values={formData.property_types || []}
            onChange={(v) => updateField("property_types", v)}
            placeholder="e.g. Apartment, House, Villa"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Min Bedrooms">
            <TextInput
              type="number"
              value={formData.min_bedrooms?.toString() || ""}
              onChange={(v) => updateField("min_bedrooms", v ? parseInt(v) : null)}
              placeholder="2"
            />
          </FormField>
          <FormField label="Min Size (m²)">
            <TextInput
              type="number"
              value={(formData as any).min_square_meters?.toString() || ""}
              onChange={(v) => updateField("min_area_m2" as any, v ? parseInt(v) : null)}
              placeholder="80"
            />
          </FormField>
        </div>
      </FormSection>

      {/* Budget Section */}
      <FormSection icon={Euro} title="Budget">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Budget Min (€)">
            <TextInput
              type="number"
              value={formData.budget_min?.toString() || ""}
              onChange={(v) => updateField("budget_min", v ? parseInt(v) : 0)}
              placeholder="500000"
            />
          </FormField>
          <FormField label="Budget Max (€)">
            <TextInput
              type="number"
              value={formData.budget_max?.toString() || ""}
              onChange={(v) => updateField("budget_max", v ? parseInt(v) : 0)}
              placeholder="800000"
            />
          </FormField>
        </div>

        <div className="pt-2 space-y-3">
          <Toggle
            checked={formData.cash_buyer || false}
            onChange={(v) => updateField("cash_buyer", v)}
            label="Cash Buyer"
          />
          <Toggle
            checked={formData.pre_approved || false}
            onChange={(v) => updateField("pre_approved", v)}
            label="Pre-approved for mortgage"
          />
        </div>
      </FormSection>

      {/* Timeline & Seriousness Section */}
      <FormSection icon={Clock} title="Timeline & Profile">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Timeline">
            <SelectInput
              value={formData.timeline || "browsing"}
              onChange={(v) => updateField("timeline", v as ReadinessLevel)}
              options={timelines}
            />
          </FormField>
          <FormField label="Seriousness Level">
            <SelectInput
              value={formData.seriousness || "medium"}
              onChange={(v) => updateField("seriousness", v as SeriousnessLevel)}
              options={seriousnessLevels}
            />
          </FormField>
        </div>

        <FormField label="Current Status">
          <SelectInput
            value={formData.status || "new"}
            onChange={(v) => updateField("status", v as BuyerStatus)}
            options={statuses}
          />
        </FormField>
      </FormSection>

      {/* Finance Section */}
      <FormSection icon={Wallet} title="Finance Profile">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Annual Income (€)">
            <TextInput
              type="number"
              value={financeData.annual_income?.toString() || ""}
              onChange={(v) => updateFinanceField("annual_income", v ? parseInt(v) : null)}
              placeholder="100000"
            />
          </FormField>
          <FormField label="Down Payment Available (€)">
            <TextInput
              type="number"
              value={financeData.available_down_payment?.toString() || ""}
              onChange={(v) => updateFinanceField("available_down_payment", v ? parseInt(v) : null)}
              placeholder="150000"
            />
          </FormField>
        </div>

        <FormField label="Existing Monthly Debt (€)">
          <TextInput
            type="number"
            value={financeData.existing_debt_monthly?.toString() || ""}
            onChange={(v) => updateFinanceField("existing_debt_monthly", v ? parseInt(v) : null)}
            placeholder="2500"
          />
        </FormField>
      </FormSection>

      {/* Notes Section */}
      <FormSection icon={FileText} title="Notes">
        <FormField label="Notes">
          <TextArea
            value={formData.notes || ""}
            onChange={(v) => updateField("notes", v)}
            placeholder="Requirements, preferences, family situation, private notes..."
            rows={4}
          />
        </FormField>
      </FormSection>
    </div>
  );
}
