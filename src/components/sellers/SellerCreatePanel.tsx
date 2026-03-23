"use client";

import { useState } from "react";
import { Lead, LeadStatus, SellerType, LanguagePreference } from "@/types/database";
import { useTranslation } from "@/lib/i18n";
import { User, Building2, MapPin, Phone, Mail, Calendar, FileText, Tag } from "lucide-react";

interface SellerCreatePanelProps {
  onChange: (data: Partial<Lead>) => void;
}

// Helper components (duplicated from SellerEditPanel)
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
  type = "text",
  icon
}: { 
  value: string | number; 
  onChange: (val: string) => void; 
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all ${icon ? 'pl-10 pr-3 py-2.5' : 'px-3 py-2.5'}`}
      />
    </div>
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

// Options
const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "contacted", label: "Contacted" },
  { value: "replied", label: "Replied" },
  { value: "call_scheduled", label: "Meeting Scheduled" },
  { value: "mandate_proposed", label: "Mandate Proposed" },
  { value: "mandate_sent", label: "Mandate Sent" },
  { value: "mandate_signed", label: "Mandate Signed" },
  { value: "lost", label: "Lost" },
];

const sellerTypeOptions: { value: SellerType; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "investor", label: "Investor" },
  { value: "developer", label: "Developer" },
  { value: "unknown", label: "Unknown" },
];

const languageOptions: { value: LanguagePreference; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "pt", label: "Portuguese" },
  { value: "es", label: "Spanish" },
];

const propertyTypeOptions = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "penthouse", label: "Penthouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

export function SellerCreatePanel({ onChange }: SellerCreatePanelProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<Lead>>({
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "new" as LeadStatus,
    seller_type: "owner" as SellerType,
    language_preference: "en" as LanguagePreference,
    whatsapp_status: "not_sent",
    source: "",
  });

  const updateField = <K extends keyof Lead>(field: K, value: Lead[K]) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-8">
      {/* Identity Section */}
      <FormSection icon={User} title="Identity">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full Name">
            <TextInput
              value={formData.owner_name || ""}
              onChange={(v) => updateField("owner_name", v)}
              placeholder="e.g. Marie Dubois"
            />
          </FormField>
          <FormField label="Seller Type">
            <SelectInput
              value={formData.seller_type || "owner"}
              onChange={(v) => updateField("seller_type", v as SellerType)}
              options={sellerTypeOptions}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Phone">
            <TextInput
              value={formData.phone || ""}
              onChange={(v) => updateField("phone", v)}
              placeholder="+33 6 12 34 56 78"
              icon={<Phone className="w-4 h-4 text-white/30" />}
            />
          </FormField>
          <FormField label="Email">
            <TextInput
              value={formData.email || ""}
              onChange={(v) => updateField("email", v)}
              placeholder="marie@example.com"
              icon={<Mail className="w-4 h-4 text-white/30" />}
            />
          </FormField>
        </div>

        <FormField label="Preferred Language">
          <SelectInput
            value={formData.language_preference || "en"}
            onChange={(v) => updateField("language_preference", v as LanguagePreference)}
            options={languageOptions}
          />
        </FormField>
      </FormSection>

      {/* Property Section */}
      <FormSection icon={Building2} title="Property">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Property Type">
            <SelectInput
              value={formData.property_type || "apartment"}
              onChange={(v) => updateField("property_type", v)}
              options={propertyTypeOptions}
            />
          </FormField>
          <FormField label="Price (€)">
            <TextInput
              type="number"
              value={formData.price?.toString() || ""}
              onChange={(v) => updateField("price", v ? parseInt(v) : 0)}
              placeholder="850000"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="City">
            <TextInput
              value={formData.city || ""}
              onChange={(v) => updateField("city", v)}
              placeholder="e.g. Lisbon"
              icon={<MapPin className="w-4 h-4 text-white/30" />}
            />
          </FormField>
          <FormField label="Neighborhood">
            <TextInput
              value={formData.neighborhood || ""}
              onChange={(v) => updateField("neighborhood", v)}
              placeholder="e.g. Príncipe Real"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Bedrooms">
            <TextInput
              type="number"
              value={formData.bedrooms?.toString() || ""}
              onChange={(v) => updateField("bedrooms", v ? parseInt(v) : null)}
              placeholder="3"
            />
          </FormField>
          <FormField label="Size (m²)">
            <TextInput
              type="number"
              value={formData.area_m2?.toString() || ""}
              onChange={(v) => updateField("area_m2", v ? parseInt(v) : null)}
              placeholder="120"
            />
          </FormField>
        </div>
      </FormSection>

      {/* Situation Section */}
      <FormSection icon={Calendar} title="Situation">
        <FormField label="Seller Profile / Situation">
          <TextArea
            value={formData.seller_profile || ""}
            onChange={(v) => updateField("seller_profile", v || null)}
            placeholder="Why are they selling? Timeline? Any special circumstances?"
            rows={3}
          />
        </FormField>

        <FormField label="Source">
          <TextInput
            value={formData.source || ""}
            onChange={(v) => updateField("source", v)}
            placeholder="e.g. Referral, Website, Cold outreach"
            icon={<Tag className="w-4 h-4 text-white/30" />}
          />
        </FormField>
      </FormSection>

      {/* Mandate Context Section */}
      <FormSection icon={FileText} title="Mandate Context">
        <FormField label="Current Status">
          <SelectInput
            value={formData.status || "new"}
            onChange={(v) => updateField("status", v as LeadStatus)}
            options={statusOptions}
          />
        </FormField>
      </FormSection>

      {/* Notes Section */}
      <FormSection icon={FileText} title="Notes">
        <FormField label="Internal Notes">
          <TextArea
            value={formData.notes || ""}
            onChange={(v) => updateField("notes", v)}
            placeholder="Any additional information..."
            rows={4}
          />
        </FormField>
      </FormSection>
    </div>
  );
}
