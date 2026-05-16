export interface BranchSalesDailyDetails {
  id: number;
  branchId: number;
  branchName: string;
  supervisorId: number;
  supervisorName: string;
  salesDate: string;
  noSalesToday: boolean;
  attachmentPath: string;

  totalSales: number;
  grandTotal: number;
  cashAmount: number;
  networkAmount: number;
  creditAmount: number;
  difference: number;

  supervisorNotes: string | null;
  accountingNotes: string | null;
  auditNotes: string | null;
  financeNotes: string | null;
  salesDeptNotes: string | null;
  returnsDeptNotes: string | null;
  discountsDeptNotes: string | null;

  totalInvoicesCount: number;
  totalQuantities: number;

  shortageDetails: ShortageDetail[];
}

export interface ShortageDetail {
  id: number;
  shortageTypeId: number;
  shortageTypeName: string;

  amount: number;
  attachmentPath: string;

  employeeId: number | null;
  employeeName: string | null;

  isReturnApproved: boolean;
  isDiscountApproved: boolean;

  returnNotes: string | null;
  discountNotes: string | null;
}
