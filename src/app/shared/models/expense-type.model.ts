export interface ExpenseType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  category: number; // ExpenseCategory enum value
}

export enum ExpenseCategory {
  GeneralExpense = 1,
  OperationalExpense = 2,
  Salary = 3,
  Refund = 4,
  PettyAssignment = 5,
  PettyHolderExpense = 6,
  CollectorTransfer = 7,
  Adjustment = 8
}