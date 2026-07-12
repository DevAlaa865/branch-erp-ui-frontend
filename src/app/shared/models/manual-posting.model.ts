export interface ManualPostingRequest {
  branchId: number;
  date: string;
  cashBoxId: number;     // 🔥 جديد

  postedAmount: number;     // يجي من API اليوميات
  actualAmount: number;     // اليوزر يكتبه
  notes?: string;           // اختياري
}


export interface ManualPostingResult {
  success: boolean;

  branchName: string;
  cashBoxName: string;

  postedAmount: number;
  actualAmount: number;
  finalAmount: number;

  date: string;
}
