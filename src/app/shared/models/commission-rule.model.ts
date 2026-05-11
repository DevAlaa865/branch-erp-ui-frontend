export enum CommissionType {
  Branch = 1,
  Employee = 2
}

export interface CommissionRuleDto {
  id: number;
  minPercentage: number;
  maxPercentage?: number | null;
  fixedBonusAmount?: number | null;
  type: CommissionType;
  isActive: boolean;
}

export interface CommissionRuleCreateUpdateDto {
  minPercentage: number;
  maxPercentage?: number | null;
  fixedBonusAmount?: number | null;
  type: CommissionType;
  isActive: boolean;
}
