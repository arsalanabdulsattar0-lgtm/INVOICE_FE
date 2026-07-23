import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ComboBox } from '../../components/ui/ComboBox';
import { useTheme } from '../../context/ThemeContext';
import { 
  UserCheck, 
  Printer, 
  RefreshCw, 
  Phone, 
  Smartphone, 
  User, 
  MapPin, 
  CreditCard,
  Building2,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  PlusCircle,
  Users
} from 'lucide-react';

interface BPDashboardProps {
  onViewChange?: (view: string) => void;
}

interface CustomerProfile {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  mobile1: string;
  mobile2: string;
  phone1: string;
  phone2: string;
  address: string;
  balance: number;
  balanceType: 'Dr' | 'Cr';
  currentMonthPayment: number;
  currentMonthSales: number;
  isOldProfile: boolean;
  creditLimit?: number;
}

const defaultCustomers: CustomerProfile[] = [
  {
    id: '0005 BK',
    code: '0005 BK',
    name: 'Aga Karyna Store Khanewal',
    contactPerson: 'Aga Karyna Store',
    mobile1: '0300-1234567',
    mobile2: '0321-9876543',
    phone1: '065-2551234',
    phone2: '065-2555678',
    address: 'Khanewal Road, Multan',
    balance: 80000.00,
    balanceType: 'Dr',
    currentMonthPayment: 0,
    currentMonthSales: 0,
    isOldProfile: true,
    creditLimit: 500000
  },
  {
    id: '0001 AC',
    code: '0001 AC',
    name: 'Al-Madina Traders',
    contactPerson: 'Muhammad Madni',
    mobile1: '0301-4455667',
    mobile2: '',
    phone1: '042-37889900',
    phone2: '',
    address: 'Circular Road, Lahore',
    balance: 45200.00,
    balanceType: 'Dr',
    currentMonthPayment: 15000,
    currentMonthSales: 60200,
    isOldProfile: false,
    creditLimit: 250000
  },
  {
    id: '0002 MT',
    code: '0002 MT',
    name: 'Metro Cash & Carry',
    contactPerson: 'Tariq Mahmood',
    mobile1: '0333-8899001',
    mobile2: '0312-5566778',
    phone1: '051-4455667',
    phone2: '',
    address: 'I-9 Industrial Area, Islamabad',
    balance: 12500.00,
    balanceType: 'Cr',
    currentMonthPayment: 50000,
    currentMonthSales: 37500,
    isOldProfile: false,
    creditLimit: 1000000
  }
];

const initialMockProducts = [
  {
    id: 'P1',
    productName: 'CASES 3" ( CTN 50 ROLL )',
    details: '2@3400',
    old: 2,
    june: 2,
    may: 0,
    april: 1,
    march: 0,
    february: 0
  },
  {
    id: 'P2',
    productName: 'CASES 4" ( CTN 30ROLL )',
    details: '1@3200',
    old: 1,
    june: 1,
    may: 0,
    april: 0,
    march: 1,
    february: 0
  },
  {
    id: 'P3',
    productName: 'CHOCOLATE SLAB BROWN G.P',
    details: '20@1200',
    old: 20,
    june: 20,
    may: 5,
    april: 10,
    march: 5,
    february: 0
  },
  {
    id: 'P4',
    productName: 'CONDENSED MILK POLAC 390G',
    details: '96@250',
    old: 96,
    june: 96,
    may: 48,
    april: 48,
    march: 24,
    february: 12
  },
  {
    id: 'P5',
    productName: 'GLASE CHERRY RED LOCAL ( 10 KG BUCKET )',
    details: '20@1100',
    old: 20,
    june: 20,
    may: 10,
    april: 5,
    march: 5,
    february: 0
  }
];

export const BPDashboard: React.FC<BPDashboardProps> = ({ onViewChange }) => {
  const { brand } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('0005 BK');
  const [isOldProfileFilter, setIsOldProfileFilter] = useState<boolean>(true);
  const [customers, setCustomers] = useState<CustomerProfile[]>(defaultCustomers);

  // Load customer records from localStorage
  const loadData = () => {
    setIsRefreshing(true);
    try {
      const stored = localStorage.getItem('customer_records');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted: CustomerProfile[] = parsed.map((c: any, idx: number) => ({
            id: c.code || c.id || `BP-00${idx+1}`,
            code: c.code || `000${idx+1} BK`,
            name: c.name || c.companyName || 'Business Partner',
            contactPerson: c.contactPerson || c.name || '-',
            mobile1: c.phone || c.mobile || '-',
            mobile2: c.mobile2 || '-',
            phone1: c.phone1 || '-',
            phone2: c.phone2 || '-',
            address: c.address || '-',
            balance: typeof c.balance === 'number' ? c.balance : 80000.00,
            balanceType: (c.balanceType || 'Dr') as 'Dr' | 'Cr',
            currentMonthPayment: c.currentMonthPayment || 0,
            currentMonthSales: c.currentMonthSales || 0,
            isOldProfile: c.isOldProfile !== undefined ? c.isOldProfile : true,
            creditLimit: c.creditLimit || 500000
          }));

          // Merge default test customer if not present
          if (!formatted.some(f => f.code === '0005 BK' || f.id === '0005 BK')) {
            formatted.unshift(defaultCustomers[0]);
          }
          setCustomers(formatted);
        }
      } else {
        setCustomers(defaultCustomers);
      }
    } catch {
      setCustomers(defaultCustomers);
    }
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId || c.code === selectedCustomerId) || customers[0];
  }, [customers, selectedCustomerId]);

  const customerOptions = useMemo(() => {
    return customers.map(c => ({
      id: c.id,
      name: `${c.code} - ${c.name}`,
      subtitle: c.address
    }));
  }, [customers]);

  // Dynamic calculations based on customer and filter state
  const computedMetrics = useMemo(() => {
    const multiplier = isOldProfileFilter ? 1 : 0.85;
    return {
      balance: activeCustomer.balance * multiplier,
      balanceType: activeCustomer.balanceType,
      currentMonthPayment: activeCustomer.currentMonthPayment,
      currentMonthSales: activeCustomer.currentMonthSales
    };
  }, [activeCustomer, isOldProfileFilter]);

  const financialMatrix = useMemo(() => {
    const isDefault = activeCustomer.code === '0005 BK' || activeCustomer.id === '0005 BK';
    return {
      receipt: {
        old: isDefault ? (isOldProfileFilter ? 105700 : 85000) : Math.round(activeCustomer.balance * 1.2),
        may: isDefault ? 0 : 12000,
        april: isDefault ? 0 : 15000,
        march: isDefault ? 0 : 8000,
        february: isDefault ? 0 : 5000
      },
      sales: {
        old: isDefault ? (isOldProfileFilter ? 80000 : 65000) : Math.round(activeCustomer.balance),
        may: isDefault ? 0 : 18000,
        april: isDefault ? 0 : 22000,
        march: isDefault ? 0 : 14000,
        february: isDefault ? 0 : 9000
      }
    };
  }, [activeCustomer, isOldProfileFilter]);

  const productPurchases = useMemo(() => {
    if (activeCustomer.code === '0005 BK' || activeCustomer.id === '0005 BK') {
      return initialMockProducts;
    }
    return [
      {
        id: 'P101',
        productName: 'INDUSTRIAL RETAIL TAPE (50M)',
        details: '5@1500',
        old: 5,
        june: 5,
        may: 2,
        april: 3,
        march: 0,
        february: 0
      },
      {
        id: 'P102',
        productName: 'PACKAGING BOX LARGE (CTN 100)',
        details: '10@4500',
        old: 10,
        june: 10,
        may: 4,
        april: 6,
        march: 2,
        february: 1
      }
    ];
  }, [activeCustomer]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto custom-scrollbar">
      
      {/* ─── PAGE HEADER & CONTROLS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bp-dashboard-header">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Customer Profile / Dashboard</h1>
              <p className="text-xs text-slate-500 font-medium">Business Partner Sales & Receipt Matrix Overview</p>
            </div>
          </div>
        </div>

        {/* FULLY FUNCTIONAL ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onViewChange && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1.5 text-xs font-semibold"
                onClick={() => onViewChange('bp-ledger')}
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                View Ledger
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1.5 text-xs font-semibold"
                onClick={() => onViewChange('add-sale-invoice')}
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                Create Invoice
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1.5 text-xs font-semibold"
                onClick={() => onViewChange('customers')}
              >
                <Users className="w-3.5 h-3.5 text-purple-600" />
                Manage Partners
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1.5 text-xs font-semibold"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5" />
            Print Profile
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            className="flex items-center gap-1.5 text-xs font-semibold"
            disabled={isRefreshing}
            onClick={loadData}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* ─── TOP SELECTOR CARD ─── */}
      <Card className="p-4 bp-dashboard-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Customer ID & Name Selector */}
          <div className="md:col-span-8 flex flex-col md:flex-row md:items-center gap-3">
            <div className="w-full md:w-80">
              <ComboBox
                label="Customer ID / Code"
                value={selectedCustomerId}
                onChange={(val) => setSelectedCustomerId(val)}
                options={customerOptions}
                placeholder="Search Customer..."
              />
            </div>
            <div className="flex-1 mt-4 md:mt-0">
              <label className="text-[11px] font-semibold text-black ml-1 block">Selected Customer Name</label>
              <div className="h-7 px-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center text-xs font-bold text-slate-800 truncate">
                {activeCustomer?.name || 'Select Customer'}
              </div>
            </div>
          </div>

          {/* Old Profile Toggle Option */}
          <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-3 pt-2 md:pt-0">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none border border-slate-200 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={isOldProfileFilter}
                onChange={(e) => setIsOldProfileFilter(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-red-600">Old Profile</span>
            </label>
          </div>

        </div>
      </Card>

      {/* ─── MAIN DASHBOARD GRID (LEFT: TABLES, RIGHT: CONTACT INFO) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: METRICS & TABLES (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. BALANCE & MONTHLY SUMMARY BANNER CARD */}
          <Card className="p-5 bp-dashboard-card overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* BALANCE DISPLAY */}
              <div className="md:col-span-6 p-4 bp-balance-banner flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase block">BALANCE RS</span>
                  <div className="text-2xl bp-balance-value tracking-tight mt-0.5">
                    {computedMetrics.balance.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    <span className="text-sm bp-balance-badge ml-1.5 inline-block">
                      {computedMetrics.balanceType}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600">
                  <CreditCard className="w-5 h-5" style={{ color: brand.primary }} />
                </div>
              </div>

              {/* MONTHLY SUMMARY METRICS */}
              <div className="md:col-span-6 grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase block">Current Month Payment</span>
                  <div className="text-base font-extrabold text-emerald-900 mt-1">
                    Rs. {computedMetrics.currentMonthPayment.toLocaleString('en-PK')}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100">
                  <span className="text-[10px] font-bold text-purple-600 tracking-wider uppercase block">Current Month Sales</span>
                  <div className="text-base font-extrabold text-purple-900 mt-1">
                    Rs. {computedMetrics.currentMonthSales.toLocaleString('en-PK')}
                  </div>
                </div>
              </div>

            </div>
          </Card>

          {/* 2. RECEIPT & SALES MONTHLY FINANCIAL MATRIX TABLE */}
          <Card className="p-4 bp-dashboard-card">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" style={{ color: brand.primary }} />
                Financial Summary Matrix (Receipt vs Sales)
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">Values in PKR</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bp-table-head text-[11px]">
                    <th className="py-2.5 px-3">TRANSACTION</th>
                    <th className="py-2.5 px-3 text-right">OLD</th>
                    <th className="py-2.5 px-3 text-right">May</th>
                    <th className="py-2.5 px-3 text-right">April</th>
                    <th className="py-2.5 px-3 text-right">March</th>
                    <th className="py-2.5 px-3 text-right">February</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  <tr className="bp-table-row">
                    <td className="py-2.5 px-3 font-bold text-emerald-600 flex items-center gap-1.5">
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      RECEIPT
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                      {financialMatrix.receipt.old.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">{financialMatrix.receipt.may || 0}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">{financialMatrix.receipt.april || 0}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">{financialMatrix.receipt.march || 0}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">{financialMatrix.receipt.february || 0}</td>
                  </tr>

                  <tr className="bp-table-row">
                    <td className="py-2.5 px-3 font-bold text-blue-600 flex items-center gap-1.5" style={{ color: brand.primary }}>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      SALES
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                      {financialMatrix.sales.old.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">{financialMatrix.sales.may || 0}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">{financialMatrix.sales.april || 0}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">{financialMatrix.sales.march || 0}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">{financialMatrix.sales.february || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* 3. PRODUCT PURCHASES BREAKDOWN MATRIX TABLE */}
          <Card className="p-4 bp-dashboard-card">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" style={{ color: brand.primary }} />
                Product Purchases Breakdown History
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">Monthly Qty Breakdown</span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bp-table-head text-[11px]">
                    <th className="py-2.5 px-3 min-w-[200px]">PRODUCTS</th>
                    <th className="py-2.5 px-3">DETAILS</th>
                    <th className="py-2.5 px-3 text-center">OLD</th>
                    <th className="py-2.5 px-3 text-center">June</th>
                    <th className="py-2.5 px-3 text-center">May</th>
                    <th className="py-2.5 px-3 text-center">April</th>
                    <th className="py-2.5 px-3 text-center">March</th>
                    <th className="py-2.5 px-3 text-center">February</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {productPurchases.map((item) => (
                    <tr key={item.id} className="bp-table-row">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-3 font-semibold">
                        <span className="bp-detail-pill text-[11px]">
                          {item.details}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">{item.old || '-'}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-600">{item.june || '-'}</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">{item.may || '-'}</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">{item.april || '-'}</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">{item.march || '-'}</td>
                      <td className="py-2.5 px-3 text-center text-slate-400">{item.february || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN: CONTACT PERSON & DETAILS SIDEBAR CARD (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          <Card className="p-5 bp-dashboard-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" style={{ color: brand.primary }} />
                Contact Information
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {activeCustomer.code}
              </span>
            </div>

            {/* Contact Person */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 block">Contact Person</label>
              <div className="text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {activeCustomer.contactPerson}
              </div>
            </div>

            {/* Mobile 1 & 2 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-slate-400" />
                  Mobile 1
                </label>
                <div className="text-xs font-semibold text-slate-800 mt-1 p-2 rounded-lg bg-slate-50 border border-slate-100 truncate">
                  {activeCustomer.mobile1 || '-'}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-slate-400" />
                  Mobile 2
                </label>
                <div className="text-xs font-semibold text-slate-800 mt-1 p-2 rounded-lg bg-slate-50 border border-slate-100 truncate">
                  {activeCustomer.mobile2 || '-'}
                </div>
              </div>
            </div>

            {/* Phone 1 & 2 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  Phone 1
                </label>
                <div className="text-xs font-semibold text-slate-800 mt-1 p-2 rounded-lg bg-slate-50 border border-slate-100 truncate">
                  {activeCustomer.phone1 || '-'}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  Phone 2
                </label>
                <div className="text-xs font-semibold text-slate-800 mt-1 p-2 rounded-lg bg-slate-50 border border-slate-100 truncate">
                  {activeCustomer.phone2 || '-'}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                Address
              </label>
              <div className="text-xs font-medium text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                {activeCustomer.address}
              </div>
            </div>

            {/* Credit Limit */}
            {activeCustomer.creditLimit !== undefined && (
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Credit Limit</span>
                  <span className="text-xs font-black text-amber-900 mt-0.5 block">
                    Rs. {activeCustomer.creditLimit.toLocaleString('en-PK')}
                  </span>
                </div>
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
            )}

          </Card>

        </div>

      </div>

    </div>
  );
};

export default BPDashboard;
