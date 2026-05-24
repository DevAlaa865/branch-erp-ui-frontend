export interface ManagerBranchControlIssue {
  id: number;
  branchId: number;
  branchName: string;
  salesDate: string;
  differenceAmount: number;
  controlNotes?: string | null;
  resolutionType?: number | null;
  isManagerApproved: boolean;
  managerSignature?: string | null;
  managerNotes?: string | null;
  branchNumber: number;
}
