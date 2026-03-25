/**
 * Import Constants
 * 
 * Field definitions, mappings, and configuration for CSV import.
 */

export interface FieldDefinition {
  key: string;
  label: string;
  required: boolean;
  alternateNames: string[];
}

export const SELLER_FIELDS: FieldDefinition[] = [
  { key: "owner_name", label: "Seller/Owner Name", required: true, alternateNames: ["name", "contact", "person", "full_name", "contact person", "company_name", "company", "business", "owner", "seller"] },
  { key: "email", label: "Email", required: false, alternateNames: ["e-mail", "email_address", "mail", "e_mail"] },
  { key: "phone", label: "Phone", required: false, alternateNames: ["telephone", "tel", "mobile", "cell", "phone_number"] },
  { key: "property_type", label: "Property Type", required: false, alternateNames: ["type", "property", "asset_type", "asset"] },
  { key: "city", label: "City/Location", required: false, alternateNames: ["city", "location", "address", "market", "area", "neighborhood"] },
  { key: "price", label: "Asking Price", required: false, alternateNames: ["asking_price", "price", "value", "amount", "price_eur", "asking price"] },
  { key: "notes", label: "Notes", required: false, alternateNames: ["description", "note", "comments", "remarks", "details"] },
  { key: "status", label: "Status", required: false, alternateNames: ["stage", "lead_status", "current_status"] },
];

export const BUYER_FIELDS: FieldDefinition[] = [
  { key: "name", label: "Buyer Name", required: true, alternateNames: ["buyer", "contact", "person", "full_name", "contact_name", "client"] },
  { key: "email", label: "Email", required: false, alternateNames: ["e-mail", "email_address", "mail", "e_mail"] },
  { key: "phone", label: "Phone", required: false, alternateNames: ["telephone", "tel", "mobile", "cell", "phone_number"] },
  { key: "budget_min", label: "Min Budget", required: false, alternateNames: ["min_budget", "budget_from", "price_min", "min price"] },
  { key: "budget_max", label: "Max Budget", required: false, alternateNames: ["max_budget", "budget_to", "price_max", "budget", "max price"] },
  { key: "property_types", label: "Property Types", required: false, alternateNames: ["property_type", "types", "looking_for", "property types"] },
  { key: "target_areas", label: "Target Areas", required: false, alternateNames: ["areas", "locations", "cities", "target_areas", "markets", "target areas"] },
  { key: "timeline", label: "Timeline", required: false, alternateNames: ["purchase_timeline", "when", "purchase timeline"] },
  { key: "seriousness", label: "Seriousness", required: false, alternateNames: ["buyer_type", "commitment", "buyer type"] },
  { key: "pre_approved", label: "Pre-approved", required: false, alternateNames: ["preapproved", "financing", "mortgage", "pre-approved"] },
  { key: "notes", label: "Notes", required: false, alternateNames: ["description", "note", "comments", "remarks", "criteria"] },
  { key: "status", label: "Status", required: false, alternateNames: ["stage", "buyer_status", "current_status"] },
];

export const PROPERTY_TYPE_MAP: Record<string, string> = {
  "apartment": "apartment",
  "apt": "apartment",
  "flat": "apartment",
  "house": "house",
  "villa": "house",
  "commercial": "commercial",
  "office": "commercial",
  "retail": "commercial",
  "land": "land",
  "plot": "land",
  "industrial": "industrial",
  "warehouse": "industrial",
};

export const SELLER_STATUS_MAP: Record<string, string> = {
  "new": "new",
  "qualified": "qualified",
  "contacted": "contacted",
  "replied": "replied",
  "call_scheduled": "call_scheduled",
  "mandate_proposed": "mandate_proposed",
  "mandate_sent": "mandate_sent",
  "mandate_signed": "mandate_signed",
  "lost": "lost",
};

export const BUYER_STATUS_MAP: Record<string, string> = {
  "new": "new",
  "contacted": "contacted",
  "qualified": "qualified",
  "viewing_scheduled": "viewing_scheduled",
  "offer_pending": "offer_pending",
  "closed": "closed",
  "inactive": "inactive",
};

export const TIMELINE_MAP: Record<string, string> = {
  "browsing": "browsing",
  "3_months": "3_months",
  "1_month": "1_month",
  "immediate": "immediate",
};

export const SERIOUSNESS_MAP: Record<string, string> = {
  "low": "low",
  "medium": "medium",
  "high": "high",
  "very_high": "very_high",
};
