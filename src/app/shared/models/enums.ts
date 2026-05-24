export enum BranchControlIssueStatus {
  Pending = 0,
  InProgress = 1,
  Resolved = 2
}

export enum ResolutionType {
  EmployeeFault = 1,
  SystemError = 2,
  InventoryDifference = 3,
  Settled = 4,
  UnderReview = 5
}
export enum DifferenceDirection {
  Shortage = 1,   // عجز
  Increase = 2    // زيادة
}