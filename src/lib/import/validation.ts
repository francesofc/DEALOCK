/**
 * Import Validation
 * 
 * Email validation, phone validation, row validation logic, and edge-case handling.
 */

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email || email.trim() === "") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validate phone format (basic check for reasonable length)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || phone.trim() === "") return false;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

/**
 * Normalize phone number for comparison
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^0+/, "");
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface RowValidationResult {
  isValid: boolean;
  errors: string[];
  hasName: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
}

/**
 * Validate a single row of data
 */
export function validateRow(
  data: Record<string, unknown>,
  entityType: "seller" | "buyer",
  nameField: "owner_name" | "name"
): RowValidationResult {
  const errors: string[] = [];
  
  const hasName = !!((data[nameField] as string) || "").trim();
  const hasEmail = !!((data.email as string) || "").trim();
  const hasPhone = !!((data.phone as string) || "").trim();
  
  // Check required fields
  if (!hasName) {
    errors.push(
      entityType === "seller" ? "Missing seller name" : "Missing buyer name"
    );
  }
  
  if (!hasEmail && !hasPhone) {
    errors.push("Missing email and phone");
  }
  
  // Validate formats
  if (hasEmail && !validateEmail(data.email as string)) {
    errors.push("Invalid email format");
  }
  
  if (hasPhone && !validatePhone(data.phone as string)) {
    errors.push("Invalid phone format");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    hasName,
    hasEmail,
    hasPhone,
  };
}

/**
 * Check if a value looks like a valid price
 */
export function parsePrice(priceStr: string): number | null {
  if (!priceStr || priceStr.trim() === "") return null;
  const cleaned = priceStr.replace(/[€$£,\s]/g, "").replace(/\./g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

// ============================================
// EDGE CASE HANDLING
// ============================================

export interface EdgeCaseCheck {
  isEdgeCase: boolean;
  type: "empty" | "headers_only" | "too_many_empty" | "unsupported_columns" | "all_invalid" | "all_duplicates" | "all_ignored" | null;
  message: string;
  canProceed: boolean;
}

/**
 * Check if CSV is completely empty (no data at all)
 */
export function isEmptyCSV(
  data: Record<string, unknown>[],
  headers: string[]
): boolean {
  if (data.length === 0) return true;
  if (headers.length === 0) return true;
  return false;
}

/**
 * Check if CSV has headers only (no data rows)
 */
export function isHeadersOnly(
  data: Record<string, unknown>[]
): boolean {
  return data.length === 0;
}

/**
 * Check if CSV has too many empty rows (more than 50% empty)
 */
export function hasTooManyEmptyRows(
  data: Record<string, unknown>[],
  threshold: number = 0.5
): boolean {
  if (data.length === 0) return false;
  
  const emptyCount = countEmptyRows(data);
  return emptyCount / data.length > threshold;
}

/**
 * Check if CSV has only unsupported columns (no mappable fields)
 */
export function hasOnlyUnsupportedColumns(
  mapping: { dealockField: string | null }[]
): boolean {
  const mappedCount = mapping.filter(m => m.dealockField !== null).length;
  return mappedCount === 0;
}

/**
 * Check for edge cases in the uploaded CSV
 */
export function checkEdgeCases(
  data: Record<string, unknown>[],
  headers: string[],
  mapping: { dealockField: string | null }[]
): EdgeCaseCheck {
  // Check for completely empty CSV
  if (isEmptyCSV(data, headers)) {
    return {
      isEdgeCase: true,
      type: "empty",
      message: "The CSV file appears to be empty. Please check that your file contains data.",
      canProceed: false,
    };
  }
  
  // Check for headers only
  if (isHeadersOnly(data)) {
    return {
      isEdgeCase: true,
      type: "headers_only",
      message: "The CSV file contains only headers, no data rows. Please add records to import.",
      canProceed: false,
    };
  }
  
  // Check for unsupported columns only
  if (hasOnlyUnsupportedColumns(mapping)) {
    return {
      isEdgeCase: true,
      type: "unsupported_columns",
      message: "No recognizable columns found. Please map at least the name field and email or phone field.",
      canProceed: false,
    };
  }
  
  // Check for too many empty rows
  if (hasTooManyEmptyRows(data)) {
    return {
      isEdgeCase: true,
      type: "too_many_empty",
      message: `More than 50% of rows appear to be empty. Found ${countEmptyRows(data)} empty rows out of ${data.length} total.`,
      canProceed: true,
    };
  }
  
  return {
    isEdgeCase: false,
    type: null,
    message: "",
    canProceed: true,
  };
}

/**
 * Check validation results for all-invalid, all-duplicate, or all-ignored cases
 */
export function checkImportEdgeCases(
  totalRows: number,
  invalidCount: number,
  fileDuplicateCount: number,
  dbDuplicateCount: number,
  ignoredCount: number,
  readyCount: number
): EdgeCaseCheck {
  // All rows are invalid
  if (totalRows > 0 && invalidCount === totalRows && readyCount === 0) {
    return {
      isEdgeCase: true,
      type: "all_invalid",
      message: "All rows have validation errors. Please review and correct the data before importing.",
      canProceed: false,
    };
  }
  
  // All rows are duplicates (file + db)
  if (totalRows > 0 && (fileDuplicateCount + dbDuplicateCount) === totalRows && readyCount === 0) {
    return {
      isEdgeCase: true,
      type: "all_duplicates",
      message: "All rows are duplicates (already in file or database). No new records to import.",
      canProceed: false,
    };
  }
  
  // All rows are ignored
  if (totalRows > 0 && ignoredCount === totalRows && readyCount === 0) {
    return {
      isEdgeCase: true,
      type: "all_ignored",
      message: "All rows have been ignored. Un-ignore rows to proceed with import.",
      canProceed: false,
    };
  }
  
  return {
    isEdgeCase: false,
    type: null,
    message: "",
    canProceed: true,
  };
}

/**
 * Check if CSV is empty or has only headers
 */
export function isEmptyOrHeadersOnly(
  data: Record<string, unknown>[],
  headers: string[]
): boolean {
  if (data.length === 0) return true;
  
  // Check if all rows are empty
  const allEmpty = data.every((row) => {
    return Object.values(row).every(
      (val) => !val || String(val).trim() === ""
    );
  });
  
  return allEmpty;
}

/**
 * Count meaningful rows (rows with at least some data)
 */
export function countMeaningfulRows(
  data: Record<string, unknown>[]
): number {
  return data.filter((row) => {
    return Object.values(row).some(
      (val) => val && String(val).trim() !== ""
    );
  }).length;
}

/**
 * Count empty rows (rows with no meaningful data)
 */
export function countEmptyRows(
  data: Record<string, unknown>[]
): number {
  return data.filter((row) => {
    return Object.values(row).every(
      (val) => !val || String(val).trim() === ""
    );
  }).length;
}

/**
 * Get a user-friendly error message for why a row is not importable
 */
export function getRowImportError(
  isValid: boolean,
  isDuplicateInFile: boolean,
  isDuplicateInDb: boolean,
  ignored: boolean,
  errors: string[]
): string {
  if (ignored) {
    return "This row has been ignored. Click 'Keep' to include it in the import.";
  }
  
  if (isDuplicateInFile) {
    return "This row is a duplicate of another row in this file.";
  }
  
  if (isDuplicateInDb) {
    return "A record with this email or phone already exists in the database.";
  }
  
  if (!isValid) {
    if (errors.length === 0) {
      return "This row has validation errors.";
    }
    return errors.join("; ");
  }
  
  return "";
}
