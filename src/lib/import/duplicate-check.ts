/**
 * Duplicate Checking
 * 
 * Database duplicate detection for sellers and buyers.
 */

import { createClient } from "@/lib/supabase/client";
import { normalizePhone } from "./validation";

export interface DuplicateCheckResult {
  exists: boolean;
  field?: "email" | "phone" | "both";
}

/**
 * Check if seller exists in database
 */
export async function checkExistingSeller(
  email: string,
  phone: string
): Promise<DuplicateCheckResult> {
  if (!email && !phone) return { exists: false };
  
  const supabase = createClient();
  let emailMatch = false;
  let phoneMatch = false;
  
  // Check email
  if (email) {
    const { data } = await supabase
      .from("leads")
      .select("id")
      .eq("email", email)
      .limit(1);
    if (data && data.length > 0) emailMatch = true;
  }
  
  // Check phone
  if (phone && !emailMatch) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length >= 6) {
      const { data } = await supabase
        .from("leads")
        .select("phone")
        .limit(100);
      if (data) {
        for (const row of data as { phone?: string }[]) {
          if (row?.phone && normalizePhone(row.phone) === normalizedPhone) {
            phoneMatch = true;
            break;
          }
        }
      }
    }
  }
  
  if (emailMatch && phoneMatch) return { exists: true, field: "both" };
  if (emailMatch) return { exists: true, field: "email" };
  if (phoneMatch) return { exists: true, field: "phone" };
  return { exists: false };
}

/**
 * Check if buyer exists in database
 */
export async function checkExistingBuyer(
  email: string,
  phone: string
): Promise<DuplicateCheckResult> {
  if (!email && !phone) return { exists: false };
  
  const supabase = createClient();
  let emailMatch = false;
  let phoneMatch = false;
  
  // Check email
  if (email) {
    const { data } = await supabase
      .from("buyers")
      .select("id")
      .eq("email", email)
      .limit(1);
    if (data && data.length > 0) emailMatch = true;
  }
  
  // Check phone
  if (phone && !emailMatch) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length >= 6) {
      const { data } = await supabase
        .from("buyers")
        .select("phone")
        .limit(100);
      if (data) {
        for (const row of data as { phone?: string }[]) {
          if (row?.phone && normalizePhone(row.phone) === normalizedPhone) {
            phoneMatch = true;
            break;
          }
        }
      }
    }
  }
  
  if (emailMatch && phoneMatch) return { exists: true, field: "both" };
  if (emailMatch) return { exists: true, field: "email" };
  if (phoneMatch) return { exists: true, field: "phone" };
  return { exists: false };
}

/**
 * Check for duplicates within the file being imported
 */
export function checkFileDuplicates(
  data: Record<string, unknown>[],
  emailField: string = "email"
): Map<number, { isDuplicate: boolean; duplicateOf?: number; field?: string }> {
  const seenEmails = new Map<string, number>();
  const results = new Map<number, { isDuplicate: boolean; duplicateOf?: number; field?: string }>();
  
  data.forEach((row, index) => {
    const email = ((row[emailField] as string) || "").toLowerCase().trim();
    
    if (email) {
      if (seenEmails.has(email)) {
        results.set(index, {
          isDuplicate: true,
          duplicateOf: seenEmails.get(email),
          field: "email",
        });
      } else {
        seenEmails.set(email, index);
        results.set(index, { isDuplicate: false });
      }
    } else {
      results.set(index, { isDuplicate: false });
    }
  });
  
  return results;
}
