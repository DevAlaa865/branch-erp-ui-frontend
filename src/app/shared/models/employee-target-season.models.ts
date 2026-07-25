// ===============================
// 🎯 Target Season Models (All-in-One)
// ===============================

// ===============================
// 🟦 1) Shift Header (عرض)
// ===============================
export interface EmployeeShiftTargetSeasonHeader {
  id: number;
  branchId: number;
  branchName: string;
  targetDate: string;
  shiftType: number;
  totalShiftTargetAmount: number;
  employeesCount: number;
  notes?: string;
  createdAt: string;
}

// ===============================
// 🟩 2) Shift Header (إنشاء)
// ===============================
export interface EmployeeShiftTargetSeasonHeaderCreate {
  branchId: number;
  targetDate: string;
  shiftType: number;
  totalShiftTargetAmount: number;
  employeesCount: number;
  notes?: string;
}

// ===============================
// 🟧 3) Excel Upload Row
// ===============================
export interface EmployeeShiftTargetSeasonExcelRowDto {
  branchNumber: number;
  targetDate: string;
  totalShiftTargetAmount: number;
  employeesCount: number;
  shiftType: number;
}

// ===============================
// 🟪 4) Excel Upload DTO
// ===============================
export interface EmployeeShiftTargetSeasonExcelUploadDto {
  rows: EmployeeShiftTargetSeasonExcelRowDto[];
}

// ===============================
// 🟧 5) Personal Target (عرض)
// ===============================
export interface EmployeePersonalTargetSeason {
  id: number;
  shiftHeaderId: number;
  shiftTypeName: string;
  targetDate: string;
  branchId: number;
  branchName: string;

  employeeId: number;
  employeeName: string;

  personalTargetAmount: number;
  createdAt: string;
}

// ===============================
// 🟥 6) Personal Target (إنشاء)
// ===============================
export interface EmployeePersonalTargetSeasonCreate {
  shiftHeaderId: number;
  employeeId: number;
}

// ===============================
// 🟪 7) Achievement (عرض)
// ===============================
export interface EmployeePersonalAchievementSeason {
  id: number;

  employeePersonalTargetId: number;

  employeeId: number;
  employeeName: string;

  personalTargetAmount: number;
  achievedAmount: number;
  achievementPercentage: number;

  commissionAmount: number;

  isOverrideCommission: boolean;
  overrideCommissionReason?: string;

  createdAt: string;
  updatedAt?: string;
}

// ===============================
// 🟫 8) Achievement (إنشاء)
// ===============================
export interface EmployeePersonalAchievementSeasonCreate {
  employeePersonalTargetId: number;
  achievedAmount: number;
}

export interface EmployeePersonalTargetSeasonCreate {
  shiftHeaderId: number;
  employeeId: number;
}

export interface EmployeePersonalTargetSeason {
  id: number;
  shiftHeaderId: number;
  employeeId: number;
  employeeName: string;
  personalTargetAmount: number;
  createdAt: string;
}
