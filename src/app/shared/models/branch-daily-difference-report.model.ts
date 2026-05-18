export interface BranchDailyDifferenceReport {
  branchId: number;
  branchNumber: number;     // 🔥 جديد
  branchName: string;
  salesDate: string;        // 🔥 جديد
  difference?: number;
  networkAmount?: number;
}

export interface BranchDailyDifferenceReportFilter {
  cityId?: number | null;
  branchIds?: number[];

  branchNumber?: number | null;   // 🔥 جديد

  isDifferenceLessOrEqual35?: boolean | null;
  isDifferenceGreaterThan35?: boolean | null;
  isNetworkReport?: boolean | null;

  fromDate?: string | null;
  toDate?: string | null;
}
