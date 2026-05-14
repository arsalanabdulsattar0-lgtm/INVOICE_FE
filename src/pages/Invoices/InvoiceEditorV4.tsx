import React, { useState } from 'react';
import type { InvoiceData, InvoiceItem } from '../../types';
import {
  Plus,
  Trash2,
  History,
  Save,
  Zap,
  Paperclip,
  Upload,
  Search,
  Check,
  FileText,
  X,
  AlertCircle,
  Clock,
  CheckCircle,
  FileEdit,
} from 'lucide-react';
import { Input, TextArea } from '../../components/ui/FormControls';

interface Props {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

type PaymentStatus = 'draft' | 'pending' | 'paid' | 'overdue';

const statusConfig: Record<PaymentStatus, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  draft: { label: 'Draft', icon: FileEdit, bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' },
  pending: { label: 'Pending', icon: Clock, bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  paid: { label: 'Paid', icon: CheckCircle, bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  overdue: { label: 'Overdue', icon: AlertCircle, bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
};

const InvoiceEditorV4: React.FC<Props> = ({ data, onChange }) => {
  const brand = {
    primary: '#2759CD',
    dark: '#304166',
    accent: '#EE4932',
    soft: '#BDD1FF',
    surface: '#EFF5FC',
    white: '#FFFFFF',
  };

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  const [files, setFiles] = useState([
    { name: 'project_brief.pdf', size: '1.2 MB' },
    { name: 'logo_assets.zip', size: '4.5 MB' },
  ]);

  const removeFile = (index: number) => setFiles(files.filter((_, i) => i !== index));

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      productCode: '',
      description: '',
      unit: '',
      unitDetails: '',
      quantity: 1,
      price: 0,
      discount: 0,
      tax: 0,
      furtherTax: 0
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) =>
    onChange({ ...data, items: data.items.filter((item) => item.id !== id) });

  const updateItem = (id: string, updates: Partial<InvoiceItem>) =>
    onChange({ ...data, items: data.items.map((item) => (item.id === id ? { ...item, ...updates } : item)) });

  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price) - item.discount + item.tax + item.furtherTax, 0);
  const taxAmount = (subtotal * data.taxRate) / 100;
  const discountVal = data.discountAmount || (subtotal * data.discountPercentage) / 100;
  const netPayable = subtotal + taxAmount - discountVal + data.shippingCharges + data.roundOff;

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2 });

  const currencySymbol = '$';

  const status = statusConfig[paymentStatus];
  const StatusIcon = status.icon;

  const filteredItems = data.items.filter(item =>
    item.description.toLowerCase().includes(itemSearchQuery.toLowerCase())
  );

  // Section header helper
  const SectionHeader = ({ title, badge }: { title: string; badge?: string }) => (
    <div className="px-6 py-3 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
      <h3 className="text-[11px] font-bold">{title}</h3>
      {badge && <div className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-bold">{badge}</div>}
    </div>
  );

  return (
    <div className="min-h-screen p-4 lg:px-8 lg:py-8 font-sans [&_input]:shadow-none [&_select]:shadow-none [&_textarea]:shadow-none" style={{ backgroundColor: brand.surface }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6" style={{ borderColor: brand.dark + '10' }}>
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-[11px] mb-1" style={{ color: brand.primary }}>
              <Zap className="w-3 h-3 fill-current" />
              <span>System V4.0</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-4" style={{ color: brand.dark }}>
              Invoice Node
              <span className="h-5 w-[1px]" style={{ backgroundColor: brand.dark + '20' }} />
              <span className="font-medium text-base opacity-40">#{data.invoiceNumber}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Payment Status Badge — interactive */}
            <div className="flex items-center gap-1 rounded-xl border px-3 py-1.5" style={{ backgroundColor: status.bg, borderColor: status.border }}>
              <StatusIcon className="w-3.5 h-3.5" style={{ color: status.text }} />
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="text-[10px] font-bold bg-transparent border-none outline-none cursor-pointer"
                style={{ color: status.text }}
              >
                {(Object.keys(statusConfig) as PaymentStatus[]).map((s) => (
                  <option key={s} value={s}>{statusConfig[s].label}</option>
                ))}
              </select>
            </div>

            <button className="h-9 px-4 bg-white border font-bold text-[11px] rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2" style={{ color: brand.dark, borderColor: brand.dark + '15' }}>
              <History className="w-3.5 h-3.5" /> Activity
            </button>
            <button className="h-9 px-6 text-white font-bold rounded-lg text-[11px] shadow-lg transition-all flex items-center gap-2 hover:opacity-90" style={{ backgroundColor: brand.primary }}>
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>

        <div className="space-y-6">

          {/* ── General Information ── */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: brand.dark + '10' }}>
            <SectionHeader title="General Information" badge="Identity Layer" />
            <div className="p-4 space-y-4">

              {/* Row 1: Customer, Invoice ID, Reference, Product Code */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-4">
                  <Input variant="compact" label="Customer Entity" icon={Search} placeholder="Search client..." value={data.clientName}
                    onChange={(e) => onChange({ ...data, clientName: e.target.value })} />
                </div>
                <div className="lg:col-span-2">
                  <Input variant="compact" label="Invoice ID" className="font-mono" style={{ color: brand.primary }}
                    value={data.invoiceNumber} onChange={(e) => onChange({ ...data, invoiceNumber: e.target.value })} />
                </div>
                <div className="lg:col-span-2">
                  <Input variant="compact" label="Reference" placeholder="PO-NODE-004" value={data.reference}
                    onChange={(e) => onChange({ ...data, reference: e.target.value })} />
                </div>
                <div className="lg:col-span-4">
                  <Input variant="compact" label="Product Code / Barcode" placeholder="Scan or enter code..." value={data.subject}
                    onChange={(e) => onChange({ ...data, subject: e.target.value })} />
                </div>
              </div>

              {/* Row 2: Dates */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-2">
                  <Input variant="compact" label="Issue Date" type="date" value={data.date}
                    onChange={(e) => onChange({ ...data, date: e.target.value })} />
                </div>
                <div className="lg:col-span-2">
                  <Input variant="compact" label="Due Date" type="date" value={data.dueDate}
                    onChange={(e) => onChange({ ...data, dueDate: e.target.value })} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Transaction Entries ── */}
          <div className="bg-white border rounded-xl overflow-hidden shadow-sm" style={{ borderColor: brand.dark + '10' }}>
            <div className="px-6 py-3 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <h3 className="text-[11px] font-bold">Transaction Entries</h3>
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: brand.soft, color: brand.dark }}>
                  {filteredItems.length} items
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative hidden sm:block">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={itemSearchQuery}
                    onChange={(e) => setItemSearchQuery(e.target.value)}
                    className="w-48 bg-white/10 border border-white/20 rounded-lg py-1.5 pl-7 pr-3 text-[10px] font-bold text-white placeholder:text-white/60 outline-none focus:bg-white/20 focus:border-white/40 transition-all"
                  />
                </div>
                <button onClick={addItem}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-white font-bold rounded-lg hover:bg-slate-50 transition-all text-[11px] shrink-0"
                  style={{ color: brand.primary }}>
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[280px]">
              <table className="w-full relative">
                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                  <tr className="text-[10px] font-bold border-b" style={{ color: brand.dark, borderColor: brand.dark + '08' }}>
                    <th className="px-4 py-3.5 text-left w-10">#</th>
                    <th className="px-3 py-3.5 text-left w-28">Product Code</th>
                    <th className="px-3 py-3.5 text-left min-w-[200px]">Description</th>
                    <th className="px-3 py-3.5 text-center w-20">Unit</th>
                    <th className="px-3 py-3.5 text-left w-28">Unit Details</th>
                    <th className="px-3 py-3.5 text-center w-20">Qty</th>
                    <th className="px-3 py-3.5 text-right w-28">Price</th>
                    <th className="px-3 py-3.5 text-right w-24">Discount</th>
                    <th className="px-3 py-3.5 text-right w-24">Tax</th>
                    <th className="px-3 py-3.5 text-right w-24">Further Tax</th>
                    <th className="px-4 py-3.5 text-right w-32">Total</th>
                    <th className="px-3 py-3.5 w-10" />
                  </tr>
                </thead>
                <tbody style={{ borderColor: brand.dark + '10' }}>
                  {filteredItems.map((item, idx) => (
                    <tr key={item.id} className="group hover:bg-slate-50/40 transition-colors border-b last:border-0" style={{ borderColor: brand.dark + '10' }}>
                      <td className="px-4 py-2.5 text-[9px] font-black text-slate-300">{idx + 1}</td>
                      <td className="px-2 py-2.5">
                        <Input
                          variant="compact"
                          placeholder="P-001"
                          value={item.productCode}
                          onChange={(e) => updateItem(item.id, { productCode: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2.5">
                        <Input
                          variant="transparent"
                          placeholder="Item description..."
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2.5">
                        <Input
                          variant="compact"
                          placeholder="pcs"
                          className="text-center"
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2.5">
                        <Input
                          variant="compact"
                          placeholder="Details..."
                          value={item.unitDetails}
                          onChange={(e) => updateItem(item.id, { unitDetails: e.target.value })}
                        />
                      </td>
                      <td className="px-2 py-2.5">
                        <Input
                          type="number"
                          variant="compact"
                          className="text-center"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                        />
                      </td>
                      <td className="px-2 py-2.5">
                        <Input
                          type="number"
                          variant="compact"
                          className="text-right"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                        />
                      </td>
                      <td className="px-2 py-2.5">
                        <Input
                          type="number"
                          variant="compact"
                          className="text-right text-red-500 font-bold"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, { discount: parseFloat(e.target.value) || 0 })}
                        />
                      </td>
                      <td className="px-2 py-2.5">
                        <Input
                          type="number"
                          variant="compact"
                          className="text-right text-green-600 font-bold"
                          value={item.tax}
                          onChange={(e) => updateItem(item.id, { tax: parseFloat(e.target.value) || 0 })}
                        />
                      </td>
                      <td className="px-2 py-2.5">
                        <Input
                          type="number"
                          variant="compact"
                          className="text-right text-blue-500 font-bold"
                          value={item.furtherTax}
                          onChange={(e) => updateItem(item.id, { furtherTax: parseFloat(e.target.value) || 0 })}
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right font-black text-[10px] tracking-tight" style={{ color: brand.primary }}>
                        {currencySymbol}{fmt((item.quantity * item.price) - item.discount + item.tax + item.furtherTax)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeItem(item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 transition-all"
                          style={{ color: brand.accent }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[11px] font-bold text-slate-300">
                        {data.items.length === 0 ? 'No items yet — click "Add Item" to begin' : 'No items match your search'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Bottom Tier ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Left: Notes + Attachments */}
            <div className="lg:col-span-7 flex flex-col gap-6">

              {/* Notes */}
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col flex-1" style={{ borderColor: brand.dark + '10' }}>
                <SectionHeader title="Notes & Special Terms" />
                <div className="p-6 flex-1">
                  <TextArea placeholder="Enter payment terms, bank details, or special instructions..." className="h-full min-h-[100px]"
                    value={data.notes} onChange={(e) => onChange({ ...data, notes: e.target.value })} />
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col flex-1" style={{ borderColor: brand.dark + '10' }}>
                <div className="px-6 py-3 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5" />
                    <h3 className="text-[11px] font-bold">Attachments</h3>
                  </div>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: brand.soft, color: brand.dark }}>
                    {files.length} files
                  </span>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 items-stretch">
                  <div className="border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50/30 h-full"
                    style={{ borderColor: brand.dark + '12', backgroundColor: brand.surface }}>
                    <Upload className="w-5 h-5" style={{ color: brand.primary }} />
                    <p className="text-[11px] font-bold" style={{ color: brand.dark }}>Click to Upload</p>
                    <p className="text-[10px] text-slate-400">PDF, PNG, JPG — max 10MB</p>
                  </div>
                  <div className="space-y-2 overflow-y-auto pr-1 h-full">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-lg hover:border-blue-200 transition-colors" style={{ borderColor: brand.dark + '08' }}>
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: brand.primary }} />
                          <div className="truncate">
                            <p className="text-[10px] font-bold truncate" style={{ color: brand.dark }}>{file.name}</p>
                            <p className="text-[8px] text-slate-400">{file.size}</p>
                          </div>
                        </div>
                        <button onClick={() => removeFile(idx)} className="p-1 rounded hover:bg-red-50 transition-colors shrink-0" style={{ color: brand.accent }}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {files.length === 0 && (
                      <p className="text-[10px] text-slate-300 italic text-center pt-4">No files attached</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Financial Matrix */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-full" style={{ borderColor: brand.dark + '10' }}>
                <SectionHeader title="Financial Matrix" badge="PKR" />

                <div className="p-5 flex-1 flex flex-col gap-4">
                  {/* Gross */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-bold text-slate-500">Gross</span>
                    <span className="text-[12px] font-black text-slate-700">{currencySymbol}{fmt(subtotal)}</span>
                  </div>

                  {/* Discount Section */}
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-3">
                      <span className="text-[11px] font-bold text-slate-500 block mb-1">Discount</span>
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        variant="compact"
                        className="text-center"
                        suffix="%"
                        value={data.discountPercentage}
                        onChange={(e) => onChange({ ...data, discountPercentage: parseFloat(e.target.value) || 0, discountAmount: 0 })}
                      />
                    </div>
                    <div className="col-span-5">
                      <Input
                        type="number"
                        variant="compact"
                        className="text-right"
                        placeholder="Amount"
                        value={data.discountAmount}
                        onChange={(e) => onChange({ ...data, discountAmount: parseFloat(e.target.value) || 0, discountPercentage: 0 })}
                      />
                    </div>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between items-center px-1">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-500">Tax</span>
                      <span className="text-[9px] text-slate-400">Calculated ({data.taxRate}%)</span>
                    </div>
                    <span className="text-[12px] font-black text-slate-700">{currencySymbol}{fmt(taxAmount)}</span>
                  </div>

                  {/* Shipping Charges */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-5">
                      <span className="text-[11px] font-bold text-slate-500">Shipping Charges</span>
                    </div>
                    <div className="col-span-7">
                      <Input
                        type="number"
                        variant="compact"
                        className="text-right"
                        value={data.shippingCharges}
                        onChange={(e) => onChange({ ...data, shippingCharges: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  {/* Round Off */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-5">
                      <span className="text-[11px] font-bold text-slate-500">Round Off</span>
                    </div>
                    <div className="col-span-7">
                      <Input
                        type="number"
                        variant="compact"
                        className="text-right"
                        value={data.roundOff}
                        onChange={(e) => onChange({ ...data, roundOff: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-1" />

                  {/* Net */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-black text-slate-700">Net (PKR)</span>
                    <span className="text-[16px] font-black" style={{ color: brand.primary }}>{currencySymbol}{fmt(netPayable)}</span>
                  </div>

                  <button className="w-full py-3 bg-[#EE4932] text-white font-black rounded-xl text-[12px] flex items-center justify-center gap-2 hover:opacity-90 transition-all mt-4">
                    <Check className="w-4 h-4" /> Execute
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEditorV4;
