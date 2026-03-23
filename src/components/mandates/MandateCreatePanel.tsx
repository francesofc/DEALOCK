"use client";

import { useState, useEffect } from "react";
import { Mandate, MandateStatus, SigningMode } from "@/types/database";
import { FileSignature, Check, Building2, MapPin, Euro, BedDouble, Maximize, Lock, Unlock, Building } from "lucide-react";

interface MandateCreatePanelProps {
  sellerId: string;
  sellerData: {
    owner_name?: string;
    price?: number;
    city?: string;
    neighborhood?: string;
    property_type?: string;
    area_m2?: number;
    bedrooms?: number;
    seller_profile?: string | null;
  };
  onChange: (data: Partial<Mandate>) => void;
}

const propertyTypeOptions: { value: string; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
];

const statusOptions: { value: MandateStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "text-white/60" },
  { value: "sent", label: "Pending Signature", color: "text-amber-400" },
  { value: "signed", label: "Active", color: "text-emerald-400" },
];

const signingModeOptions: { value: SigningMode; label: string }[] = [
  { value: "physical", label: "In-Person" },
  { value: "electronic", label: "Electronic" },
  { value: "remote", label: "Remote" },
];

export function MandateCreatePanel({ sellerId, sellerData, onChange }: MandateCreatePanelProps) {
  const [formData, setFormData] = useState<Partial<Mandate>>({
    lead_id: sellerId,
    title: sellerData.owner_name ? `${sellerData.owner_name} - ${sellerData.city || 'Property'}` : "",
    asking_price: sellerData.price || 0,
    city: sellerData.city || "",
    neighborhood: sellerData.neighborhood || "",
    property_type: sellerData.property_type || "apartment",
    agency_name: "Dealock Agency",
    signing_mode: "electronic",
    area_m2: sellerData.area_m2 || 0,
    bedrooms: sellerData.bedrooms || 0,
    exclusive: true,
    status: "draft",
    notes: "",
  });

  useEffect(() => {
    onChange(formData);
  }, []);

  const updateField = <K extends keyof Mandate>(field: K, value: Mandate[K]) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const parsePrice = (value: string) => {
    return parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header with prefilled indicator */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <FileSignature className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="font-medium">Create Mandate</p>
            <p className="text-sm text-white/50">Pre-filled from seller data</p>
          </div>
        </div>
        
        {/* Seller Context */}
        {sellerData.seller_profile && (
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Seller Context</p>
            <p className="text-sm text-white/70 line-clamp-3">{sellerData.seller_profile}</p>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 uppercase tracking-wider">Title</label>
        <input
          type="text"
          value={formData.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="e.g., Luxury Villa - Lisbon"
          className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
        />
      </div>

      {/* Price */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1">
          <Euro className="w-3 h-3" />
          Asking Price
        </label>
        <input
          type="text"
          value={formData.asking_price ? formatPrice(formData.asking_price) : ""}
          onChange={(e) => updateField("asking_price", parsePrice(e.target.value))}
          placeholder="0"
          className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
        />
        {formData.asking_price !== sellerData.price && sellerData.price && (
          <p className="text-xs text-amber-400/70">
            Original seller price: €{formatPrice(sellerData.price)}
          </p>
        )}
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            City
          </label>
          <input
            type="text"
            value={formData.city || ""}
            onChange={(e) => updateField("city", e.target.value)}
            placeholder="City"
            className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 uppercase tracking-wider">Neighborhood</label>
          <input
            type="text"
            value={formData.neighborhood || ""}
            onChange={(e) => updateField("neighborhood", e.target.value)}
            placeholder="Neighborhood"
            className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1">
          <Building2 className="w-3 h-3" />
          Property Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {propertyTypeOptions.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => updateField("property_type", type.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                formData.property_type === type.value
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/[0.03] text-white/60 border border-white/[0.06] hover:bg-white/[0.06]"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Specs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1">
            <Maximize className="w-3 h-3" />
            Area (m²)
          </label>
          <input
            type="number"
            value={formData.area_m2 || ""}
            onChange={(e) => updateField("area_m2", parseInt(e.target.value) || 0)}
            placeholder="0"
            className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1">
            <BedDouble className="w-3 h-3" />
            Bedrooms
          </label>
          <input
            type="number"
            value={formData.bedrooms || ""}
            onChange={(e) => updateField("bedrooms", parseInt(e.target.value) || 0)}
            placeholder="0"
            className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>
      </div>

      {/* Exclusivity Toggle */}
      <div className="space-y-3">
        <label className="text-xs text-white/50 uppercase tracking-wider">Exclusivity</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateField("exclusive", true)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
              formData.exclusive
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              formData.exclusive ? "bg-emerald-500/20" : "bg-white/[0.06]"
            }`}>
              <Lock className={`w-5 h-5 ${formData.exclusive ? "text-emerald-400" : "text-white/40"}`} />
            </div>
            <div className="text-left">
              <p className={`font-medium ${formData.exclusive ? "text-emerald-400" : ""}`}>Exclusive</p>
              <p className="text-xs text-white/50">Sole representation</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => updateField("exclusive", false)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
              !formData.exclusive
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06]"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              !formData.exclusive ? "bg-amber-500/20" : "bg-white/[0.06]"
            }`}>
              <Unlock className={`w-5 h-5 ${!formData.exclusive ? "text-amber-400" : "text-white/40"}`} />
            </div>
            <div className="text-left">
              <p className={`font-medium ${!formData.exclusive ? "text-amber-400" : ""}`}>Non-Exclusive</p>
              <p className="text-xs text-white/50">Shared representation</p>
            </div>
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <label className="text-xs text-white/50 uppercase tracking-wider">Status</label>
        <div className="flex gap-2">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => updateField("status", status.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                formData.status === status.value
                  ? "bg-white/10 border border-white/20"
                  : "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
              }`}
            >
              {formData.status === status.value && <Check className="w-3.5 h-3.5" />}
              <span className={formData.status === status.value ? status.color : "text-white/60"}>
                {status.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Agency Name */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1">
          <Building className="w-3 h-3" />
          Agency Name
        </label>
        <input
          type="text"
          value={formData.agency_name ?? "Dealock Agency"}
          onChange={(e) => updateField("agency_name", e.target.value)}
          placeholder="Your agency name"
          className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20"
        />
      </div>

      {/* Signing Mode */}
      <div className="space-y-2">
        <label className="text-xs text-white/50 uppercase tracking-wider">Signing Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {signingModeOptions.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => updateField("signing_mode", mode.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                formData.signing_mode === mode.value
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/[0.03] text-white/60 border border-white/[0.06] hover:bg-white/[0.06]"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 uppercase tracking-wider">Notes</label>
        <textarea
          value={formData.notes ?? ""}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Additional terms, special conditions..."
          rows={3}
          className="w-full px-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-white/20"
        />
      </div>
    </div>
  );
}
