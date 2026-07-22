export type InvoiceStatus = 'Posted' | 'Unposted';

export interface Invoice {
  id: string;
  customer: string;
  customerInitials: string;
  customerColor: string;
  issueDate: string;
  dueDate: string;
  amount: string;
  rawAmount: number;
  status: InvoiceStatus;
  payment: string;
  type: string;
  companyId?: string;
  branchId?: string;
  fbrInvoiceNumber?: string;
}

export interface InvoiceItem {
  id: string;
  productCode: string;
  description: string;
  unit: string;
  unitDetails: string;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  furtherTax: number;
  batchNo?: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  senderName: string;
  senderAddress: string;
  customerName: string;
  customerAddress: string;
  subject: string;
  reference: string;
  productCode: string;
  remarks: string;
  type: string;
  items: InvoiceItem[];
  taxRate: number;
  discountPercentage: number;
  discountAmount: number;
  shippingCharges: number;
  roundOff: number;
  receivedAmount: number;
  bankAccount: string;
  notes: string;
  salesPerson: string;
  department: string;
  fbrInvoiceNumber?: string;
  status?: InvoiceStatus;
}

export interface BPAdjustment {
  id: string;
  date: string;
  partnerType: 'customer' | 'supplier';
  partnerId: string;
  partnerName: string;
  voucherNo: string;
  ref: string;
  debitTotal: number;
  creditTotal: number;
  narration: string;
  status: 'Posted' | 'Unposted';
  companyId: string;
  branchId: string;
}

export interface BPAdjustmentDetailRow {
  partnerId: string;
  date: string;
  voucherNo: string;
  ref: string;
  glCode: string;
  narration: string;
  analysisCode: string;
  deptCode: string;
  debit: number;
  credit: number;
  taxId: string;
  taxAmt: number;
  voucherType: string;
}

export interface BPAdjustmentData {
  adjustmentNumber: string;
  date: string;
  partnerType: 'customer' | 'supplier';
  partnerId: string;
  partnerName: string;
  voucherNo: string;
  ref: string;
  narration: string;
  voucherType: string;
  items: BPAdjustmentDetailRow[];
  status?: 'Posted' | 'Unposted';
}

export interface StockAdjustmentDetailRow {
  productId: string;
  productName: string;
  unit: string;
  date: string;
  detail: string;
  qtyIn: number;
  qtyOut: number;
  batchNo?: string;
  unitPrice: number;
  amount: number;
  locId: string;
}

export interface StockAdjustmentData {
  adjustmentNumber: string;
  adjustmentType: string;
  customerId: string;
  customerName: string;
  srNo: string;
  reference?: string;
  serialNosOut: string;
  serialNosIn: string;
  includeInTaxRecord: boolean;
  items: StockAdjustmentDetailRow[];
  status?: 'Posted' | 'Unposted';
}

export interface StockTransferDetailRow {
  productId: string;
  productName: string;
  unit: string;
  batchNo?: string;
  currentStock: number;
  transferQty: number;
}

export interface StockTransferData {
  transferNumber: string;
  date: string;
  sourceWarehouseId: string;
  sourceWarehouseName: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  gtsNo?: string;
  reference?: string;
  remarks?: string; // mapping to Detail/Remarks
  items: StockTransferDetailRow[];
  status?: 'Posted' | 'Unposted';
}


