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
  entity_type: "seller" | "buyer";
  file_name: string;
  total_rows: number;
  imported_count: number;
  invalid_count: number;
  file_duplicate_count: number;
  db_duplicate_count: number;
  ignored_count: number;
  status: ImportStatus;
  error_message?: string;
}

export interface CreateImportSessionInput {
  entity_type: "seller" | "buyer";
  file_name: string;
  total_rows: number;
  imported_count: number;
  invalid_count: number;
  file_duplicate_count: number;
  db_duplicate_count: number;
  ignored_count: number;
  status: ImportStatus;
  error_message?: string;
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
      total_rows: input.total_rows,
      imported_count: input.imported_count,
      invalid_count: input.invalid_count,
      file_duplicate_count: input.file_duplicate_count,
      db_duplicate_count: input.db_duplicate_count,
      ignored_count: input.ignored_count,
      status: input.status,
      error_message: input.error_message,
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
