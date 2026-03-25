/**
 * Import Sessions Data Layer
 * 
 * Functions for persisting and retrieving import session history.
 */

import { createClient } from "@/lib/supabase/client";

export type ImportStatus = "completed" | "partial" | "failed";

export interface ImportSession {
  id: string;
  created_at: string;
  workspace_id: string | null;  // Phase 7: Workspace isolation
  entity_type: "seller" | "buyer";
  file_name: string;
  total_rows: number;
  imported_count: number;
  invalid_count: number;
  file_duplicate_count: number;
  db_duplicate_count: number;
  ignored_count: number;
  failed_count: number;
  status: ImportStatus;
  error_message?: string;
  duration_ms?: number;
}

export interface CreateImportSessionInput {
  entity_type: "seller" | "buyer";
  file_name: string;
  workspace_id?: string | null;  // Phase 7: Workspace isolation (optional)
  total_rows: number;
  imported_count: number;
  invalid_count: number;
  file_duplicate_count: number;
  db_duplicate_count: number;
  ignored_count: number;
  failed_count?: number;
  status: ImportStatus;
  error_message?: string;
  duration_ms?: number;
}

/**
 * Create a new import session record
 */
export async function createImportSession(
  input: CreateImportSessionInput
): Promise<ImportSession | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("import_sessions")
    .insert({
      entity_type: input.entity_type,
      file_name: input.file_name,
      workspace_id: input.workspace_id,
      total_rows: input.total_rows,
      imported_count: input.imported_count,
      invalid_count: input.invalid_count,
      file_duplicate_count: input.file_duplicate_count,
      db_duplicate_count: input.db_duplicate_count,
      ignored_count: input.ignored_count,
      failed_count: input.failed_count || 0,
      status: input.status,
      error_message: input.error_message,
      duration_ms: input.duration_ms,
    } as any)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating import session:", error);
    return null;
  }
  
  return data as ImportSession;
}

/**
 * Get recent import sessions (latest 5)
 */
export async function getRecentImportSessions(
  limit: number = 5
): Promise<ImportSession[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("import_sessions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit) as any;
  
  if (error) {
    console.error("Error fetching import sessions:", error);
    return [];
  }
  
  return (data || []) as ImportSession[];
}

/**
 * Get import sessions by entity type
 */
export async function getImportSessionsByEntityType(
  entityType: "seller" | "buyer",
  limit: number = 5
): Promise<ImportSession[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("import_sessions")
    .select("*")
    .eq("entity_type", entityType)
    .order("created_at", { ascending: false })
    .limit(limit) as any;
  
  if (error) {
    console.error("Error fetching import sessions:", error);
    return [];
  }
  
  return (data || []) as ImportSession[];
}

/**
 * Format import session for display
 */
export function formatImportSession(session: ImportSession): {
  title: string;
  subtitle: string;
  statusText: string;
  countsText: string;
} {
  const entityLabel = session.entity_type === "seller" ? "Sellers" : "Buyers";
  const dateStr = new Date(session.created_at).toLocaleString();
  
  const statusText = session.status === "completed" 
    ? "Completed"
    : session.status === "partial"
      ? "Partial"
      : "Failed";
  
  const parts: string[] = [];
  if (session.imported_count > 0) parts.push(`${session.imported_count} imported`);
  if (session.failed_count && session.failed_count > 0) parts.push(`${session.failed_count} failed`);
  if (session.invalid_count > 0) parts.push(`${session.invalid_count} invalid`);
  if (session.file_duplicate_count > 0) parts.push(`${session.file_duplicate_count} duplicates`);
  
  return {
    title: session.file_name,
    subtitle: `${dateStr} • ${entityLabel}`,
    statusText,
    countsText: parts.join(" • ") || "No rows processed",
  };
}

/**
 * Get status badge variant for import status
 */
export function getImportStatusVariant(
  status: ImportStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "partial":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

/**
 * Calculate import success rate
 */
export function calculateSuccessRate(session: ImportSession): number {
  if (session.total_rows === 0) return 0;
  return Math.round((session.imported_count / session.total_rows) * 100);
}
