export interface ExpenseType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  category: number; // ExpenseCategory enum value
}