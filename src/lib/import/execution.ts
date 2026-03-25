/**
 * Import Execution
 * 
 * Resilient import execution with per-row error handling and detailed failure reporting.
 */

import { createClient } from "@/lib/supabase/client";
import { createLead } from "@/lib/data/leads";
import { transformToSeller, transformToBuyer } from "./transformation";

export type EntityType = "seller" | "buyer";

export interface ImportExecutionResult {
  success: boolean;
  imported: number;
  failed: number;
  failedRows: FailedRow[];
  durationMs: number;
}

export interface FailedRow {
  row: number;
  data: Record<string, unknown>;
  error: string;
  errorType: "database_error" | "validation_error" | "network_error" | "unknown";
}

export interface ImportProgress {
  processed: number;
  total: number;
  imported: number;
  failed: number;
}

export type ProgressCallback = (progress: ImportProgress) => void;

/**
 * Row data ready for import (passed from the import page)
 */
export interface ImportRow {
  row: number;
  data: Record<string, unknown>;
  isValid: boolean;
  isDuplicateInFile: boolean;
  isDuplicateInDb: boolean;
  ignored: boolean;
  errors: string[];
}

/**
 * Execute import with resilient error handling
 * Each row is processed independently - one failure doesn't stop the import
 */
export async function executeImport(
  rows: ImportRow[],
  entityType: EntityType,
  onProgress?: ProgressCallback
): Promise<ImportExecutionResult> {
  const startTime = Date.now();
  const failedRows: FailedRow[] = [];
  let imported = 0;
  let processed = 0;
  
  const validRows = rows.filter(r => r.isValid && !r.ignored);
  const total = validRows.length;
  
  // Process rows sequentially to avoid overwhelming the database
  for (const row of validRows) {
    processed++;
    
    try {
      const success = await importRow(row, entityType);
      
      if (success) {
        imported++;
      } else {
        failedRows.push({
          row: row.row,
          data: row.data,
          error: "Unknown error during import",
          errorType: "unknown",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorType = categorizeError(errorMessage);
      
      failedRows.push({
        row: row.row,
        data: row.data,
        error: errorMessage,
        errorType,
      });
    }
    
    // Report progress
    if (onProgress) {
      onProgress({
        processed,
        total,
        imported,
        failed: failedRows.length,
      });
    }
  }
  
  return {
    success: failedRows.length === 0,
    imported,
    failed: failedRows.length,
    failedRows,
    durationMs: Date.now() - startTime,
  };
}

/**
 * Import a single row based on entity type
 */
async function importRow(
  row: ImportRow,
  entityType: EntityType
): Promise<boolean> {
  if (entityType === "seller") {
    return await importSeller(row);
  } else {
    return await importBuyer(row);
  }
}

/**
 * Import a seller lead
 */
async function importSeller(row: ImportRow): Promise<boolean> {
  const transformed = transformToSeller(row.data);
  
  // Double-check required fields before saving
  if (!transformed.owner_name || transformed.owner_name === "Unknown") {
    throw new Error("Seller name is required");
  }
  
  if (!transformed.email && !transformed.phone) {
    throw new Error("Either email or phone is required");
  }
  
  await createLead(transformed as any);
  return true;
}

/**
 * Import a buyer
 */
async function importBuyer(row: ImportRow): Promise<boolean> {
  const transformed = transformToBuyer(row.data);
  const supabase = createClient();
  
  // Double-check required fields before saving
  if (!transformed.name || transformed.name === "Unknown") {
    throw new Error("Buyer name is required");
  }
  
  if (!transformed.email && !transformed.phone) {
    throw new Error("Either email or phone is required");
  }
  
  const { error } = await supabase.from("buyers").insert(transformed as any);
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  return true;
}

/**
 * Categorize error messages for better reporting
 */
function categorizeError(errorMessage: string): FailedRow["errorType"] {
  const lower = errorMessage.toLowerCase();
  
  if (lower.includes("unique constraint") || 
      lower.includes("duplicate key") ||
      lower.includes("already exists")) {
    return "database_error";
  }
  
  if (lower.includes("network") || 
      lower.includes("timeout") ||
      lower.includes("connection")) {
    return "network_error";
  }
  
  if (lower.includes("required") || 
      lower.includes("invalid") ||
      lower.includes("constraint")) {
    return "validation_error";
  }
  
  return "unknown";
}

/**
 * Determine import status based on results
 */
export function determineImportStatus(
  totalRows: number,
  imported: number,
  failed: number
): "completed" | "partial" | "failed" {
  if (failed === 0 && imported > 0) {
    return "completed";
  }
  
  if (imported > 0 && failed > 0) {
    return "partial";
  }
  
  if (imported === 0 && failed > 0) {
    return "failed";
  }
  
  // No rows to import (all filtered/ignored)
  return "completed";
}

/**
 * Format execution results for display
 */
export function formatExecutionResult(result: ImportExecutionResult): string {
  const parts: string[] = [];
  
  if (result.imported > 0) {
    parts.push(`${result.imported} imported`);
  }
  
  if (result.failed > 0) {
    parts.push(`${result.failed} failed`);
  }
  
  if (parts.length === 0) {
    return "No rows processed";
  }
  
  return parts.join(" • ");
}

/**
 * Check if a row can be retried based on error type
 */
export function isRetryableError(errorType: FailedRow["errorType"]): boolean {
  return errorType === "network_error" || errorType === "unknown";
}
