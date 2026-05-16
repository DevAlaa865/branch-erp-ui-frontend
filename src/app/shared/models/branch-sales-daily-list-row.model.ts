export interface BranchSalesDailyListRow {
  id: number;
  branchId: number;
  branchName: string;
  salesDate: string;

  cashAmount: number;
  networkAmount: number;
  creditAmount: number;

  totalSales: number;
  grandTotal: number;
  difference: number;

  supervisorNotes?: string; // ملاحظات المشرف
  shortageDetails?: {
    shortageTypeName: string;
    employeeName: string;
    amount: number;
    attachmentPath: string;
    notes?: string;
  }[];
}
