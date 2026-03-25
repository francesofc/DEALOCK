/**
 * Import Transformation
 * 
 * Transform validated CSV data into entity format for database insertion.
 */

import {
  PROPERTY_TYPE_MAP,
  SELLER_STATUS_MAP,
  BUYER_STATUS_MAP,
  TIMELINE_MAP,
  SERIOUSNESS_MAP,
} from "./constants";

export interface TransformedSeller {
  owner_name: string;
  email: string;
  phone: string;
  property_type: string;
  city: string;
  neighborhood: string;
  price: number;
  notes: string | null;
  status: string;
  source: string;
  listing_url: null;
  whatsapp_status: string;
  seller_type: string;
  language_preference: string;
  area_m2: null;
  bedrooms: null;
}

export interface TransformedBuyer {
  name: string;
  email: string | null;
  phone: string | null;
  budget_min: number;
  budget_max: number;
  property_types: string[];
  target_areas: string[];
  timeline: string;
  seriousness: string;
  pre_approved: boolean;
  notes: string | null;
  status: string;
}

/**
 * Transform raw data to seller format
 */
export function transformToSeller(
  data: Record<string, unknown>
): TransformedSeller {
  const propertyType = data.property_type as string;
  const status = data.status as string;
  
  return {
    owner_name: ((data.owner_name as string) || "Unknown").trim(),
    email: ((data.email as string) || "").trim(),
    phone: ((data.phone as string) || "").trim(),
    property_type:
      PROPERTY_TYPE_MAP[propertyType?.toLowerCase()] ||
      propertyType ||
      "apartment",
    city: ((data.city as string) || "").trim(),
    neighborhood: "",
    price: parsePrice(data.price as string) || 0,
    notes: data.notes ? String(data.notes) : null,
    status: SELLER_STATUS_MAP[status?.toLowerCase()] || status || "new",
    source: "csv_import",
    listing_url: null,
    whatsapp_status: "not_sent",
    seller_type: "owner",
    language_preference: "en",
    area_m2: null,
    bedrooms: null,
  };
}

/**
 * Transform raw data to buyer format
 */
export function transformToBuyer(
  data: Record<string, unknown>
): TransformedBuyer {
  const timeline = data.timeline as string;
  const seriousness = data.seriousness as string;
  const status = data.status as string;
  
  return {
    name: ((data.name as string) || "Unknown").trim(),
    email: data.email ? String(data.email).trim() : null,
    phone: data.phone ? String(data.phone).trim() : null,
    budget_min: parsePrice(data.budget_min as string) || 0,
    budget_max: parsePrice(data.budget_max as string) || 0,
    property_types: data.property_types
      ? [String(data.property_types)]
      : [],
    target_areas: data.target_areas
      ? [String(data.target_areas)]
      : [],
    timeline: TIMELINE_MAP[timeline?.toLowerCase()] || timeline || "browsing",
    seriousness:
      SERIOUSNESS_MAP[seriousness?.toLowerCase()] || seriousness || "low",
    pre_approved: parseBoolean(data.pre_approved),
    notes: data.notes ? String(data.notes) : null,
    status: BUYER_STATUS_MAP[status?.toLowerCase()] || status || "new",
  };
}

/**
 * Parse price string to number
 */
function parsePrice(priceStr: string | number | undefined): number {
  if (typeof priceStr === "number") return priceStr;
  if (!priceStr) return 0;
  
  const cleaned = String(priceStr)
    .replace(/[€$£,\s]/g, "")
    .replace(/\./g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Parse various boolean representations
 */
function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.toLowerCase().trim();
    return lower === "true" || lower === "yes" || lower === "1";
  }
  if (typeof value === "number") return value === 1;
  return false;
}
