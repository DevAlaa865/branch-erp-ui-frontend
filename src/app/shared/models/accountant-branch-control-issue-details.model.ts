export interface AccountantBranchControlIssueDetails {
  id: number;
  branchNumber: number;
  branchName: string;
  salesDate: string;
  differenceAmount: number;

  controlNotes: string;
  resolutionType: number | null;

  isManagerApproved: boolean;
  managerNotes?: string | null;
  managerSignature?: string | null;
}
