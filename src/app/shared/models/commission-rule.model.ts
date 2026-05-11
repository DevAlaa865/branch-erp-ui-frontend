export enum CommissionType {
  Branch = 0,
  Employee = 1
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
