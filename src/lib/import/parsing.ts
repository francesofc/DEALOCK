/**
 * Import Parsing
 * 
 * CSV parsing utilities, column mapping detection, and data extraction.
 */

import type { FieldDefinition } from "./constants";

export interface ColumnMapping {
  csvColumn: string;
  dealockField: string | null;
}

export interface ParsedCSV {
  data: Record<string, string>[];
  headers: string[];
  rowCount: number;
}

/**
 * Normalize column name for matching
 */
export function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[_\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Auto-detect column mapping from CSV headers
 */
export function detectColumnMapping(
  csvColumns: string[],
  fields: FieldDefinition[]
): ColumnMapping[] {
  return csvColumns.map((csvColumn) => {
    const normalizedCsv = normalizeColumnName(csvColumn);
    
    // First try exact match
    let matchedField = fields.find(
      (f) => normalizeColumnName(f.key) === normalizedCsv
    );
    
    // Then try alternate names
    if (!matchedField) {
      matchedField = fields.find((f) =>
        f.alternateNames.some(
          (alt) => normalizeColumnName(alt) === normalizedCsv
        )
      );
    }
    
    // Then try partial match
    if (!matchedField) {
      matchedField = fields.find((f) => {
        const normalizedField = normalizeColumnName(f.label);
        return (
          normalizedCsv.includes(normalizedField) ||
          normalizedField.includes(normalizedCsv)
        );
      });
    }
    
    return {
      csvColumn,
      dealockField: matchedField?.key || null,
    };
  });
}

/**
 * Check if mapping has all required fields
 */
export function hasRequiredMapping(
  mapping: ColumnMapping[],
  fields: FieldDefinition[]
): boolean {
  const mappedFields = mapping
    .filter((m) => m.dealockField)
    .map((m) => m.dealockField!);
  const requiredFields = fields.filter((f) => f.required).map((f) => f.key);
  
  // At minimum need name field
  const hasName = mappedFields.some((f) => 
    f === "owner_name" || f === "name"
  );
  
  // And either email or phone
  const hasContact = mappedFields.some((f) => 
    f === "email" || f === "phone"
  );
  
  return hasName && hasContact;
}

/**
 * Extract mapped data from a CSV row
 */
export function extractRowData(
  row: Record<string, string>,
  mapping: ColumnMapping[]
): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  
  mapping.forEach(({ csvColumn, dealockField }) => {
    if (dealockField && row[csvColumn]) {
      let value: unknown = row[csvColumn].trim();
      
      // Parse numbers
      if (dealockField.includes("budget") || dealockField === "price") {
        const cleaned = (value as string)
          .replace(/[€$£,\s]/g, "")
          .replace(/\./g, "");
        const num = parseInt(cleaned, 10);
        value = isNaN(num) ? 0 : num;
      }
      // Parse arrays
      else if (
        dealockField === "property_type" ||
        dealockField === "property_types"
      ) {
        const mapped =
          PROPERTY_TYPE_MAP[(value as string).toLowerCase()];
        value = mapped || value;
      } else if (dealockField === "status") {
        const mapped =
          SELLER_STATUS_MAP[(value as string).toLowerCase()] ||
          BUYER_STATUS_MAP[(value as string).toLowerCase()];
        value = mapped || value;
      } else if (dealockField === "timeline") {
        const mapped = TIMELINE_MAP[(value as string).toLowerCase()];
        value = mapped || value;
      } else if (dealockField === "seriousness") {
        const mapped = SERIOUSNESS_MAP[(value as string).toLowerCase()];
        value = mapped || value;
      } else if (dealockField === "pre_approved") {
        const val = (value as string).toLowerCase();
        value = val === "true" || val === "yes" || val === "1";
      }
      
      data[dealockField] = value;
    }
  });
  
  return data;
}

// Re-export maps for use in extraction
import {
  PROPERTY_TYPE_MAP,
  SELLER_STATUS_MAP,
  BUYER_STATUS_MAP,
  TIMELINE_MAP,
  SERIOUSNESS_MAP,
} from "./constants";
