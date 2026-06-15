export interface BranchDailyDifferenceReport {
  branchId: number;
  branchNumber: number;
  branchName: string;
  salesDate: string;
  difference?: number;
  networkAmount?: number;
  salesDailyId?: number;
}

export interface BranchDailyDifferenceReportFilter {
 cityIds?: number[];
  branchIds?: number[];

  branchNumber?: number | null;

  // ⭐ العجز
  isAllowedShortage?: boolean | null;   // -35 إلى -1
  isBigShortage?: boolean | null;       // أقل من -35

  // ⭐ الزيادة الجديدة
  isSmallIncrease?: boolean | null;     // 1 إلى 35
  isBigIncrease?: boolean | null;       // أكبر من 35

  isNetworkReport?: boolean | null;

  fromDate?: string | null;
  toDate?: string | null;
}
