import { BranchControlIssueStatus, ResolutionType } from './enums';

export interface BranchControlIssue {
  id: number;
  branchId: number;
  branchName: string;
  branchNumber: number;   // ⭐ رقم الفرع الحقيقي
  salesDate: string;
  differenceAmount: number;

  sentByUser: string;
  sentAt: string;

  status: BranchControlIssueStatus;
  resolutionType?: ResolutionType | null;
  controlNotes?: string | null;
  resolvedAt?: string | null;

    differenceDirection: number; // 1 = عجز ، 2 = زيادة
}
