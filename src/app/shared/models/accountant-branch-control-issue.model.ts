export interface AccountantBranchControlIssue {
  id: number;
  branchId: number;
  branchNumber: number;
  branchName: string;
  salesDate: string;
  differenceAmount: number;
  isManagerApproved: boolean;

}
