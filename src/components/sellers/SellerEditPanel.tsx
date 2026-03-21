"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Building2, 
  MapPin, 
  Euro, 
  Maximize, 
  BedDouble, 
  FileSignature,
  Edit3,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import { Lead, LanguagePreference, LeadStatus, SellerType } from "@/types/database";
import { useTranslation } from "@/lib/i18n";

interface SellerEditPanelProps {
  seller: Lead;
  onChange: (updated: Lead) => void;
}

const languages: { value: LanguagePreference; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "pt", label: "Portuguese" },
  { value: "es", label: "Spanish" },
];

const statuses: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New Lead" },
  { value: "qualified", label: "Qualified" },
  { value: "contacted", label: "Contacted" },
  { value: "replied", label: "Replied" },
  { value: "call_scheduled", label: "Meeting Set" },
  { value: "mandate_proposed", label: "Proposal Out" },
  { value: "mandate_sent", label: "Sent for Signature" },
  { value: "mandate_signed", label: "Signed" },
  { value: "lost", label: "Lost" },
];

const sellerTypes: { value: SellerType; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "investor", label: "Investor" },
  { value: "developer", label: "Developer" },
  { value: "unknown", label: "Unknown" },
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

export function SellerEditPanel({ seller, onChange }: SellerEditPanelProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Lead>(seller);

  // Update local state when seller prop changes
  useEffect(() => {
    setFormData(seller);
  }, [seller]);

  const updateField = <K extends keyof Lead>(field: K, value: Lead[K]) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-8">
      {/* Contact Section */}
      <FormSection title={t.edit.sections.contact} icon={User}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormField label={t.edit.fields.owner_name}>
              <TextInput 
                value={formData.owner_name} 
                onChange={(v) => updateField("owner_name", v)}
                placeholder="Full name"
              />
            </FormField>
          </div>
          <FormField label={t.edit.fields.phone}>
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
          <FormField label={t.edit.fields.email}>
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
          <FormField label={t.edit.fields.language}>
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
          <FormField label={t.edit.fields.seller_type}>
            <SelectInput
              value={formData.seller_type}
              onChange={(v) => updateField("seller_type", v as SellerType)}
              options={sellerTypes}
            />
          </FormField>
        </div>
      </FormSection>

      {/* Property Section */}
      <FormSection title={t.edit.sections.property} icon={Building2}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <FormField label={t.edit.fields.property_type}>
              <TextInput 
                value={formData.property_type} 
                onChange={(v) => updateField("property_type", v)}
                placeholder="e.g. Apartment, House, Villa"
              />
            </FormField>
          </div>
          <FormField label={t.edit.fields.city}>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={formData.city || ""}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="City"
                className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
              />
            </div>
          </FormField>
          <FormField label={t.edit.fields.neighborhood}>
            <TextInput 
              value={formData.neighborhood} 
              onChange={(v) => updateField("neighborhood", v)}
              placeholder="Neighborhood / Area"
            />
          </FormField>
          <FormField label={t.edit.fields.area}>
            <div className="relative">
              <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="number"
                value={formData.area_m2 || ""}
                onChange={(e) => updateField("area_m2", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="0"
                className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
              />
            </div>
          </FormField>
          <FormField label={t.edit.fields.bedrooms}>
            <div className="relative">
              <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="number"
                value={formData.bedrooms || ""}
                onChange={(e) => updateField("bedrooms", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="0"
                className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
              />
            </div>
          </FormField>
          <div className="col-span-2">
            <FormField label={t.edit.fields.price}>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => updateField("price", e.target.value ? parseInt(e.target.value) : 0)}
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
                />
              </div>
            </FormField>
          </div>
        </div>
      </FormSection>

      {/* Mandate Context Section */}
      <FormSection title={t.edit.sections.mandate_context} icon={FileSignature}>
        <div className="space-y-4">
          <FormField label={t.edit.fields.status}>
            <SelectInput
              value={formData.status}
              onChange={(v) => updateField("status", v as LeadStatus)}
              options={statuses}
            />
          </FormField>
          <FormField label={t.edit.fields.source} hint={t.edit.hints.source}>
            <TextInput 
              value={formData.source} 
              onChange={(v) => updateField("source", v)}
              placeholder="e.g. Website, Referral, Cold Outreach"
            />
          </FormField>
          <FormField label={t.edit.fields.listing_url} hint={t.edit.hints.listing_url}>
            <TextInput 
              value={formData.listing_url || ""} 
              onChange={(v) => updateField("listing_url", v || null)}
              placeholder="https://..."
            />
          </FormField>
        </div>
      </FormSection>

      {/* Notes Section */}
      <FormSection title={t.edit.sections.notes} icon={Edit3}>
        <div className="space-y-4">
          <FormField label={t.edit.fields.seller_profile} hint={t.edit.hints.seller_profile}>
            <TextArea 
              value={formData.seller_profile} 
              onChange={(v) => updateField("seller_profile", v || null)}
              placeholder="Describe the seller's situation, motivation, personality..."
              rows={4}
            />
          </FormField>
          <FormField label={t.edit.fields.internal_notes} hint={t.edit.hints.internal_notes}>
            <TextArea 
              value={formData.notes} 
              onChange={(v) => updateField("notes", v || null)}
              placeholder="Add any relevant notes, reminders, or context..."
              rows={3}
            />
          </FormField>
        </div>
      </FormSection>
    </div>
  );
}
