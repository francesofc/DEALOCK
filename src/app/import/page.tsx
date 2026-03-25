"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Download,
  Loader2,
  Users,
  Building2,
  FileCheck,
  UserCircle,
  Database,
  Edit2,
  EyeOff,
  Eye,
  RefreshCw,
  AlertTriangle,
  FileX,
  Info,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import Papa from "papaparse";
import { createImportSession, getRecentImportSessions, ImportSession, getImportStatusVariant, formatImportSession } from "@/lib/data/import-sessions";
import { useWorkspace } from "@/lib/workspace/WorkspaceContext";
import {
  executeImport,
  determineImportStatus,
  generateReportByType,
  downloadCSV,
  generateSellerTemplate,
  generateBuyerTemplate,
  formatImportSummary,
  checkEdgeCases,
  checkImportEdgeCases,
  getRowImportError,
  type FailedRow,
  type ReportRow,
  type EdgeCaseCheck,
} from "@/lib/import";

// ============================================
// TYPES
// ============================================

type ImportStep = "upload" | "preview" | "validate" | "results";
type EntityType = "seller" | "buyer";
type FilterType = "all" | "ready" | "invalid" | "inFile" | "inDb" | "ignored" | "failed";

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  csvColumn: string;
  dealockField: string | null;
}

interface ValidationResult {
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

interface ImportSummary {
  total: number;
  valid: number;
  invalid: number;
  fileDuplicates: number;
  dbDuplicates: number;
  ignored: number;
  readyToImport: number;
  imported: number;
  failed: number;
}

// ============================================
// FIELD DEFINITIONS
// ============================================

const SELLER_FIELDS = [
  { key: "owner_name", label: "Seller/Owner Name", required: true, alternateNames: ["name", "contact", "person", "full_name", "contact person", "company_name", "company", "business", "owner", "seller"] },
  { key: "email", label: "Email", required: false, alternateNames: ["e-mail", "email_address", "mail", "e_mail"] },
  { key: "phone", label: "Phone", required: false, alternateNames: ["telephone", "tel", "mobile", "cell", "phone_number"] },
  { key: "property_type", label: "Property Type", required: false, alternateNames: ["type", "property", "asset_type", "asset"] },
  { key: "city", label: "City/Location", required: false, alternateNames: ["city", "location", "address", "market", "area", "neighborhood"] },
  { key: "price", label: "Asking Price", required: false, alternateNames: ["asking_price", "price", "value", "amount", "price_eur", "asking price"] },
  { key: "notes", label: "Notes", required: false, alternateNames: ["description", "note", "comments", "remarks", "details"] },
  { key: "status", label: "Status", required: false, alternateNames: ["stage", "lead_status", "current_status"] },
];

const BUYER_FIELDS = [
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

const PROPERTY_TYPE_MAP: Record<string, string> = {
  apartment: "apartment", apartments: "apartment", residential: "apartment",
  commercial: "commercial", office: "office", offices: "office",
  retail: "retail", shop: "retail", shops: "retail",
  industrial: "industrial", warehouse: "industrial",
  land: "land", plot: "land",
};

const SELLER_STATUS_MAP: Record<string, string> = {
  new: "new", cold: "new", contacted: "contacted", warm: "contacted",
  qualified: "qualified", hot: "qualified", negotiating: "mandate_proposed",
  proposal: "mandate_proposed", mandate_proposed: "mandate_proposed",
  mandate: "mandate_signed", signed: "mandate_signed", lost: "lost", dead: "lost",
};

const BUYER_STATUS_MAP: Record<string, string> = {
  new: "new", contacted: "contacted", qualified: "qualified",
  viewing: "viewing_scheduled", viewing_scheduled: "viewing_scheduled",
  offer: "offer_pending", offer_pending: "offer_pending", closed: "closed",
  inactive: "inactive", browsing: "new", serious: "qualified", committed: "qualified",
};

const TIMELINE_MAP: Record<string, string> = {
  immediate: "immediate", asap: "immediate", now: "immediate",
  "1_month": "one_month", "1 month": "one_month", one_month: "one_month", "30_days": "one_month",
  "3_months": "three_months", "3 months": "three_months", three_months: "three_months", "90_days": "three_months",
  browsing: "browsing", just_looking: "browsing", flexible: "browsing",
};

const SERIOUSNESS_MAP: Record<string, string> = {
  browsing: "low", just_looking: "low", curious: "low",
  interested: "medium", somewhat: "medium", considering: "medium",
  serious: "high", motivated: "high", active: "high",
  committed: "very_high", ready: "very_high", urgent: "very_high", cash_buyer: "very_high",
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function normalizeColumnName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "_").replace(/-/g, "_").replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function detectColumnMapping(csvColumns: string[], fields: typeof SELLER_FIELDS): ColumnMapping[] {
  return csvColumns.map((csvCol) => {
    const normalized = normalizeColumnName(csvCol);
    let dealockField = fields.find(f => f.key === normalized)?.key || null;
    if (!dealockField) {
      for (const field of fields) {
        if (field.alternateNames.some(alt => normalizeColumnName(alt) === normalized)) {
          dealockField = field.key;
          break;
        }
      }
    }
    return { csvColumn: csvCol, dealockField };
  });
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 6;
}

function parsePrice(priceStr: string): number | null {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/[€$£,\s]/g, "").replace(/\./g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

// ============================================
// DATABASE DUPLICATE CHECK
// ============================================

import { createClient } from "@/lib/supabase/client";

async function checkExistingSeller(email: string, phone: string): Promise<{ exists: boolean; field?: 'email' | 'phone' | 'both' }> {
  if (!email && !phone) return { exists: false };
  const supabase = createClient();
  
  let emailMatch = false;
  let phoneMatch = false;
  
  if (email) {
    const { data } = await supabase.from("leads").select("id").eq("email", email).limit(1);
    if (data && data.length > 0) emailMatch = true;
  }
  
  if (phone) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length >= 6) {
      const { data } = await supabase.from("leads").select("phone").limit(100);
      if (data) {
        for (const row of data as any[]) {
          if (row?.phone && normalizePhone(row.phone) === normalizedPhone) {
            phoneMatch = true;
            break;
          }
        }
      }
    }
  }
  
  if (emailMatch && phoneMatch) return { exists: true, field: 'both' };
  if (emailMatch) return { exists: true, field: 'email' };
  if (phoneMatch) return { exists: true, field: 'phone' };
  return { exists: false };
}

async function checkExistingBuyer(email: string, phone: string): Promise<{ exists: boolean; field?: 'email' | 'phone' | 'both' }> {
  if (!email && !phone) return { exists: false };
  const supabase = createClient();
  
  let emailMatch = false;
  let phoneMatch = false;
  
  if (email) {
    const { data } = await supabase.from("buyers").select("id").eq("email", email).limit(1);
    if (data && data.length > 0) emailMatch = true;
  }
  
  if (phone) {
    const normalizedPhone = normalizePhone(phone);
    if (normalizedPhone.length >= 6) {
      const { data } = await supabase.from("buyers").select("phone").limit(100);
      if (data) {
        for (const row of data as any[]) {
          if (row?.phone && normalizePhone(row.phone) === normalizedPhone) {
            phoneMatch = true;
            break;
          }
        }
      }
    }
  }
  
  if (emailMatch && phoneMatch) return { exists: true, field: 'both' };
  if (emailMatch) return { exists: true, field: 'email' };
  if (phoneMatch) return { exists: true, field: 'phone' };
  return { exists: false };
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ImportPage() {
  const { t } = useTranslation();
  const router = useRouter();
  
  const [entityType, setEntityType] = useState<EntityType>("seller");
  const [step, setStep] = useState<ImportStep>("upload");
  const [rawData, setRawData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [editingCell, setEditingCell] = useState<{rowIndex: number, field: string} | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [importHistory, setImportHistory] = useState<ImportSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [edgeCase, setEdgeCase] = useState<EdgeCaseCheck | null>(null);
  const [failedRows, setFailedRows] = useState<FailedRow[]>([]);
  const [importProgress, setImportProgress] = useState<{ processed: number; total: number } | null>(null);
  
  // Phase 7: Get workspace context for data isolation
  const { workspaceId } = useWorkspace();

  const fields = entityType === "seller" ? SELLER_FIELDS : BUYER_FIELDS;
  const nameField = entityType === "seller" ? "owner_name" : "name";

  // Filtered results based on current filter
  const filteredResults = useMemo(() => {
    if (filter === "all") return validationResults;
    return validationResults.filter(r => {
      switch (filter) {
        case "ready": return r.isValid && !r.isDuplicateInFile && !r.isDuplicateInDb && !r.ignored;
        case "invalid": return !r.isValid && !r.ignored;
        case "inFile": return r.isDuplicateInFile && !r.ignored;
        case "inDb": return r.isDuplicateInDb && !r.ignored;
        case "ignored": return r.ignored;
        default: return true;
      }
    });
  }, [validationResults, filter]);

  // Reset import state for new import
  const resetImport = () => {
    setRawData([]);
    setHeaders([]);
    setColumnMapping([]);
    setValidationResults([]);
    setSummary(null);
    setFileName("");
    setFilter("all");
    setSelectedRows(new Set());
    setEdgeCase(null);
    setFailedRows([]);
    setImportProgress(null);
  };

  // ============================================
  // STEP 1: UPLOAD
  // ============================================

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert(t.import.errors.csvOnly);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert(t.import.errors.fileTooLarge);
      return;
    }

    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length > 1000) {
          alert(t.import.errors.tooManyRows);
          return;
        }
        const data = results.data as CSVRow[];
        const cols = results.meta.fields || [];
        
        // Check for edge cases
        const mapping = detectColumnMapping(cols, fields);
        const edgeCaseCheck = checkEdgeCases(data, cols, mapping);
        
        if (!edgeCaseCheck.canProceed) {
          setEdgeCase(edgeCaseCheck);
          setRawData(data);
          setHeaders(cols);
          setColumnMapping(mapping);
          setStep("preview");
          return;
        }
        
        setRawData(data);
        setHeaders(cols);
        setColumnMapping(mapping);
        setEdgeCase(edgeCaseCheck.isEdgeCase ? edgeCaseCheck : null);
        setStep("preview");
      },
      error: () => alert(t.import.errors.parseFailed),
    });
  }, [t, fields]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  // ============================================
  // STEP 2: PREVIEW & MAPPING
  // ============================================

  const handleMappingChange = (csvColumn: string, dealockField: string | null) => {
    setColumnMapping(prev => prev.map(m => m.csvColumn === csvColumn ? { ...m, dealockField } : m));
  };

  const mappedFields = useMemo(() => columnMapping.filter(m => m.dealockField).map(m => m.dealockField!), [columnMapping]);

  const hasRequiredMapping = useMemo(() => {
    const hasName = mappedFields.includes(nameField);
    const hasContact = mappedFields.includes("email") || mappedFields.includes("phone");
    return hasName && hasContact;
  }, [mappedFields, nameField]);

  // ============================================
  // STEP 3: VALIDATE
  // ============================================

  const validateRow = useCallback(async (data: Record<string, unknown>, seenEmails: Map<string, number>): Promise<Omit<ValidationResult, 'row' | 'ignored'>> => {
    const errors: string[] = [];
    
    const hasName = !!(data[nameField] as string)?.trim();
    const hasEmail = !!(data.email as string)?.trim();
    const hasPhone = !!(data.phone as string)?.trim();

    if (!hasName) errors.push(entityType === "seller" ? "Missing seller name" : "Missing buyer name");
    if (!hasEmail && !hasPhone) errors.push("Missing email and phone");
    if (hasEmail && !validateEmail(data.email as string)) errors.push("Invalid email format");
    if (hasPhone && !validatePhone(data.phone as string)) errors.push("Invalid phone format");

    const email = (data.email as string)?.toLowerCase().trim();
    let isDuplicateInFile = false;
    let fileDuplicateField: 'email' | 'phone' | 'both' | undefined;
    let duplicateOf: number | undefined;
    
    if (email) {
      if (seenEmails.has(email)) {
        isDuplicateInFile = true;
        fileDuplicateField = 'email';
        duplicateOf = seenEmails.get(email);
      } else {
        seenEmails.set(email, -1); // Temporary, will be set to actual row index
      }
    }

    let isDuplicateInDb = false;
    let dbDuplicateField: 'email' | 'phone' | 'both' | undefined;
    
    if (!isDuplicateInFile && (hasEmail || hasPhone)) {
      const checkFn = entityType === "seller" ? checkExistingSeller : checkExistingBuyer;
      const result = await checkFn(data.email as string || "", data.phone as string || "");
      isDuplicateInDb = result.exists;
      dbDuplicateField = result.field;
    }

    return {
      data,
      errors,
      isValid: errors.length === 0 && !isDuplicateInFile && !isDuplicateInDb,
      isDuplicateInFile,
      isDuplicateInDb,
      duplicateField: isDuplicateInDb ? dbDuplicateField : isDuplicateInFile ? fileDuplicateField : undefined,
      duplicateOf,
    };
  }, [entityType, nameField]);

  const runValidation = useCallback(async () => {
    setIsValidating(true);
    const results: ValidationResult[] = [];
    const seenEmails = new Map<string, number>();

    for (let index = 0; index < rawData.length; index++) {
      const row = rawData[index];
      const rowNum = index + 2;
      const data: Record<string, unknown> = {};

      columnMapping.forEach(({ csvColumn, dealockField }) => {
        if (dealockField && row[csvColumn]) {
          let value: unknown = row[csvColumn].trim();
          if (dealockField.includes("budget") || dealockField === "price") {
            value = parsePrice(value as string);
          } else if (dealockField === "property_type" || dealockField === "property_types") {
            value = PROPERTY_TYPE_MAP[(value as string).toLowerCase()] || value;
          } else if (dealockField === "status") {
            const statusMap = entityType === "seller" ? SELLER_STATUS_MAP : BUYER_STATUS_MAP;
            value = statusMap[(value as string).toLowerCase()] || "new";
          } else if (dealockField === "timeline") {
            value = TIMELINE_MAP[(value as string).toLowerCase()] || "browsing";
          } else if (dealockField === "seriousness") {
            value = SERIOUSNESS_MAP[(value as string).toLowerCase()] || "low";
          } else if (dealockField === "pre_approved") {
            value = ["yes", "true", "1", "pre-approved", "approved"].includes((value as string).toLowerCase());
          }
          data[dealockField] = value;
        }
      });

      const validation = await validateRow(data, seenEmails);
      
      // Update seenEmails with actual row index
      const email = (data.email as string)?.toLowerCase().trim();
      if (email) {
        seenEmails.set(email, index);
      }
      
      results.push({ row: rowNum, ...validation, ignored: false });
    }

    setValidationResults(results);
    updateSummary(results, 0, []);
    
    // Check for import edge cases (all invalid, all duplicates, all ignored)
    const summary = calculateSummary(results, 0, []);
    const importEdgeCase = checkImportEdgeCases(
      summary.total,
      summary.invalid,
      summary.fileDuplicates,
      summary.dbDuplicates,
      summary.ignored,
      summary.readyToImport
    );
    
    setEdgeCase(importEdgeCase.isEdgeCase ? importEdgeCase : null);
    setStep("validate");
    setIsValidating(false);
  }, [rawData, columnMapping, entityType, validateRow]);

  const calculateSummary = (results: ValidationResult[], imported: number, failedRows: FailedRow[]): ImportSummary => {
    const valid = results.filter(r => r.isValid && !r.ignored).length;
    const ignored = results.filter(r => r.ignored).length;
    return {
      total: results.length,
      valid,
      invalid: results.filter(r => !r.isValid && !r.isDuplicateInFile && !r.isDuplicateInDb && !r.ignored).length,
      fileDuplicates: results.filter(r => r.isDuplicateInFile && !r.ignored).length,
      dbDuplicates: results.filter(r => r.isDuplicateInDb && !r.ignored).length,
      ignored,
      readyToImport: valid,
      imported,
      failed: failedRows.length,
    };
  };

  const updateSummary = (results: ValidationResult[], imported: number, failedRows: FailedRow[]) => {
    setSummary(calculateSummary(results, imported, failedRows));
  };

  // ============================================
  // ROW EDITING
  // ============================================

  const handleCellEdit = (rowIndex: number, field: string, value: string) => {
    setValidationResults(prev => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], data: { ...updated[rowIndex].data, [field]: value } };
      setTimeout(() => revalidateRow(rowIndex), 0);
      return updated;
    });
  };

  const revalidateRow = async (rowIndex: number) => {
    const row = validationResults[rowIndex];
    const seenEmails = new Map<string, number>();
    
    // Build seenEmails from all other rows
    validationResults.forEach((r, i) => {
      if (i !== rowIndex && r.data.email) {
        seenEmails.set((r.data.email as string).toLowerCase().trim(), i);
      }
    });
    
    const validation = await validateRow(row.data, seenEmails);
    
    setValidationResults(prev => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], ...validation };
      return updated;
    });
    
    updateSummary(validationResults.map((r, i) => i === rowIndex ? { ...r, ...validation } : r), 0, failedRows);
  };

  const toggleIgnoreRow = (rowIndex: number) => {
    setValidationResults(prev => prev.map((r, i) => i === rowIndex ? { ...r, ignored: !r.ignored } : r));
  };

  // Batch actions
  const ignoreAllInvalid = () => {
    setValidationResults(prev => prev.map(r => 
      (!r.isValid && !r.isDuplicateInFile && !r.isDuplicateInDb) ? { ...r, ignored: true } : r
    ));
    setSelectedRows(new Set());
  };

  const ignoreAllDbDuplicates = () => {
    setValidationResults(prev => prev.map(r => 
      r.isDuplicateInDb ? { ...r, ignored: true } : r
    ));
    setSelectedRows(new Set());
  };

  const ignoreAllFileDuplicates = () => {
    setValidationResults(prev => prev.map(r => 
      r.isDuplicateInFile ? { ...r, ignored: true } : r
    ));
    setSelectedRows(new Set());
  };

  const keepAll = () => {
    setValidationResults(prev => prev.map(r => ({ ...r, ignored: false })));
    setSelectedRows(new Set());
  };

  const toggleSelectAll = () => {
    const visibleIndices = filteredResults.map(r => validationResults.indexOf(r));
    const allSelected = visibleIndices.every(i => selectedRows.has(i));
    
    if (allSelected) {
      const newSelected = new Set(selectedRows);
      visibleIndices.forEach(i => newSelected.delete(i));
      setSelectedRows(newSelected);
    } else {
      const newSelected = new Set(selectedRows);
      visibleIndices.forEach(i => newSelected.add(i));
      setSelectedRows(newSelected);
    }
  };

  const toggleSelectRow = (rowIndex: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowIndex)) {
      newSelected.delete(rowIndex);
    } else {
      newSelected.add(rowIndex);
    }
    setSelectedRows(newSelected);
  };

  const ignoreSelected = () => {
    setValidationResults(prev => prev.map((r, i) => 
      selectedRows.has(i) ? { ...r, ignored: true } : r
    ));
    setSelectedRows(new Set());
  };
  
  // Derive summary from validationResults
  useEffect(() => {
    if (step === 'validate' && validationResults.length > 0) {
      updateSummary(validationResults, summary?.imported || 0, failedRows);
    }
  }, [validationResults, step, failedRows.length]);

  // Load import history on mount
  useEffect(() => {
    loadImportHistory();
  }, []);

  const loadImportHistory = async () => {
    setIsLoadingHistory(true);
    const history = await getRecentImportSessions(5);
    setImportHistory(history);
    setIsLoadingHistory(false);
  };

  // ============================================
  // STEP 4: IMPORT
  // ============================================

  const executeImportHandler = useCallback(async () => {
    setIsImporting(true);
    setFailedRows([]);
    setImportProgress({ processed: 0, total: validationResults.filter(r => r.isValid && !r.ignored).length });
    
    const validRows = validationResults.filter(r => r.isValid && !r.ignored);
    
    const result = await executeImport(validRows, entityType, (progress) => {
      setImportProgress({ processed: progress.processed, total: progress.total });
    });
    
    setFailedRows(result.failedRows);
    
    const finalSummary: ImportSummary = {
      ...calculateSummary(validationResults, result.imported, result.failedRows),
    };
    setSummary(finalSummary);
    
    // Determine status
    const status = determineImportStatus(validRows.length, result.imported, result.failed);
    
    // Save import session with detailed counts
    await createImportSession({
      entity_type: entityType,
      file_name: fileName,
      workspace_id: workspaceId, // Phase 7: Associate with workspace
      total_rows: finalSummary.total,
      imported_count: result.imported,
      invalid_count: finalSummary.invalid,
      file_duplicate_count: finalSummary.fileDuplicates,
      db_duplicate_count: finalSummary.dbDuplicates,
      ignored_count: finalSummary.ignored,
      failed_count: result.failed,
      status,
      error_message: result.failed > 0 ? `${result.failed} rows failed during import` : undefined,
      duration_ms: result.durationMs,
    });
    
    // Refresh import history
    await loadImportHistory();
    
    setStep("results");
    setIsImporting(false);
    setImportProgress(null);
  }, [validationResults, entityType, fileName]);

  // ============================================
  // DOWNLOAD REPORTS
  // ============================================

  const downloadReport = (type: 'invalid' | 'skipped' | 'imported' | 'failed') => {
    const rows = generateReportByType(type, validationResults, failedRows);
    
    if (rows.length === 0) return;

    const filenameMap: Record<string, string> = {
      invalid: 'invalid-rows-report.csv',
      skipped: 'skipped-rows-report.csv',
      imported: 'imported-rows-report.csv',
      failed: 'failed-rows-report.csv',
    };
    
    const csv = generateReportCSV(rows);
    downloadCSV(csv, filenameMap[type]);
  };

  function generateReportCSV(rows: ReportRow[]): string {
    if (rows.length === 0) return "";
    
    const allKeys = new Set<string>();
    rows.forEach((r) => {
      Object.keys(r.data).forEach((k) => allKeys.add(k));
    });
    const keys = Array.from(allKeys);
    
    const headers = ["row_number", ...keys, "status", "reason", "errors"];
    
    const csvRows = rows.map((r) => {
      const dataValues = keys.map((k) => {
        const val = r.data[k];
        if (val === null || val === undefined) return "";
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

  const downloadErrorReport = useCallback(() => {
    const rows = generateReportByType("all", validationResults, failedRows);
    if (rows.length === 0) return;

    const csv = generateReportCSV(rows);
    downloadCSV(csv, "import-error-report.csv");
  }, [validationResults, failedRows]);

  // ============================================
  // CSV TEMPLATES
  // ============================================

  const downloadTemplate = (type: 'seller' | 'buyer') => {
    const csv = type === 'seller' ? generateSellerTemplate() : generateBuyerTemplate();
    const filename = type === 'seller' ? 'seller-import-template.csv' : 'buyer-import-template.csv';
    downloadCSV(csv, filename);
  };

  // ============================================
  // STATUS BADGE HELPER
  // ============================================

  const getStatusBadge = (result: ValidationResult, wasFailed?: boolean) => {
    if (wasFailed) {
      return <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">Failed</Badge>;
    }
    if (result.ignored) return <Badge variant="secondary" className="text-xs">Ignored</Badge>;
    if (result.isDuplicateInDb) {
      const fieldLabel = result.duplicateField === 'email' ? ' (email)' : result.duplicateField === 'phone' ? ' (phone)' : result.duplicateField === 'both' ? ' (email+phone)' : '';
      return <Badge className="text-xs bg-purple-500/20 text-purple-400 border-purple-500/30">In DB{fieldLabel}</Badge>;
    }
    if (result.isDuplicateInFile) {
      const fieldLabel = result.duplicateField === 'email' ? ' (email)' : result.duplicateField === 'phone' ? ' (phone)' : result.duplicateField === 'both' ? ' (email+phone)' : '';
      return <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">In File{fieldLabel}</Badge>;
    }
    if (!result.isValid) return <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">Invalid</Badge>;
    return <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">Ready</Badge>;
  };

  // ============================================
  // EDGE CASE UI HELPERS
  // ============================================

  const renderEdgeCaseAlert = () => {
    if (!edgeCase || !edgeCase.isEdgeCase) return null;

    const icons: Record<string, React.ReactNode> = {
      empty: <FileX className="w-5 h-5 text-amber-400" />,
      headers_only: <FileX className="w-5 h-5 text-amber-400" />,
      too_many_empty: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      unsupported_columns: <AlertCircle className="w-5 h-5 text-amber-400" />,
      all_invalid: <AlertCircle className="w-5 h-5 text-amber-400" />,
      all_duplicates: <Info className="w-5 h-5 text-blue-400" />,
      all_ignored: <Info className="w-5 h-5 text-blue-400" />,
    };

    return (
      <div className={`flex items-start gap-3 p-4 rounded-lg border mb-6 ${edgeCase.canProceed ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
        {icons[edgeCase.type || ''] || <AlertCircle className="w-5 h-5 text-amber-400" />}
        <div className="flex-1">
          <p className={`text-sm font-medium ${edgeCase.canProceed ? 'text-amber-200' : 'text-red-200'}`}>
            {edgeCase.canProceed ? 'Warning' : 'Cannot Import'}
          </p>
          <p className={`text-sm mt-1 ${edgeCase.canProceed ? 'text-amber-200/70' : 'text-red-200/70'}`}>
            {edgeCase.message}
          </p>
        </div>
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <section className="pb-6 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{t.import.title}</h1>
            <p className="text-white/50 mt-2">{t.import.subtitle}</p>
          </div>
          <Badge variant="secondary" className="text-xs">Phase 6</Badge>
        </div>
      </section>

      {/* ENTITY TYPE SELECTOR */}
      {step === "upload" && (
        <div className="flex gap-4">
          <button onClick={() => setEntityType("seller")} className={`flex-1 p-6 rounded-xl border-2 text-left transition-colors ${entityType === "seller" ? "border-white bg-white/5" : "border-white/10 hover:border-white/30"}`}>
            <Building2 className={`w-8 h-8 mb-3 ${entityType === "seller" ? "text-white" : "text-white/50"}`} />
            <h3 className="font-medium">Import Sellers</h3>
            <p className="text-sm text-white/50 mt-1">Import property owners and seller leads</p>
          </button>
          <button onClick={() => setEntityType("buyer")} className={`flex-1 p-6 rounded-xl border-2 text-left transition-colors ${entityType === "buyer" ? "border-white bg-white/5" : "border-white/10 hover:border-white/30"}`}>
            <UserCircle className={`w-8 h-8 mb-3 ${entityType === "buyer" ? "text-white" : "text-white/50"}`} />
            <h3 className="font-medium">Import Buyers</h3>
            <p className="text-sm text-white/50 mt-1">Import buyer prospects and investors</p>
          </button>
        </div>
      )}

      {/* PROGRESS STEPS */}
      <div className="flex items-center gap-4 text-sm">
        {["upload", "preview", "validate", "results"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s ? "bg-white text-black" : i < ["upload", "preview", "validate", "results"].indexOf(step) ? "bg-green-500/20 text-green-400" : "bg-white/5 text-white/30"}`}>
              {i < ["upload", "preview", "validate", "results"].indexOf(step) ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={step === s ? "text-white" : "text-white/40"}>{t.import.steps[s as keyof typeof t.import.steps]}</span>
            {i < 3 && <ChevronRight className="w-4 h-4 text-white/20 ml-2" />}
          </div>
        ))}
      </div>

      {/* STEP 1: UPLOAD */}
      {step === "upload" && (
        <div className="space-y-6">
          <Card className="p-12">
            <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive ? "border-white bg-white/5" : "border-white/10 hover:border-white/30"}`}>
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-white/50" />
              </div>
              <h3 className="text-xl font-medium mb-2">{t.import.upload.title}</h3>
              <p className="text-white/50 mb-6 max-w-md mx-auto">{t.import.upload.description}</p>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/5 transition-colors">
                <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" />
                <FileSpreadsheet className="w-4 h-4" />
                {t.import.upload.selectFile}
              </label>
              <p className="text-xs text-white/30 mt-6">{t.import.upload.limits}</p>
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <h4 className="font-medium mb-3 flex items-center gap-2"><Building2 className="w-4 h-4 text-white/50" />{t.import.template.required}</h4>
                <p className="text-sm text-white/50 mb-3">{t.import.template.requiredDesc}</p>
                <div className="flex flex-wrap gap-2">
                  <code className="text-xs bg-white/5 px-2 py-1 rounded">{nameField}</code>
                  <span className="text-xs text-white/30">+</span>
                  <code className="text-xs bg-white/5 px-2 py-1 rounded">email</code>
                  <span className="text-xs text-white/30">or</span>
                  <code className="text-xs bg-white/5 px-2 py-1 rounded">phone</code>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <h4 className="font-medium mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-white/50" />{t.import.template.optional}</h4>
                <p className="text-sm text-white/50 mb-3">{t.import.template.optionalDesc}</p>
                <div className="flex flex-wrap gap-2">
                  {entityType === "seller" ? (
                    <><code className="text-xs bg-white/5 px-2 py-1 rounded">property_type</code><code className="text-xs bg-white/5 px-2 py-1 rounded">city</code><code className="text-xs bg-white/5 px-2 py-1 rounded">price</code></>
                  ) : (
                    <><code className="text-xs bg-white/5 px-2 py-1 rounded">budget_max</code><code className="text-xs bg-white/5 px-2 py-1 rounded">target_areas</code><code className="text-xs bg-white/5 px-2 py-1 rounded">timeline</code></>
                  )}
                </div>
              </div>
            </div>

            {/* Template Downloads */}
            <div className="mt-8 pt-8 border-t border-white/[0.06]">
              <h4 className="font-medium mb-4 flex items-center gap-2"><Download className="w-4 h-4 text-white/50" />Download Templates</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" onClick={() => downloadTemplate('seller')}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />Seller Template
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadTemplate('buyer')}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />Buyer Template
                </Button>
              </div>
            </div>
          </Card>

          {/* Import History */}
          {importHistory.length > 0 && (
            <Card className="p-6">
              <h4 className="font-medium mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-white/50" />Recent Imports</h4>
              <div className="space-y-3">
                {importHistory.map((session) => {
                  const formatted = formatImportSession(session);
                  return (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <Badge variant={getImportStatusVariant(session.status)} className="text-xs">
                          {formatted.statusText}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{formatted.title}</p>
                          <p className="text-xs text-white/50">{formatted.subtitle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{session.imported_count} / {session.total_rows}</p>
                        <p className="text-xs text-white/50">{formatted.countsText}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* STEP 2: PREVIEW */}
      {step === "preview" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium">{t.import.preview.title}</h3>
              <p className="text-sm text-white/50">{fileName} • {rawData.length} {t.import.preview.rows}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { resetImport(); setStep("upload"); }}><X className="w-4 h-4 mr-2" />{t.common.cancel}</Button>
          </div>

          {renderEdgeCaseAlert()}

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">{t.import.preview.mapping}</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {columnMapping.map(({ csvColumn, dealockField }) => (
                <div key={csvColumn} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-sm text-white/70 truncate flex-1" title={csvColumn}>{csvColumn}</span>
                  <ChevronRight className="w-4 h-4 text-white/20" />
                  <select value={dealockField || ""} onChange={(e) => handleMappingChange(csvColumn, e.target.value || null)} className="text-sm bg-black border border-white/10 rounded px-2 py-1">
                    <option value="">{t.import.preview.ignore}</option>
                    {fields.map((field) => <option key={field.key} value={field.key}>{field.label}{field.required ? " *" : ""}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3">{t.import.preview.dataPreview}</h4>
            <div className="overflow-x-auto rounded-lg border border-white/[0.06]">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.02]">
                  <tr>{headers.map((h) => <th key={h} className="px-3 py-2 text-left text-white/50 font-normal whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rawData.slice(0, 5).map((row, i) => <tr key={i} className="border-t border-white/[0.06]">{headers.map((h) => <td key={h} className="px-3 py-2 text-white/70 truncate max-w-[200px]">{row[h] || "—"}</td>)}</tr>)}
                </tbody>
              </table>
            </div>
            {rawData.length > 5 && <p className="text-xs text-white/30 mt-2">{t.import.preview.showingFirst.replace("{{count}}", "5").replace("{{total}}", String(rawData.length))}</p>}
          </div>

          {!hasRequiredMapping && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-6">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-200">{t.import.preview.missingRequired}</p>
                <p className="text-xs text-amber-200/60 mt-1">{t.import.preview.missingRequiredDesc}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => { resetImport(); setStep("upload"); }}><ChevronLeft className="w-4 h-4 mr-2" />{t.common.back}</Button>
            <Button onClick={runValidation} disabled={!hasRequiredMapping || isValidating || (edgeCase?.isEdgeCase && !edgeCase?.canProceed)}>
              {isValidating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Checking database...</> : <>{t.import.preview.validate}<ChevronRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: VALIDATE & REVIEW */}
      {step === "validate" && summary && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium">{t.import.validate.title}</h3>
              <p className="text-sm text-white/50">{summary.readyToImport} rows ready to import • {summary.ignored} ignored</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
            </div>
          </div>

          {renderEdgeCaseAlert()}

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-7 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center cursor-pointer hover:bg-white/[0.04] transition-colors" onClick={() => setFilter('all')}><p className="text-xl font-semibold">{summary.total}</p><p className="text-xs text-white/50">Total</p></div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center cursor-pointer hover:bg-green-500/15 transition-colors" onClick={() => setFilter('ready')}><p className="text-xl font-semibold text-green-400">{summary.readyToImport}</p><p className="text-xs text-green-400/70">Ready</p></div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center cursor-pointer hover:bg-amber-500/15 transition-colors" onClick={() => setFilter('invalid')}><p className="text-xl font-semibold text-amber-400">{summary.invalid}</p><p className="text-xs text-amber-400/70">Invalid</p></div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center cursor-pointer hover:bg-blue-500/15 transition-colors" onClick={() => setFilter('inFile')}><p className="text-xl font-semibold text-blue-400">{summary.fileDuplicates}</p><p className="text-xs text-blue-400/70">In File</p></div>
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center cursor-pointer hover:bg-purple-500/15 transition-colors" onClick={() => setFilter('inDb')}><p className="text-xl font-semibold text-purple-400">{summary.dbDuplicates}</p><p className="text-xs text-purple-400/70">In DB</p></div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center cursor-pointer hover:bg-white/[0.04] transition-colors" onClick={() => setFilter('ignored')}><p className="text-xl font-semibold text-white/60">{summary.ignored}</p><p className="text-xs text-white/50">Ignored</p></div>
            {summary.failed > 0 && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center cursor-pointer hover:bg-red-500/15 transition-colors" onClick={() => setFilter('failed')}><p className="text-xl font-semibold text-red-400">{summary.failed}</p><p className="text-xs text-red-400/70">Failed</p></div>
            )}
          </div>

          {/* FILTER TABS */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1 flex-wrap">
              {(['all', 'ready', 'invalid', 'inFile', 'inDb', 'ignored'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    filter === f 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f === 'all' && `All (${summary.total})`}
                  {f === 'ready' && `Ready (${summary.readyToImport})`}
                  {f === 'invalid' && `Invalid (${summary.invalid})`}
                  {f === 'inFile' && `In File (${summary.fileDuplicates})`}
                  {f === 'inDb' && `In DB (${summary.dbDuplicates})`}
                  {f === 'ignored' && `Ignored (${summary.ignored})`}
                </button>
              ))}
            </div>
          </div>

          {/* BATCH ACTIONS */}
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex-wrap">
            <span className="text-xs text-white/50 mr-2">Batch:</span>
            <Button variant="ghost" size="sm" onClick={ignoreAllInvalid} disabled={summary.invalid === 0} className="text-xs">
              <EyeOff className="w-3 h-3 mr-1" />Ignore All Invalid
            </Button>
            <Button variant="ghost" size="sm" onClick={ignoreAllFileDuplicates} disabled={summary.fileDuplicates === 0} className="text-xs">
              <EyeOff className="w-3 h-3 mr-1" />Ignore All File Dups
            </Button>
            <Button variant="ghost" size="sm" onClick={ignoreAllDbDuplicates} disabled={summary.dbDuplicates === 0} className="text-xs">
              <EyeOff className="w-3 h-3 mr-1" />Ignore All DB Dups
            </Button>
            <Button variant="ghost" size="sm" onClick={keepAll} disabled={summary.ignored === 0} className="text-xs">
              <Eye className="w-3 h-3 mr-1" />Keep All
            </Button>
            {selectedRows.size > 0 && (
              <Button variant="ghost" size="sm" onClick={ignoreSelected} className="text-xs text-amber-400">
                <EyeOff className="w-3 h-3 mr-1" />Ignore Selected ({selectedRows.size})
              </Button>
            )}
          </div>

          {/* REVIEW TABLE */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2"><Edit2 className="w-4 h-4" />Review & Edit {filter !== 'all' && <span className="text-white/50">• {filteredResults.length} shown</span>}</h4>
            
            {filteredResults.length === 0 ? (
              <div className="text-center py-12 bg-white/[0.02] rounded-lg border border-white/[0.06]">
                <Info className="w-8 h-8 text-white/30 mx-auto mb-3" />
                <p className="text-sm text-white/50">No rows match this filter</p>
                <p className="text-xs text-white/30 mt-1">Try selecting a different filter</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto rounded-lg border border-white/[0.06]">
                <table className="w-full text-sm">
                  <thead className="bg-white/[0.02] sticky top-0">
                    <tr>
                      <th className="px-2 py-2 text-left text-white/50 font-normal w-10">
                        <input
                          type="checkbox"
                          checked={filteredResults.length > 0 && filteredResults.every(r => selectedRows.has(validationResults.indexOf(r)))}
                          onChange={toggleSelectAll}
                          className="rounded border-white/20 bg-transparent"
                        />
                      </th>
                      <th className="px-2 py-2 text-left text-white/50 font-normal w-14">Row</th>
                      <th className="px-2 py-2 text-left text-white/50 font-normal">Name</th>
                      <th className="px-2 py-2 text-left text-white/50 font-normal">Email</th>
                      <th className="px-2 py-2 text-left text-white/50 font-normal">Phone</th>
                      <th className="px-2 py-2 text-left text-white/50 font-normal">Status</th>
                      <th className="px-2 py-2 text-left text-white/50 font-normal">Why Not Importable</th>
                      <th className="px-2 py-2 text-left text-white/50 font-normal">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result) => {
                      const originalIndex = validationResults.indexOf(result);
                      const errorMessage = getRowImportError(result.isValid, result.isDuplicateInFile, result.isDuplicateInDb, result.ignored, result.errors);
                      return (
                        <tr key={originalIndex} className={`border-t border-white/[0.06] ${result.ignored ? 'opacity-50' : ''}`}>
                          <td className="px-2 py-2">
                            <input
                              type="checkbox"
                              checked={selectedRows.has(originalIndex)}
                              onChange={() => toggleSelectRow(originalIndex)}
                              className="rounded border-white/20 bg-transparent"
                            />
                          </td>
                          <td className="px-2 py-2 text-white/50">{result.row}</td>
                          <td className="px-2 py-2" onClick={() => editingCell?.rowIndex !== originalIndex && setEditingCell({rowIndex: originalIndex, field: nameField})}>
                            {editingCell?.rowIndex === originalIndex && editingCell.field === nameField ? (
                              <input
                                type="text"
                                defaultValue={(result.data[nameField] as string) || ''}
                                onBlur={(e) => { handleCellEdit(originalIndex, nameField, e.target.value); setEditingCell(null); }}
                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                className="w-full bg-black border border-white/20 rounded px-2 py-1 text-sm"
                                autoFocus
                              />
                            ) : (
                              <span 
                                className="cursor-pointer hover:text-white text-white/70 border-b border-dashed border-white/20"
                              >
                                {(result.data[nameField] as string) || <span className="text-amber-400 italic">empty</span>}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2" onClick={() => editingCell?.rowIndex !== originalIndex && setEditingCell({rowIndex: originalIndex, field: 'email'})}>
                            {editingCell?.rowIndex === originalIndex && editingCell.field === 'email' ? (
                              <input
                                type="text"
                                defaultValue={(result.data.email as string) || ''}
                                onBlur={(e) => { handleCellEdit(originalIndex, 'email', e.target.value); setEditingCell(null); }}
                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                className="w-full bg-black border border-white/20 rounded px-2 py-1 text-sm"
                                autoFocus
                              />
                            ) : (
                              <span 
                                className={`cursor-pointer hover:text-white border-b border-dashed border-white/20 ${result.errors.some(e => e.includes('email')) ? 'text-amber-400' : 'text-white/70'}`}
                              >
                                {(result.data.email as string) || <span className="text-white/30">—</span>}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2" onClick={() => editingCell?.rowIndex !== originalIndex && setEditingCell({rowIndex: originalIndex, field: 'phone'})}>
                            {editingCell?.rowIndex === originalIndex && editingCell.field === 'phone' ? (
                              <input
                                type="text"
                                defaultValue={(result.data.phone as string) || ''}
                                onBlur={(e) => { handleCellEdit(originalIndex, 'phone', e.target.value); setEditingCell(null); }}
                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                className="w-full bg-black border border-white/20 rounded px-2 py-1 text-sm"
                                autoFocus
                              />
                            ) : (
                              <span 
                                className={`cursor-pointer hover:text-white border-b border-dashed border-white/20 ${result.errors.some(e => e.includes('phone')) ? 'text-amber-400' : 'text-white/70'}`}
                              >
                                {(result.data.phone as string) || <span className="text-white/30">—</span>}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2">{getStatusBadge(result)}</td>
                          <td className="px-2 py-2 text-xs text-white/50 max-w-[200px] truncate" title={errorMessage}>
                            {errorMessage || <span className="text-green-400/70">Ready to import</span>}
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => toggleIgnoreRow(originalIndex)}
                                className={result.ignored ? 'text-amber-400' : ''}
                              >
                                {result.ignored ? <><Eye className="w-3 h-3 mr-1" />Keep</> : <><EyeOff className="w-3 h-3 mr-1" />Ignore</>}
                              </Button>
                              {!result.isValid && !result.ignored && (
                                <Button variant="ghost" size="sm" onClick={() => revalidateRow(originalIndex)}>
                                  <RefreshCw className="w-3 h-3 mr-1" />Check
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep("preview")}><ChevronLeft className="w-4 h-4 mr-2" />{t.common.back}</Button>
            <Button 
              onClick={executeImportHandler} 
              disabled={summary.readyToImport === 0 || isImporting || (edgeCase?.isEdgeCase && !edgeCase?.canProceed)}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {importProgress ? `${importProgress.processed}/${importProgress.total}` : t.import.validate.importing}
                </>
              ) : (
                <><FileCheck className="w-4 h-4 mr-2" />{t.import.validate.import.replace("{{count}}", String(summary.readyToImport))}</>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: RESULTS */}
      {step === "results" && summary && (
        <Card className="p-12">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${summary.failed > 0 ? 'bg-amber-500/10' : 'bg-green-500/10'}`}>
              {summary.failed > 0 ? <AlertCircle className="w-10 h-10 text-amber-400" /> : <CheckCircle className="w-10 h-10 text-green-400" />}
            </div>
            <h3 className="text-2xl font-semibold mb-2">
              {summary.failed > 0 ? 'Import Completed with Issues' : t.import.results.success}
            </h3>
            <p className="text-white/50">
              {formatImportSummary({
                total: summary.total,
                imported: summary.imported,
                invalid: summary.invalid,
                fileDuplicates: summary.fileDuplicates,
                dbDuplicates: summary.dbDuplicates,
                ignored: summary.ignored,
                failed: summary.failed,
              })}
            </p>
          </div>

          {/* Summary Cards */}
          <div className={`grid gap-4 max-w-2xl mx-auto mb-8 ${summary.failed > 0 ? 'grid-cols-5' : 'grid-cols-4'}`}>
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10"><p className="text-2xl font-semibold text-green-400">{summary.imported}</p><p className="text-xs text-white/50">Imported</p></div>
            {summary.failed > 0 && (
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10"><p className="text-2xl font-semibold text-red-400">{summary.failed}</p><p className="text-xs text-white/50">Failed</p></div>
            )}
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-2xl font-semibold text-amber-400">{summary.invalid}</p><p className="text-xs text-white/50">Invalid</p></div>
            <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10"><p className="text-2xl font-semibold text-blue-400">{summary.fileDuplicates}</p><p className="text-xs text-white/50">In File</p></div>
            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10"><p className="text-2xl font-semibold text-purple-400">{summary.dbDuplicates}</p><p className="text-xs text-white/50">In DB</p></div>
          </div>

          {/* Download Reports */}
          <div className="max-w-2xl mx-auto mb-8">
            <h4 className="text-sm font-medium mb-3 text-white/70">Download Reports</h4>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button variant="outline" size="sm" onClick={() => downloadReport('imported')} disabled={summary.imported === 0}>
                <Download className="w-4 h-4 mr-2" />Imported ({summary.imported})
              </Button>
              {summary.failed > 0 && (
                <Button variant="outline" size="sm" onClick={() => downloadReport('failed')} disabled={summary.failed === 0}>
                  <Download className="w-4 h-4 mr-2" />Failed ({summary.failed})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => downloadReport('invalid')} disabled={summary.invalid === 0}>
                <Download className="w-4 h-4 mr-2" />Invalid ({summary.invalid})
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadReport('skipped')} disabled={summary.fileDuplicates + summary.dbDuplicates + summary.ignored === 0}>
                <Download className="w-4 h-4 mr-2" />Skipped ({summary.fileDuplicates + summary.dbDuplicates + summary.ignored})
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Button variant="outline" onClick={() => { resetImport(); setStep("upload"); }}>
              {t.import.results.importMore}
            </Button>
            <Button onClick={() => router.push(entityType === "seller" ? "/sellers" : "/buyers")}>
              View {entityType === "seller" ? "Sellers" : "Buyers"}
            </Button>
            <Button variant="ghost" onClick={() => router.push("/")}>
              Command Center
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
