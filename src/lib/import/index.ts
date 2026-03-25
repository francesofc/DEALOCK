/**
 * Import Module
 * 
 * Clean, modular import functionality for CSV processing.
 */

// Constants
export {
  SELLER_FIELDS,
  BUYER_FIELDS,
  PROPERTY_TYPE_MAP,
  SELLER_STATUS_MAP,
  BUYER_STATUS_MAP,
  TIMELINE_MAP,
  SERIOUSNESS_MAP,
  type FieldDefinition,
} from "./constants";

// Parsing
export {
  normalizeColumnName,
  detectColumnMapping,
  hasRequiredMapping,
  extractRowData,
  type ColumnMapping,
  type ParsedCSV,
} from "./parsing";

// Validation
export {
  validateEmail,
  validatePhone,
  normalizePhone,
  validateRow,
  parsePrice,
  isEmptyOrHeadersOnly,
  countMeaningfulRows,
  countEmptyRows,
  checkEdgeCases,
  checkImportEdgeCases,
  getRowImportError,
  type EdgeCaseCheck,
  type RowValidationResult,
} from "./validation";

// Duplicate Checking
export {
  checkExistingSeller,
  checkExistingBuyer,
  checkFileDuplicates,
  type DuplicateCheckResult,
} from "./duplicate-check";

// Transformation
export {
  transformToSeller,
  transformToBuyer,
  type TransformedSeller,
  type TransformedBuyer,
} from "./transformation";

// Execution
export {
  executeImport,
  determineImportStatus,
  formatExecutionResult,
  isRetryableError,
  type ImportExecutionResult,
  type FailedRow,
  type ImportProgress,
  type ProgressCallback,
} from "./execution";

// Reports
export {
  generateReportCSV,
  downloadCSV,
  generateSellerTemplate,
  generateBuyerTemplate,
  formatImportSummary,
  generateImportedReport,
  generateInvalidReport,
  generateSkippedReport,
  generateFailedReport,
  generateErrorReport,
  generateReportByType,
  getStatusLabel,
  type ReportRow,
  type ReportType,
  type ImportSummary,
} from "./reports";
