export interface PostingDetails {
  id: number;
  date: string;        // SalesDate
  postedAt: string;    // CreatedAt (تاريخ الترحيل الفعلي)
  amount: number;
  cashBoxName: string;
  collectorName: string;
  branchName: string;
  cityName: string;
  description: string;
  direction: string;
  type: string;
}