"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Home, 
  MapPin, 
  Euro, 
  Maximize, 
  BedDouble, 
  Clock,
  Edit3,
  Phone,
  Mail,
  Globe,
  Wallet,
  ShieldCheck,
  TrendingUp,
  CheckCircle,
  Plus,
  X
} from "lucide-react";
import { Buyer, LanguagePreference, BuyerStatus, BuyerType, ReadinessLevel, SeriousnessLevel, FinanceProfile } from "@/types/database";
import { useTranslation } from "@/lib/i18n";

interface BuyerEditPanelProps {
  buyer: Buyer;
  finance: FinanceProfile | null;
  onChange: (updated: Buyer) => void;
  onFinanceChange?: (updated: FinanceProfile) => void;
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
          className="px-3 py-2 bg-white/[0.06] hover:bg-white/[0.10] rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((value, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/[0.06] rounded-md text-sm"
          >
            {value}
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-white/40 hover:text-white/70"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export function BuyerEditPanel({ buyer, finance, onChange, onFinanceChange }: BuyerEditPanelProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Buyer>(buyer);
  const [financeData, setFinanceData] = useState<FinanceProfile | null>(finance);

  useEffect(() => {
    setFormData(buyer);
  }, [buyer]);

  useEffect(() => {
    setFinanceData(finance);
  }, [finance]);

  const updateField = <K extends keyof Buyer>(field: K, value: Buyer[K]) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const updateFinanceField = <K extends keyof FinanceProfile>(field: K, value: FinanceProfile[K]) => {
    if (!financeData) return;
    const updated = { ...financeData, [field]: value };
    setFinanceData(updated);
    onFinanceChange?.(updated);
  };

  return (
    <div className="space-y-8">
      {/* Contact Section */}
      <FormSection title={t.edit.sections.contact} icon={User}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormField label="Full Name">
              <TextInput 
                value={formData.name} 
                onChange={(v) => updateField("name", v)}
                placeholder="Full name"
              />
            </FormField>
          </div>
          <FormField label="Phone">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="tel"
                value={formData.phone || ""}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+33 6 12 34 56 78"
                className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
              />
            </div>
          </FormField>
          <FormField label="Email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="email@example.com"
                className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
              />
            </div>
          </FormField>
          <FormField label="Language">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <select
                value={formData.language_preference}
                onChange={(e) => updateField("language_preference", e.target.value as LanguagePreference)}
                className="w-full pl-10 pr-10 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value} className="bg-[#0d0d0f]">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </FormField>
          <FormField label="Status">
            <SelectInput
              value={formData.status}
              onChange={(v) => updateField("status", v as BuyerStatus)}
              options={statuses}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Search Criteria Section */}
      <FormSection title={t.edit.sections.search_criteria} icon={Home}>
        <div className="space-y-4">
          <FormField label="Property Types" hint="Add all property types they're interested in">
            <ArrayInput
              values={formData.property_types}
              onChange={(v) => updateField("property_types", v)}
              placeholder="e.g. Apartment, House, Villa"
            />
          </FormField>
          <FormField label="Target Areas" hint="Neighborhoods or cities they're targeting">
            <ArrayInput
              values={formData.target_areas}
              onChange={(v) => updateField("target_areas", v)}
              placeholder="e.g. Downtown, Marais, Chelsea"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Min Bedrooms">
              <div className="relative">
                <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="number"
                  value={formData.min_bedrooms || ""}
                  onChange={(e) => updateField("min_bedrooms", e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
                />
              </div>
            </FormField>
            <FormField label="Min Area (m²)">
              <div className="relative">
                <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="number"
                  value={formData.min_area_m2 || ""}
                  onChange={(e) => updateField("min_area_m2", e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
                />
              </div>
            </FormField>
          </div>
        </div>
      </FormSection>

      {/* Budget Section */}
      <FormSection title={t.edit.sections.budget} icon={Wallet}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Minimum Budget">
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="number"
                  value={formData.budget_min || ""}
                  onChange={(e) => updateField("budget_min", e.target.value ? parseInt(e.target.value) : 0)}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
                />
              </div>
            </FormField>
            <FormField label="Maximum Budget">
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="number"
                  value={formData.budget_max || ""}
                  onChange={(e) => updateField("budget_max", e.target.value ? parseInt(e.target.value) : 0)}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
                />
              </div>
            </FormField>
          </div>
          <div className="pt-2 space-y-3">
            <Toggle
              checked={formData.cash_buyer}
              onChange={(v) => updateField("cash_buyer", v)}
              label="Cash buyer (no financing needed)"
            />
            <Toggle
              checked={formData.pre_approved}
              onChange={(v) => updateField("pre_approved", v)}
              label="Pre-approved for mortgage"
            />
          </div>
        </div>
      </FormSection>

      {/* Timeline & Seriousness Section */}
      <FormSection title={t.edit.sections.timeline} icon={TrendingUp}>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Timeline">
            <SelectInput
              value={formData.timeline}
              onChange={(v) => updateField("timeline", v as ReadinessLevel)}
              options={timelines}
            />
          </FormField>
          <FormField label="Seriousness Level">
            <SelectInput
              value={formData.seriousness}
              onChange={(v) => updateField("seriousness", v as SeriousnessLevel)}
              options={seriousnessLevels}
            />
          </FormField>
          <FormField label="Buyer Type">
            <SelectInput
              value={formData.buyer_type}
              onChange={(v) => updateField("buyer_type", v as BuyerType)}
              options={buyerTypes}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Finance Status Section */}
      {financeData && (
        <FormSection title={t.edit.sections.finance} icon={ShieldCheck}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Annual Income">
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="number"
                    value={financeData.annual_income || ""}
                    onChange={(e) => updateFinanceField("annual_income", e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
                  />
                </div>
              </FormField>
              <FormField label="Available Down Payment">
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="number"
                    value={financeData.available_down_payment || ""}
                    onChange={(e) => updateFinanceField("available_down_payment", e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="0"
                    className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
                  />
                </div>
              </FormField>
            </div>
            <FormField label="Existing Monthly Debt">
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="number"
                  value={financeData.existing_debt_monthly || ""}
                  onChange={(e) => updateFinanceField("existing_debt_monthly", e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
                />
              </div>
            </FormField>
          </div>
        </FormSection>
      )}

      {/* Notes Section */}
      <FormSection title={t.edit.sections.notes} icon={Edit3}>
        <div className="space-y-4">
          <FormField label="Internal Notes" hint="Private notes, blockers, or special requirements">
            <TextArea 
              value={formData.notes} 
              onChange={(v) => updateField("notes", v || null)}
              placeholder="Add any relevant notes about this buyer..."
              rows={4}
            />
          </FormField>
        </div>
      </FormSection>
    </div>
  );
}
