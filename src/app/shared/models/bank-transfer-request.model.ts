export interface BankTransferRequest {
  id: number;

  requestNumber: string;
  requestDate: string;

  branchId: number;
  branchNumber: number;
  branchName: string;

  invoiceNumber: string;
  invoiceAmount: number;

  transferType: number;
attachmentPath?: string;
  transferAmount: number;

  customerName: string;
  customerMobile: string;

  bankName: string;
  iban: string;

  status: number;

  transferDate?: string;

  createdBy: string;
  processedBy?: string;

  applicantSignature: string;

  transferReferenceNumber?: string;

  notes?: string;
}

export interface CreateBankTransferRequest {
  branchId: number;

  invoiceNumber: string;
  invoiceAmount: number;
attachmentPath?: string;
  transferType: number;

  transferAmount: number;

  customerName: string;
  customerMobile: string;

  bankName: string;
  iban: string;

  applicantSignature: string;

  notes?: string;
}

export interface BankTransferRequestFilter {
  requestNumber?: string;

  branchId?: number;
attachmentPath?: string;
  invoiceNumber?: string;

  customerName?: string;

  customerMobile?: string;

  iban?: string;

  status?: number;

  fromRequestDate?: string;
  toRequestDate?: string;

  fromTransferDate?: string;
  toTransferDate?: string;
}

export interface UpdateTransferStatus {
  requestId: number;

  status: number;

  transferReferenceNumber?: string;
}