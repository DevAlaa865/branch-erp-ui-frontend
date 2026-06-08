export interface SalesSummaryReportFilter {
  fromDate: string;   // ISO string
  toDate: string;     // ISO string
  regionId?: number | null;
  cityId?: number | null;
  branchId?: number | null;
}

export interface SalesSummaryReportItem {
  branchId: number;
  branchNumber:number;
  branchName: string;
  totalSales: number;
  totalReturns: number;
  netSales: number;
  invoiceCount: number;
  quantityCount: number;
  activityType: string;
}
