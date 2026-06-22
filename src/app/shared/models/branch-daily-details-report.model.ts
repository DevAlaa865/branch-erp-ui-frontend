export interface BranchDailyDetailDto {
  salesDate: string;
  totalSales: number;
  totalReturns: number;
  netSales: number;
  invoiceCount: number;
  quantityCount: number;
  avgInvoice: number;
  avgPieces: number;
}

export interface BranchDailyDetailReportResponse {
  items: BranchDailyDetailDto[];
  totalSales: number;
  totalReturns: number;
  netSales: number;
  invoiceCount: number;
  quantityCount: number;
  avgInvoice: number;
  avgPieces: number;
}
