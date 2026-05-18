import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InvoiceData, InvoiceItem } from '../../types';
import type { Invoice } from './InvoiceList';
import {
  Plus,
  Trash2,
  Save,
  Paperclip,
  Upload,
  Search,
  X,
  Package,
  Printer,
  Download
} from 'lucide-react';
import { Input, TextArea, Select, ComboBox, ScrollArea } from '../../components/ui/FormControls';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';

// Sample data for the ComboBoxes
const sampleCustomers = [
  { id: '1', name: 'Arsalan Abdul Sattar', subtitle: 'Premium Client · Karachi, PK', fullAddress: 'House 42, Street 5, Karachi, PK', strn: 'STRN-042-2024', ntn: '1234567-8', province: 'Sindh', registrationType: 'Registered', creditLimit: 500000, balance: 125000, status: 'active' },
  { id: '2', name: 'Google DeepMind', subtitle: 'Enterprise · London, UK', fullAddress: '6 Pancras Square, London, UK', strn: 'STRN-UK-9821', ntn: '9876543-1', province: 'London', registrationType: 'Registered', creditLimit: 2000000, balance: 0, status: 'active' },
  { id: '3', name: 'Al-Madina Traders', subtitle: 'Wholesale · Lahore, PK', fullAddress: 'Shop 12, Main Bazar, Lahore, PK', strn: 'STRN-LHR-3310', ntn: '4561237-5', province: 'Punjab', registrationType: 'Unregistered', creditLimit: 150000, balance: 89000, status: 'overdue' },
  { id: '4', name: 'TechFlow Solutions', subtitle: 'SaaS · Dubai, UAE', fullAddress: 'Office 404, Tech Tower, Dubai, UAE', strn: 'STRN-UAE-7821', ntn: '7894561-2', province: 'Dubai', registrationType: 'Registered', creditLimit: 750000, balance: 210000, status: 'active' },
];

const sampleProducts = [
  { id: 'P001', name: 'Logic Board Pro v4', subtitle: 'SKU: LB-V4-001 · $450.00' },
  { id: 'P002', name: 'Wireless Mesh Node', subtitle: 'SKU: WMN-2024 · $120.00' },
  { id: 'P003', name: 'Thermal Paste XG', subtitle: 'SKU: TP-XG-01 · $15.00' },
  { id: 'P004', name: 'Fiber Patch Cord', subtitle: 'SKU: FPC-OS2-1M · $8.00' },
  { id: 'P005', name: 'Core Processor i9', subtitle: 'SKU: CP-I9-14G · $599.00' },
  { id: 'P006', name: 'High-Speed RAM 32GB', subtitle: 'SKU: RAM-DDR5-32 · $110.00' },
  { id: 'P007', name: 'NVMe SSD 2TB', subtitle: 'SKU: SSD-NVME-2TB · $180.00' },
  { id: 'P010', name: 'Chassis Airflow ATX', subtitle: 'SKU: CASE-ATX-AF · $95.00' },
];

interface Props {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
  onSave?: (data: InvoiceData) => void;
  onViewChange?: (view: string) => void;
  onPrint?: (inv: Invoice) => void;
}





const InvoiceEditorV4: React.FC<Props> = ({ data, onChange, onSave, onViewChange, onPrint }) => {
  const { brand } = useTheme();


  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [tableSearchQuery, setTableSearchQuery] = useState<string>('');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>((window as any).isSidebarCollapsed || false);

  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsSidebarCollapsed(customEvent.detail.isCollapsed);
    };
    window.addEventListener('sidebar-toggle', handleToggle);
    return () => window.removeEventListener('sidebar-toggle', handleToggle);
  }, []);

  const unitWidth = isSidebarCollapsed ? 'w-20' : 'w-16';
  const detailsWidth = isSidebarCollapsed ? 'w-24' : 'w-20';
  const qtyWidth = isSidebarCollapsed ? 'w-24' : 'w-20';
  const priceWidth = isSidebarCollapsed ? 'w-24' : 'w-24';
  const discountWidth = isSidebarCollapsed ? 'w-24' : 'w-20';
  const taxWidth = isSidebarCollapsed ? 'w-24' : 'w-20';
  const furtherTaxWidth = isSidebarCollapsed ? 'w-24' : 'w-20';
  const totalWidth = isSidebarCollapsed ? 'w-24' : 'w-20';
  const descriptionWidth = '';
  const tableMinW = isSidebarCollapsed ? 'min-w-[1130px]' : 'min-w-[980px]';

  const [files, setFiles] = useState<{ name: string, size: string }[]>([]);



  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(e.target as Node)) {
        setShowDownloadDropdown(false);
      }
    };
    if (showDownloadDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDownloadDropdown]);

  const handleDownloadExcel = () => {
    // Generate CSV content
    const headers = ['Product Code', 'Description', 'Unit', 'Details', 'Qty', 'Price', 'Discount', 'Tax', 'Further Tax', 'Total'];
    const rows = data.items.map(item => [
      item.productCode,
      item.description,
      item.unit,
      item.unitDetails,
      item.quantity,
      item.price,
      item.discount,
      item.tax,
      item.furtherTax,
      (item.quantity * item.price) - item.discount + item.tax + item.furtherTax
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Invoice_${data.invoiceNumber || 'draft'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedCustomer = sampleCustomers.find(c => c.id === selectedCustomerId) || null;

  const addItem = () => {
    // Prevent adding new item if there's an existing empty item
    const hasEmptyItem = data.items.some(item => !item.productCode);
    if (hasEmptyItem) {
      alert('Please fill the current product details before adding a new one.');
      return;
    }

    const id = crypto.randomUUID();
    const newItem: InvoiceItem = {
      id,
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
    setLastAddedId(id);

    // Auto-scroll to bottom after state update
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
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




  const filteredItems = data.items.filter(item =>
    item.productCode.toLowerCase().includes(tableSearchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(tableSearchQuery.toLowerCase())
  );



  // ── Action Handlers ──
  const handleNewInvoice = () => {
    if (window.confirm('Are you sure you want to create a new invoice? All unsaved changes will be lost.')) {
      onChange({
        invoiceNumber: 'INV-' + Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        senderName: '',
        senderAddress: '',
        clientName: '',
        clientAddress: '',
        subject: '',
        reference: '',
        productCode: '',
        remarks: '',
        type: 'Standard',
        items: [],
        taxRate: 0,
        discountPercentage: 0,
        discountAmount: 0,
        shippingCharges: 0,
        roundOff: 0,
        receivedAmount: 0,
        bankAccount: '',
        notes: ''
      });
      setSelectedCustomerId('');
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(data);
    } else {
      alert('Invoice ' + data.invoiceNumber + ' has been saved successfully!');
    }
  };

  const getMappedInvoice = (): Invoice => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price) - item.discount + item.tax + item.furtherTax, 0);
    const taxAmount = (subtotal * data.taxRate) / 100;
    const discountVal = data.discountAmount || (subtotal * data.discountPercentage) / 100;
    const netPayable = subtotal + taxAmount - discountVal + data.shippingCharges + data.roundOff;

    const initials = data.clientName ? data.clientName.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : 'IV';
    const colors = ['#2759CD', '#10B981', '#F59E0B', '#8B5CF6', '#EE4932', '#0EA5E9', '#EC4899', '#14B8A6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return {
      id: data.invoiceNumber || 'INV-' + Math.floor(1000 + Math.random() * 9000),
      client: data.clientName || 'Unnamed Client',
      clientInitials: initials,
      clientColor: randomColor,
      issueDate: data.date || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      amount: `$${netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      rawAmount: netPayable,
      status: 'Draft',
      payment: 'Net 30',
      type: data.type || 'Standard'
    };
  };

  const handleClose = () => {
    if (window.confirm('Discard all changes and return to dashboard?')) {
      onViewChange?.('dashboard');
    }
  };

  const handlePrint = () => {
    const element = document.getElementById('local-printable-container');
    if (element) {
      // Load html2pdf via CDN dynamically
      const runHtml2Pdf = () => {
        const opt = {
          margin: 0,
          filename: `Invoice_${data.invoiceNumber || 'Draft'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        (window as any).html2pdf().from(element).set(opt).save();
      };

      if (!(window as any).html2pdf) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = runHtml2Pdf;
        document.head.appendChild(script);
      } else {
        runHtml2Pdf();
      }
    } else {
      // Fallback
      window.print();
    }
  };

  // Section header helper
  const SectionHeader = ({ title, badge, className = "" }: { title: string; badge?: string; className?: string }) => (
    <div className={`px-6 py-3 flex items-center justify-between text-white ${className}`} style={{ backgroundColor: brand.primary }}>
      <h3 className="text-[11px] font-bold">{title}</h3>
      {badge && <div className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-bold">{badge}</div>}
    </div>
  );

  return (<>
    <style dangerouslySetInnerHTML={{ __html: `
      @media print {
        .no-print, .no-print * {
          display: none !important;
        }
        aside, nav, header {
          display: none !important;
        }
        body {
          background: white !important;
          color: black !important;
        }
        .min-h-screen {
          background: white !important;
          padding: 0 !important;
          min-height: auto !important;
        }
        .max-w-7xl {
          max-width: 100% !important;
        }
        /* Make inputs look like flat text */
        input, textarea, select {
          border: none !important;
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
          appearance: none !important;
          color: black !important;
        }
        /* Hide buttons or interactive elements */
        button, .btn {
          display: none !important;
        }
      }
    `}} />
    <div className="min-h-screen p-4 lg:px-8 lg:py-8 font-sans [&_input]:shadow-none [&_select]:shadow-none [&_textarea]:shadow-none" style={{ backgroundColor: brand.surface }}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="relative z-50 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6" style={{ borderColor: brand.dark + '10' }}>
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-4 " style={{ color: brand.dark }}>
              Sales Invoice
              <span className="h-8 w-[1px]" style={{ backgroundColor: brand.dark + '20' }} />
              <div className="flex flex-col">
                <span className="font-medium text-base opacity-40 leading-tight">#{data.invoiceNumber}</span>
                <span className="font-medium text-base opacity-40 leading-tight">#DI-543869050</span>
              </div>
            </h1>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Static Status Label remains on the left */}
              <div className="flex items-center gap-2 rounded-xl border px-3 py-1 bg-slate-50 border-slate-200">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span className="text-[10px] font-bold text-slate-500">Draft</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap no-print">
            <Button
              onClick={handleNewInvoice}
              icon={Plus}
              className="bg-emerald-500 hover:bg-emerald-600 border-none shadow-emerald-500/20"
              size="sm"
            >
              New Invoice
            </Button>

            <Button
              variant="primary"
              icon={Save}
              onClick={handleSave}
              size="sm"
            >
              Save
            </Button>

            <Button
              variant="white"
              icon={Printer}
              onClick={() => {
                if (onPrint) {
                  onPrint(getMappedInvoice());
                } else {
                  window.print();
                }
              }}
              size="sm"
            >
              Print
            </Button>

            <div className="relative">
              <Button
                variant="white"
                icon={Download}
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                size="sm"
              >
                PDF/Excel
              </Button>
              <AnimatePresence>
                {showDownloadDropdown && (
                  <motion.div
                    ref={downloadDropdownRef}
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-11 z-30 bg-white rounded-xl shadow-xl border p-2 w-40"
                    style={{ borderColor: brand.dark + '15' }}
                  >
                    <button
                      onClick={() => {
                        setShowDownloadDropdown(false);
                        handlePrint();
                      }}
                      className="w-full text-left px-3 py-2 text-[11px] font-bold hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2"
                      style={{ color: brand.dark }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      PDF Document
                    </button>
                    <button
                      onClick={() => {
                        setShowDownloadDropdown(false);
                        handleDownloadExcel();
                      }}
                      className="w-full text-left px-3 py-2 text-[11px] font-bold hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2"
                      style={{ color: brand.dark }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Excel (CSV)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              variant="white"
              icon={X}
              onClick={handleClose}
              size="sm"
            >
              Close
            </Button>
          </div>
        </div>

        <div className="space-y-6">

          {/* ── General Information + Client Profile (Side-by-Side Cards) ── */}
          <div className="flex gap-4 items-stretch">

            {/* Left Column: General Information */}
            <div className="flex-1 bg-white rounded-xl border shadow-sm relative z-40" style={{ borderColor: brand.dark + '10' }}>
              <SectionHeader title="General Information" badge="Identity Layer" className="rounded-t-xl" />
              <div className="p-4 space-y-3">
                {/* Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-5">
                    <ComboBox
                      variant="compact"
                      label="Customer Entity"
                      placeholder="Search client..."
                      value={selectedCustomerId}
                      options={sampleCustomers}
                      onChange={(id) => {
                        setSelectedCustomerId(id);
                        const client = sampleCustomers.find(c => c.id === id);
                        if (client) {
                          onChange({ ...data, clientName: client.name, clientAddress: client.fullAddress });
                        }
                      }}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Input variant="compact" label="Issue Date" type="date" value={data.date}
                      onChange={(e) => onChange({ ...data, date: e.target.value })} />
                  </div>
                  <div className="lg:col-span-2">
                    <Input variant="compact" label="Invoice ID" className="font-mono" style={{ color: brand.primary }}
                      value={data.invoiceNumber} onChange={(e) => onChange({ ...data, invoiceNumber: e.target.value })} />
                  </div>
                  <div className="lg:col-span-2">
                    <Input variant="compact" label="Reference" placeholder="PO-2026-004" value={data.reference}
                      onChange={(e) => onChange({ ...data, reference: e.target.value })} />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-5">
                    <Input variant="compact" label="Customer Address" placeholder="Street, City, Country..." value={data.clientAddress || ''} readOnly />
                  </div>
                  <div className="lg:col-span-2">
                    <Input variant="compact" label="Due Date" type="date" value={data.dueDate}
                      onChange={(e) => onChange({ ...data, dueDate: e.target.value })} />
                  </div>
                  <div className="lg:col-span-3">
                    <Select
                      variant="compact"
                      label="Invoice Type"
                      value={data.type || 'Standard'}
                      onChange={(e) => onChange({ ...data, type: e.target.value })}
                      options={[
                        { value: 'Standard', label: 'Standard Invoice' },
                        { value: 'Service', label: 'Service Invoice' },
                        { value: 'Product', label: 'Product Sale' },
                        { value: 'Subscription', label: 'Subscription' }
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Independent Client Profile Card */}
            <AnimatePresence mode="wait">
              {selectedCustomer ? (
                <motion.div
                  key={selectedCustomer.id}
                  initial={{ opacity: 0, x: 20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-[240px] shrink-0 bg-white rounded-xl border shadow-md overflow-hidden"
                  style={{ borderColor: brand.primary + '30' }}
                >
                  {/* Header */}
                  <div className="px-3 py-2.5 flex items-center justify-between" style={{ backgroundColor: brand.primary }}>
                    <span className="text-[10px] font-black text-white tracking-widest">Client Profile</span>
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-black  tracking-wider ${selectedCustomer.status === 'active' ? 'bg-emerald-400/30 text-emerald-100' :
                      selectedCustomer.status === 'overdue' ? 'bg-red-400/30 text-red-100' :
                        'bg-slate-400/30 text-slate-100'
                      }`}>{selectedCustomer.status}</div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-3 bg-gradient-to-b from-[#EFF5FC]/60 to-white">
                    {[
                      { label: 'NTN', value: selectedCustomer.ntn },
                      { label: 'STRN', value: selectedCustomer.strn },
                      { label: 'Province', value: (selectedCustomer as any).province },
                      { label: 'Registration', value: (selectedCustomer as any).registrationType },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-400 tracking-wider">{row.label}</span>
                        <span className="text-[10px] font-black font-mono text-slate-700">{row.value}</span>
                      </div>
                    ))}

                    <div className="h-[1px] bg-slate-200/60 my-1" />

                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400  tracking-wider">Credit Limit</span>
                      <span className="text-[11px] font-black" style={{ color: brand.primary }}>PKR {selectedCustomer.creditLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 tracking-wider">Current Balance</span>
                      <span className={`text-[11px] font-black ${selectedCustomer.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {selectedCustomer.balance > 0 ? `PKR ${selectedCustomer.balance.toLocaleString()}` : 'Clear'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-[240px] shrink-0 bg-white rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 py-10 shadow-sm"
                  style={{ borderColor: brand.dark + '15' }}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <Package className="w-5 h-5 text-slate-200" />
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 text-center uppercase tracking-widest leading-relaxed">
                    Select customer<br />to view profile
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-1">
            {/* ── Scanner Bar (Reusable ComboBox) ── */}
            <div className="relative z-30">
              <div className="w-[31%]">
                <ComboBox
                  variant="default"
                  className="!bg-white shadow-sm"
                  placeholder="Product Code / Barcode"
                  value=""
                  icon={Search}
                  options={sampleProducts}
                  onChange={(id) => {
                    const prod = sampleProducts.find(p => p.id === id);
                    if (prod) {
                      const newId = Math.random().toString(36).substr(2, 9);
                      const newItem: InvoiceItem = {
                        id: newId,
                        productCode: prod.id,
                        description: prod.name,
                        unit: 'pcs',
                        unitDetails: prod.subtitle || '',
                        quantity: 1,
                        price: parseFloat(prod.subtitle?.split('$')[1] || '0'),
                        discount: 0,
                        tax: 0,
                        furtherTax: 0,
                      };
                      onChange({ ...data, items: [...data.items, newItem] });
                      setLastAddedId(newId);
                    }
                  }}
                />
              </div>
            </div>

            {/* ── Transaction Entries ── */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden w-full max-w-full" style={{ borderColor: brand.dark + '10' }}>
              <div className="px-6 py-3 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <h3 className="text-[11px] font-bold">Transaction Entries</h3>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: brand.soft, color: brand.dark }}>
                    {filteredItems.length} Items
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-64">
                    <ComboBox
                      variant="compact"
                      placeholder="Search items in table..."
                      value={tableSearchQuery}
                      onQueryChange={(q) => setTableSearchQuery(q)}
                      options={data.items.filter(item => item.productCode).map(item => ({
                        id: item.id,
                        name: item.productCode,
                        subtitle: item.description
                      }))}

                      onChange={(id) => {
                        const item = data.items.find(i => i.id === id);
                        if (item) setTableSearchQuery(item.productCode);
                        else setTableSearchQuery("");
                      }}
                      className="!bg-white/10 !border-white/20 !text-white"
                    />
                  </div>
                  <Button
                    variant="white"
                    icon={Plus}
                    onClick={addItem}
                  >
                    Add Item
                  </Button>
                </div>
              </div>

              <ScrollArea
                className="overflow-x-auto custom-scrollbar w-full max-w-full"
                maxHeight="290px"
                ref={scrollContainerRef}
                style={{ overscrollBehavior: 'contain' }}
              >
                <table className={`w-full relative table-fixed ${tableMinW}`}>
                  <thead className="sticky top-0 bg-white z-20">
                    <tr className="text-[10px] font-black tracking-wider border-b" style={{ color: brand.dark, borderColor: brand.dark + '10' }}>
                      <th className="px-3 py-2.5 text-left w-10">#</th>
                      <th className="px-3 py-2.5 text-left w-36 border-l border-slate-100">Product Code</th>
                      <th className={`px-3 py-2.5 text-left border-l border-slate-100 ${descriptionWidth}`}>Description</th>
                      <th className={`px-3 py-2.5 text-left ${unitWidth} border-l border-slate-100`}>Unit</th>
                      <th className={`px-3 py-2.5 text-left ${detailsWidth} border-l border-slate-100`}>Details</th>
                      <th className={`px-3 py-2.5 text-left ${qtyWidth} border-l border-slate-100`}>Qty</th>
                      <th className={`px-3 py-2.5 text-left ${priceWidth} border-l border-slate-100`}>Price</th>
                      <th className={`px-3 py-2.5 text-left ${discountWidth} border-l border-slate-100`}>Discount</th>
                      <th className={`px-3 py-2.5 text-left ${taxWidth} border-l border-slate-100`}>Tax</th>
                      <th className={`px-3 py-2.5 text-left ${furtherTaxWidth} border-l border-slate-100`}>Further Tax</th>
                      <th className={`px-4 py-2.5 text-left ${totalWidth} border-l border-slate-100`}>Total</th>
                      <th className="px-3 py-2.5 w-12 border-l border-slate-100" />
                    </tr>
                  </thead>
                  <tbody style={{ borderColor: brand.dark + '10' }}>
                    <AnimatePresence mode="popLayout">
                      {filteredItems.map((item, idx) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          layout
                          className="group hover:bg-slate-50/60 transition-colors border-b last:border-0"
                          style={{ borderColor: brand.dark + '08' }}
                        >
                          <td className="px-3 py-3 text-[10px] font-black text-slate-300 group-hover:text-indigo-400 transition-colors text-center">{idx + 1}</td>
                          <td className="px-2 py-3 border-l border-slate-50">
                            <ComboBox
                              autoFocus={item.id === lastAddedId}
                              variant="compact"
                              placeholder="P-CODE"
                              value={item.productCode}
                              options={sampleProducts.map(p => ({ id: p.id, name: p.id, subtitle: p.name }))}
                              onChange={(id) => {
                                const prod = sampleProducts.find(p => p.id === id);
                                if (prod) {
                                  updateItem(item.id, {
                                    productCode: prod.id,
                                    description: prod.name,
                                    price: 450 // Default rate
                                  });
                                }
                              }}
                            />
                          </td>
                          <td className="px-2 py-3 border-l border-slate-50">
                            <Input
                              variant="transparent"
                              placeholder="Detailed description..."
                              className="!font-bold text-slate-700"
                              value={item.description}
                              onChange={(e) => updateItem(item.id, { description: e.target.value })}
                            />
                          </td>
                          <td className="px-2 py-3 border-l border-slate-50">
                            <Input
                              variant="compact"
                              placeholder="pcs"
                              className="text-center !bg-white border-slate-200"
                              value={item.unit}
                              onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                            />
                          </td>
                          <td className="px-2 py-3 border-l border-slate-50">
                            <Input
                              variant="compact"
                              placeholder="Details"
                              className="!bg-white border-slate-200"
                              value={item.unitDetails}
                              onChange={(e) => updateItem(item.id, { unitDetails: e.target.value })}
                            />
                          </td>
                          <td className="px-2 py-3 border-l border-slate-50">
                            <Input
                              type="number"
                              variant="compact"
                              className="text-center !bg-white border-slate-200"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                            />
                          </td>
                          <td className="px-2 py-3 border-l border-slate-50">
                            <Input
                              type="number"
                              variant="compact"
                              className="text-right !bg-white border-slate-200"
                              value={item.price}
                              onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                            />
                          </td>
                          <td className="px-2 py-3 border-l border-slate-50">
                            <Input
                              type="number"
                              variant="compact"
                              className="text-center text-red-500 font-black !bg-white border-slate-200"
                              value={item.discount}
                              onChange={(e) => updateItem(item.id, { discount: parseFloat(e.target.value) || 0 })}
                            />
                          </td>
                          <td className="px-2 py-3 border-l border-slate-50">
                            <Input
                              type="number"
                              variant="compact"
                              className="text-center text-green-600 font-black !bg-white border-slate-200"
                              value={item.tax}
                              onChange={(e) => updateItem(item.id, { tax: parseFloat(e.target.value) || 0 })}
                            />
                          </td>
                          <td className="px-2 py-3 border-l border-slate-50">
                            <Input
                              type="number"
                              variant="compact"
                              className="text-center text-amber-500 font-black !bg-white border-slate-200"
                              value={item.furtherTax}
                              onChange={(e) => updateItem(item.id, { furtherTax: parseFloat(e.target.value) || 0 })}
                            />
                          </td>
                          <td className="px-4 py-3 text-left font-black text-[11px] tracking-tight text-indigo-600 border-l border-slate-50">
                            {currencySymbol}{fmt((item.quantity * item.price) - item.discount + item.tax + item.furtherTax)}
                          </td>
                          <td className="px-1 py-3 text-center border-l border-slate-50">
                            <Button
                              variant="danger"
                              size="xs"
                              className="!px-0 !w-6 !h-6 flex items-center justify-center rounded-lg mx-auto"
                              icon={Trash2}
                              onClick={() => removeItem(item.id)}
                            />
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>

                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={12} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-20">
                            <Plus className="w-12 h-12" />
                            <p className="text-[11px] font-black uppercase tracking-widest">
                              {data.items.length === 0 ? 'No entries found — Click "Add Item" to start' : 'No items match your search'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>

                  {/* Sticky Summary Footer */}
                  {data.items.length > 0 && (
                    <tfoot className="sticky bottom-0 z-10 bg-white border-t-2 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]" style={{ borderColor: brand.dark + '10' }}>
                      <tr className="font-black">
                        <td className="px-3 py-3 text-[10px] text-slate-400 text-center">Σ</td>
                        <td colSpan={4} className="px-4 py-3 text-[11px] text-slate-500 uppercase tracking-widest text-right pr-10 border-l border-slate-50">Total Summary</td>
                        <td className="px-2 py-3 text-center text-[11px] text-slate-700 border-l border-slate-50">
                          {data.items.reduce((sum, i) => sum + i.quantity, 0)}
                        </td>
                        <td className="px-2 py-3 text-right text-[11px] text-slate-700 border-l border-slate-50">
                          {/* Price total removed as requested */}
                        </td>
                        <td className="px-2 py-3 text-center text-[11px] text-red-500 border-l border-slate-50">
                          {currencySymbol}{fmt(data.items.reduce((sum, i) => sum + i.discount, 0))}
                        </td>
                        <td className="px-2 py-3 text-center text-[11px] text-emerald-600 border-l border-slate-50">
                          {currencySymbol}{fmt(data.items.reduce((sum, i) => sum + i.tax, 0))}
                        </td>
                        <td className="px-2 py-3 text-center text-[11px] text-amber-600 border-l border-slate-50">
                          {currencySymbol}{fmt(data.items.reduce((sum, i) => sum + i.furtherTax, 0))}
                        </td>
                        <td className="px-4 py-3 text-left text-[12px] text-indigo-700 underline decoration-indigo-200 underline-offset-4 border-l border-slate-50">
                          {currencySymbol}{fmt(subtotal)}
                        </td>
                        <td className="border-l border-slate-50"></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </ScrollArea>
            </div>
          </div>

          {/* ── Bottom Tier ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left: Notes + Attachments (Side-by-Side) */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Notes */}
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col" style={{ borderColor: brand.dark + '10' }}>
                <SectionHeader title="Notes & Special Terms" />
                <div className="p-6 flex-1">
                  <TextArea placeholder="Enter payment terms, bank details, or special instructions..." className="h-full min-h-[100px]"
                    value={data.notes} onChange={(e) => onChange({ ...data, notes: e.target.value })} />
                </div>
              </div>

              {/* Attachments */}
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col h-full" style={{ borderColor: brand.dark + '10' }}>
                <div className="px-6 py-3 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
                  <div className="flex items-center gap-1.5">
                    <Paperclip className="w-3 h-3 opacity-80" />
                    <h3 className="text-[11px] font-bold">Document Attachments</h3>
                  </div>
                  <div className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-bold uppercase">
                    {uploadSuccess ? 'Upload Success!' : `${files.length} ${files.length === 1 ? 'File' : 'Files'}`}
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      const newFiles = Array.from(e.target.files).map(f => ({
                        name: f.name,
                        size: (f.size / 1024 / 1024).toFixed(1) + ' MB'
                      }));
                      setFiles([...files, ...newFiles]);
                      setUploadSuccess(true);
                      setTimeout(() => setUploadSuccess(false), 3000);
                    }
                  }}
                />

                <div className="pt-3 px-3 pb-2 space-y-2 flex-1 flex flex-col">
                  <p className="text-[10px] font-medium text-slate-500 px-1">Supporting files & assets</p>
                  <div className="w-full flex-1">
                    {/* Upload Zone */}
                    <motion.div
                      whileHover={{ scale: 1.002 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-[12px] flex flex-col items-center justify-center py-2 bg-white relative shadow-sm h-full min-h-[80px] cursor-pointer hover:bg-slate-50 transition-colors"
                      style={{ borderColor: '#E2E8F0' }}
                    >
                      <div className="w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center border border-slate-50 mb-1">
                        <div className="w-5 h-5 rounded-full bg-[#F0F7FF] flex items-center justify-center">
                          <Upload className="w-3 h-3 text-[#2759CD]" />
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-800">Drop files</p>
                        <p className="text-[6px] font-medium text-slate-400">PDF, JPG, ZIP</p>
                      </div>
                    </motion.div>

                    {/* Right Side: Spacer or extra space if needed */}
                    <div className="hidden md:block" />
                  </div>

                  {/* Compact Buttons */}
                  <div className="flex justify-end gap-2 pt-0.5 border-t border-slate-50">
                    <Button
                      variant="white"
                      size="xs"
                      onClick={() => { }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => { }}
                    >
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Financial Matrix */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-full" style={{ borderColor: brand.dark + '10' }}>
                <SectionHeader title="Financial Matrix" badge="PKR" />

                <div className="p-3 flex-1 flex flex-col gap-2">
                  {/* Discount Section */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-8">
                      <span className="text-[11px] font-bold text-slate-500">Discount (%)</span>
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        variant="compact"
                        className="text-right"
                        suffix="%"
                        value={data.discountPercentage}
                        onChange={(e) => onChange({ ...data, discountPercentage: parseFloat(e.target.value) || 0, discountAmount: 0 })}
                      />
                    </div>
                  </div>

                  {/* Shipping Charges */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-8">
                      <span className="text-[11px] font-bold text-slate-500">Shipping Charges</span>
                    </div>
                    <div className="col-span-4">
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
                    <div className="col-span-8">
                      <span className="text-[11px] font-bold text-slate-500">Round Off</span>
                    </div>
                    <div className="col-span-4">
                      <Input
                        type="number"
                        variant="compact"
                        className="text-right"
                        value={data.roundOff}
                        onChange={(e) => onChange({ ...data, roundOff: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-0.5" />

                  {/* Gross */}
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-bold text-slate-500">Gross Subtotal</span>
                    <span className="text-[12px] font-black text-slate-700">{currencySymbol}{fmt(subtotal)}</span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between items-center px-1">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-500">Tax</span>
                      <span className="text-[9px] text-slate-400">Calculated ({data.taxRate}%)</span>
                    </div>
                    <span className="text-[12px] font-black text-slate-700">{currencySymbol}{fmt(taxAmount)}</span>
                  </div>

                  <div className="h-[1px] bg-slate-100 my-0.5" />

                  {/* Net */}
                  <div className="flex justify-between items-center px-1 py-1">
                    <span className="text-[11px] font-black text-slate-700">Net Total (PKR)</span>
                    <span className="text-[16px] font-black" style={{ color: brand.primary }}>{currencySymbol}{fmt(netPayable)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    {/* ── Hidden Printable Invoice for Direct Download ── */}
    <div style={{ position: 'relative', height: 0, overflow: 'hidden' }}>
      <div id="local-printable-container" style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '12px', lineHeight: '1.6', background: 'white', color: '#1e293b', padding: '40px', margin: 0, width: '210mm' }}>
        {/* Header: Company & Invoice title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>{data.senderName || 'Antigravity Creative Studio'}</h1>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: '1.7' }}>
              {data.senderAddress || '452 Innovation Blvd, San Francisco, CA 94107'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#2759CD', margin: 0, letterSpacing: '2px' }}>INVOICE</h2>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#334155', marginTop: '4px' }}>#{data.invoiceNumber}</p>
            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '8px', lineHeight: '1.8' }}>
              <div><strong>Issue Date:</strong> {data.date}</div>
              <div><strong>Due Date:</strong> {data.dueDate}</div>
              <div><strong>Status:</strong> Draft</div>
            </div>
          </div>
        </div>

        {/* Billing Details Block */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h3 style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#94a3b8', marginBottom: '8px' }}>FROM</h3>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{data.senderName || 'Antigravity Creative Studio'}</h4>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: '1.7' }}>
              {data.senderAddress}
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', color: '#94a3b8', marginBottom: '8px' }}>BILL TO</h3>
            <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{data.clientName || 'Unnamed Client'}</h4>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', lineHeight: '1.7' }}>
              {data.clientAddress}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', textAlign: 'left' }}>Product Code</th>
              <th style={{ padding: '12px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '12px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', textAlign: 'right' }}>Qty</th>
              <th style={{ padding: '12px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', textAlign: 'right' }}>Price</th>
              <th style={{ padding: '12px', fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px', color: '#475569', textAlign: 'left' }}>{item.productCode}</td>
                <td style={{ padding: '12px', color: '#475569', textAlign: 'left' }}>{item.description}</td>
                <td style={{ padding: '12px', color: '#64748b', textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ padding: '12px', color: '#64748b', textAlign: 'right' }}>{currencySymbol}{item.price.toFixed(2)}</td>
                <td style={{ padding: '12px', fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>{currencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Gross Subtotal:</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{currencySymbol}{fmt(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Tax ({data.taxRate}%):</span>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{currencySymbol}{fmt(taxAmount)}</span>
            </div>
            {data.discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Discount:</span>
                <span style={{ fontWeight: 700, color: '#10B981' }}>-{currencySymbol}{fmt(data.discountAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>
              <span>Net Total:</span>
              <span style={{ color: '#2759CD' }}>{currencySymbol}{fmt(netPayable)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default InvoiceEditorV4;
