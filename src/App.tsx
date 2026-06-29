import { useState, useEffect, Suspense, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InvoiceData, InvoiceItem } from './types';
import Layout from './components/layout/Layout';
import Card from './components/ui/Card';
import { Button } from './components/ui/Button';
import { useTheme } from './context/ThemeContext';

// Static page imports for instantaneous and smooth transitions
import Dashboard from './pages/Invoices/Dashboard/Dashboard';
import Dashboard1 from './pages/Invoices/Dashboard/Dashboard1';
import Dashboard2 from './pages/Invoices/Dashboard/Dashboard2';
import InvoiceEditorV4 from './pages/Invoices/SaleInvoiceEditor';
import ReturnInvoiceEditor from './pages/Invoices/ReturnInvoiceEditor';
import InvoiceListModule from './pages/Invoices/InvoiceList';
import PurchaseList from './pages/Purchases/PurchaseList';
import PurchaseInvoiceEditor from './pages/Purchases/PurchaseInvoiceEditor';
import PurchaseReturnEditor from './pages/Purchases/PurchaseReturnEditor';
import CustomerManagement from './pages/BusinessPartner/CustomerManagement';
import { BPLedgerForm } from './pages/BusinessPartner/BPLedgerForm';
import Settings from './pages/Settings/Settings';
import Help from './pages/Help/Help';
import Login from './pages/Auth/Login';
import ProductList from './pages/Products/ProductList';
import WarehousesPage from './pages/Products/Warehouses';
import { ProductBatchPage } from './pages/Products/ProductBatchPage';
import InlineProductForm from './components/ui/InlineProductForm';
import { AlertModal } from './components/ui/AlertModal';
import type { BPAdjustment, BPAdjustmentData } from './types/types';
import { BPAdjustmentEditor } from './pages/BusinessPartner/BPAdjustmentEditor';
import { StockAdjustmentEditor } from './pages/Products/StockAdjustmentEditor';

// Static imports for types / initial data only
import { initialInvoices } from './pages/Invoices/invoiceTypes';
import type { Invoice } from './pages/Invoices/invoiceTypes';
import { getCodeSettingsForBranch, generateNextCode, incrementNextCode } from './utils/codeSettingsHelper';
import type { BranchCodeSettings } from './utils/codeSettingsHelper';
import { FileText } from 'lucide-react';
import {
  seedPrintTemplates,
  getSeedTemplateFields,
  getSeedTemplateSections,
  getSeedTemplateColumns,
  seedCompanies,
  seedBranches
} from './utils/settingsData';
import type {
  PrintTemplate,
  PrintTemplateSection,
  PrintTemplateField,
  PrintTemplateCustomField,
  PrintTemplateColumn
} from './utils/settingsData';
import { sampleCustomers, DEFAULT_CUSTOMERS } from './utils/customerData';

const parseCustomCss = (cssString?: string): React.CSSProperties => {
  if (!cssString) return {};
  const styles: any = {};
  cssString.split(';').forEach(rule => {
    const parts = rule.split(':');
    if (parts.length >= 2) {
      const prop = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      if (prop && val) {
        const key = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        styles[key] = val;
      }
    }
  });
  return styles;
};

type View = 'dashboard' | 'dashboard1' | 'dashboard2' | 'invoices' | 'add-invoice' | 'add-invoice-v2' | 'add-invoice-v3' | 'add-invoice-v4' | 'return-invoice' | 'customers' | 'add-customer' | 'bp-ledger' | 'bp-adjustments' | 'add-bp-adjustment' | 'products' | 'warehouses' | 'product-batches' | 'stock-adjustments' | 'settings' | 'help' | 'purchases' | 'add-purchase-invoice' | 'purchase-return';

const initialPurchases: Invoice[] = [
  {
    id: 'PI-99991',
    customer: 'Al-Farooq Traders',
    customerInitials: 'AF',
    customerColor: '#10B981',
    issueDate: '2026-06-10',
    dueDate: '2026-06-24',
    amount: 'Rs. 45,000.00',
    rawAmount: 45000,
    status: 'Posted',
    payment: 'Net 30',
    type: 'Purchase Invoice',
    companyId: 'co1',
    branchId: 'br-1',
    fbrInvoiceNumber: 'FBR-PI-99991'
  },
  {
    id: 'PRTN-99992',
    customer: 'Zeeshan Distributors',
    customerInitials: 'ZD',
    customerColor: '#F59E0B',
    issueDate: '2026-06-15',
    dueDate: '2026-06-15',
    amount: 'Rs. 12,000.00',
    rawAmount: 12000,
    status: 'Unposted',
    payment: 'Cash',
    type: 'Purchase Return',
    companyId: 'co1',
    branchId: 'br-1',
    fbrInvoiceNumber: ''
  }
];

function App() {
  const { brand } = useTheme();
  const [companies] = useState(() => {
    try {
      const stored = localStorage.getItem('company_records');
      return stored ? JSON.parse(stored) : seedCompanies;
    } catch {
      return seedCompanies;
    }
  });

  const [branches] = useState(() => {
    try {
      const stored = localStorage.getItem('branch_records');
      return stored ? JSON.parse(stored) : seedBranches;
    } catch {
      return seedBranches;
    }
  });

  const [activeCompany, setActiveCompany] = useState<any>(() => {
    try {
      const sess = sessionStorage.getItem('active_company');
      if (sess) return JSON.parse(sess);
      const defCoId = localStorage.getItem('default_company_id');
      if (defCoId) {
        const found = companies.find((c: any) => c.id === defCoId);
        if (found) return found;
      }
    } catch {}
    return null;
  });

  const [activeBranch, setActiveBranch] = useState<any>(() => {
    try {
      const sess = sessionStorage.getItem('active_branch');
      if (sess) return JSON.parse(sess);
      const defBrId = localStorage.getItem('default_branch_id');
      if (defBrId) {
        const found = branches.find((b: any) => b.id === defBrId);
        if (found) return found;
      }
    } catch {}
    return null;
  });

  const [isSelectingContext, setIsSelectingContext] = useState<boolean>(() => {
    const loggedIn = localStorage.getItem('is_logged_in') === 'true';
    if (!loggedIn) return false;
    try {
      const sessCo = sessionStorage.getItem('active_company');
      const sessBr = sessionStorage.getItem('active_branch');
      if (sessCo && sessBr) return false;
      const defCo = localStorage.getItem('default_company_id');
      const defBr = localStorage.getItem('default_branch_id');
      if (defCo && defBr) return false;
    } catch {}
    return true;
  });

  const [isReloading, setIsReloading] = useState(false);
  const [reloadStep, setReloadStep] = useState('');

  const [tempSelectedCompanyId, setTempSelectedCompanyId] = useState(() => {
    try {
      const stored = localStorage.getItem('company_records');
      const cos = stored ? JSON.parse(stored) : seedCompanies;
      const activeCos = cos.filter((c: any) => c.is_active);
      return activeCos.length > 0 ? activeCos[0].id : '';
    } catch {
      return '';
    }
  });
  const [tempSelectedBranchId, setTempSelectedBranchId] = useState(() => {
    try {
      const storedCo = localStorage.getItem('company_records');
      const cos = storedCo ? JSON.parse(storedCo) : seedCompanies;
      const activeCos = cos.filter((c: any) => c.is_active);
      if (activeCos.length > 0) {
        const activeCoId = activeCos[0].id;
        const storedBr = localStorage.getItem('branch_records');
        const brs = storedBr ? JSON.parse(storedBr) : seedBranches;
        const firstBr = brs.find((b: any) => b.companyId === activeCoId);
        return firstBr ? firstBr.id : '';
      }
    } catch {}
    return '';
  });
  const [tempSetAsDefault, setTempSetAsDefault] = useState(false);

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const stored = localStorage.getItem('profile_details');
      if (stored) return JSON.parse(stored);
    } catch {}
    return { name: 'Arsalan Ahmed', role: 'Administrator' };
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('profile_details');
        if (stored) {
          setUserProfile(JSON.parse(stored));
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('is_logged_in') === 'true';
    } catch {
      return false;
    }
  });
  const [activeView, setActiveView] = useState<View>(() => {
    try {
      const stored = localStorage.getItem('active_view');
      if (stored) return stored as View;
    } catch {}
    return 'dashboard';
  });
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productFormInitialData, setProductFormInitialData] = useState<any>(undefined);
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm?: () => void }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const [invoiceList, setInvoiceList] = useState<Invoice[]>(() => {
    try {
      const stored = localStorage.getItem('invoice_list');
      const mapInvoice = (inv: any, idx: number) => {
        let mappedStatus = inv.status;
        if (mappedStatus === 'Paid') mappedStatus = 'Posted';
        else if (['Pending', 'Overdue', 'Draft'].includes(mappedStatus)) mappedStatus = 'Unposted';
        else if (mappedStatus !== 'Posted' && mappedStatus !== 'Unposted') mappedStatus = 'Unposted';

        let mappedType = inv.type;
        if (mappedType === 'Standard' || mappedType === 'Product') mappedType = 'Sale Invoice';
        else if (mappedType === 'Service') mappedType = 'Service Invoice';

        if (mappedType !== 'Sale Invoice' && mappedType !== 'Sale Return' && mappedType !== 'Service Invoice' && mappedType !== 'Digital Invoice') {
          mappedType = 'Sale Invoice';
        }

        let companyId = inv.companyId;
        let branchId = inv.branchId;
        if (!companyId) {
          if (inv.customer === 'BlueRitt Technologies Inc.' || inv.customer === 'Starlight Media Group') {
            companyId = 'co1';
          } else if (inv.customer === 'Acme Corporation' || inv.customer === 'Apex Digital Studio') {
            companyId = 'co2';
          } else {
            companyId = 'co4';
          }
        }
        if (!branchId) {
          if (companyId === 'co1') {
            branchId = idx % 2 === 0 ? 'br-1' : 'br-2';
          } else if (companyId === 'co2') {
            branchId = 'br-3';
          } else {
            branchId = 'br-4';
          }
        }

        const fbrInvoiceNumber = mappedStatus === 'Posted'
          ? (inv.fbrInvoiceNumber || ('FBR-INV-' + inv.id))
          : '';

        return {
          ...inv,
          status: mappedStatus,
          type: mappedType,
          companyId,
          branchId,
          customer: inv.customer || inv.client || 'Unknown Customer',
          customerInitials: inv.customerInitials || inv.clientInitials || (inv.customer || inv.client || 'UC').slice(0, 2).toUpperCase(),
          customerColor: inv.customerColor || inv.clientColor || '#16a34a',
          fbrInvoiceNumber,
        };
      };

      if (stored) {
        const parsed = JSON.parse(stored) as any[];
        if (parsed.length <= 8) {
          return initialInvoices.map(mapInvoice);
        }
        let mapped = parsed.map(mapInvoice);
        if (!mapped.some(inv => inv.type === 'Sale Return')) {
          const defaultReturns = initialInvoices.filter(inv => inv.type === 'Sale Return').map(mapInvoice);
          mapped = [...defaultReturns, ...mapped];
        }
        return mapped;
      }
      return initialInvoices.map(mapInvoice);
    } catch {
      return initialInvoices.map((inv, idx) => {
        let companyId = 'co1';
        let branchId = idx % 2 === 0 ? 'br-1' : 'br-2';
        if (inv.customer === 'BlueRitt Technologies Inc.' || inv.customer === 'Starlight Media Group') {
          companyId = 'co1';
        } else if (inv.customer === 'Acme Corporation' || inv.customer === 'Apex Digital Studio') {
          companyId = 'co2';
          branchId = 'br-3';
        } else {
          companyId = 'co4';
          branchId = 'br-4';
        }
        return { ...inv, companyId, branchId };
      });
    }
  });

  // Auto-save invoice list to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem('invoice_list', JSON.stringify(invoiceList)); } catch { /* ignore */ }
  }, [invoiceList]);

  // Sync active view to localStorage
  useEffect(() => {
    try { localStorage.setItem('active_view', activeView); } catch { /* ignore */ }
  }, [activeView]);

  useEffect(() => {
    const handleOpenProductForm = (e: any) => {
      setProductFormInitialData(e.detail?.product);
      setIsProductFormOpen(true);
    };
    window.addEventListener('open-product-form', handleOpenProductForm);
    return () => window.removeEventListener('open-product-form', handleOpenProductForm);
  }, []);

  const generatedItems = Array.from({ length: 30 }, (_, i) => ({
    id: `gen-${i + 1}`,
    productCode: `PROD-${1000 + i}`,
    description: `Automated Test Product ${i + 1} - High Performance Test`,
    unit: 'Job',
    unitDetails: 'Standard',
    quantity: 1,
    price: 50 + (i * 2),
    discount: 0,
    tax: 0,
    furtherTax: 0
  }));

  const emptyInvoiceData = (type: string, invoiceNumber: string): InvoiceData => {
    const defaultItem: InvoiceItem = {
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
    return {
      invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      senderName: 'Antigravity Creative Studio',
      senderAddress: 'Antigravity Creative Studio\ncontact@antigravity.studio | +1 (555) 012-3456',
      customerName: '',
      customerAddress: '',
      subject: '',
      reference: '',
      items: [defaultItem],
      taxRate: 8,
      discountPercentage: 0,
      discountAmount: 0,
      shippingCharges: 0,
      roundOff: 0,
      receivedAmount: 0,
      bankAccount: 'bank',
      notes: '',
      salesPerson: '',
      department: '',
      productCode: '',
      remarks: '',
      type: type as any,
      fbrInvoiceNumber: '',
      status: 'Unposted',
    };
  };

  const [invoice, setInvoice] = useState<InvoiceData>({
    invoiceNumber: 'SI-000248',
    date: '2026-05-12',
    dueDate: '2026-05-26',
    senderName: 'Antigravity Creative Studio',
    senderAddress: '452 Innovation Blvd, San Francisco, CA 94107\ncontact@antigravity.studio | +1 (555) 012-3456',
    customerName: 'BlueRitt Technologies Inc.',
    customerAddress: '88 Tech Park Way, Austin, TX 78701\nbilling@blueritt.com',
    subject: 'Brand Identity & Web Development - Phase 1',
    reference: 'PO-2026-004',
    items: generatedItems,
    taxRate: 8,
    discountPercentage: 5,
    discountAmount: 0,
    shippingCharges: 25,
    roundOff: 0,
    receivedAmount: 0,
    bankAccount: 'chase',
    notes: 'Please include the invoice number in your wire transfer reference.\nPayment via ACH or Wire Transfer to Chase Bank Account #....4521.',
    salesPerson: '',
    department: '',
    productCode: '',
    remarks: '',
    type: 'Standard',
  });

  const [returnInvoice, setReturnInvoice] = useState<InvoiceData>({
    invoiceNumber: 'RTN-' + Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    senderName: 'Antigravity Creative Studio',
    senderAddress: '452 Innovation Blvd, San Francisco, CA 94107\ncontact@antigravity.studio | +1 (555) 012-3456',
    customerName: '',
    customerAddress: '',
    subject: 'Returned Items',
    reference: '',
    productCode: '',
    remarks: '',
    type: 'Return',
    items: [{
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
    }],
    taxRate: 8,
    discountPercentage: 0,
    discountAmount: 0,
    shippingCharges: 0,
    roundOff: 0,
    receivedAmount: 0,
    bankAccount: 'chase',
    notes: 'Return invoice details.',
    salesPerson: '',
    department: ''
  });

  const [purchaseList, setPurchaseList] = useState<Invoice[]>(() => {
    try {
      const stored = localStorage.getItem('purchase_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialPurchases;
  });

  const [purchase, setPurchase] = useState<InvoiceData>(() => emptyInvoiceData('Purchase Invoice', 'PI-00001'));
  const [purchaseReturn, setPurchaseReturn] = useState<InvoiceData>(() => emptyInvoiceData('Purchase Return', 'PRTN-00001'));

  useEffect(() => {
    try { localStorage.setItem('purchase_list', JSON.stringify(purchaseList)); } catch { /* ignore */ }
  }, [purchaseList]);

  const [bpAdjustmentList, setBpAdjustmentList] = useState<BPAdjustment[]>(() => {
    try {
      const stored = localStorage.getItem('bp_adjustments');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [bpAdjustment, setBpAdjustment] = useState<BPAdjustmentData>(() => ({
    adjustmentNumber: 'BPA-00001',
    date: new Date().toISOString().split('T')[0],
    partnerType: 'customer',
    partnerId: '',
    partnerName: '',
    voucherNo: 'BPA-00001',
    ref: '',
    narration: '',
    voucherType: 'Adjustment',
    items: [],
    status: 'Unposted'
  }));

  useEffect(() => {
    try {
      localStorage.setItem('bp_adjustments', JSON.stringify(bpAdjustmentList));
    } catch {}
  }, [bpAdjustmentList]);

  // Save default invoice data to localStorage if not present
  useEffect(() => {
    try {
      const key = 'invoice_detail_SI-000248';
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(invoice));
      }
    } catch { /* ignore */ }
  }, []);

  const [printInvoiceData, setPrintInvoiceData] = useState<Invoice | null>(null);
  const [printInvoiceFullData, setPrintInvoiceFullData] = useState<InvoiceData | null>(null);
  const [printTemplate, setPrintTemplate] = useState<PrintTemplate | null>(null);
  const [printSections, setPrintSections] = useState<PrintTemplateSection[]>([]);
  const [printFields, setPrintFields] = useState<PrintTemplateField[]>([]);
  const [printColumns, setPrintColumns] = useState<PrintTemplateColumn[]>([]);
  const [printCustomFields, setPrintCustomFields] = useState<PrintTemplateCustomField[]>([]);
  const [printListData, setPrintListData] = useState<any[] | null>(null);

  const handleContextChange = (companyId: string, branchId: string, setAsDefault: boolean) => {
    const nextCo = companies.find((c: any) => c.id === companyId);
    const nextBr = branches.find((b: any) => b.id === branchId);
    if (!nextCo || !nextBr) return;

    setIsReloading(true);
    setReloadStep('Reloading Company Context...');
    
    setTimeout(() => {
      setReloadStep('Reloading Branch Context...');
      setTimeout(() => {
        setReloadStep('Reloading User Permissions...');
        setTimeout(() => {
          setReloadStep('Reloading Accessible Menus...');
          setTimeout(() => {
            setReloadStep('Reloading Dashboard Data...');
            setTimeout(() => {
              setActiveCompany(nextCo);
              setActiveBranch(nextBr);
              try {
                sessionStorage.setItem('active_company', JSON.stringify(nextCo));
                sessionStorage.setItem('active_branch', JSON.stringify(nextBr));
                if (setAsDefault) {
                  localStorage.setItem('default_company_id', companyId);
                  localStorage.setItem('default_branch_id', branchId);
                } else {
                  localStorage.removeItem('default_company_id');
                  localStorage.removeItem('default_branch_id');
                }
              } catch {}
              setIsReloading(false);
              setIsSelectingContext(false);
            }, 150);
          }, 150);
        }, 150);
      }, 150);
    }, 150);
  };

  const filteredInvoiceList = useMemo(() => {
    if (!activeCompany || !activeBranch) return [];
    return invoiceList.filter((inv: any) => {
      return inv.companyId === activeCompany.id && inv.branchId === activeBranch.id;
    });
  }, [invoiceList, activeCompany, activeBranch]);

  const filteredPurchaseList = useMemo(() => {
    if (!activeCompany || !activeBranch) return [];
    return purchaseList.filter((inv: any) => {
      return inv.companyId === activeCompany.id && inv.branchId === activeBranch.id;
    });
  }, [purchaseList, activeCompany, activeBranch]);

  if (!isLoggedIn) {
    return (
      <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>Loading…</div>}>
        <Login
          companies={companies}
          branches={branches}
          onLoginSuccess={(companyId, branchId, setAsDefault) => {
            try {
              localStorage.setItem('is_logged_in', 'true');
              const foundCo = companies.find((c: any) => c.id === companyId);
              const foundBr = branches.find((b: any) => b.companyId === companyId && b.id === branchId);
              if (foundCo && foundBr) {
                setActiveCompany(foundCo);
                setActiveBranch(foundBr);
                sessionStorage.setItem('active_company', JSON.stringify(foundCo));
                sessionStorage.setItem('active_branch', JSON.stringify(foundBr));
                if (setAsDefault) {
                  localStorage.setItem('default_company_id', companyId);
                  localStorage.setItem('default_branch_id', branchId);
                } else {
                  localStorage.removeItem('default_company_id');
                  localStorage.removeItem('default_branch_id');
                }
                setIsSelectingContext(false);
              }
            } catch {}
            setIsLoggedIn(true);
          }}
        />
      </Suspense>
    );
  }

  if (isSelectingContext) {
    const activeCompanies = companies.filter((c: any) => c.is_active);
    const availableBranches = branches.filter((b: any) => b.companyId === tempSelectedCompanyId);

    return (
      <div
        className="min-h-screen font-sans flex flex-col justify-center px-6 py-16 relative items-center transition-colors duration-500"
        style={{
          backgroundColor: brand.mainBg
        }}
      >
        {/* Soft radial glow in top right */}
        <div
          className="absolute -top-30 -right-30 w-80 h-80 rounded-full filter blur-3xl opacity-15 pointer-events-none"
          style={{ background: brand.primary }}
        />

        <div className="w-full max-w-[390px] space-y-6 relative z-10">
          
          {/* InvoiceFlow App Logo */}
          <div className="flex items-center gap-3 justify-center">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-lg"
              style={{
                backgroundColor: brand.primary,
                boxShadow: `0 4px 12px ${brand.primary}40`,
                fontSize: 18
              }}
            >
              I
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-800">Inventory Tracking System</span>
          </div>

          <Card
            className="p-8"
            style={{
              background: `linear-gradient(${brand.cardBg}, ${brand.cardBg}) padding-box, linear-gradient(135deg, ${brand.primary}, #38bdf8) border-box`,
              border: '1px solid transparent',
              borderRadius: '1rem',
              height: '455px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <div className="w-full">
              {/* Title & Subtitle */}
              <div className="text-center mb-5">
                <h2 className="text-[22px] font-extrabold text-slate-800 tracking-tight mb-1">Select Context</h2>
                <p className="text-xs font-semibold text-slate-500">
                  Choose the company and branch to log in.
                </p>
              </div>

              {/* Company & Branch form */}
              <div className="space-y-4">
                {/* Company Select */}
                <div className="w-full space-y-1">
                  <label className="text-[11px] font-bold ml-1 block mb-1.5 text-slate-500">
                    Select Company
                  </label>
                  <div className="relative">
                    <select
                      value={tempSelectedCompanyId}
                      onChange={(e) => {
                        const coId = e.target.value;
                        setTempSelectedCompanyId(coId);
                        const firstBr = branches.find((b: any) => b.companyId === coId);
                        setTempSelectedBranchId(firstBr ? firstBr.id : '');
                      }}
                      className="w-full border font-normal text-slate-800 placeholder:text-slate-400 text-sm outline-none transition-all h-10 px-4 rounded-xl form-select-container bg-white appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Choose a company...</option>
                      {activeCompanies.map((co: any) => (
                        <option key={co.id} value={co.id}>
                          {co.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Branch Select */}
                <div className="w-full space-y-1">
                  <label className="text-[11px] font-bold ml-1 block mb-1.5 text-slate-500">
                    Select Branch
                  </label>
                  <div className="relative">
                    <select
                      value={tempSelectedBranchId}
                      onChange={(e) => setTempSelectedBranchId(e.target.value)}
                      className="w-full border font-normal text-slate-800 placeholder:text-slate-400 text-sm outline-none transition-all h-10 px-4 rounded-xl form-select-container bg-white appearance-none cursor-pointer"
                      disabled={!tempSelectedCompanyId}
                    >
                      <option value="" disabled>Choose a branch...</option>
                      {availableBranches.map((br: any) => (
                        <option key={br.id} value={br.id}>
                          {br.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={tempSetAsDefault}
                      onChange={(e) => setTempSetAsDefault(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-600 font-bold">Set As Default Company & Branch</span>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full font-bold h-10"
                  onClick={() => {
                    if (tempSelectedCompanyId && tempSelectedBranchId) {
                      handleContextChange(tempSelectedCompanyId, tempSelectedBranchId, tempSetAsDefault);
                    }
                  }}
                  disabled={!tempSelectedCompanyId || !tempSelectedBranchId}
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const handlePrintInvoice = (inv: Invoice, templateId?: string) => {
    let tId = templateId;
    let templates: PrintTemplate[] = [];
    const deletedIds = new Set(['pt-1', 'pt-2', 'pt-3', 'pt-4', 'pt-5', 'pt-6', 'pt-7', 'pt-8', 'pt-9', 'pt-10', 'pt-11', 'pt-12']);
    try {
      const stored = localStorage.getItem('print_templates');
      const rawTemplates = stored ? JSON.parse(stored) : seedPrintTemplates;
      // Filter out only the old deleted static default templates (pt-1 to pt-12)
      // while keeping the 5 Sales Return (srt-) templates and any user-customized/imported templates (pt-[timestamp]).
      templates = rawTemplates
        .filter((t: any) => !deletedIds.has(t.template_id));
    } catch {
      templates = seedPrintTemplates
        .filter((t: any) => !deletedIds.has(t.template_id));
    }

    if (!tId) {
      const normType = inv.type === 'Sale Return' ? 'Sales Return' : 
                       inv.type === 'Purchase Return' ? 'Purchase Return' :
                       inv.type === 'Purchase Invoice' ? 'Purchase Invoice' : 'Sales Invoice';
      const defaultTemplate = templates.find((t: any) => t.is_default && t.is_active && t.document_type === normType) ||
                              templates.find((t: any) => t.is_default && t.is_active) ||
                              templates[0];
      tId = defaultTemplate?.template_id;
    }

    const activeTemplate = templates.find(t => t.template_id === tId) || templates[0];
    tId = activeTemplate?.template_id;

    // Load Sections
    let sections: PrintTemplateSection[] = [];
    try {
      const stored = localStorage.getItem('print_template_sections');
      const allSections = stored ? JSON.parse(stored) : [];
      sections = allSections.filter((s: any) => s.template_id === tId);
      if (sections.length === 0) {
        sections = getSeedTemplateSections(tId);
      }
    } catch {
      sections = getSeedTemplateSections(tId);
    }
    sections.sort((a, b) => a.display_order - b.display_order);

    // Load Fields
    let fields: PrintTemplateField[] = [];
    try {
      const stored = localStorage.getItem('print_template_fields');
      const allFields = stored ? JSON.parse(stored) : [];
      fields = allFields.filter((f: any) => f.template_id === tId);
      if (fields.length === 0) {
        fields = getSeedTemplateFields(tId);
      }
    } catch {
      fields = getSeedTemplateFields(tId);
    }

    // Load Columns
    let columns: PrintTemplateColumn[] = [];
    try {
      const stored = localStorage.getItem('print_template_columns');
      const allColumns = stored ? JSON.parse(stored) : [];
      columns = allColumns.filter((c: any) => c.template_id === tId);
      if (columns.length === 0) {
        columns = getSeedTemplateColumns(tId);
      }
    } catch {
      columns = getSeedTemplateColumns(tId);
    }
    columns.sort((a, b) => a.display_order - b.display_order);

    // Load Custom Fields
    let customFields: PrintTemplateCustomField[] = [];
    try {
      const stored = localStorage.getItem('print_template_custom_fields');
      const allCustomFields = stored ? JSON.parse(stored) : [];
      customFields = allCustomFields.filter((cf: any) => cf.template_id === tId);
    } catch {}
    customFields.sort((a, b) => a.display_order - b.display_order);

    setPrintTemplate(activeTemplate);
    setPrintSections(sections);
    setPrintFields(fields);
    setPrintColumns(columns);
    setPrintCustomFields(customFields);

    try {
      const stored = localStorage.getItem(`invoice_detail_${inv.id}`);
      if (stored) {
        setPrintInvoiceFullData(JSON.parse(stored) as InvoiceData);
      } else {
        setPrintInvoiceFullData(null);
      }
    } catch {
      setPrintInvoiceFullData(null);
    }
    setPrintInvoiceData(inv);
    setTimeout(() => {
      window.print();
      setPrintInvoiceData(null);
      setPrintInvoiceFullData(null);
      setPrintTemplate(null);
      setPrintSections([]);
      setPrintFields([]);
      setPrintColumns([]);
      setPrintCustomFields([]);
    }, 250);
  };

  const handlePrintList = (
    listData: any[],
    listType: 'products' | 'business_partners' | 'invoices' | 'purchases',
    templateId?: string,
    isPdf?: boolean
  ) => {
    let tId = templateId;
    let templates: PrintTemplate[] = [];
    try {
      const stored = localStorage.getItem('print_templates');
      templates = stored ? JSON.parse(stored) : seedPrintTemplates;
    } catch {
      templates = seedPrintTemplates;
    }

    const docType = listType === 'products' ? 'Product List' :
                    listType === 'business_partners' ? 'Business Partner List' :
                    listType === 'invoices' ? 'Sales Invoice' : 'Purchase Invoice';

    if (!tId) {
      const defaultTemplate = templates.find((t: any) => t.is_default && t.is_active && t.document_type === docType) ||
                              templates.find((t: any) => t.is_active && t.document_type === docType) ||
                              templates.find((t: any) => t.is_default && t.is_active) ||
                              templates[0];
      tId = defaultTemplate?.template_id;
    }

    const activeTemplate = templates.find(t => t.template_id === tId) || templates[0];
    tId = activeTemplate?.template_id;

    // Load Sections
    let sections: PrintTemplateSection[] = [];
    try {
      const stored = localStorage.getItem('print_template_sections');
      const allSections = stored ? JSON.parse(stored) : [];
      sections = allSections.filter((s: any) => s.template_id === tId);
      if (sections.length === 0) {
        sections = getSeedTemplateSections(tId);
      }
    } catch {
      sections = getSeedTemplateSections(tId);
    }
    sections.sort((a, b) => a.display_order - b.display_order);

    // Load Columns
    let columns: PrintTemplateColumn[] = [];
    try {
      const stored = localStorage.getItem('print_template_columns');
      const allColumns = stored ? JSON.parse(stored) : [];
      columns = allColumns.filter((c: any) => c.template_id === tId);
      if (columns.length === 0) {
        columns = getSeedTemplateColumns(tId);
      }
    } catch {
      columns = getSeedTemplateColumns(tId);
    }
    columns.sort((a, b) => a.display_order - b.display_order);

    setPrintTemplate(activeTemplate);
    setPrintSections(sections);
    setPrintColumns(columns);
    setPrintListData(listData);

    if (isPdf) {
      setTimeout(() => {
        const element = document.getElementById('list-print-container');
        if (element) {
          const opt = {
            margin: 0,
            filename: `${docType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { 
              unit: 'mm', 
              format: activeTemplate.paper_size === 'Thermal' ? [80, 200] : 'a4', 
              orientation: activeTemplate.orientation?.toLowerCase() || 'portrait' 
            }
          };

          const runHtml2Pdf = () => {
            (window as any).html2pdf().from(element).set(opt).save().then(() => {
              setPrintListData(null);
              setPrintTemplate(null);
              setPrintSections([]);
              setPrintColumns([]);
            }).catch((err: any) => {
              console.error("PDF generation failed:", err);
              setPrintListData(null);
              setPrintTemplate(null);
              setPrintSections([]);
              setPrintColumns([]);
            });
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
          setPrintListData(null);
          setPrintTemplate(null);
          setPrintSections([]);
          setPrintColumns([]);
        }
      }, 300);
    } else {
      setTimeout(() => {
        window.print();
        setPrintListData(null);
        setPrintTemplate(null);
        setPrintSections([]);
        setPrintColumns([]);
      }, 250);
    }
  };


  const handleSaveInvoice = (data: InvoiceData) => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price) - item.discount + item.tax + item.furtherTax, 0);
    const taxAmount = (subtotal * data.taxRate) / 100;
    const discountVal = data.discountAmount || (subtotal * data.discountPercentage) / 100;
    const netPayable = subtotal + taxAmount - discountVal + data.shippingCharges + data.roundOff;

    const initials = data.customerName ? data.customerName.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : 'IV';
    const colors = ['#2759CD', '#10B981', '#F59E0B', '#8B5CF6', '#EE4932', '#0EA5E9', '#EC4899', '#14B8A6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const existingInv = invoiceList.find(x => x.id === data.invoiceNumber);
    const status = existingInv ? existingInv.status : 'Unposted';

    const updatedInvoice: Invoice = {
      id: data.invoiceNumber || 'INV-' + Math.floor(1000 + Math.random() * 9000),
      customer: data.customerName || 'Unnamed Customer',
      customerInitials: initials,
      customerColor: randomColor,
      issueDate: data.date || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      amount: `Rs. ${netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      rawAmount: netPayable,
      status,
      payment: 'Net 30',
      type: data.type || 'Sale Invoice',
      companyId: activeCompany?.id || 'co1',
      branchId: activeBranch?.id || 'br-1',
      fbrInvoiceNumber: status === 'Posted' ? (data.fbrInvoiceNumber || ('FBR-INV-' + (data.invoiceNumber || ''))) : ''
    };

    try {
      localStorage.setItem(`invoice_detail_${updatedInvoice.id}`, JSON.stringify({ ...data, fbrInvoiceNumber: updatedInvoice.fbrInvoiceNumber, status: updatedInvoice.status }));
    } catch { /* ignore */ }

    setInvoiceList(prev => {
      const exists = prev.some(x => x.id === updatedInvoice.id);
      if (exists) {
        return prev.map(x => x.id === updatedInvoice.id ? updatedInvoice : x);
      } else {
        const companyId = activeCompany?.id || 'co1';
        const branchId = activeBranch?.id || 'br-1';
        let settingKey: keyof BranchCodeSettings = 'sale_invoice';
        if (data.type === 'Service Invoice') settingKey = 'service_invoice';
        if (data.type === 'Digital Invoice') settingKey = 'digital_invoice';
        const settings = getCodeSettingsForBranch(companyId, branchId)[settingKey];
        if (settings.mode === 'auto' && data.invoiceNumber) {
          incrementNextCode(settingKey, companyId, branchId);
        }
        return [updatedInvoice, ...prev];
      }
    });

    setSuccessModal({
      isOpen: true,
      title: 'Invoice Saved',
      message: `Invoice ${updatedInvoice.id} created & saved successfully!`,
      onConfirm: () => setActiveView('invoices')
    });
  };

  const handleSaveReturnInvoice = (data: InvoiceData) => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price) - item.discount + item.tax + item.furtherTax, 0);
    const taxAmount = (subtotal * data.taxRate) / 100;
    const discountVal = data.discountAmount || (subtotal * data.discountPercentage) / 100;
    const netPayable = subtotal + taxAmount - discountVal + data.shippingCharges + data.roundOff;

    const initials = data.customerName ? data.customerName.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : 'RT';
    const colors = ['#2759CD', '#10B981', '#F59E0B', '#8B5CF6', '#EE4932', '#0EA5E9', '#EC4899', '#14B8A6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const existingInv = invoiceList.find(x => x.id === data.invoiceNumber);
    const status = existingInv ? existingInv.status : 'Unposted';

    const updatedInvoice: Invoice = {
      id: data.invoiceNumber || 'RTN-' + Math.floor(1000 + Math.random() * 9000),
      customer: data.customerName || 'Unnamed Customer',
      customerInitials: initials,
      customerColor: randomColor,
      issueDate: data.date || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      amount: `Rs. ${netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      rawAmount: netPayable,
      status,
      payment: 'Net 30',
      type: 'Sale Return',
      companyId: activeCompany?.id || 'co1',
      branchId: activeBranch?.id || 'br-1',
      fbrInvoiceNumber: status === 'Posted' ? (data.fbrInvoiceNumber || ('FBR-INV-' + (data.invoiceNumber || ''))) : ''
    };

    try {
      localStorage.setItem(`invoice_detail_${updatedInvoice.id}`, JSON.stringify({ ...data, fbrInvoiceNumber: updatedInvoice.fbrInvoiceNumber, status: updatedInvoice.status }));
    } catch { /* ignore */ }

    setInvoiceList(prev => {
      const exists = prev.some(x => x.id === updatedInvoice.id);
      if (exists) {
        return prev.map(x => x.id === updatedInvoice.id ? updatedInvoice : x);
      } else {
        const companyId = activeCompany?.id || 'co1';
        const branchId = activeBranch?.id || 'br-1';
        const settings = getCodeSettingsForBranch(companyId, branchId).sale_return;
        if (settings.mode === 'auto' && data.invoiceNumber) {
          incrementNextCode('sale_return', companyId, branchId);
        }
        return [updatedInvoice, ...prev];
      }
    });

    setSuccessModal({
      isOpen: true,
      title: 'Return Invoice Saved',
      message: `Return Invoice ${updatedInvoice.id} saved successfully!`,
      onConfirm: () => setActiveView('invoices')
    });
  };

  const handleEditInvoice = (id: string) => {
    try {
      const stored = localStorage.getItem(`invoice_detail_${id}`);
      if (stored) {
        const parsed = JSON.parse(stored) as InvoiceData;
        const inv = invoiceList.find(x => x.id === id);
        parsed.status = parsed.status || inv?.status || 'Unposted';
        parsed.fbrInvoiceNumber = parsed.status === 'Posted' ? (parsed.fbrInvoiceNumber || inv?.fbrInvoiceNumber || ('FBR-INV-' + id)) : '';
        if (parsed.type === 'Return') {
          setReturnInvoice(parsed);
          setActiveView('return-invoice');
        } else {
          setInvoice(parsed);
          setActiveView('add-invoice-v4');
        }
      } else {
        const inv = invoiceList.find(i => i.id === id);
        if (inv) {
          const fallback: InvoiceData = {
            invoiceNumber: inv.id,
            date: inv.issueDate,
            dueDate: inv.dueDate,
            senderName: 'Antigravity Creative Studio',
            senderAddress: '452 Innovation Blvd, San Francisco, CA 94107',
            customerName: inv.customer,
            customerAddress: 'Enterprise Customer Account',
            subject: inv.type === 'Return' ? 'Returned Items' : 'Services Rendered',
            reference: '',
            productCode: '',
            remarks: '',
            type: inv.type || 'Standard',
            items: [
              {
                id: '1',
                productCode: 'BC-001',
                description: `${inv.type || 'Standard'} Services & Deliverables`,
                unit: 'Job',
                unitDetails: '',
                quantity: 1,
                price: inv.rawAmount || 0,
                discount: 0,
                tax: 0,
                furtherTax: 0
              }
            ],
            taxRate: 0,
            discountPercentage: 0,
            discountAmount: 0,
            shippingCharges: 0,
            roundOff: 0,
            receivedAmount: 0,
            bankAccount: '',
            notes: inv.type === 'Return' ? 'Return invoice details.' : `Please include the invoice number ${inv.id} in your wire transfer reference.`,
            salesPerson: '',
            department: '',
            fbrInvoiceNumber: inv.status === 'Posted' ? (inv.fbrInvoiceNumber || ('FBR-INV-' + inv.id)) : '',
            status: inv.status
          };
          if (inv.type === 'Return') {
            setReturnInvoice(fallback);
            setActiveView('return-invoice');
          } else {
            setInvoice(fallback);
            setActiveView('add-invoice-v4');
          }
        } else {
          alert('Invoice not found!');
        }
      }
    } catch {
      alert('Failed to load invoice data!');
    }
  };

  const handleSavePurchase = (data: InvoiceData) => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price) - item.discount + item.tax + item.furtherTax, 0);
    const taxAmount = (subtotal * data.taxRate) / 100;
    const discountVal = data.discountAmount || (subtotal * data.discountPercentage) / 100;
    const netPayable = subtotal + taxAmount - discountVal + data.shippingCharges + data.roundOff;

    const initials = data.customerName ? data.customerName.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : 'PR';
    const colors = ['#2759CD', '#10B981', '#F59E0B', '#8B5CF6', '#EE4932', '#0EA5E9', '#EC4899', '#14B8A6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const existingInv = purchaseList.find(x => x.id === data.invoiceNumber);
    const status = existingInv ? existingInv.status : 'Unposted';

    const updatedPurchase: Invoice = {
      id: data.invoiceNumber || 'PI-' + Math.floor(1000 + Math.random() * 9000),
      customer: data.customerName || 'Unnamed Supplier',
      customerInitials: initials,
      customerColor: randomColor,
      issueDate: data.date || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      amount: `Rs. ${netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      rawAmount: netPayable,
      status,
      payment: 'Net 30',
      type: data.type || 'Purchase Invoice',
      companyId: activeCompany?.id || 'co1',
      branchId: activeBranch?.id || 'br-1',
      fbrInvoiceNumber: status === 'Posted' ? (data.fbrInvoiceNumber || ('FBR-PI-' + (data.invoiceNumber || ''))) : ''
    };

    try {
      localStorage.setItem(`invoice_detail_${updatedPurchase.id}`, JSON.stringify({ ...data, fbrInvoiceNumber: updatedPurchase.fbrInvoiceNumber, status: updatedPurchase.status }));
    } catch { /* ignore */ }

    setPurchaseList(prev => {
      const exists = prev.some(x => x.id === updatedPurchase.id);
      if (exists) {
        return prev.map(x => x.id === updatedPurchase.id ? updatedPurchase : x);
      } else {
        const companyId = activeCompany?.id || 'co1';
        const branchId = activeBranch?.id || 'br-1';
        let settingKey: keyof BranchCodeSettings = 'purchase_invoice';
        const settings = getCodeSettingsForBranch(companyId, branchId)[settingKey];
        if (settings.mode === 'auto' && data.invoiceNumber) {
          incrementNextCode(settingKey, companyId, branchId);
        }
        return [updatedPurchase, ...prev];
      }
    });

    setSuccessModal({
      isOpen: true,
      title: 'Purchase Invoice Saved',
      message: `Purchase Invoice ${updatedPurchase.id} created & saved successfully!`,
      onConfirm: () => setActiveView('purchases')
    });
  };

  const handleSavePurchaseReturn = (data: InvoiceData) => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price) - item.discount + item.tax + item.furtherTax, 0);
    const taxAmount = (subtotal * data.taxRate) / 100;
    const discountVal = data.discountAmount || (subtotal * data.discountPercentage) / 100;
    const netPayable = subtotal + taxAmount - discountVal + data.shippingCharges + data.roundOff;

    const initials = data.customerName ? data.customerName.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : 'PR';
    const colors = ['#2759CD', '#10B981', '#F59E0B', '#8B5CF6', '#EE4932', '#0EA5E9', '#EC4899', '#14B8A6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const existingInv = purchaseList.find(x => x.id === data.invoiceNumber);
    const status = existingInv ? existingInv.status : 'Unposted';

    const updatedPurchase: Invoice = {
      id: data.invoiceNumber || 'PRTN-' + Math.floor(1000 + Math.random() * 9000),
      customer: data.customerName || 'Unnamed Supplier',
      customerInitials: initials,
      customerColor: randomColor,
      issueDate: data.date || new Date().toISOString().split('T')[0],
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      amount: `Rs. ${netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      rawAmount: netPayable,
      status,
      payment: 'Cash',
      type: data.type || 'Purchase Return',
      companyId: activeCompany?.id || 'co1',
      branchId: activeBranch?.id || 'br-1',
      fbrInvoiceNumber: status === 'Posted' ? (data.fbrInvoiceNumber || ('FBR-PRTN-' + (data.invoiceNumber || ''))) : ''
    };

    try {
      localStorage.setItem(`invoice_detail_${updatedPurchase.id}`, JSON.stringify({ ...data, fbrInvoiceNumber: updatedPurchase.fbrInvoiceNumber, status: updatedPurchase.status }));
    } catch { /* ignore */ }

    setPurchaseList(prev => {
      const exists = prev.some(x => x.id === updatedPurchase.id);
      if (exists) {
        return prev.map(x => x.id === updatedPurchase.id ? updatedPurchase : x);
      } else {
        const companyId = activeCompany?.id || 'co1';
        const branchId = activeBranch?.id || 'br-1';
        let settingKey: keyof BranchCodeSettings = 'purchase_return';
        const settings = getCodeSettingsForBranch(companyId, branchId)[settingKey];
        if (settings.mode === 'auto' && data.invoiceNumber) {
          incrementNextCode(settingKey, companyId, branchId);
        }
        return [updatedPurchase, ...prev];
      }
    });

    setSuccessModal({
      isOpen: true,
      title: 'Purchase Return Saved',
      message: `Purchase Return ${updatedPurchase.id} created & saved successfully!`,
      onConfirm: () => setActiveView('purchases')
    });
  };

  const handleEditPurchase = (id: string) => {
    try {
      const stored = localStorage.getItem(`invoice_detail_${id}`);
      if (stored) {
        const parsed = JSON.parse(stored) as InvoiceData;
        const inv = purchaseList.find(x => x.id === id);
        parsed.status = parsed.status || inv?.status || 'Unposted';
        parsed.fbrInvoiceNumber = parsed.status === 'Posted' ? (parsed.fbrInvoiceNumber || inv?.fbrInvoiceNumber || ('FBR-INV-' + id)) : '';
        if (parsed.type === 'Purchase Return') {
          setPurchaseReturn(parsed);
          setActiveView('purchase-return');
        } else {
          setPurchase(parsed);
          setActiveView('add-purchase-invoice');
        }
      } else {
        const inv = purchaseList.find(i => i.id === id);
        if (inv) {
          const fallback: InvoiceData = {
            invoiceNumber: inv.id,
            date: inv.issueDate,
            dueDate: inv.dueDate,
            senderName: 'Antigravity Creative Studio',
            senderAddress: '452 Innovation Blvd, San Francisco, CA 94107',
            customerName: inv.customer,
            customerAddress: 'Enterprise Supplier Account',
            subject: inv.type === 'Purchase Return' ? 'Returned Items' : 'Goods Purchased',
            reference: '',
            productCode: '',
            remarks: '',
            type: inv.type || 'Purchase Invoice',
            items: [
              {
                id: crypto.randomUUID(),
                productCode: 'BC-001',
                description: `${inv.type || 'Standard'} Goods & Supplies`,
                unit: 'Item',
                unitDetails: '',
                quantity: 1,
                price: inv.rawAmount || 0,
                discount: 0,
                tax: 0,
                furtherTax: 0
              }
            ],
            taxRate: 0,
            discountPercentage: 0,
            discountAmount: 0,
            shippingCharges: 0,
            roundOff: 0,
            receivedAmount: 0,
            bankAccount: '',
            notes: inv.type === 'Purchase Return' ? 'Purchase return details.' : `Please include the purchase number ${inv.id} in payments.`,
            salesPerson: '',
            department: '',
            fbrInvoiceNumber: inv.status === 'Posted' ? (inv.fbrInvoiceNumber || ('FBR-INV-' + inv.id)) : '',
            status: inv.status
          };
          if (inv.type === 'Purchase Return') {
            setPurchaseReturn(fallback);
            setActiveView('purchase-return');
          } else {
            setPurchase(fallback);
            setActiveView('add-purchase-invoice');
          }
        } else {
          alert('Purchase not found!');
        }
      }
    } catch {
      alert('Failed to load purchase data!');
    }
  };
  const handleSaveBPAdjustment = (data: BPAdjustmentData) => {
    const debitTotal = data.items.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
    const creditTotal = data.items.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);

    const existing = bpAdjustmentList.find(x => x.id === data.adjustmentNumber);
    const status = data.status || 'Unposted';

    if (existing && existing.status === 'Posted') {
      try {
        const oldDetailStored = localStorage.getItem(`bp_adjustment_detail_${data.adjustmentNumber}`);
        if (oldDetailStored) {
          const oldDetail = JSON.parse(oldDetailStored) as BPAdjustmentData;
          const plistRaw = localStorage.getItem('customer_list');
          if (plistRaw) {
            const plist = JSON.parse(plistRaw);
            oldDetail.items.forEach(row => {
              const partner = plist.find((p: any) => (p.customer_id || p.id) === row.partnerId || p.name === row.partnerId);
              if (partner) {
                if ((partner.bp_type || existing.partnerType) === 'customer') {
                  partner.opening_balance = (partner.opening_balance || 0) - (row.debit - row.credit);
                } else {
                  partner.opening_balance = (partner.opening_balance || 0) - (row.credit - row.debit);
                }
              }
            });
            localStorage.setItem('customer_list', JSON.stringify(plist));
          }
        }
      } catch (e) {
        console.error('Failed to reverse old balances', e);
      }
    }

    if (status === 'Posted') {
      try {
        const plistRaw = localStorage.getItem('customer_list');
        if (plistRaw) {
          const plist = JSON.parse(plistRaw);
          data.items.forEach(row => {
            const partner = plist.find((p: any) => (p.customer_id || p.id) === row.partnerId || p.name === row.partnerId);
            if (partner) {
              if ((partner.bp_type || data.partnerType) === 'customer') {
                partner.opening_balance = (partner.opening_balance || 0) + (row.debit - row.credit);
              } else {
                partner.opening_balance = (partner.opening_balance || 0) + (row.credit - row.debit);
              }
            }
          });
          localStorage.setItem('customer_list', JSON.stringify(plist));
        }
      } catch (e) {
        console.error('Failed to apply new balances', e);
      }
    }

    const updatedAdj: BPAdjustment = {
      id: data.adjustmentNumber,
      date: data.date,
      partnerType: data.partnerType,
      partnerId: data.partnerId,
      partnerName: data.partnerName,
      voucherNo: data.voucherNo,
      ref: data.ref,
      debitTotal,
      creditTotal,
      narration: data.narration,
      status,
      companyId: activeCompany?.id || 'co1',
      branchId: activeBranch?.id || 'br-1'
    };

    localStorage.setItem(`bp_adjustment_detail_${updatedAdj.id}`, JSON.stringify(data));

    setBpAdjustmentList(prev => {
      const exists = prev.some(x => x.id === updatedAdj.id);
      if (exists) {
        return prev.map(x => x.id === updatedAdj.id ? updatedAdj : x);
      } else {
        const companyId = activeCompany?.id || 'co1';
        const branchId = activeBranch?.id || 'br-1';
        const settings = getCodeSettingsForBranch(companyId, branchId).bp_adjustment;
        if (settings.mode === 'auto') {
          incrementNextCode('bp_adjustment', companyId, branchId);
        }
        return [updatedAdj, ...prev];
      }
    });
  };

  const handleViewChange = (v: string) => {
    const companyId = activeCompany?.id || 'co1';
    const branchId = activeBranch?.id || 'br-1';

    if (v === 'add-sale-invoice') {
      const settings = getCodeSettingsForBranch(companyId, branchId).sale_invoice;
      const nextId = settings.mode === 'auto' 
        ? generateNextCode('sale_invoice', companyId, branchId)
        : '';
      setInvoice(emptyInvoiceData('Sale Invoice', nextId || 'SI-' + Math.floor(1000 + Math.random() * 9000)));
      setActiveView('add-invoice-v4');
    } else if (v === 'add-service-invoice') {
      const settings = getCodeSettingsForBranch(companyId, branchId).service_invoice;
      const nextId = settings.mode === 'auto' 
        ? generateNextCode('service_invoice', companyId, branchId)
        : '';
      setInvoice(emptyInvoiceData('Service Invoice', nextId || 'SRV-' + Math.floor(1000 + Math.random() * 9000)));
      setActiveView('add-invoice-v4');
    } else if (v === 'add-digital-invoice') {
      const settings = getCodeSettingsForBranch(companyId, branchId).digital_invoice;
      const nextId = settings.mode === 'auto' 
        ? generateNextCode('digital_invoice', companyId, branchId)
        : '';
      setInvoice(emptyInvoiceData('Digital Invoice', nextId || 'DIG-' + Math.floor(1000 + Math.random() * 9000)));
      setActiveView('add-invoice-v4');
    } else if (v === 'return-invoice') {
      const settings = getCodeSettingsForBranch(companyId, branchId).sale_return;
      const nextId = settings.mode === 'auto' 
        ? generateNextCode('sale_return', companyId, branchId)
        : '';
      setReturnInvoice(emptyInvoiceData('Sale Return', nextId || 'RTN-' + Math.floor(1000 + Math.random() * 9000)));
      setActiveView('return-invoice');
    } else if (v === 'add-purchase-invoice') {
      const settings = getCodeSettingsForBranch(companyId, branchId).purchase_invoice;
      const nextId = settings.mode === 'auto' 
        ? generateNextCode('purchase_invoice', companyId, branchId)
        : '';
      setPurchase(emptyInvoiceData('Purchase Invoice', nextId || 'PI-' + Math.floor(1000 + Math.random() * 9000)));
      setActiveView('add-purchase-invoice');
    } else if (v === 'purchase-return') {
      const settings = getCodeSettingsForBranch(companyId, branchId).purchase_return;
      const nextId = settings.mode === 'auto' 
        ? generateNextCode('purchase_return', companyId, branchId)
        : '';
      setPurchaseReturn(emptyInvoiceData('Purchase Return', nextId || 'PRTN-' + Math.floor(1000 + Math.random() * 9000)));
      setActiveView('purchase-return');
    } else if (v === 'bp-adjustments' || v === 'add-bp-adjustment') {
      const settings = getCodeSettingsForBranch(companyId, branchId).bp_adjustment;
      const nextId = settings.mode === 'auto'
        ? generateNextCode('bp_adjustment', companyId, branchId)
        : '';
      setBpAdjustment({
        adjustmentNumber: nextId || 'BPA-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toISOString().split('T')[0],
        partnerType: 'customer',
        partnerId: '',
        partnerName: '',
        voucherNo: nextId || 'BPA-' + Math.floor(1000 + Math.random() * 9000),
        ref: '',
        narration: '',
        voucherType: 'Adjustment',
        items: [],
        status: 'Posted'
      });
      setActiveView('bp-adjustments');
    } else {
      setActiveView(v as View);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard invoiceItems={filteredInvoiceList} onViewChange={handleViewChange} />;
      case 'dashboard1':
        return <Dashboard1 invoiceItems={filteredInvoiceList} onViewChange={handleViewChange} />;
      case 'dashboard2':
        return <Dashboard2 invoiceItems={filteredInvoiceList} onViewChange={handleViewChange} />;
      case 'add-invoice':
        return <div>Invoice creation is handled via AI Inline Panel.</div>;
      case 'add-invoice-v2':
        return <div>Invoice creation v2 handled via AI Inline Panel.</div>;
      case 'add-invoice-v3':
        return <div>Invoice creation v3 handled via AI Inline Panel.</div>;
      case 'add-invoice-v4':
        return <InvoiceEditorV4 data={invoice} onChange={setInvoice} onSave={handleSaveInvoice} onViewChange={handleViewChange} onPrint={handlePrintInvoice} />;
      case 'return-invoice':
        return <ReturnInvoiceEditor data={returnInvoice} onChange={setReturnInvoice} onSave={handleSaveReturnInvoice} onViewChange={handleViewChange} onPrint={handlePrintInvoice} />;
      case 'invoices':
        return <InvoiceListModule invoiceItems={filteredInvoiceList} setInvoiceItems={setInvoiceList} onViewChange={handleViewChange} onPrintInvoice={handlePrintInvoice} onEditInvoice={handleEditInvoice} onPrintList={handlePrintList} />;
      case 'customers':
        return <CustomerManagement onViewChange={handleViewChange} onPrintList={handlePrintList} />;
      case 'bp-ledger':
        return <BPLedgerForm />;
      case 'bp-adjustments':
      case 'add-bp-adjustment':
        return (
          <BPAdjustmentEditor
            data={bpAdjustment}
            onChange={setBpAdjustment}
            onSave={handleSaveBPAdjustment}
            onViewChange={handleViewChange}
          />
        );
      case 'add-customer':
        return <CustomerManagement initialOpenCreate={true} onViewChange={handleViewChange} onPrintList={handlePrintList} />;
      case 'products':
        return <ProductList onAddProductClick={() => {
          setProductFormInitialData(undefined);
          setIsProductFormOpen(true);
        }} onPrintList={handlePrintList} />;
      case 'warehouses':
        return <WarehousesPage />;
      case 'product-batches':
        return <ProductBatchPage />;
      case 'stock-adjustments':
        return <StockAdjustmentEditor onViewChange={handleViewChange} />;
      case 'purchases':
        return <PurchaseList purchaseItems={filteredPurchaseList} setPurchaseItems={setPurchaseList} onViewChange={handleViewChange} onPrintPurchase={handlePrintInvoice} onEditPurchase={handleEditPurchase} onPrintList={handlePrintList} />;
      case 'add-purchase-invoice':
        return <PurchaseInvoiceEditor data={purchase} onChange={setPurchase} onSave={handleSavePurchase} onViewChange={handleViewChange} onPrint={handlePrintInvoice} />;
      case 'purchase-return':
        return <PurchaseReturnEditor data={purchaseReturn} onChange={setPurchaseReturn} onSave={handleSavePurchaseReturn} onViewChange={handleViewChange} onPrint={handlePrintInvoice} />;
      case 'settings':
        return <Settings />;
      case 'help':
        return <Help />;
      default:
        return <Dashboard invoiceItems={filteredInvoiceList} onViewChange={handleViewChange} />;
    }
  };

  const loadingFallback = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>Loading…</div>
  );

  return (
    <Suspense fallback={loadingFallback}>
      <div className="h-screen w-screen overflow-hidden relative">
        <Layout
          activeView={activeView}
          invoiceType={invoice.type}
          onViewChange={handleViewChange}
          onLogout={() => {
            try {
              localStorage.removeItem('is_logged_in');
              localStorage.removeItem('active_view');
              sessionStorage.removeItem('active_company');
              sessionStorage.removeItem('active_branch');
            } catch {}
            setActiveCompany(null);
            setActiveBranch(null);
            setIsLoggedIn(false);
            setActiveView('dashboard');
          }}
          userName={userProfile.name}
          userRole={userProfile.role}
          currentCompany={activeCompany}
          currentBranch={activeBranch}
          companies={companies}
          branches={branches}
          onContextChange={handleContextChange}
        >
          <Suspense fallback={loadingFallback}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="h-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </Layout>

        {/* Visual Reloading Context Overlay */}
        {isReloading && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[9999] transition-all duration-300">
            <Card className="p-6 border rounded-2xl shadow-2xl bg-white max-w-sm w-full mx-4 text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Updating ERP Context</h3>
                <p className="text-[11px] font-medium text-slate-500 mt-1.5">{reloadStep}</p>
              </div>
            </Card>
          </div>
        )}
      </div>

      <AlertModal
        isOpen={successModal.isOpen}
        onClose={() => {
          setSuccessModal(prev => ({ ...prev, isOpen: false }));
          if (successModal.onConfirm) {
            successModal.onConfirm();
          }
        }}
        title={successModal.title}
        message={successModal.message}
        variant="info"
        closeLabel="Got It"
      />

      <InlineProductForm
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        initialData={productFormInitialData}
      />

      {/* Hidden Printable List Area */}
      {printListData && printTemplate && (() => {
        const printOrientation = printTemplate?.orientation?.toLowerCase() || 'portrait';
        const isLandscape = printOrientation === 'landscape';

        const pageWidthVal = printTemplate?.paper_size === 'Thermal' ? '80mm' :
                             printTemplate?.paper_size === 'Letter' ? (isLandscape ? '279mm' : '216mm') :
                             printTemplate?.paper_size === 'Custom' ? (isLandscape ? (printTemplate.paper_height || '297mm') : (printTemplate.paper_width || '210mm')) :
                             (isLandscape ? '297mm' : '210mm'); // A4 default

        const pageHeightVal = printTemplate?.paper_size === 'Thermal' ? 'auto' :
                              printTemplate?.paper_size === 'Letter' ? (isLandscape ? '216mm' : '279mm') :
                              printTemplate?.paper_size === 'Custom' ? (isLandscape ? (printTemplate.paper_width || '210mm') : (printTemplate.paper_height || '297mm')) :
                              (isLandscape ? '210mm' : '297mm'); // A4 default

        const pageSizeRule = printTemplate?.paper_size === 'Thermal' ? '80mm auto' :
                             `${pageWidthVal} ${pageHeightVal}`;

        const companyDetails = (() => {
          try {
            const stored = localStorage.getItem('company_records');
            if (stored) {
              const list = JSON.parse(stored);
              const activeCo = list.find((c: any) => c.is_active) || list[0];
              if (activeCo) {
                return {
                  name: activeCo.name || 'Acme Corporation',
                  address: activeCo.address3 ? `${activeCo.address3}${activeCo.city ? ', ' + activeCo.city : ''}` : 'Main Boulevard, Gulberg III, Lahore',
                  phone: activeCo.phone || activeCo.mobile || '042-35711111',
                  email: activeCo.email || 'info@acme.com',
                  website: activeCo.website || 'www.acme.com',
                  ntn: activeCo.ntn || '1234567-8',
                  strn: activeCo.stn || '03-00-1234-567-89'
                };
              }
            }
          } catch {}
          return {
            name: 'Acme Corporation',
            address: 'Main Boulevard, Gulberg III, Lahore',
            phone: '042-35711111',
            email: 'info@acme.com',
            website: 'www.acme.com',
            ntn: '1234567-8',
            strn: '03-00-1234-567-89'
          };
        })();

        return (
          <div className="fixed inset-0 z-[9999] bg-white overflow-auto print-visible-only">
            <style dangerouslySetInnerHTML={{ __html: `
              @media screen {
                .print-visible-only { display: none !important; }
              }
              @media print {
                body * { visibility: hidden !important; }
                #list-print-container, #list-print-container * { visibility: visible !important; }
                #list-print-container { 
                  position: absolute !important; 
                  left: 0 !important; 
                  top: 0 !important; 
                  width: ${pageWidthVal} !important; 
                  max-width: ${pageWidthVal} !important;
                  background: white !important; 
                  color: black !important;
                  padding: ${printTemplate?.paper_size === 'Thermal' ? '5mm' : '15mm'} !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                  border: none !important;
                  display: block !important;
                }
              }
              @page { size: ${pageSizeRule}; margin: 0; }
            ` }} />
            <div 
              id="list-print-container" 
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                width: pageWidthVal,
                minHeight: printTemplate?.paper_size === 'Thermal' ? 'auto' : pageHeightVal,
                background: 'white',
                color: '#1e293b',
                margin: '0 auto',
                boxSizing: 'border-box',
                padding: printTemplate?.paper_size === 'Thermal' ? '5mm' : '15mm',
              }}
              className="space-y-6 font-sans text-xs bg-white text-black"
            >
              {/* 1. Company Header */}
              {printSections.find(s => s.section_name === 'Company Information' && s.is_visible) && (
                <div className="w-full flex justify-between items-start border-b pb-4 mb-2" style={{ borderColor: '#E2E8F0' }}>
                  <div className="flex-grow">
                    {printTemplate?.logo_url && printTemplate?.logo_size !== undefined && printTemplate.logo_size > 0 && (
                      <img src={printTemplate.logo_url} alt="Logo" style={{ height: `${printTemplate.logo_size}px`, objectFit: 'contain', marginBottom: '8px' }} />
                    )}
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">{companyDetails.name}</h2>
                    <p className="text-slate-500 text-[10px] mt-0.5">{companyDetails.address}</p>
                    <p className="text-slate-500 text-[10px]">Phone: {companyDetails.phone} | Email: {companyDetails.email}</p>
                    {(companyDetails.ntn || companyDetails.strn) && (
                      <p className="text-slate-600 text-[10px] font-bold mt-1">
                        {companyDetails.ntn && `NTN: ${companyDetails.ntn}`}
                        {companyDetails.ntn && companyDetails.strn && ' | '}
                        {companyDetails.strn && `STRN: ${companyDetails.strn}`}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-[10px] text-slate-500 space-y-0.5">
                    <p className="font-bold text-slate-700">Date: {new Date().toLocaleDateString('en-GB')}</p>
                    <p>Records: {printListData.length}</p>
                  </div>
                </div>
              )}

              {/* Centered Document Title */}
              <div className="w-full text-center my-4">
                <h1 className="text-base font-extrabold tracking-wider text-slate-800 uppercase pb-1 border-b-2 border-slate-700 inline-block">
                  {printTemplate.document_type === 'Product List' ? 'Product Catalog' : 
                   printTemplate.document_type === 'Business Partner List' ? 'Business Partner Directory' :
                   printTemplate.document_type === 'Purchase List' ? 'Purchase Register' :
                   printTemplate.document_type === 'Sales Invoice' ? 'Sales Invoice Register' : 'Purchase Register'}
                </h1>
              </div>

              {/* 2. List Table */}
              {printSections.find(s => s.section_name === 'Product Table' && s.is_visible) && (
                <table className="w-full border-collapse border border-slate-200" style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-slate-300 text-[11px] font-bold text-slate-700">
                      {printColumns.filter(c => c.is_visible).map(c => (
                        <th key={c.column_id} className="py-2.5 px-3 text-left font-black border border-slate-200" style={{ width: c.width, textAlign: c.alignment || 'left' }}>
                          {(() => {
                            let dl = c.custom_label || c.column_name;
                            if (dl === 'Customer Name' || dl === 'Supplier Name') return 'Business Partner Name';
                            if (dl === 'Customer Code' || dl === 'Supplier Code') return 'Business Partner Code';
                            return dl;
                          })()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {printListData.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-150 hover:bg-slate-50/50">
                        {printColumns.filter(c => c.is_visible).map(c => {
                          let val = '';
                          const colName = c.column_name;
                          if (printTemplate.document_type === 'Product List') {
                            if (colName === 'Sr No') val = String(idx + 1);
                            else if (colName === 'Product Code') val = item.id || '';
                            else if (colName === 'Product Name') val = item.name || '';
                            else if (colName === 'Category') val = item.category || '';
                            else if (colName === 'Purchase Price') val = item.purchase_price ? `Rs. ${item.purchase_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-';
                            else if (colName === 'Sale Price') val = item.sale_price ? `Rs. ${item.sale_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-';
                            else if (colName === 'Stock Qty') val = item.stock != null ? String(item.stock) : '0';
                            else if (colName === 'Expiry Date') val = item.expiry_date || '-';
                          } else if (printTemplate.document_type === 'Business Partner List') {
                            if (colName === 'Sr No') val = String(idx + 1);
                            else if (colName === 'Code') val = item.customer_id || item.id || '';
                            else if (colName === 'Name') val = item.name || '';
                            else if (colName === 'Type') val = item.bp_type === 'supplier' ? 'Supplier' : 'Customer';
                            else if (colName === 'Phone Number') val = item.phone || item.mobile || '-';
                            else if (colName === 'City') val = item.city || '-';
                            else if (colName === 'Address') val = item.address || '-';
                          } else if (printTemplate.document_type === 'Purchase List') {
                            let fullDetails: any = null;
                            try {
                              const storedDetail = localStorage.getItem(`invoice_detail_${item.id}`);
                              if (storedDetail) {
                                fullDetails = JSON.parse(storedDetail);
                              }
                            } catch {}

                            const supplierCode = (() => {
                              try {
                                const storedCusts = localStorage.getItem('customer_list');
                                if (storedCusts) {
                                  const custs = JSON.parse(storedCusts);
                                  const match = custs.find((c: any) => c.name === item.customer);
                                  if (match) return match.customer_id || match.id || '';
                                }
                              } catch {}
                              return '';
                            })();

                            const subtotal = fullDetails?.items?.reduce((sum: number, it: any) => sum + (it.quantity * it.price), 0) || 0;
                            const discount = fullDetails?.discountAmount || 0;
                            const tax = fullDetails?.items?.reduce((sum: number, it: any) => sum + (it.tax || 0) + (it.furtherTax || 0), 0) || 0;
                            const netAmount = fullDetails?.items?.reduce((sum: number, it: any) => sum + (it.quantity * it.price) - it.discount + it.tax + (it.furtherTax || 0), 0) + (fullDetails?.shippingCharges || 0) + (fullDetails?.roundOff || 0) || item.rawAmount || 0;

                            if (colName === 'Sr No') val = String(idx + 1);
                            else if (colName === 'Purchase No') val = item.id || '';
                            else if (colName === 'Supplier Name') val = item.customer || '';
                            else if (colName === 'Supplier Code') val = supplierCode || '-';
                            else if (colName === 'Invoice No') val = fullDetails?.reference || 'N/A';
                            else if (colName === 'Purchase Date') val = item.issueDate || '';
                            else if (colName === 'Due Date') val = item.dueDate || '';
                            else if (colName === 'Branch') {
                              val = 'Main';
                              try {
                                const activeCo = sessionStorage.getItem('active_company');
                                if (activeCo) {
                                  const parsedCo = JSON.parse(activeCo);
                                  val = parsedCo.activeBranchName || 'Main';
                                }
                              } catch {}
                            }
                            else if (colName === 'Warehouse') val = fullDetails?.warehouse || 'Main Warehouse';
                            else if (colName === 'Total Amount') val = subtotal ? `${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '0.00';
                            else if (colName === 'Discount') val = discount ? `${discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '0.00';
                            else if (colName === 'Tax') val = tax ? `${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '0.00';
                            else if (colName === 'Net Amount') val = netAmount ? `${netAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '0.00';
                            else if (colName === 'Payment Status') val = item.payment || 'Unpaid';
                            else if (colName === 'Status') val = item.status || '';
                            else if (colName === 'Remarks') val = fullDetails?.remarks || '-';
                            else if (colName === 'Created By') val = fullDetails?.senderName || 'System';
                            else if (colName === 'Created Date') val = item.issueDate || '';
                          } else {
                            if (colName === 'Sr No') val = String(idx + 1);
                            else if (colName === 'Invoice No' || colName === 'Invoice ID' || colName === 'Purchase ID' || colName === 'Invoice No.') val = item.id || '';
                            else if (colName === 'FBR Invoice Number') val = item.fbrInvoiceNumber || '-';
                            else if (colName === 'Business Partner' || colName === 'Customer') val = item.customer || '';
                            else if (colName === 'Issue Date' || colName === 'Issue date') val = item.issueDate || '';
                            else if (colName === 'Due Date' || colName === 'Due date') val = item.dueDate || '';
                            else if (colName === 'Amount' || colName === 'Amount (Rs.)') val = item.amount || '';
                            else if (colName === 'Type') val = item.type || '';
                            else if (colName === 'Status') val = item.status || '';
                          }
                          return (
                            <td key={c.column_id} className="py-2.5 px-3 text-[10.5px] text-slate-800 border border-slate-200" style={{ textAlign: c.alignment || 'left' }}>
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* 3. Footer */}
              {printSections.find(s => s.section_name === 'Footer' && s.is_visible) && (
                <div className="flex justify-between items-center pt-6 border-t mt-8" style={{ borderColor: '#E2E8F0' }}>
                  <div className="text-slate-400 text-[9px]">
                    {printTemplate.remarks_enabled && <p>Report generated automatically on {new Date().toLocaleString()}.</p>}
                  </div>
                  {printTemplate.signature_enabled && (
                    <div className="text-center w-40 border-t border-slate-300 pt-1.5 mt-4">
                      <p className="font-bold text-slate-600 text-[10px]">Authorized Signature</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Hidden Printable Invoice Area */}
      {printInvoiceData && (() => {
        const paperWidth = printTemplate?.paper_size === 'Thermal' ? '80mm' :
                           printTemplate?.paper_size === 'Letter' ? '216mm' :
                           printTemplate?.paper_size === 'Custom' ? (printTemplate.paper_width || '210mm') : '210mm'; // A4 default

        const paperHeight = printTemplate?.paper_size === 'Thermal' ? 'auto' :
                            printTemplate?.paper_size === 'Letter' ? '279mm' :
                            printTemplate?.paper_size === 'Custom' ? (printTemplate.paper_height || '297mm') : '297mm'; // A4 default

        const printOrientation = printTemplate?.orientation?.toLowerCase() || 'portrait';
        const pageSizeRule = printTemplate?.paper_size === 'Thermal' ? '80mm auto' :
                             `${paperWidth} ${paperHeight} ${printOrientation}`;

        const companyDetails = (() => {
          try {
            const stored = localStorage.getItem('company_records');
            if (stored) {
              const list = JSON.parse(stored);
              const activeCo = list.find((c: any) => c.is_active) || list[0];
              if (activeCo) {
                return {
                  name: activeCo.name || 'Acme Corporation',
                  address: activeCo.address3 ? `${activeCo.address3}${activeCo.city ? ', ' + activeCo.city : ''}` : 'Main Boulevard, Gulberg III, Lahore',
                  phone: activeCo.phone || activeCo.mobile || '042-35711111',
                  email: activeCo.email || 'info@acme.com',
                  website: activeCo.website || 'www.acme.com',
                  ntn: activeCo.ntn || '1234567-8',
                  strn: activeCo.stn || '03-00-1234-567-89'
                };
              }
            }
          } catch {}
          return {
            name: 'Acme Corporation',
            address: 'Main Boulevard, Gulberg III, Lahore',
            phone: '042-35711111',
            email: 'info@acme.com',
            website: 'www.acme.com',
            ntn: '1234567-8',
            strn: '03-00-1234-567-89'
          };
        })();

        const customerDetails = (() => {
          if (!printInvoiceData?.customer) return null;
          try {
            const stored = localStorage.getItem('customer_list');
            if (stored) {
              const list = JSON.parse(stored);
              const match = list.find((c: any) => c.name === printInvoiceData.customer);
              if (match) {
                return {
                  phone: match.phone || match.mobile || '0300-1234567',
                  ntn: match.ntn || '1234567-8',
                  email: match.email || 'customer@gmail.com',
                  cnic: match.cnic || '42201-1234567-1',
                  strn: match.strn || match.strn_number || '03-09-9999-001-22',
                  code: match.code || match.customer_code || 'CUST-9928',
                  address: match.address ? `${match.address}${match.city ? ', ' + match.city : ''}` : 'Enterprise Customer Account'
                };
              }
            }
          } catch {}
          // Fallback to sampleCustomers/DEFAULT_CUSTOMERS or default
          const matchSample = sampleCustomers.find(c => c.name === printInvoiceData.customer);
          if (matchSample) {
            return {
              phone: '0300-1234567',
              ntn: matchSample.ntn || '9876543-2',
              email: (matchSample as any).email || 'customer@gmail.com',
              cnic: (matchSample as any).cnic || '42201-1234567-1',
              strn: (matchSample as any).strn || '03-09-9999-001-22',
              code: (matchSample as any).code || 'CUST-9928',
              address: matchSample.fullAddress
            };
          }
          const matchDefault = DEFAULT_CUSTOMERS.find(c => c.name === printInvoiceData.customer);
          if (matchDefault) {
            return {
              phone: matchDefault.phone || '0300-1234567',
              ntn: '1234567-8',
              email: 'customer@gmail.com',
              cnic: '42201-1234567-1',
              strn: '03-09-9999-001-22',
              code: 'CUST-9928',
              address: matchDefault.location
            };
          }
          return {
            phone: '0300-1234567',
            ntn: '1234567-8',
            email: 'customer@gmail.com',
            cnic: '42201-1234567-1',
            strn: '03-09-9999-001-22',
            code: 'CUST-9928',
            address: 'Enterprise Customer Account'
          };
        })();

        const salesPersonName = (() => {
          try {
            const spListStored = localStorage.getItem('sales_persons');
            const spList = spListStored ? JSON.parse(spListStored) : [];
            
            // Try to find salesperson via customer assignment
            const custName = printInvoiceData?.customer;
            if (custName) {
              const storedCustomers = localStorage.getItem('customer_list');
              const customersList = storedCustomers ? JSON.parse(storedCustomers) : [];
              const customer = customersList.find((c: any) => c.name === custName) || sampleCustomers.find((c: any) => c.name === custName);
              
              if (customer && customer.sales_person_id) {
                const sp = spList.find((s: any) => s.id === customer.sales_person_id);
                if (sp) return sp.name;
              }
            }
            
            if (spList.length > 0) return spList[0].name;
          } catch {}
          return 'Arsalan Ahmed';
        })();

        let subtotalVal = 0;
        let grandTotalVal = 0;
        let taxRate = 0;
        let taxVal = 0;
        let discountVal = 0;
        let shippingCharges = 0;
        let roundOff = 0;
        let receivedVal = 0;

        if (printInvoiceFullData) {
          subtotalVal = printInvoiceFullData.items.reduce((sum, item) => sum + (item.quantity * item.price) - item.discount + item.tax + (item.furtherTax || 0), 0);
          taxRate = printInvoiceFullData.taxRate || 0;
          taxVal = (subtotalVal * taxRate) / 100;
          discountVal = printInvoiceFullData.discountAmount || (subtotalVal * (printInvoiceFullData.discountPercentage || 0)) / 100;
          shippingCharges = printInvoiceFullData.shippingCharges || 0;
          roundOff = printInvoiceFullData.roundOff || 0;
          grandTotalVal = subtotalVal + taxVal - discountVal + shippingCharges + roundOff;
          receivedVal = printInvoiceFullData.receivedAmount || 0;
        } else {
          const rawStr = printInvoiceData?.amount?.replace(/^(Rs\.|PKR|\$)\s*/i, '').replace(/,/g, '') || '0';
          grandTotalVal = parseFloat(rawStr) || 0;
          subtotalVal = grandTotalVal;
        }

        const renderPrintFieldContent = (item: any, _sectionName: string) => {
          const label = item.isCustom ? item.field_name : (item.custom_label || item.field_name);

          if (item.field_name === 'Company Logo') {
            return printTemplate?.logo_url ? (
              <img
                src={printTemplate.logo_url}
                alt="Logo"
                style={{
                  height: `${printTemplate.logo_size || 80}px`,
                  objectFit: 'contain',
                }}
              />
            ) : null;
          }

          if (item.field_name === 'Item Table') {
            const visibleCols = printColumns.filter((c: PrintTemplateColumn) => c.is_visible);
            const isNumericColumn = (name: string) => {
              return ['Quantity', 'Qty', 'Rate', 'Unit Price', 'Discount', 'Tax', 'Amount', 'Cost Price', 'Return Quantity'].includes(name);
            };
            return (
              <div className="overflow-hidden bg-white w-full">
                <table className="w-full text-left border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-300 text-[9px] font-bold text-slate-500">
                      {visibleCols.map((col: PrintTemplateColumn) => {
                        const alignVal = col.alignment || (isNumericColumn(col.column_name) ? 'right' : 'left');
                        return (
                          <th key={col.column_id} className="py-2 px-3 font-black text-slate-700 border border-slate-300" style={{ width: col.width, textAlign: alignVal }}>
                            {col.custom_label || col.column_name}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {printInvoiceFullData ? (
                      printInvoiceFullData.items.map((item, idx) => {
                        const itemTotal = (item.quantity * item.price) - item.discount + item.tax + (item.furtherTax || 0);
                        return (
                          <tr key={item.id || idx} className="text-[9px] border-b border-slate-300 text-slate-650 last:border-b-0">
                            {visibleCols.map((col: PrintTemplateColumn) => {
                              let val = '-';
                              const alignVal = col.alignment || (isNumericColumn(col.column_name) ? 'right' : 'left');
                              
                              if (col.column_name === 'Sr No' || col.column_name === 'Sr#') val = (idx + 1).toString();
                              else if (col.column_name === 'Product Code') val = item.productCode || '';
                              else if (col.column_name === 'Product Name') {
                                const productName = (() => {
                                  try {
                                    const storedProds = localStorage.getItem('products_list');
                                    if (storedProds) {
                                      const prods = JSON.parse(storedProds);
                                      const match = prods.find((p: any) => p.code === item.productCode || p.id === item.productCode);
                                      if (match) return match.name || '';
                                    }
                                  } catch {}
                                  return item.description || 'Product/Service';
                                })();
                                val = productName;
                              }
                              else if (col.column_name === 'Description') val = item.description || '';
                              else if (col.column_name === 'Batch No') val = item.batchNo || '-';
                              else if (col.column_name === 'Expiry Date') {
                                const expiryDate = (() => {
                                  try {
                                    const stored = localStorage.getItem('product_batches');
                                    if (stored && item.batchNo) {
                                      const batches = JSON.parse(stored);
                                      const match = batches.find((b: any) => b.batch_no === item.batchNo);
                                      if (match) return match.expiry_date || '';
                                    }
                                  } catch {}
                                  return '';
                                })();
                                val = expiryDate || '-';
                              }
                              else if (col.column_name === 'Serial No') val = '-';
                              else if (col.column_name === 'Warehouse') val = '-';
                              else if (col.column_name === 'Unit') val = item.unit || 'Unit';
                              else if (col.column_name === 'Quantity' || col.column_name === 'Qty' || col.column_name === 'Return Quantity') val = item.quantity.toLocaleString(undefined, { minimumFractionDigits: 2 });
                              else if (col.column_name === 'Rate' || col.column_name === 'Unit Price' || col.column_name === 'Cost Price') val = item.price.toLocaleString(undefined, { minimumFractionDigits: 2 });
                              else if (col.column_name === 'Discount') val = item.discount.toLocaleString(undefined, { minimumFractionDigits: 2 });
                              else if (col.column_name === 'Tax') val = item.tax.toLocaleString(undefined, { minimumFractionDigits: 2 });
                              else if (col.column_name === 'Amount') val = itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
                              
                              return (
                                <td key={col.column_id} className="py-2 px-3 border border-slate-300" style={{ textAlign: alignVal }}>
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })
                    ) : (
                      <tr className="text-[9px] border-b border-slate-300 text-slate-650 last:border-b-0">
                        {visibleCols.map((col: PrintTemplateColumn) => {
                          let val = '-';
                          const alignVal = col.alignment || (isNumericColumn(col.column_name) ? 'right' : 'left');
                          const rawStr = printInvoiceData?.amount?.replace(/^(Rs\.|PKR|\$)\s*/i, '').replace(/,/g, '') || '0';
                          const netPayable = parseFloat(rawStr) || 0;
                          
                          if (col.column_name === 'Sr No' || col.column_name === 'Sr#') val = '1';
                          else if (col.column_name === 'Product Code') val = 'BC-001';
                          else if (col.column_name === 'Product Name') val = 'Services';
                          else if (col.column_name === 'Description') val = `${printInvoiceData?.type || 'Standard'} Services & Deliverables`;
                          else if (col.column_name === 'Quantity' || col.column_name === 'Qty' || col.column_name === 'Return Quantity') val = '1.00';
                          else if (col.column_name === 'Rate' || col.column_name === 'Unit Price' || col.column_name === 'Cost Price') val = netPayable.toLocaleString(undefined, { minimumFractionDigits: 2 });
                          else if (col.column_name === 'Amount') val = netPayable.toLocaleString(undefined, { minimumFractionDigits: 2 });
                          else if (col.column_name === 'Batch No') val = 'BATCH-001';
                          else if (col.column_name === 'Expiry Date') val = '31-Dec-2027';
                          else if (col.column_name === 'Unit') val = 'Unit';
                          
                          return (
                            <td key={col.column_id} className="py-2 px-3 border border-slate-300" style={{ textAlign: alignVal }}>
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          }

          if (item.field_name === 'QR Code') {
            return printTemplate?.qr_enabled ? (
              <div className="w-10 h-10 border p-0.5 rounded bg-white flex items-center justify-center">
                <svg className="w-full h-full text-slate-800" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-2 2h2v2h-2v-2zm2 2h3v3h-3v-3zm-2 2h2v2h-2v-2zm4-4h2v4h-2v-4zm0 6h2v1h-2v-1z" />
                </svg>
              </div>
            ) : null;
          }

          if (item.field_name === 'Barcode') {
            return printTemplate?.barcode_enabled ? (
              <div className="pt-1 w-32">
                <svg className="h-6 w-32 text-slate-800" viewBox="0 0 100 20">
                  <rect width="100" height="20" fill="white"/>
                  <rect x="5" y="2" width="2" height="16" fill="currentColor"/>
                  <rect x="10" y="2" width="4" height="16" fill="currentColor"/>
                  <rect x="16" y="2" width="1" height="16" fill="currentColor"/>
                  <rect x="20" y="2" width="3" height="16" fill="currentColor"/>
                  <rect x="25" y="2" width="5" height="16" fill="currentColor"/>
                  <rect x="32" y="2" width="2" height="16" fill="currentColor"/>
                  <rect x="36" y="2" width="1" height="16" fill="currentColor"/>
                  <rect x="40" y="2" width="4" height="16" fill="currentColor"/>
                  <rect x="48" y="2" width="2" height="16" fill="currentColor"/>
                  <rect x="52" y="2" width="3" height="16" fill="currentColor"/>
                  <rect x="58" y="2" width="5" height="16" fill="currentColor"/>
                  <rect x="65" y="2" width="2" height="16" fill="currentColor"/>
                  <rect x="70" y="2" width="1" height="16" fill="currentColor"/>
                  <rect x="74" y="2" width="4" height="16" fill="currentColor"/>
                  <rect x="80" y="2" width="2" height="16" fill="currentColor"/>
                  <rect x="85" y="2" width="5" height="16" fill="currentColor"/>
                </svg>
              </div>
            ) : null;
          }

          if (item.field_name === 'Signature') {
            return printTemplate?.signature_enabled ? (
              <div className="text-center w-32">
                <div className="border-b border-slate-300 w-full h-4" />
                <span className="text-[8px] text-slate-400 block mt-0.5">{item.custom_label || 'Seller Signature'}</span>
              </div>
            ) : null;
          }

          if (item.field_name === 'Watermark') {
            return null;
          }

          if (item.field_name === 'FBR Logo') {
            return (
              <div className="flex items-center gap-1 bg-emerald-50/70 border border-emerald-200 rounded px-1.5 py-0.5 text-[8px] font-bold text-emerald-800">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
                <div className="flex flex-col text-left leading-[1.1]">
                  <span>FBR</span>
                  <span className="text-[5px] text-emerald-500 font-medium font-sans">Pakistan</span>
                </div>
              </div>
            );
          }

          if (item.field_name === 'Company Stamp') {
            return (
              <div className="w-20 h-10 border border-dashed border-slate-350 rounded-full flex flex-col items-center justify-center opacity-65 select-none bg-slate-50/50">
                <span className="text-[5px] font-bold text-slate-455">Company Stamp</span>
                <span className="text-[4px] text-slate-350">Seal Here</span>
              </div>
            );
          }

          const labelColor = item.label_color || item.color;
          const labelBold = item.label_is_bold !== undefined ? item.label_is_bold : item.is_bold;
          const valueColor = item.value_color || item.color;
          const valueBold = item.value_is_bold !== undefined ? item.value_is_bold : item.is_bold;

          if (item.field_name === 'Notes') {
            const notesValue = printInvoiceFullData?.notes || 'Goods once sold are non-refundable. Tax paid has been deposited with FBR.';
            return (
              <div className="w-full">
                <strong style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}>{label}: </strong>
                <span style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal', whiteSpace: 'pre-wrap' }}>{notesValue}</span>
              </div>
            );
          }

          if (item.field_name === 'Remarks' && !printTemplate?.remarks_enabled) return null;
          if (item.field_name === 'Terms & Conditions' && !printTemplate?.terms_enabled) return null;

          if (['Prepared By', 'Received By'].includes(item.field_name)) {
            return (
              <div className="inline-block text-center mr-4">
                <div className="border-b border-slate-300 w-24 h-4" />
                <span className="text-[8px] text-slate-400" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{label}</span>
              </div>
            );
          }

          if (['Subtotal', 'Grand Total', 'Balance Due', 'Tax Amount', 'Discount Amount', 'Shipping Charges', 'Round Off', 'Received Amount'].includes(item.field_name)) {
            let valAmount = '0.00';
            if (item.field_name === 'Subtotal') valAmount = subtotalVal.toLocaleString(undefined, { minimumFractionDigits: 2 });
            else if (item.field_name === 'Grand Total') valAmount = grandTotalVal.toLocaleString(undefined, { minimumFractionDigits: 2 });
            else if (item.field_name === 'Balance Due') valAmount = (grandTotalVal - receivedVal).toLocaleString(undefined, { minimumFractionDigits: 2 });
            else if (item.field_name === 'Tax Amount') valAmount = taxVal.toLocaleString(undefined, { minimumFractionDigits: 2 });
            else if (item.field_name === 'Discount Amount') valAmount = discountVal.toLocaleString(undefined, { minimumFractionDigits: 2 });
            else if (item.field_name === 'Shipping Charges') valAmount = shippingCharges.toLocaleString(undefined, { minimumFractionDigits: 2 });
            else if (item.field_name === 'Round Off') valAmount = roundOff.toLocaleString(undefined, { minimumFractionDigits: 2 });
            else if (item.field_name === 'Received Amount') valAmount = receivedVal.toLocaleString(undefined, { minimumFractionDigits: 2 });

            return (
              <div className="grid grid-cols-12 w-full items-center gap-x-2">
                <div className="col-span-7 text-left">
                  <span className="text-slate-400 font-bold" style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}>{label}:</span>
                </div>
                <div className="col-span-2 text-center text-slate-400 font-bold" style={{ color: labelColor || undefined }}>
                  Rs.
                </div>
                <div className="col-span-3 text-right">
                  <span className="font-extrabold" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{valAmount}</span>
                </div>
              </div>
            );
          }

          let actualVal = '';
          if (item.isCustom) {
            actualVal = item.default_value || '';
            if (printInvoiceFullData && (printInvoiceFullData as any).customFields) {
              const matched = (printInvoiceFullData as any).customFields.find((x: any) => x.name === item.field_name || x.id === item.custom_field_id);
              if (matched) actualVal = matched.value;
            }
          } else {
            actualVal = 
              item.field_name === 'Company Name' ? companyDetails.name :
              item.field_name === 'Company Address' ? companyDetails.address :
              item.field_name === 'Phone' || item.field_name === 'Phone Number' ? companyDetails.phone :
              item.field_name === 'Email' ? companyDetails.email :
              item.field_name === 'Website' ? companyDetails.website :
              item.field_name === 'NTN' ? companyDetails.ntn :
              item.field_name === 'STRN' || item.field_name === 'STN' || item.field_name === 'STN / STRN' ? companyDetails.strn :
              item.field_name === 'Customer Name' || item.field_name === 'Supplier Name' ? (printInvoiceData?.customer || '') :
              item.field_name === 'Customer Address' || item.field_name === 'Address' ? (customerDetails?.address || '') :
              item.field_name === 'Mobile' || item.field_name === 'Mobile Number' ? (customerDetails?.phone || '') :
              item.field_name === 'Customer NTN' ? (customerDetails?.ntn || '') :
              item.field_name === 'Customer STRN' ? (customerDetails?.strn || '') :
              item.field_name === 'Customer CNIC' ? (customerDetails?.cnic || '') :
              item.field_name === 'Customer Code' || item.field_name === 'Supplier Code' ? (customerDetails?.code || '') :
              item.field_name === 'Customer Email' ? customerDetails?.email || '' :
              item.field_name === 'Contact Person' ? ((customerDetails as any)?.contact_person || '') :
              item.field_name === 'Invoice Number' || item.field_name === 'Purchase Invoice Number' || item.field_name === 'Purchase Return Number' ? (printInvoiceData?.id || '') :
              item.field_name === 'Date' || item.field_name === 'Invoice Date' || item.field_name === 'Purchase Date' || item.field_name === 'Return Date' ? (printInvoiceData?.issueDate || '') :
              item.field_name === 'Due Date' ? (printInvoiceData?.dueDate || '') :
              item.field_name === 'Sales Person' ? salesPersonName :
              item.field_name === 'Reference Number' ? (printInvoiceData as any)?.referenceNumber || '' :
              item.field_name === 'Warehouse' ? (printInvoiceData as any)?.warehouse || 'Main Warehouse' :
              item.field_name === 'FBR Invoice Number' ? (printInvoiceData?.status === 'Posted' ? ((printInvoiceData as any)?.fbrInvoiceNumber || ('FBR-INV-' + (printInvoiceData?.id || '1092837'))) : '') :
              item.field_name === 'Payment Terms' ? (printInvoiceData?.payment || (printInvoiceFullData as any)?.paymentTerms || 'Net 30') :
              item.field_name === 'Prepared By' || item.field_name === 'Printed By' ? (printInvoiceFullData as any)?.preparedBy || 'Prepared By User' :
              item.field_name === 'Received By' ? (printInvoiceFullData as any)?.receivedBy || 'Received By Client' :
              item.field_name === 'Remarks' ? ((printInvoiceFullData as any)?.remarks || `Payment term: ${printInvoiceData?.payment || ''}`) :
              item.field_name === 'Terms & Conditions' ? 'Payment is due within 30 days of issue. Balance subject to 2% late penalty.' : '';
          }

          if (!actualVal && item.field_name !== 'Remarks' && item.field_name !== 'Terms & Conditions') return null;

          return (
            <div className="w-full">
              <strong className="mr-1" style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}>{label}: </strong>
              <span style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{actualVal}</span>
            </div>
          );
        };

        const renderPrintSectionFields = (sectionName: string) => {
          const secFields = printFields.filter((f: PrintTemplateField) => f.section_name === sectionName);
          const secCustomFields = printCustomFields.filter((cf: PrintTemplateCustomField) => (cf.section_name || 'Custom Fields') === sectionName);
          
          const combined = [
            ...secFields.map(f => ({ ...f, isCustom: false as const })),
            ...secCustomFields.map(cf => ({ ...cf, isCustom: true as const }))
          ];

          if (combined.length === 0) return null;

          const rowsMap: Record<number, typeof combined> = {};
          combined.forEach(item => {
            const r = item.row_position ?? 1;
            if (!rowsMap[r]) rowsMap[r] = [];
            rowsMap[r].push(item);
          });

          const sortedRowKeys = Object.keys(rowsMap).map(Number).sort((a, b) => a - b);

          return (
            <div className="w-full space-y-2">
              {sortedRowKeys.map(rowNum => {
                const rowItems = rowsMap[rowNum].sort((a, b) => {
                  const colA = a.column_position ?? 1;
                  const colB = b.column_position ?? 1;
                  if (colA !== colB) return colA - colB;
                  return a.display_order - b.display_order;
                });

                return (
                  <div key={rowNum} className="grid grid-cols-12 gap-x-4 gap-y-2 w-full items-start">
                    {rowItems.map(item => {
                      let defaultWidth = 100;
                      if (sectionName === 'Business Partner Information') defaultWidth = 50;
                      else if (sectionName === 'Invoice Information') defaultWidth = 33;
                      else if (sectionName === 'Totals') defaultWidth = 100;

                      const widthPercent = sectionName === 'Totals' ? 100 : (item.width_percent || defaultWidth);
                      const isFullBlock = ['Company Logo', 'Item Table', 'Remarks', 'Terms & Conditions', 'FBR Logo', 'Notes'].includes(item.field_name);
                      
                      let colSpan = 'col-span-12';
                      if (!isFullBlock) {
                        if (widthPercent <= 25) colSpan = 'col-span-3';
                        else if (widthPercent <= 33) colSpan = 'col-span-4';
                        else if (widthPercent <= 50) colSpan = 'col-span-6';
                        else colSpan = 'col-span-12';
                      }

                      const fieldElement = renderPrintFieldContent(item, sectionName);
                      const isVisible = item.is_visible && fieldElement !== null;

                      return (
                        <div
                          key={item.isCustom ? item.custom_field_id : item.field_id}
                          className={colSpan}
                          style={{
                            paddingLeft: '2px',
                            paddingRight: '2px',
                            visibility: isVisible ? undefined : 'hidden',
                            marginLeft: (item.column_position === 3 || item.field_name === 'Signature') ? 'auto' : undefined,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              width: '100%',
                              justifyContent: item.alignment === 'center' ? 'center' : item.alignment === 'right' ? 'flex-end' : 'flex-start',
                              fontSize: item.font_size ? `${item.font_size}px` : undefined,
                              textAlign: item.alignment || (sectionName === 'Totals' ? 'right' : 'left'),
                              fontWeight: item.is_bold ? 'bold' : 'normal',
                              color: item.color,
                              backgroundColor: item.background || 'transparent',
                              borderLeft: item.border === 'bottom-light' || item.border === 'bottom-slate' || item.border === 'bottom-black' ? 'none' : item.border || 'none',
                              borderRight: item.border === 'bottom-light' || item.border === 'bottom-slate' || item.border === 'bottom-black' ? 'none' : item.border || 'none',
                              borderTop: item.border === 'bottom-light' || item.border === 'bottom-slate' || item.border === 'bottom-black' ? 'none' : item.border || 'none',
                              borderBottom: item.border === 'bottom-light' ? '1px solid #cbd5e1' : item.border === 'bottom-slate' ? '1px solid #475569' : item.border === 'bottom-black' ? '1px solid #000000' : item.border || 'none',
                              padding: item.padding || '0px',
                              marginBottom: item.margin_bottom ? `${item.margin_bottom}px` : undefined,
                            }}
                          >
                            {fieldElement || <div style={{ height: '1em' }} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        };

        return (
          <>
            <style dangerouslySetInnerHTML={{
              __html: `
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-invoice-container, #printable-invoice-container * {
                  visibility: visible !important;
                }
                #printable-invoice-container {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: ${printTemplate?.paper_size === 'Thermal' ? '80mm' : '100%'} !important;
                  max-width: ${printTemplate?.paper_size === 'Thermal' ? '80mm' : 'none'} !important;
                  background: white !important;
                  color: black !important;
                  padding: ${printTemplate?.paper_size === 'Thermal' ? '5mm' : '15mm'} !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                  border: none !important;
                }
                @page {
                  size: ${pageSizeRule};
                  margin: ${printTemplate?.paper_size === 'Thermal' ? '0' : '10mm'};
                }
              }
              @media screen {
                #printable-invoice-container {
                  display: none !important;
                }
              }
            `}} />

            <div
              id="printable-invoice-container"
              style={{
                position: 'relative',
                width: paperWidth,
                height: printTemplate?.paper_size === 'Thermal' ? 'auto' : (printTemplate?.layout_mode === 'free' ? paperHeight : undefined),
                minHeight: printTemplate?.paper_size === 'Thermal' ? 'auto' : paperHeight,
                background: 'white',
                color: '#1e293b',
                margin: '0 auto',
                boxSizing: 'border-box',
                fontFamily: 'Inter, system-ui, sans-serif',
                overflow: printTemplate?.layout_mode === 'free' ? 'hidden' : undefined,
              }}
              className={printTemplate?.layout_mode === 'free' ? "font-sans text-slate-800" : "flex flex-col justify-between font-sans text-slate-800"}
            >
              {/* Watermark */}
              {printTemplate?.watermark_enabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none z-0">
                  <span className="text-5xl font-black rotate-45 border-4 border-slate-900 px-6 py-2 uppercase tracking-widest text-slate-900">
                    Watermark
                  </span>
                </div>
              )}

              {printTemplate?.layout_mode === 'free' ? (
                <div className="absolute inset-0" style={{ width: '100%', height: '100%' }}>
                  {printFields
                    .filter((f: PrintTemplateField) => f.is_visible)
                    .map((f: PrintTemplateField) => {
                      let elementContent = null;
                      
                      if (f.field_name === 'Company Logo') {
                        elementContent = printTemplate.logo_url ? (
                          <img
                            src={printTemplate.logo_url}
                            alt="Logo"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        ) : null;
                      } else if (f.field_name === 'Item Table') {
                        const visibleCols = printColumns.filter((c: PrintTemplateColumn) => c.is_visible);
                        const isNumericColumn = (name: string) => {
                          return ['Quantity', 'Qty', 'Rate', 'Unit Price', 'Discount', 'Tax', 'Amount'].includes(name);
                        };
                        elementContent = (
                          <div className="border rounded bg-white overflow-hidden w-full h-full text-[9px] flex flex-col justify-between">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b text-[8px] font-bold text-slate-500">
                                  {visibleCols.map((col: PrintTemplateColumn) => {
                                    const alignVal = col.alignment || (isNumericColumn(col.column_name) ? 'right' : 'left');
                                    return (
                                      <th key={col.column_id} className="py-1 px-1.5 font-black text-slate-700" style={{ width: col.width, textAlign: alignVal }}>
                                        {col.custom_label || col.column_name}
                                      </th>
                                    );
                                  })}
                                </tr>
                              </thead>
                              <tbody>
                                {printInvoiceFullData ? (
                                  printInvoiceFullData.items.map((item, idx) => {
                                    const itemTotal = (item.quantity * item.price) - item.discount + item.tax + (item.furtherTax || 0);
                                    return (
                                      <tr key={item.id || idx} className="text-[8px] border-b text-slate-650 last:border-b-0">
                                        {visibleCols.map((col: PrintTemplateColumn) => {
                                          let val = '-';
                                          const alignVal = col.alignment || (isNumericColumn(col.column_name) ? 'right' : 'left');
                                          
                                          if (col.column_name === 'Sr No') val = (idx + 1).toString();
                                          else if (col.column_name === 'Product Code') val = item.productCode || '';
                                          else if (col.column_name === 'Product Name') val = 'Product/Service';
                                          else if (col.column_name === 'Description') val = item.description || '';
                                          else if (col.column_name === 'Batch No') val = '-';
                                          else if (col.column_name === 'Serial No') val = '-';
                                          else if (col.column_name === 'Warehouse') val = '-';
                                          else if (col.column_name === 'Unit') val = item.unit || 'Unit';
                                          else if (col.column_name === 'Quantity' || col.column_name === 'Qty') {
                                            val = item.quantity.toLocaleString(undefined, { minimumFractionDigits: 2 });
                                          }
                                          else if (col.column_name === 'Rate' || col.column_name === 'Unit Price') {
                                            val = item.price.toLocaleString(undefined, { minimumFractionDigits: 2 });
                                          }
                                          else if (col.column_name === 'Discount') {
                                            val = item.discount.toLocaleString(undefined, { minimumFractionDigits: 2 });
                                          }
                                          else if (col.column_name === 'Tax') {
                                            val = item.tax.toLocaleString(undefined, { minimumFractionDigits: 2 });
                                          }
                                          else if (col.column_name === 'Amount') {
                                            val = itemTotal.toLocaleString(undefined, { minimumFractionDigits: 2 });
                                          }
                                          
                                          return (
                                            <td key={col.column_id} className="py-1 px-1.5" style={{ textAlign: alignVal }}>
                                              {val}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr className="text-[8px] border-b text-slate-650 last:border-b-0">
                                    {visibleCols.map((col: PrintTemplateColumn) => {
                                      let val = '-';
                                      const alignVal = col.alignment || (isNumericColumn(col.column_name) ? 'right' : 'left');
                                      const rawStr = printInvoiceData?.amount?.replace(/^(Rs\.|PKR|\$)\s*/i, '').replace(/,/g, '') || '0';
                                      const netPayable = parseFloat(rawStr) || 0;
                                      
                                      if (col.column_name === 'Sr No') val = '1';
                                      else if (col.column_name === 'Product Code') val = 'BC-001';
                                      else if (col.column_name === 'Product Name') val = 'Services';
                                      else if (col.column_name === 'Description') val = `${printInvoiceData?.type || 'Standard'} Services & Deliverables`;
                                      else if (col.column_name === 'Quantity' || col.column_name === 'Qty') val = '1.00';
                                      else if (col.column_name === 'Rate' || col.column_name === 'Unit Price') val = netPayable.toLocaleString(undefined, { minimumFractionDigits: 2 });
                                      else if (col.column_name === 'Amount') val = netPayable.toLocaleString(undefined, { minimumFractionDigits: 2 });
                                      
                                      return (
                                        <td key={col.column_id} className="py-1 px-1.5" style={{ textAlign: alignVal }}>
                                          {val}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        );
                      } else if (f.field_name === 'QR Code') {
                        elementContent = printTemplate.qr_enabled ? (
                          <div className="w-10 h-10 border p-0.5 rounded bg-white flex items-center justify-center">
                            <svg className="w-full h-full text-slate-800" viewBox="0 0 24 24">
                              <path fill="currentColor" d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-2 2h2v2h-2v-2zm2 2h3v3h-3v-3zm-2 2h2v2h-2v-2zm4-4h2v4h-2v-4zm0 6h2v1h-2v-1z" />
                            </svg>
                          </div>
                        ) : null;
                      } else if (f.field_name === 'Barcode') {
                        elementContent = printTemplate.barcode_enabled ? (
                          <svg className="h-6 w-full text-slate-800" viewBox="0 0 100 20" preserveAspectRatio="none">
                            <rect width="100" height="20" fill="white"/>
                            <rect x="5" y="2" width="2" height="16" fill="currentColor"/>
                            <rect x="10" y="2" width="4" height="16" fill="currentColor"/>
                            <rect x="16" y="2" width="1" height="16" fill="currentColor"/>
                            <rect x="20" y="2" width="3" height="16" fill="currentColor"/>
                            <rect x="25" y="2" width="5" height="16" fill="currentColor"/>
                            <rect x="32" y="2" width="2" height="16" fill="currentColor"/>
                            <rect x="36" y="2" width="1" height="16" fill="currentColor"/>
                            <rect x="40" y="2" width="4" height="16" fill="currentColor"/>
                            <rect x="48" y="2" width="2" height="16" fill="currentColor"/>
                            <rect x="52" y="2" width="3" height="16" fill="currentColor"/>
                            <rect x="58" y="2" width="5" height="16" fill="currentColor"/>
                          </svg>
                        ) : null;
                      } else if (f.field_name === 'Signature') {
                        elementContent = printTemplate.signature_enabled ? (
                          <div className="w-full text-center">
                            <div className="border-b border-slate-300 w-full h-3" />
                            <span className="text-[8px] text-slate-400 block mt-0.5">{f.custom_label || 'Seller Signature'}</span>
                          </div>
                        ) : null;
                      } else if (f.field_name === 'FBR Logo') {
                        elementContent = (
                          <div className="flex items-center gap-1 bg-emerald-50/70 border border-emerald-200 rounded px-1.5 py-0.5 text-[8px] font-bold text-emerald-800">
                            <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                              <path d="M2 12h20" />
                            </svg>
                            <div className="flex flex-col text-left leading-[1.1]">
                              <span>FBR</span>
                              <span className="text-[5px] text-emerald-500 font-medium font-sans">Pakistan</span>
                            </div>
                          </div>
                        );
                      } else if (f.field_name === 'Company Stamp') {
                        elementContent = (
                          <div className="w-18 h-9 border border-dashed border-slate-355 rounded-full flex flex-col items-center justify-center opacity-65 select-none bg-slate-50/50">
                            <span className="text-[5px] font-bold text-slate-455">Company Stamp</span>
                            <span className="text-[4px] text-slate-355">Seal Here</span>
                          </div>
                        );
                      } else if (f.field_name === 'Notes') {
                        const notesValue = printInvoiceFullData?.notes || 'Goods once sold are non-refundable. Tax paid has been deposited with FBR.';
                        elementContent = (
                          <div className="w-full">
                            <strong className="text-slate-400 mr-1" style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal' }}>{f.custom_label || f.field_name}: </strong>
                            <span className="text-slate-700" style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal', whiteSpace: 'pre-wrap' }}>{notesValue}</span>
                          </div>
                        );
                      } else if (['Subtotal', 'Grand Total', 'Balance Due', 'Tax Amount', 'Discount Amount', 'Shipping Charges', 'Round Off', 'Received Amount'].includes(f.field_name)) {
                        let valAmount = '0.00';
                        let subtotalVal = 0;
                        let grandTotalVal = 0;
                        let taxRate = 0;
                        let taxVal = 0;
                        let discountVal = 0;
                        let shippingCharges = 0;
                        let roundOff = 0;
                        let receivedVal = 0;

                        if (printInvoiceFullData) {
                          subtotalVal = printInvoiceFullData.items.reduce((sum, item) => sum + (item.quantity * item.price) - item.discount + item.tax + (item.furtherTax || 0), 0);
                          taxRate = printInvoiceFullData.taxRate || 0;
                          taxVal = (subtotalVal * taxRate) / 100;
                          discountVal = printInvoiceFullData.discountAmount || (subtotalVal * (printInvoiceFullData.discountPercentage || 0)) / 100;
                          shippingCharges = printInvoiceFullData.shippingCharges || 0;
                          roundOff = printInvoiceFullData.roundOff || 0;
                          grandTotalVal = subtotalVal + taxVal - discountVal + shippingCharges + roundOff;
                          receivedVal = printInvoiceFullData.receivedAmount || 0;
                        } else {
                          const rawStr = printInvoiceData?.amount?.replace(/^(Rs\.|PKR|\$)\s*/i, '').replace(/,/g, '') || '0';
                          grandTotalVal = parseFloat(rawStr) || 0;
                          subtotalVal = grandTotalVal;
                        }

                        if (f.field_name === 'Subtotal') valAmount = subtotalVal.toLocaleString(undefined, { minimumFractionDigits: 2 });
                        else if (f.field_name === 'Grand Total') valAmount = grandTotalVal.toLocaleString(undefined, { minimumFractionDigits: 2 });
                        else if (f.field_name === 'Balance Due') valAmount = (grandTotalVal - receivedVal).toLocaleString(undefined, { minimumFractionDigits: 2 });
                        else if (f.field_name === 'Tax Amount') valAmount = taxVal.toLocaleString(undefined, { minimumFractionDigits: 2 });
                        else if (f.field_name === 'Discount Amount') valAmount = discountVal.toLocaleString(undefined, { minimumFractionDigits: 2 });
                        else if (f.field_name === 'Shipping Charges') valAmount = shippingCharges.toLocaleString(undefined, { minimumFractionDigits: 2 });
                        else if (f.field_name === 'Round Off') valAmount = roundOff.toLocaleString(undefined, { minimumFractionDigits: 2 });
                        else if (f.field_name === 'Received Amount') valAmount = receivedVal.toLocaleString(undefined, { minimumFractionDigits: 2 });

                        elementContent = (
                          <div className="grid grid-cols-12 w-full items-center gap-x-2">
                            <div className="col-span-7 text-left">
                              <span className="text-slate-400 font-bold" style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal' }}>{f.custom_label || f.field_name}:</span>
                            </div>
                            <div className="col-span-2 text-center text-slate-400 font-bold" style={{ color: f.color || undefined }}>
                              Rs.
                            </div>
                            <div className="col-span-3 text-right">
                              <span className="font-extrabold" style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal' }}>{valAmount}</span>
                            </div>
                          </div>
                        );
                      } else {
                        // Standard field sample/real value
                        const actualVal = 
                          f.field_name === 'Company Name' ? companyDetails.name :
                          f.field_name === 'Company Address' ? companyDetails.address :
                          f.field_name === 'Phone' ? companyDetails.phone :
                          f.field_name === 'Email' ? companyDetails.email :
                          f.field_name === 'Website' ? companyDetails.website :
                          f.field_name === 'NTN' ? companyDetails.ntn :
                          f.field_name === 'STRN' || f.field_name === 'STN' || f.field_name === 'STN / STRN' ? companyDetails.strn :
                          f.field_name === 'Customer Name' ? (printInvoiceData?.customer || '') :
                          f.field_name === 'Customer Address' ? (customerDetails?.address || '') :
                          f.field_name === 'Mobile' ? (customerDetails?.phone || '') :
                          f.field_name === 'Customer NTN' ? (customerDetails?.ntn || '') :
                          f.field_name === 'Customer STRN' ? (customerDetails?.strn || '') :
                          f.field_name === 'Customer CNIC' ? (customerDetails?.cnic || '') :
                          f.field_name === 'Customer Code' ? (customerDetails?.code || '') :
                          f.field_name === 'Customer Email' ? customerDetails?.email || '' :
                          f.field_name === 'Invoice Number' ? (printInvoiceData?.id || '') :
                          f.field_name === 'Date' || f.field_name === 'Invoice Date' ? (printInvoiceData?.issueDate || '') :
                          f.field_name === 'Due Date' ? (printInvoiceData?.dueDate || '') :
                          f.field_name === 'Sales Person' ? salesPersonName :
                          f.field_name === 'Reference Number' ? (printInvoiceData as any)?.referenceNumber || '' :
                          f.field_name === 'Warehouse' ? (printInvoiceData as any)?.warehouse || 'Main Warehouse' :
                          f.field_name === 'FBR Invoice Number' ? (printInvoiceData?.status === 'Posted' ? ((printInvoiceData as any)?.fbrInvoiceNumber || ('FBR-INV-' + (printInvoiceData?.id || '1092837'))) : '') :
                          f.field_name === 'Payment Terms' ? (printInvoiceData?.payment || (printInvoiceFullData as any)?.paymentTerms || 'Net 30') :
                          f.field_name === 'Prepared By' ? (printInvoiceFullData as any)?.preparedBy || 'Prepared By User' :
                          f.field_name === 'Received By' ? (printInvoiceFullData as any)?.receivedBy || 'Received By Client' :
                          f.field_name === 'Remarks' ? ((printInvoiceFullData as any)?.remarks || '') :
                          f.field_name === 'Terms & Conditions' ? 'Payment is due within 30 days.' : '';

                        if (f.field_name === 'Remarks' && !printTemplate?.remarks_enabled) return null;
                        if (f.field_name === 'Terms & Conditions' && !printTemplate?.terms_enabled) return null;
                        if (!actualVal && f.field_name !== 'Remarks' && f.field_name !== 'Terms & Conditions') return null;

                        let displayLabel = f.custom_label || f.field_name;
                        if (displayLabel === 'Customer Name' || displayLabel === 'Supplier Name') displayLabel = 'Business Partner Name';
                        else if (displayLabel === 'Customer Address' || displayLabel === 'Supplier Address') displayLabel = 'Business Partner Address';
                        else if (displayLabel === 'Customer NTN' || displayLabel === 'Supplier NTN') displayLabel = 'Business Partner NTN';
                        else if (displayLabel === 'Customer STRN' || displayLabel === 'Supplier STRN') displayLabel = 'Business Partner STRN';
                        else if (displayLabel === 'Customer CNIC' || displayLabel === 'Supplier CNIC') displayLabel = 'Business Partner CNIC';
                        else if (displayLabel === 'Customer Code' || displayLabel === 'Supplier Code') displayLabel = 'Business Partner Code';
                        else if (displayLabel === 'Customer Email' || displayLabel === 'Supplier Email') displayLabel = 'Business Partner Email';

                        if (['Purchase Invoice', 'Purchase Return'].includes(printInvoiceData?.type || '')) {
                          if (displayLabel === 'Invoice Number') displayLabel = 'Purchase Number';
                          else if (displayLabel === 'Invoice Date') displayLabel = 'Purchase Date';
                          else if (displayLabel === 'FBR Invoice Number') displayLabel = 'FBR Number';
                        }

                        elementContent = (
                          <div className="w-full">
                            <strong className="text-slate-400 mr-1" style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal' }}>{displayLabel}: </strong>
                            <span className="text-slate-700" style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal' }}>{actualVal}</span>
                          </div>
                        );
                      }

                      if (!elementContent) return null;

                      return (
                        <div
                          key={f.field_id}
                          style={{
                            position: 'absolute',
                            left: `${f.position_x ?? 5}%`,
                            top: `${f.position_y ?? 5}%`,
                            width: f.width_percent ? `${f.width_percent}%` : 'auto',
                            height: f.height_px ? `${f.height_px}px` : 'auto',
                            fontSize: f.font_size ? `${f.font_size}px` : '10px',
                            fontWeight: f.font_weight === 'bold' || f.is_bold ? 'bold' : f.font_weight === 'semibold' ? '600' : 'normal',
                            color: f.color || '#1e293b',
                            background: f.background || 'transparent',
                            border: f.border || 'none',
                            padding: f.padding || '0px',
                            marginTop: f.margin_top ? `${f.margin_top}px` : undefined,
                            marginBottom: f.margin_bottom ? `${f.margin_bottom}px` : undefined,
                            textAlign: f.alignment || 'left',
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: f.alignment === 'center' ? 'center' : f.alignment === 'right' ? 'flex-end' : 'flex-start',
                            ...parseCustomCss(f.custom_css)
                          }}
                        >
                          {elementContent}
                        </div>
                      );
                    })}

                  {/* Custom fields */}
                  {printCustomFields
                    .filter((cf: PrintTemplateCustomField) => cf.is_visible)
                    .map((cf: PrintTemplateCustomField) => {
                      let customVal = cf.default_value;
                      if (printInvoiceFullData && (printInvoiceFullData as any).customFields) {
                        const matched = (printInvoiceFullData as any).customFields.find((x: any) => x.name === cf.field_name || x.id === cf.custom_field_id);
                        if (matched) customVal = matched.value;
                      }

                      return (
                        <div
                          key={cf.custom_field_id}
                          style={{
                            position: 'absolute',
                            left: `${cf.position_x ?? 10}%`,
                            top: `${cf.position_y ?? 60}%`,
                            width: cf.width_percent ? `${cf.width_percent}%` : 'auto',
                            height: cf.height_px ? `${cf.height_px}px` : 'auto',
                            fontSize: cf.font_size ? `${cf.font_size}px` : '10px',
                            fontWeight: cf.font_weight === 'bold' || cf.is_bold ? 'bold' : cf.font_weight === 'semibold' ? '600' : 'normal',
                            color: cf.color || '#1e293b',
                            background: cf.background || 'transparent',
                            border: cf.border || 'none',
                            padding: cf.padding || '0px',
                            marginTop: cf.margin_top ? `${cf.margin_top}px` : undefined,
                            marginBottom: cf.margin_bottom ? `${cf.margin_bottom}px` : undefined,
                            textAlign: cf.alignment || 'left',
                            boxSizing: 'border-box',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: cf.alignment === 'center' ? 'center' : cf.alignment === 'right' ? 'flex-end' : 'flex-start',
                            ...parseCustomCss(cf.custom_css)
                          }}
                        >
                          <div className="w-full flex" style={{ justifyContent: cf.alignment === 'center' ? 'center' : cf.alignment === 'right' ? 'flex-end' : 'flex-start' }}>
                            <strong className="text-slate-400 mr-1" style={{ color: cf.color || undefined, fontWeight: cf.is_bold ? 'bold' : 'normal' }}>{cf.field_name}: </strong>
                            <span className="text-slate-700" style={{ color: cf.color || undefined, fontWeight: cf.is_bold ? 'bold' : 'normal' }}>{customVal || ''}</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : printTemplate?.paper_size === 'Thermal' ? (
                  <div className="space-y-4 z-10 flex-grow text-[10px]">
                    {printSections
                      .filter((s: PrintTemplateSection) => s.is_visible)
                      .map((sec: PrintTemplateSection) => {
                        if (sec.section_name === 'Attachments') {
                          const fullData = printInvoiceFullData as any;
                          if (!fullData?.attachments || fullData.attachments.length === 0) return null;
                          return (
                            <div key={sec.section_id} className="space-y-1 py-2 border-b">
                              <span className="text-[9px] font-bold text-slate-400 block">Attachments</span>
                              <div className="flex gap-2 text-[8px] text-blue-500">
                                {fullData.attachments.map((att: any, attIdx: number) => (
                                  <span key={attIdx} className="flex items-center gap-1 border rounded px-1.5 py-0.5 bg-slate-50">
                                    <FileText className="w-2.5 h-2.5 text-slate-400" />
                                    {att.name || 'attachment.pdf'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        const dynamicFields = renderPrintSectionFields(sec.section_name);
                        if (!dynamicFields) return null;

                        return (
                          <div key={sec.section_id} className="w-full">
                            <span className="text-[8px] font-bold text-slate-400 block border-b pb-0.5 mb-1 uppercase tracking-wider">{sec.section_name}</span>
                            {dynamicFields}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  // BEAUTIFUL A4/LETTER SOLID LAYOUT MATCHING USER'S IMAGE
                  <div className="space-y-6 z-10 flex-grow w-full flex flex-col justify-start">
                    <div>
                      {/* 1. Header (Company details & centered Title) */}
                      {printSections.find(s => s.section_name === 'Company Information' && s.is_visible) && (
                        <div className="w-full flex justify-between items-start border-b pb-4 mb-2">
                          <div className="flex-grow">
                            {renderPrintSectionFields('Company Information')}
                          </div>
                        </div>
                      )}

                      {/* Centered Document Title */}
                      <div className="w-full text-center my-3">
                        <h1 className="text-base font-extrabold tracking-wider text-slate-800 uppercase pb-1 border-b-2 border-slate-700 inline-block">
                          {['Purchase Invoice', 'Purchase Return'].includes(printInvoiceData?.type || '')
                            ? printInvoiceData?.type
                            : (printTemplate?.document_type || printInvoiceData?.type || 'Sale Tax Invoice')}
                        </h1>
                      </div>

                      {/* 2. Side-by-Side Information Boxes (Invoice & Customer details) */}
                      <div className="grid grid-cols-2 gap-4 mb-4 items-stretch">
                        {/* Left Column: Stacked Invoice Information Boxes */}
                        {printSections.find(s => s.section_name === 'Invoice Information' && s.is_visible) ? (
                          <div className="flex flex-col space-y-1.5 h-full justify-between">
                            {(() => {
                              const secFields = printFields.filter((f: PrintTemplateField) => f.section_name === 'Invoice Information');
                              const secCustomFields = printCustomFields.filter((cf: PrintTemplateCustomField) => (cf.section_name || 'Custom Fields') === 'Invoice Information');
                              const combined = [
                                ...secFields.map(f => ({ ...f, isCustom: false as const })),
                                ...secCustomFields.map(cf => ({ ...cf, isCustom: true as const }))
                              ].sort((a, b) => a.display_order - b.display_order);

                              return combined.map(item => {
                                let actualVal = '';
                                if (item.isCustom) {
                                  actualVal = item.default_value || '';
                                  if (printInvoiceFullData && (printInvoiceFullData as any).customFields) {
                                    const matched = (printInvoiceFullData as any).customFields.find((x: any) => x.name === item.field_name || x.id === item.custom_field_id);
                                    if (matched) actualVal = matched.value;
                                  }
                                } else {
                                  actualVal = 
                                    item.field_name === 'Invoice Number' ? (printInvoiceData?.id || '') :
                                    item.field_name === 'Date' || item.field_name === 'Invoice Date' ? (printInvoiceData?.issueDate || '') :
                                    item.field_name === 'Due Date' ? (printInvoiceData?.dueDate || '') :
                                    item.field_name === 'Sales Person' ? salesPersonName :
                                    item.field_name === 'Reference Number' ? (printInvoiceData as any)?.referenceNumber || '' :
                                    item.field_name === 'Warehouse' ? (printInvoiceData as any)?.warehouse || 'Main Warehouse' :
                                    item.field_name === 'FBR Invoice Number' ? (printInvoiceData?.status === 'Posted' ? ((printInvoiceData as any)?.fbrInvoiceNumber || ('FBR-INV-' + (printInvoiceData?.id || '1092837'))) : '') :
                                    item.field_name === 'Payment Terms' ? (printInvoiceData?.payment || (printInvoiceFullData as any)?.paymentTerms || 'Net 30') : '';
                                }

                                const labelColor = item.label_color || item.color;
                                const labelBold = item.label_is_bold !== undefined ? item.label_is_bold : item.is_bold;
                                const valueColor = item.value_color || item.color;
                                const valueBold = item.value_is_bold !== undefined ? item.value_is_bold : item.is_bold;

                                const borderVal = item.border === 'bottom-light' ? '1px solid #cbd5e1' :
                                                  item.border === 'bottom-slate' ? '1px solid #475569' :
                                                  item.border === 'bottom-black' ? '1px solid #000000' :
                                                  item.border === 'none' ? 'none' :
                                                  item.border || '1px solid #cbd5e1';

                                const borderStyles = item.border && (item.border.startsWith('bottom-') || item.border === 'none') ? {
                                  borderBottom: item.border === 'none' ? 'none' : borderVal,
                                  borderTop: 'none',
                                  borderLeft: 'none',
                                  borderRight: 'none'
                                } : {
                                  border: borderVal
                                };

                                const isVisible = item.is_visible && !!actualVal;

                                return (
                                  <div 
                                    key={item.isCustom ? item.custom_field_id : item.field_id} 
                                    className="rounded px-3 py-1.5 flex justify-between items-center text-[10px]"
                                    style={{ 
                                      ...borderStyles,
                                      backgroundColor: item.background || '#ffffff',
                                      fontSize: item.font_size ? `${item.font_size}px` : undefined,
                                      padding: item.padding || undefined,
                                      marginBottom: item.margin_bottom ? `${item.margin_bottom}px` : undefined,
                                      visibility: isVisible ? undefined : 'hidden',
                                    }}
                                  >
                                    <strong className="text-slate-500 mr-2" style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}>{item.custom_label || item.field_name}:</strong>
                                    <span className="text-slate-800" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{actualVal}</span>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        ) : <div />}

                        {printSections.find(s => s.section_name === 'Business Partner Information' && s.is_visible) ? (
                          <div 
                            className="rounded p-3 flex flex-col justify-start text-[10px]"
                            style={{ 
                              border: '1px solid #cbd5e1', 
                              backgroundColor: '#ffffff', 
                              color: '#1e293b',
                              minHeight: '100%' 
                            }}
                          >
                            <div className="font-extrabold border-b border-slate-300 pb-1 mb-2 text-slate-800 uppercase tracking-wider text-left">
                              Business Partner Details
                            </div>
                            <div className="space-y-1.5">
                              {(() => {
                                const secFields = printFields.filter((f: PrintTemplateField) => f.section_name === 'Business Partner Information');
                                const secCustomFields = printCustomFields.filter((cf: PrintTemplateCustomField) => (cf.section_name || 'Custom Fields') === 'Business Partner Information');
                                const combined = [
                                  ...secFields.map(f => ({ ...f, isCustom: false as const })),
                                  ...secCustomFields.map(cf => ({ ...cf, isCustom: true as const }))
                                ].sort((a, b) => a.display_order - b.display_order);

                                return combined.map(item => {
                                  let actualVal = '';
                                  if (item.isCustom) {
                                    actualVal = item.default_value || '';
                                    if (printInvoiceFullData && (printInvoiceFullData as any).customFields) {
                                      const matched = (printInvoiceFullData as any).customFields.find((x: any) => x.name === item.field_name || x.id === item.custom_field_id);
                                      if (matched) actualVal = matched.value;
                                    }
                                  } else {
                                    actualVal = 
                                      item.field_name === 'Customer Name' ? (printInvoiceData?.customer || '') :
                                      item.field_name === 'Customer Address' ? (customerDetails?.address || '') :
                                      item.field_name === 'Mobile' ? (customerDetails?.phone || '') :
                                      item.field_name === 'Customer NTN' ? (customerDetails?.ntn || '') :
                                      item.field_name === 'Customer STRN' ? (customerDetails?.strn || '') :
                                      item.field_name === 'Customer CNIC' ? (customerDetails?.cnic || '') :
                                      item.field_name === 'Customer Code' ? (customerDetails?.code || '') :
                                      item.field_name === 'Customer Email' ? customerDetails?.email || '' : '';
                                  }

                                  const labelColor = item.label_color || item.color;
                                  const labelBold = item.label_is_bold !== undefined ? item.label_is_bold : item.is_bold;
                                  const valueColor = item.value_color || item.color;
                                  const valueBold = item.value_is_bold !== undefined ? item.value_is_bold : item.is_bold;

                                  const borderVal = item.border === 'bottom-light' ? '1px solid #cbd5e1' :
                                                    item.border === 'bottom-slate' ? '1px solid #475569' :
                                                    item.border === 'bottom-black' ? '1px solid #000000' :
                                                    item.border === 'none' ? 'none' :
                                                    item.border || '1px solid #f1f5f9';

                                  const borderStyles = item.border && (item.border.startsWith('bottom-') || item.border === 'none') ? {
                                    borderBottom: item.border === 'none' ? 'none' : borderVal,
                                    borderTop: 'none',
                                    borderLeft: 'none',
                                    borderRight: 'none'
                                  } : {
                                    borderBottom: borderVal
                                  };

                                  const isVisible = item.is_visible && !!actualVal;

                                  return (
                                    <div 
                                      key={item.isCustom ? item.custom_field_id : item.field_id} 
                                      className="flex justify-between items-start pb-1.5 last:border-0 last:pb-0"
                                      style={{
                                        ...borderStyles,
                                        fontSize: item.font_size ? `${item.font_size}px` : undefined,
                                        padding: item.padding || undefined,
                                        marginBottom: item.margin_bottom ? `${item.margin_bottom}px` : undefined,
                                        visibility: isVisible ? undefined : 'hidden',
                                      }}
                                    >
                                      <strong className="text-slate-500 mr-2 shrink-0" style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}>
                                        {(() => {
                                          let dl = item.custom_label || item.field_name;
                                          if (dl === 'Customer Name' || dl === 'Supplier Name') return 'Business Partner Name';
                                          if (dl === 'Customer Address' || dl === 'Supplier Address') return 'Business Partner Address';
                                          if (dl === 'Customer NTN' || dl === 'Supplier NTN') return 'Business Partner NTN';
                                          if (dl === 'Customer STRN' || dl === 'Supplier STRN') return 'Business Partner STRN';
                                          if (dl === 'Customer CNIC' || dl === 'Supplier CNIC') return 'Business Partner CNIC';
                                          if (dl === 'Customer Code' || dl === 'Supplier Code') return 'Business Partner Code';
                                          if (dl === 'Customer Email' || dl === 'Supplier Email') return 'Business Partner Email';
                                          return dl;
                                        })()}:
                                      </strong>
                                      <span className="text-slate-800 text-right break-words max-w-[65%]" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{actualVal}</span>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        ) : <div />}
                      </div>

                      {printSections.find(s => s.section_name === 'Product Table' && s.is_visible) && (
                        <div className="w-full my-4">
                          {renderPrintSectionFields('Product Table')}
                        </div>
                      )}

                      {/* Attachments if any */}
                      {(() => {
                        const fullData = printInvoiceFullData as any;
                        if (!fullData?.attachments || fullData.attachments.length === 0) return null;
                        return (
                          <div className="space-y-1 py-2 border-b w-full">
                            <span className="text-[9px] font-bold text-slate-400 block">Attachments</span>
                            <div className="flex gap-2 text-[8px] text-blue-500">
                              {fullData.attachments.map((att: any, attIdx: number) => (
                                <span key={attIdx} className="flex items-center gap-1 border rounded px-1.5 py-0.5 bg-slate-50">
                                  <FileText className="w-2.5 h-2.5 text-slate-400" />
                                  {att.name || 'attachment.pdf'}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* 4. Footer Section (Side-by-Side Note & Totals Box) */}
                    <div className="grid grid-cols-12 gap-6 items-end w-full pt-4 border-t">
                      {/* Left: Notes, Remarks, Signatures */}
                      <div className="col-span-7 space-y-4">
                        {printSections.find(s => s.section_name === 'Footer' && s.is_visible) && (
                          <div className="space-y-3">
                            {renderPrintSectionFields('Footer')}
                          </div>
                        )}
                      </div>

                      {/* Right: Bordered Totals Box */}
                      {printSections.find(s => s.section_name === 'Totals' && s.is_visible) && (
                        <div className="col-span-5 border border-slate-300 rounded p-3 bg-slate-50/50 text-[10px]">
                          <div className="font-bold border-b pb-1 mb-2 text-slate-700 uppercase tracking-wider text-right">Summary</div>
                          <div className="space-y-1.5 flex flex-col items-end w-full">
                            {renderPrintSectionFields('Totals')}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </>
        );
      })()}
    </Suspense>
  );
}

export default App;
