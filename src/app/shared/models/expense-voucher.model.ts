// ============================================================
// Enums
// ============================================================

export enum ExpenseVoucherSource {
  DepositResponsible = 0,
  PettySettlement = 1
}

export enum ExpenseApprovalRole {
  Manager = 0,
  HR = 1,
  Accountant = 2,
  FinanceManager = 3,
  GeneralManager = 4
}

// ============================================================
// Attachments
// ============================================================

export interface ExpenseVoucherLineAttachment {
  id: number;
  fileName: string;
  fileUrl: string;
}

// ============================================================
// Approvals
// ============================================================

export interface ExpenseVoucherLineApproval {
  id: number;
  role: ExpenseApprovalRole;
  approvedByUserId?: string | null;
  approvedByUserName?: string | null;
  approvedDate?: string | null;
  notes?: string | null;
}

// ============================================================
// Voucher Line
// ============================================================

export interface ExpenseVoucherLine {
  id: number;
  lineNumber: number;

  expenseTypeId: number;
  expenseTypeName: string;

  amount: number;

  branchId?: number | null;
  branchName?: string | null;

  pettyHolderId?: number | null;
  pettyHolderName?: string | null;

  description?: string | null;

  attachments: ExpenseVoucherLineAttachment[];
  approvals: ExpenseVoucherLineApproval[];
}

// ============================================================
// Voucher (Main)
// ============================================================

export interface ExpenseVoucher {
  id: number;

  voucherNumber: string;
  voucherDate: string;

  cashBoxId: number;
  totalAmount: number;

  createdByUserId: string;
  createdByUserName?: string | null;

  approvedByUserId?: string | null;
  approvedByUserName?: string | null;
  approvedDate?: string | null;

  description?: string | null;

  status: string;

  source: ExpenseVoucherSource;
  cityId?: number | null;
  branchId?: number | null;

  lines: ExpenseVoucherLine[];
}

// ============================================================
// Create Line Request
// ============================================================

export interface CreateExpenseVoucherLineRequest {
  expenseTypeId: number;
  amount: number;
  branchId?: number | null;
  pettyHolderId?: number | null;
  description?: string | null;
  attachmentUrls: string[];
}

// ============================================================
// Create Voucher Request
// ============================================================

export interface CreateExpenseVoucherRequest {
  voucherDate: string;
  cashBoxId: number;
  createdByUserId: string;
  description?: string | null;

  lines: CreateExpenseVoucherLineRequest[];

  submit: boolean;

  source: ExpenseVoucherSource;

  cityId?: number | null;
  branchId?: number | null;
}
