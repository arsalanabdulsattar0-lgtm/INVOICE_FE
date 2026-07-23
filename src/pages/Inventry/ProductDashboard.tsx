import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ComboBox } from '../../components/ui/ComboBox';
import { useTheme } from '../../context/ThemeContext';
import { 
  Package, 
  Printer, 
  RefreshCw, 
  Building2, 
  Layers, 
  ArrowLeftRight, 
  SlidersHorizontal, 
  List,
  Tag
} from 'lucide-react';

interface ProductDashboardProps {
  onViewChange?: (view: string) => void;
}

interface ProductItem {
  id: string;
  code: string;
  name: string;
  category?: string;
  unitPrice: number;
  level1Price: number;
  level2Price: number;
  level3Price: number;
  level4Price: number;
}

interface CustomerSalesRow {
  id: string;
  customerName: string;
  mobile1?: string;
  mobile2?: string;
  oldQty: number;
  juneQty: number;
  mayQty: number;
  aprilQty: number;
  marchQty: number;
  februaryQty: number;
  totalQty: number;
}

interface LocationStockRow {
  id: string;
  location: string;
  stock: number;
}

const defaultProducts: ProductItem[] = [
  {
    id: '0001',
    code: '0001',
    name: 'CASING 3" ( CTN 50 ROLL )',
    category: 'Packaging',
    unitPrice: 1635,
    level1Price: 1635.00,
    level2Price: 4.27,
    level3Price: 0.00,
    level4Price: 0.00
  },
  {
    id: '0002',
    code: '0002',
    name: 'CASING 4" ( CTN 30 ROLL )',
    category: 'Packaging',
    unitPrice: 3200,
    level1Price: 3200.00,
    level2Price: 8.50,
    level3Price: 0.00,
    level4Price: 0.00
  },
  {
    id: '0003',
    code: '0003',
    name: 'CHOCOLATE SLAB BROWN G.P',
    category: 'Raw Material',
    unitPrice: 1200,
    level1Price: 1200.00,
    level2Price: 3.50,
    level3Price: 0.00,
    level4Price: 0.00
  }
];

const mockCustomerSales: CustomerSalesRow[] = [
  {
    id: 'CS1',
    customerName: 'Guddo Food Gujranwala',
    mobile1: '',
    mobile2: '',
    oldQty: 500,
    juneQty: 0,
    mayQty: 0,
    aprilQty: 0,
    marchQty: 0,
    februaryQty: 0,
    totalQty: 500
  },
  {
    id: 'CS2',
    customerName: 'Umair Krishan Nagar',
    mobile1: '',
    mobile2: '',
    oldQty: 1500,
    juneQty: 0,
    mayQty: 0,
    aprilQty: 0,
    marchQty: 0,
    februaryQty: 0,
    totalQty: 1500
  },
  {
    id: 'CS3',
    customerName: 'Farooq Multan',
    mobile1: '',
    mobile2: '',
    oldQty: 500,
    juneQty: 0,
    mayQty: 0,
    aprilQty: 0,
    marchQty: 0,
    februaryQty: 0,
    totalQty: 500
  },
  {
    id: 'CS4',
    customerName: 'SALMAN Chaman Essence',
    mobile1: '03218450107',
    mobile2: '',
    oldQty: 3000,
    juneQty: 0,
    mayQty: 0,
    aprilQty: 0,
    marchQty: 0,
    februaryQty: 0,
    totalQty: 3000
  },
  {
    id: 'CS5',
    customerName: 'Karak Tea Jawad Sab',
    mobile1: '',
    mobile2: '',
    oldQty: -3000,
    juneQty: 0,
    mayQty: 0,
    aprilQty: 0,
    marchQty: 0,
    februaryQty: 0,
    totalQty: -3000
  },
  {
    id: 'CS6',
    customerName: 'CASH',
    mobile1: '',
    mobile2: '',
    oldQty: 35625,
    juneQty: 0,
    mayQty: 0,
    aprilQty: 0,
    marchQty: 0,
    februaryQty: 0,
    totalQty: 35625
  },
  {
    id: 'CS7',
    customerName: 'ONLINE',
    mobile1: '',
    mobile2: '',
    oldQty: 63850,
    juneQty: 0,
    mayQty: 0,
    aprilQty: 0,
    marchQty: 0,
    februaryQty: 0,
    totalQty: 63850
  },
  {
    id: 'CS8',
    customerName: 'SAMPLE',
    mobile1: '',
    mobile2: '',
    oldQty: 50,
    juneQty: 0,
    mayQty: 0,
    aprilQty: 0,
    marchQty: 0,
    februaryQty: 0,
    totalQty: 50
  }
];

const mockLocationStock: LocationStockRow[] = [
  { id: 'LS1', location: 'SHOP KEH', stock: 0 },
  { id: 'LS2', location: 'MC', stock: 0 },
  { id: 'LS3', location: 'NS', stock: 0 },
  { id: 'LS4', location: 'NS', stock: 0 },
  { id: 'LS5', location: 'SHOP KEH', stock: 0 },
  { id: 'LS6', location: 'SHOP KEH', stock: 0 },
  { id: 'LS7', location: 'NS', stock: 0 },
  { id: 'LS8', location: 'SHOP KEH', stock: 100 },
  { id: 'LS9', location: 'SHOP KEH', stock: 2500 }
];

export const ProductDashboard: React.FC<ProductDashboardProps> = ({ onViewChange }) => {
  const { brand } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('0001');
  const [isOldProfileFilter, setIsOldProfileFilter] = useState<boolean>(true);
  const [products, setProducts] = useState<ProductItem[]>(defaultProducts);

  // Load product list from localStorage if available
  const loadData = () => {
    setIsRefreshing(true);
    try {
      const stored = localStorage.getItem('products_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted: ProductItem[] = parsed.map((p: any, idx: number) => ({
            id: p.code || p.id || `000${idx+1}`,
            code: p.code || `000${idx+1}`,
            name: p.name || 'Product Item',
            category: p.category || 'General',
            unitPrice: p.price || p.unitPrice || 1635,
            level1Price: p.price || 1635.00,
            level2Price: Math.round((p.price || 1635) * 0.0026 * 100) / 100,
            level3Price: 0.00,
            level4Price: 0.00
          }));

          if (!formatted.some(f => f.code === '0001' || f.id === '0001')) {
            formatted.unshift(defaultProducts[0]);
          }
          setProducts(formatted);
        }
      } else {
        setProducts(defaultProducts);
      }
    } catch {
      setProducts(defaultProducts);
    }
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId || p.code === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  const productOptions = useMemo(() => {
    return products.map(p => ({
      id: p.id,
      name: `${p.code} - ${p.name}`,
      subtitle: `Rs. ${p.unitPrice.toLocaleString()}`
    }));
  }, [products]);

  const customerSalesRows = useMemo(() => {
    if (activeProduct.code === '0001' || activeProduct.id === '0001') {
      return mockCustomerSales;
    }
    return [
      {
        id: 'CS101',
        customerName: 'Al-Madina Traders',
        mobile1: '0301-4455667',
        mobile2: '',
        oldQty: 250,
        juneQty: 50,
        mayQty: 20,
        aprilQty: 10,
        marchQty: 0,
        februaryQty: 0,
        totalQty: 330
      },
      {
        id: 'CS102',
        customerName: 'Metro Cash & Carry',
        mobile1: '0333-8899001',
        mobile2: '',
        oldQty: 1200,
        juneQty: 100,
        mayQty: 50,
        aprilQty: 25,
        marchQty: 0,
        februaryQty: 0,
        totalQty: 1375
      }
    ];
  }, [activeProduct]);

  const locationStockRows = useMemo(() => {
    if (activeProduct.code === '0001' || activeProduct.id === '0001') {
      return mockLocationStock;
    }
    return [
      { id: 'LS101', location: 'MAIN WAREHOUSE', stock: 450 },
      { id: 'LS102', location: 'SHOP KEH', stock: 120 },
      { id: 'LS103', location: 'MC', stock: 80 }
    ];
  }, [activeProduct]);

  const totalStockCount = useMemo(() => {
    return locationStockRows.reduce((sum, row) => sum + row.stock, 0);
  }, [locationStockRows]);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto custom-scrollbar">
      
      {/* ─── PAGE HEADER & CONTROLS ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bp-dashboard-header">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">Product Profile / Dashboard</h1>
              <p className="text-xs text-slate-500 font-medium">Product Sales History & Warehouse Location Stock Overview</p>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onViewChange && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1.5 text-xs font-semibold"
                onClick={() => onViewChange('products')}
              >
                <List className="w-3.5 h-3.5 text-blue-600" />
                Product List
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1.5 text-xs font-semibold"
                onClick={() => onViewChange('stock-transfer')}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-purple-600" />
                Stock Transfer
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1.5 text-xs font-semibold"
                onClick={() => onViewChange('stock-adjustments')}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                Stock Adjustment
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

      {/* ─── TOP SELECTOR & PRICE LEVELS CARD ─── */}
      <Card className="p-4 bp-dashboard-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Product ID & Name Selector */}
          <div className="md:col-span-8 flex flex-col md:flex-row md:items-center gap-3">
            <div className="w-full md:w-80">
              <ComboBox
                label="Product ID / Code"
                value={selectedProductId}
                onChange={(val) => setSelectedProductId(val)}
                options={productOptions}
                placeholder="Search Product..."
              />
            </div>
            <div className="flex-1 mt-4 md:mt-0">
              <label className="text-[11px] font-semibold text-black ml-1 block">Selected Product Name</label>
              <div className="h-7 px-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center text-xs font-bold text-slate-800 truncate">
                {activeProduct?.name || 'Select Product'}
              </div>
            </div>
          </div>

          {/* Old Profile Checkbox Toggle */}
          <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-3 pt-2 md:pt-0">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none border border-slate-200 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <input
                type="checkbox"
                checked={isOldProfileFilter}
                onChange={(e) => setIsOldProfileFilter(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-red-600">OLD Profile</span>
            </label>
          </div>

        </div>

        {/* SALES PRICE LEVELS MATRIX BAR */}
        <div className="pt-3 border-t border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 rounded-lg">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-700">
                  <th className="py-1.5 px-3 border-r border-slate-200">SALES PRICE</th>
                  <th className="py-1.5 px-3 border-r border-slate-200 text-center">LEVEL - 1</th>
                  <th className="py-1.5 px-3 border-r border-slate-200 text-center">LEVEL - 2</th>
                  <th className="py-1.5 px-3 border-r border-slate-200 text-center">LEVEL - 3</th>
                  <th className="py-1.5 px-3 text-center">LEVEL - 4</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-xs bg-white">
                  <td className="py-2 px-3 font-bold text-slate-600 border-r border-slate-200 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    Unit Rates (PKR)
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-slate-800 border-r border-slate-200">
                    {activeProduct.level1Price.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-slate-800 border-r border-slate-200">
                    {activeProduct.level2Price.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-400 border-r border-slate-200">
                    {activeProduct.level3Price.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-400">
                    {activeProduct.level4Price.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </Card>

      {/* ─── MAIN DASHBOARD GRID (LEFT: CUSTOMER SALES MATRIX, RIGHT: LOCATION STOCK TABLE) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CUSTOMER SALES MATRIX TABLE (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          <Card className="p-4 bp-dashboard-card">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" style={{ color: brand.primary }} />
                Customer Sales Quantity Breakdown Matrix
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">Monthly Product Distribution</span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bp-table-head text-[11px]">
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Mobile 1</th>
                    <th className="py-2.5 px-3">Mobile 2</th>
                    <th className="py-2.5 px-3 text-right">OLD</th>
                    <th className="py-2.5 px-3 text-right">Jun</th>
                    <th className="py-2.5 px-3 text-right">May</th>
                    <th className="py-2.5 px-3 text-right">Apr</th>
                    <th className="py-2.5 px-3 text-right">Mar</th>
                    <th className="py-2.5 px-3 text-right">Feb</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {customerSalesRows.map((row) => (
                    <tr key={row.id} className="bp-table-row">
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {row.customerName}
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                        {row.mobile1 || '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-mono text-[11px]">
                        {row.mobile2 || '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-700">
                        {row.oldQty.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-500">{row.juneQty || 0}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{row.mayQty || 0}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{row.aprilQty || 0}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{row.marchQty || 0}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{row.februaryQty || 0}</td>
                      <td className="py-2 px-3 text-right font-black text-blue-900">
                        {row.totalQty.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>

        {/* RIGHT COLUMN: LOCATION STOCK TABLE (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          
          <Card className="p-4 bp-dashboard-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" style={{ color: brand.primary }} />
                Warehouse Location Stock
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                Total Stock: {totalStockCount.toLocaleString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bp-table-head text-[11px]">
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3 text-right">Stock Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {locationStockRows.map((row) => (
                    <tr key={row.id} className="bp-table-row">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {row.location}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        {row.stock > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                            {row.stock.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default ProductDashboard;
