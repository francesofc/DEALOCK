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
  Check,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import Papa from "papaparse";
import { createLead } from "@/lib/data/leads";
import { createClient } from "@/lib/supabase/client";
import { createImportSession, getRecentImportSessions, ImportSession } from "@/lib/data/import-sessions";
import { createBuyer } from "@/lib/data/buyers";

// ============================================
// TYPES
// ============================================

type ImportStep = "upload" | "preview" | "validate" | "results";
type EntityType = "seller" | "buyer";
type FilterType = "all" | "ready" | "invalid" | "inFile" | "inDb" | "ignored";

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
        setRawData(data);
        setHeaders(cols);
        setColumnMapping(detectColumnMapping(cols, fields));
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

  const validateRow = useCallback(async (data: Record<string, unknown>, seenEmails: Set<string>): Promise<Omit<ValidationResult, 'row' | 'ignored'>> => {
    const errors: string[] = [];
    
    const hasName = !!(data[nameField] as string)?.trim();
    const hasEmail = !!(data.email as string)?.trim();
    const hasPhone = !!(data.phone as string)?.trim();

    if (!hasName) errors.push(entityType === "seller" ? "Missing seller name" : "Missing buyer name");
    if (!hasEmail && !hasPhone) errors.push("Missing email and phone");
    if (hasEmail && !validateEmail(data.email as string)) errors.push("Invalid email");
    if (hasPhone && !validatePhone(data.phone as string)) errors.push("Invalid phone");

    const email = (data.email as string)?.toLowerCase();
    let isDuplicateInFile = false;
    let fileDuplicateField: 'email' | 'phone' | 'both' | undefined;
    
    if (email) {
      if (seenEmails.has(email)) {
        isDuplicateInFile = true;
        fileDuplicateField = 'email';
      } else {
        seenEmails.add(email);
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
    };
  }, [entityType, nameField]);

  const runValidation = useCallback(async () => {
    setIsValidating(true);
    const results: ValidationResult[] = [];
    const seenEmails = new Set<string>();

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
      results.push({ row: rowNum, ...validation, ignored: false });
    }

    setValidationResults(results);
    updateSummary(results);
    setStep("validate");
    setIsValidating(false);
  }, [rawData, columnMapping, entityType, validateRow]);

  const updateSummary = (results: ValidationResult[]) => {
    const valid = results.filter(r => r.isValid && !r.ignored).length;
    const ignored = results.filter(r => r.ignored).length;
    setSummary({
      total: results.length,
      valid,
      invalid: results.filter(r => !r.isValid && !r.isDuplicateInFile && !r.isDuplicateInDb && !r.ignored).length,
      fileDuplicates: results.filter(r => r.isDuplicateInFile && !r.ignored).length,
      dbDuplicates: results.filter(r => r.isDuplicateInDb && !r.ignored).length,
      ignored,
      readyToImport: valid,
      imported: 0,
    });
  };

  // ============================================
  // ROW EDITING
  // ============================================

  const handleCellEdit = (rowIndex: number, field: string, value: string) => {
    setValidationResults(prev => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], data: { ...updated[rowIndex].data, [field]: value } };
      // Revalidate immediately after edit
      setTimeout(() => revalidateRow(rowIndex), 0);
      return updated;
    });
  };

  const revalidateRow = async (rowIndex: number) => {
    const row = validationResults[rowIndex];
    const seenEmails = new Set<string>(validationResults
      .filter((r, i) => i !== rowIndex && r.data.email)
      .map(r => (r.data.email as string).toLowerCase()));
    
    const validation = await validateRow(row.data, seenEmails);
    
    setValidationResults(prev => {
      const updated = [...prev];
      updated[rowIndex] = { ...updated[rowIndex], ...validation };
      return updated;
    });
    
    updateSummary(validationResults.map((r, i) => i === rowIndex ? { ...r, ...validation } : r));
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
      // Deselect all visible
      const newSelected = new Set(selectedRows);
      visibleIndices.forEach(i => newSelected.delete(i));
      setSelectedRows(newSelected);
    } else {
      // Select all visible
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
  
  // Derive summary from validationResults - ensures consistency
  useEffect(() => {
    if (step === 'validate' && validationResults.length > 0) {
      const ignoredCount = validationResults.filter(r => r.ignored).length;
      const valid = validationResults.filter(r => r.isValid && !r.ignored).length;

      setSummary({
        total: validationResults.length,
        valid,
        invalid: validationResults.filter(r => !r.isValid && !r.isDuplicateInFile && !r.isDuplicateInDb && !r.ignored).length,
        fileDuplicates: validationResults.filter(r => r.isDuplicateInFile && !r.ignored).length,
        dbDuplicates: validationResults.filter(r => r.isDuplicateInDb && !r.ignored).length,
        ignored: ignoredCount,
        readyToImport: valid,
        imported: summary?.imported || 0,
      });
    }
  }, [validationResults, step]);

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

  const executeImport = useCallback(async () => {
    setIsImporting(true);
    let imported = 0;
    const validRows = validationResults.filter(r => r.isValid && !r.ignored);

    for (const result of validRows) {
      try {
        if (entityType === "seller") {
          await createLead({
            owner_name: (result.data.owner_name as string) || "Unknown",
            email: (result.data.email as string) || "",
            phone: (result.data.phone as string) || "",
            property_type: (result.data.property_type as string) || "apartment",
            city: (result.data.city as string) || "",
            neighborhood: "",
            price: (result.data.price as number) || 0,
            notes: (result.data.notes as string) || null,
            status: (result.data.status as string) || "new",
            source: "csv_import",
            listing_url: null,
            whatsapp_status: "not_sent",
            seller_type: "owner",
            language_preference: "en",
            area_m2: null,
            bedrooms: null,
          } as any);
        } else {
          const supabase = createClient();
          await supabase.from("buyers").insert({
            name: (result.data.name as string) || "Unknown",
            email: (result.data.email as string) || null,
            phone: (result.data.phone as string) || null,
            budget_min: (result.data.budget_min as number) || 0,
            budget_max: (result.data.budget_max as number) || 0,
            property_types: result.data.property_types ? [(result.data.property_types as string)] : [],
            target_areas: result.data.target_areas ? [(result.data.target_areas as string)] : [],
            timeline: (result.data.timeline as string) || "browsing",
            seriousness: (result.data.seriousness as string) || "low",
            pre_approved: (result.data.pre_approved as boolean) || false,
            notes: (result.data.notes as string) || null,
            status: (result.data.status as string) || "new",
          } as any);
        }
        imported++;
      } catch (err) {
        console.error("Import error for row", result.row, err);
      }
    }

    const finalSummary = {
      ...summary!,
      imported,
    };
    setSummary(finalSummary);
    
    // Save import session
    const status = imported === validRows.length 
      ? 'completed' 
      : imported > 0 
        ? 'partial' 
        : 'failed';
    
    await createImportSession({
      entity_type: entityType,
      file_name: fileName,
      total_rows: finalSummary.total,
      imported_count: imported,
      invalid_count: finalSummary.invalid,
      file_duplicate_count: finalSummary.fileDuplicates,
      db_duplicate_count: finalSummary.dbDuplicates,
      ignored_count: finalSummary.ignored,
      status,
    });
    
    // Refresh import history
    await loadImportHistory();
    
    setStep("results");
    setIsImporting(false);
  }, [validationResults, entityType, summary, fileName]);

  // ============================================
  // DOWNLOAD REPORTS
  // ============================================

  const downloadReport = (type: 'invalid' | 'skipped' | 'imported') => {
    let rows: ValidationResult[] = [];
    let filename = '';
    
    switch (type) {
      case 'invalid':
        rows = validationResults.filter(r => !r.isValid && !r.isDuplicateInFile && !r.isDuplicateInDb);
        filename = 'invalid-rows-report.csv';
        break;
      case 'skipped':
        rows = validationResults.filter(r => r.isDuplicateInFile || r.isDuplicateInDb || r.ignored);
        filename = 'skipped-rows-report.csv';
        break;
      case 'imported':
        rows = validationResults.filter(r => r.isValid && !r.ignored);
        filename = 'imported-rows-report.csv';
        break;
    }
    
    if (rows.length === 0) return;

    const csv = Papa.unparse(rows.map(r => ({
      row: r.row,
      ...r.data,
      status: r.isDuplicateInFile ? 'Duplicate in file' : r.isDuplicateInDb ? 'Already in database' : r.ignored ? 'Ignored' : 'Valid',
      errors: r.errors.join("; ") || 'None',
    })));

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadErrorReport = useCallback(() => {
    const problematicRows = validationResults.filter(r => !r.isValid || r.isDuplicateInFile || r.isDuplicateInDb);
    if (problematicRows.length === 0) return;

    const csv = Papa.unparse(problematicRows.map(r => ({
      row: r.row,
      ...r.data,
      errors: r.errors.join("; ") + (r.isDuplicateInFile ? " [Duplicate in file]" : "") + (r.isDuplicateInDb ? " [Already in database]" : ""),
    })));

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  }, [validationResults]);

  // ============================================
  // CSV TEMPLATES
  // ============================================

  const downloadTemplate = (type: 'seller' | 'buyer') => {
    let csv = '';
    let filename = '';
    
    if (type === 'seller') {
      csv = 'owner_name,email,phone,property_type,city,price,notes\n"John Smith","john@example.com","+1234567890","apartment","Miami","500000","Looking to sell quickly"\n"Jane Doe","jane@example.com","+0987654321","house","Boston","750000","Price negotiable"';
      filename = 'seller-import-template.csv';
    } else {
      csv = 'name,email,phone,budget_min,budget_max,property_types,target_areas,timeline,seriousness,pre_approved,notes\n"Mike Buyer","mike@example.com","+1234567890","300000","500000","apartment","Miami","3_months","high",false,"First-time buyer"\n"Sarah Investor","sarah@example.com","+0987654321","500000","1000000","house,commercial","Boston,New York","immediate","very_high",true,"Cash buyer"';
      filename = 'buyer-import-template.csv';
    }
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // ============================================
  // STATUS BADGE HELPER
  // ============================================

  const getStatusBadge = (result: ValidationResult) => {
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
          <Badge variant="secondary" className="text-xs">{t.import.phaseLabel}</Badge>
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
                {importHistory.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <Badge variant={session.status === 'completed' ? 'default' : session.status === 'partial' ? 'secondary' : 'destructive'} className="text-xs">
                        {session.status}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{session.file_name}</p>
                        <p className="text-xs text-white/50">
                          {new Date(session.created_at).toLocaleString()} • {session.entity_type === 'seller' ? 'Sellers' : 'Buyers'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{session.imported_count} / {session.total_rows}</p>
                      <p className="text-xs text-white/50">imported</p>
                    </div>
                  </div>
                ))}
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
            <Button variant="ghost" size="sm" onClick={() => setStep("upload")}><X className="w-4 h-4 mr-2" />{t.common.cancel}</Button>
          </div>

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
            <Button variant="outline" onClick={() => setStep("upload")}><ChevronLeft className="w-4 h-4 mr-2" />{t.common.back}</Button>
            <Button onClick={runValidation} disabled={!hasRequiredMapping || isValidating}>
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

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-6 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center cursor-pointer hover:bg-white/[0.04] transition-colors" onClick={() => setFilter('all')}><p className="text-xl font-semibold">{summary.total}</p><p className="text-xs text-white/50">Total</p></div>
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center cursor-pointer hover:bg-green-500/15 transition-colors" onClick={() => setFilter('ready')}><p className="text-xl font-semibold text-green-400">{summary.readyToImport}</p><p className="text-xs text-green-400/70">Ready</p></div>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center cursor-pointer hover:bg-amber-500/15 transition-colors" onClick={() => setFilter('invalid')}><p className="text-xl font-semibold text-amber-400">{summary.invalid}</p><p className="text-xs text-amber-400/70">Invalid</p></div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center cursor-pointer hover:bg-blue-500/15 transition-colors" onClick={() => setFilter('inFile')}><p className="text-xl font-semibold text-blue-400">{summary.fileDuplicates}</p><p className="text-xs text-blue-400/70">In File</p></div>
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center cursor-pointer hover:bg-purple-500/15 transition-colors" onClick={() => setFilter('inDb')}><p className="text-xl font-semibold text-purple-400">{summary.dbDuplicates}</p><p className="text-xs text-purple-400/70">In DB</p></div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center cursor-pointer hover:bg-white/[0.04] transition-colors" onClick={() => setFilter('ignored')}><p className="text-xl font-semibold text-white/60">{summary.ignored}</p><p className="text-xs text-white/50">Ignored</p></div>
          </div>

          {/* FILTER TABS */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1">
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
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
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
                    <th className="px-2 py-2 text-left text-white/50 font-normal">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result) => {
                    const originalIndex = validationResults.indexOf(result);
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
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep("preview")}><ChevronLeft className="w-4 h-4 mr-2" />{t.common.back}</Button>
            <Button onClick={executeImport} disabled={summary.readyToImport === 0 || isImporting}>
              {isImporting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t.import.validate.importing}</> : <><FileCheck className="w-4 h-4 mr-2" />{t.import.validate.import.replace("{{count}}", String(summary.readyToImport))}</>}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: RESULTS */}
      {step === "results" && summary && (
        <Card className="p-12">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">{t.import.results.success}</h3>
            <p className="text-white/50">{t.import.results.imported.replace("{{count}}", String(summary.imported))}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10"><p className="text-2xl font-semibold text-green-400">{summary.imported}</p><p className="text-xs text-white/50">Imported</p></div>
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
