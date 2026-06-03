export interface AccountsReturnsDiscountsReport {
  journalDate: string;
  branchId: number;
  branchNumber: number;
  branchName: string;

  shortageTypeId: number;
  shortageTypeName: string;

  amount: number;

  isApproved: boolean;
  source: string;
}

export interface AccountsReturnsDiscountsReportFilter {
  fromDate: string;
  toDate: string;

  cityId?: number | null;
  branchIds?: number[] | null;

  shortageTypeId?: number | null;
  status: number; // 0 = All, 1 = Approved, 2 = NotApproved
}
