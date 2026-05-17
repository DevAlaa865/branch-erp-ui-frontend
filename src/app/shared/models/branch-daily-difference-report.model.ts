export interface BranchDailyDifferenceReport {
  branchId: number;
  branchName: string;
  difference?: number;      // لو تقرير فرق
  networkAmount?: number;   // لو تقرير شبكة
}

export interface BranchDailyDifferenceReportFilter {
  cityId?: number | null;
  branchIds?: number[];
  isDifferenceLessOrEqual35?: boolean | null;
  isDifferenceGreaterThan35?: boolean | null;
  isNetworkReport?: boolean | null;
  fromDate?: string | null;
  toDate?: string | null
}
