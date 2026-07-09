// ============================================================
// Enums
// ============================================================

export enum ExpenseVoucherSource {
  DepositCollector = 1,
  PettySettlement = 2
  
}

export enum ExpenseApprovalRole {
  GeneralManager = 1,        // سامي
  HRManager = 2,             // مدير الـ HR
  BankingExpensesManager = 3,// نزار
  VehiclesManager = 4,       // فيصل
   SalesCommissionManager = 5, // مدير المبيعات - العمولات
  Accountant = 6,            // الحسابات

}



export enum UserType {
  DepositCollector = 1,
  PettyHolder = 2,
  Central = 3
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
   // 🔥 الإدخال المحاسبي
  isAccounted: boolean;
  accountedByUserId?: string | null;
  accountedDate?: string | null;
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
