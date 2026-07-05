export interface ManualPostingRequest {
  branchId: number;
  date: string;
  depositCollectorId?: number;
  amount: number;   // 🔥 المبلغ اليدوي الجديد
}

export interface ManualPostingResult {
  success: boolean;
  branchName: string;
  cityName: string;
  cashBoxName: string;
  amount: number;
  
  date: string;
}