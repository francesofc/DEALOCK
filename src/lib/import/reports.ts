/**
 * Import Reports
 * 
 * Enhanced CSV report generation for import results with detailed failure tracking.
 */

import type { FailedRow } from "./execution";

export type ReportType = "imported" | "invalid" | "skipped" | "failed" | "all";

/**
 * Validation result row (mirrors the interface in page.tsx)
 */
export interface ReportValidationResult {
  row: number;
  data: Record<string, unknown>;
  errors: string[];
  isValid: boolean;
  isDuplicateInFile: boolean;
  isDuplicateInDb: boolean;
  duplicateField?: 'email' | 'phone' | 'both';
  duplicateOf?: number;
  ignored: boolean;
}

export interface ReportRow {
  row: number;
  data: Record<string, unknown>;
  status: string;
  reason?: string;
  errors?: string[];
}

export interface ImportSummary {
  total: number;
  imported: number;
  invalid: number;
  fileDuplicates: number;
  dbDuplicates: number;
  ignored: number;
  failed: number;
}

/**
 * Generate CSV content from report rows
 */
export function generateReportCSV(rows: ReportRow[]): string {
  if (rows.length === 0) return "";
  
  // Get all unique keys from data
  const allKeys = new Set<string>();
  rows.forEach((r) => {
    Object.keys(r.data).forEach((k) => allKeys.add(k));
  });
  const keys = Array.from(allKeys);
  
  // Build headers
  const headers = ["row_number", ...keys, "status", "reason", "errors"];
  
  // Build rows
  const csvRows = rows.map((r) => {
    const dataValues = keys.map((k) => {
      const val = r.data[k];
      if (val === null || val === undefined) return "";
      // Escape quotes and wrap in quotes if contains comma
      const str = String(val).replace(/"/g, '""');
      if (str.includes(",") || str.includes("\n") || str.includes('"')) {
        return `"${str}"`;
      }
      return str;
    });
    
    const errorStr = r.errors ? r.errors.join("; ") : "";
    
    return [
      r.row,
      ...dataValues,
      r.status,
      r.reason || "",
      errorStr,
    ].join(",");
  });
  
  return [headers.join(","), ...csvRows].join("\n");
}

/**
 * Download CSV as file
 */
export function downloadCSV(csv: string, filename: string): void {
  if (!csv) return;
  
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate imported rows report
 */
export function generateImportedReport(
  validationResults: ReportValidationResult[]
): ReportRow[] {
  return validationResults
    .filter(r => r.isValid && !r.ignored)
    .map(r => ({
      row: r.row,
      data: r.data,
      status: "Imported",
      reason: "Successfully imported",
      errors: [],
    }));
}

/**
 * Generate invalid rows report with detailed error reasons
 */
export function generateInvalidReport(
  validationResults: ReportValidationResult[]
): ReportRow[] {
  return validationResults
    .filter(r => !r.isValid && !r.isDuplicateInFile && !r.isDuplicateInDb && !r.ignored)
    .map(r => ({
      row: r.row,
      data: r.data,
      status: "Invalid",
      reason: formatInvalidReason(r.errors),
      errors: r.errors,
    }));
}

/**
 * Generate skipped rows report (duplicates and ignored)
 */
export function generateSkippedReport(
  validationResults: ReportValidationResult[]
): ReportRow[] {
  return validationResults
    .filter(r => r.isDuplicateInFile || r.isDuplicateInDb || r.ignored)
    .map(r => {
      let status = "Skipped";
      let reason = "";
      
      if (r.ignored) {
        status = "Ignored";
        reason = "Manually ignored by user";
      } else if (r.isDuplicateInFile) {
        status = "Duplicate in File";
        reason = `Duplicate email found in file (row ${r.duplicateOf ? r.duplicateOf + 2 : "unknown"})`;
      } else if (r.isDuplicateInDb) {
        status = "Already in Database";
        const fieldLabel = r.duplicateField === "email" 
          ? "email" 
          : r.duplicateField === "phone" 
            ? "phone" 
            : r.duplicateField === "both" 
              ? "email and phone" 
              : "contact info";
        reason = `Record with this ${fieldLabel} already exists in database`;
      }
      
      return {
        row: r.row,
        data: r.data,
        status,
        reason,
        errors: r.errors,
      };
    });
}

/**
 * Generate failed rows report from execution failures
 */
export function generateFailedReport(failedRows: FailedRow[]): ReportRow[] {
  return failedRows.map(r => ({
    row: r.row,
    data: r.data,
    status: "Failed",
    reason: formatFailedReason(r.error, r.errorType),
    errors: [r.error],
  }));
}

/**
 * Generate comprehensive error report (invalid + skipped + failed)
 */
export function generateErrorReport(
  validationResults: ReportValidationResult[],
  failedRows?: FailedRow[]
): ReportRow[] {
  const invalid = generateInvalidReport(validationResults);
  const skipped = generateSkippedReport(validationResults);
  const failed = failedRows ? generateFailedReport(failedRows) : [];
  
  return [...invalid, ...skipped, ...failed].sort((a, b) => a.row - b.row);
}

/**
 * Format a report by type
 */
export function generateReportByType(
  type: ReportType,
  validationResults: ReportValidationResult[],
  failedRows?: FailedRow[]
): ReportRow[] {
  switch (type) {
    case "imported":
      return generateImportedReport(validationResults);
    case "invalid":
      return generateInvalidReport(validationResults);
    case "skipped":
      return generateSkippedReport(validationResults);
    case "failed":
      return failedRows ? generateFailedReport(failedRows) : [];
    case "all":
    default:
      return generateErrorReport(validationResults, failedRows);
  }
}

/**
 * Format invalid reason from errors
 */
function formatInvalidReason(errors: string[]): string {
  if (errors.length === 0) return "Unknown validation error";
  
  const errorMessages: Record<string, string> = {
    "missing seller name": "Required field 'owner_name' is empty",
    "missing buyer name": "Required field 'name' is empty",
    "missing email and phone": "At least one contact method (email or phone) is required",
    "invalid email format": "Email address is not in valid format (e.g., name@domain.com)",
    "invalid phone": "Phone number appears invalid (should have 6-15 digits)",
    "invalid phone format": "Phone number format is not recognized",
  };
  
  return errors
    .map(e => {
      const lower = e.toLowerCase();
      return errorMessages[lower] || e;
    })
    .join("; ");
}

/**
 * Format failed reason with context
 */
function formatFailedReason(error: string, errorType: string): string {
  const prefixes: Record<string, string> = {
    database_error: "Database error: ",
    network_error: "Network/connection error: ",
    validation_error: "Validation error: ",
    unknown: "Import failed: ",
  };
  
  return prefixes[errorType] + error;
}

/**
 * Generate template CSV for sellers
 */
export function generateSellerTemplate(): string {
  const headers = [
    "owner_name",
    "email",
    "phone",
    "property_type",
    "city",
    "price",
    "notes",
  ];
  
  const sample1 = [
    "John Smith",
    "john@example.com",
    "+1234567890",
    "apartment",
    "Miami",
    "500000",
    "Looking to sell quickly",
  ];
  
  const sample2 = [
    "Jane Doe",
    "jane@example.com",
    "+0987654321",
    "house",
    "Boston",
    "750000",
    "Price negotiable",
  ];
  
  return [headers.join(","), sample1.join(","), sample2.join(",")].join("\n");
}

/**
 * Generate template CSV for buyers
 */
export function generateBuyerTemplate(): string {
  const headers = [
    "name",
    "email",
    "phone",
    "budget_min",
    "budget_max",
    "property_types",
    "target_areas",
    "timeline",
    "seriousness",
    "pre_approved",
    "notes",
  ];
  
  const sample1 = [
    "Mike Buyer",
    "mike@example.com",
    "+1234567890",
    "300000",
    "500000",
    "apartment",
    "Miami",
    "3_months",
    "high",
    "false",
    "First-time buyer",
  ];
  
  const sample2 = [
    "Sarah Investor",
    "sarah@example.com",
    "+0987654321",
    "500000",
    "1000000",
    "house,commercial",
    "Boston,New York",
    "immediate",
    "very_high",
    "true",
    "Cash buyer",
  ];
  
  return [headers.join(","), sample1.join(","), sample2.join(",")].join("\n");
}

/**
 * Format import summary for display
 */
export function formatImportSummary(summary: ImportSummary): string {
  const parts: string[] = [];
  
  if (summary.imported > 0) {
    parts.push(`${summary.imported} imported`);
  }
  if (summary.failed > 0) {
    parts.push(`${summary.failed} failed`);
  }
  if (summary.invalid > 0) {
    parts.push(`${summary.invalid} invalid`);
  }
  if (summary.fileDuplicates > 0) {
    parts.push(`${summary.fileDuplicates} duplicate in file`);
  }
  if (summary.dbDuplicates > 0) {
    parts.push(`${summary.dbDuplicates} already in database`);
  }
  if (summary.ignored > 0) {
    parts.push(`${summary.ignored} ignored`);
  }
  
  if (parts.length === 0) {
    return "No rows processed";
  }
  
  return parts.join(" • ");
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(
  result: ReportValidationResult,
  wasImported?: boolean,
  failedReason?: string
): { label: string; color: string } {
  if (failedReason) {
    return { label: "Failed", color: "red" };
  }
  
  if (wasImported) {
    return { label: "Imported", color: "green" };
  }
  
  if (result.ignored) {
    return { label: "Ignored", color: "gray" };
  }
  
  if (result.isDuplicateInDb) {
    return { label: "In DB", color: "purple" };
  }
  
  if (result.isDuplicateInFile) {
    return { label: "In File", color: "blue" };
  }
  
  if (!result.isValid) {
    return { label: "Invalid", color: "amber" };
  }
  
  return { label: "Ready", color: "green" };
}
