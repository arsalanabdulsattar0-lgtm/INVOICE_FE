import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Plus, Search, Trash2, Edit2, LayoutGrid, List,
  SlidersHorizontal, ArrowUpDown, X, Eye,
  FileText, CheckCircle, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';
import { ScrollArea } from '../../components/ui/FormControls';
import { Button } from '../../components/ui/Button';
import { ProductFilterDrawer } from '../../components/ui/ProductFilterDrawer';
import { ActiveChip, InactiveChip } from '../../components/ui/Chip';

export interface Product {
  id: string;
  name: string;
  code: string;
  category_id: string;
  brand_id: string;
  make_id: string;
  model_id: string;
  size_id: string;
  uom_id: string;
  sale_price: number;
  cost: number;
  mrp_ex_tax: number;
  mrp_inc_tax: number;
  opening_qty: number;
  opening_rate: number;
  low_stock_level: number;
  weight: number;
  gst_rate: number;
  non_filer_gst_rate: number;
  adt_rate: number;
  sale_discount: number;
  purchase_discount: number;
  fbr_uom: string;
  sro_item_serial_no: string;
  sro_schedule_no: string;
  fbr_sale_rate: number;
  fbr_sale_type: string;
  hs_code: string;
  gst_tax_id: string;
  non_filer_tax_id: string;
  adt_tax_id: string;
  fbr_tax_id: string;
  description: string;
  notes: string;
  is_active: boolean;
  length?: number;
  width?: number;
  created_at?: string;
  preferred_supplier_id?: string;
}

interface Props {
  onAddProductClick: () => void;
}

export const ProductCategory = [
  { id: 'cat-1', name: 'Electronics' },
  { id: 'cat-2', name: 'Hardware' },
  { id: 'cat-3', name: 'Cabling' },
  { id: 'cat-4', name: 'Networking' },
  { id: 'cat-5', name: 'Software' },
  { id: 'cat-6', name: 'Services' },
];

export const ProductBrand = [
  { id: 'br-1', name: 'Intel' },
  { id: 'br-2', name: 'Logitech' },
  { id: 'br-3', name: 'ASUS' },
  { id: 'br-4', name: 'Cisco' },
  { id: 'br-5', name: 'TP-Link' },
  { id: 'br-6', name: 'Generic' },
];

export const ProductMake = [
  { id: 'mk-1', name: 'USA' },
  { id: 'mk-2', name: 'China' },
  { id: 'mk-3', name: 'Taiwan' },
  { id: 'mk-4', name: 'Japan' },
  { id: 'mk-5', name: 'Germany' },
];

export const ProductModel = [
  { id: 'md-1', name: 'Pro v4' },
  { id: 'md-2', name: 'Airflow AF' },
  { id: 'md-3', name: 'Gen4 PCIe' },
  { id: 'md-4', name: 'Enterprise Managed' },
  { id: 'md-5', name: 'Standard Edition' },
];

export const ProductSize = [
  { id: 'sz-1', name: 'Standard' },
  { id: 'sz-2', name: '1 Meter' },
  { id: 'sz-3', name: '2TB Storage' },
  { id: 'sz-4', name: '32GB Capacity' },
  { id: 'sz-5', name: '1500VA Power' },
];

export const ProductUOM = [
  { id: 'uom-1', name: 'Pcs' },
  { id: 'uom-2', name: 'Box' },
  { id: 'uom-3', name: 'Kg' },
];

export const ProductSupplier = [
  { id: 'sup-1', name: 'Logitech Wholesale' },
  { id: 'sup-2', name: 'ASUS Distribution' },
  { id: 'sup-3', name: 'Cisco Partner PK' },
  { id: 'sup-4', name: 'Intel Distributors' },
  { id: 'sup-5', name: 'Local Supplier' },
];

type SortKey = 'name' | 'code' | 'price' | 'qty' | 'status' | 'category_id';
type SortDir = 'asc' | 'desc';

const ProductList: React.FC<Props> = ({ onAddProductClick }) => {
  const { brand } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  // Interactive Filters & Sorting States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceOperator, setPriceOperator] = useState<string>('all');
  const [priceValue, setPriceValue] = useState<string>('');
  const [stockOperator, setStockOperator] = useState<string>('all');
  const [stockValue, setStockValue] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Panel Open States
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showSortPanel, setShowSortPanel] = useState(false);
  const [openAction, setOpenAction] = useState<string | null>(null);

  // Layout View Mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      const saved = localStorage.getItem('products_view_mode');
      return saved === 'grid' ? 'grid' : 'list'; // default to list view (table)
    } catch {
      return 'list';
    }
  });

  // Selected Products for Bulk Actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Viewing detail product modal
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

  const sortRef = useRef<HTMLDivElement>(null);
  const perPage = 15;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (sortRef.current && !sortRef.current.contains(target)) {
        setShowSortPanel(false);
      }
      if (openAction && !target.closest('.action-menu-container')) {
        setOpenAction(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openAction]);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('products_view_mode', mode);
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryName = (catId: string) => {
    return ProductCategory.find(c => c.id === catId)?.name || 'Uncategorized';
  };

  const getBrandName = (brandId: string) => {
    return ProductBrand.find(b => b.id === brandId)?.name || 'Generic';
  };

  const getUOMName = (uomId: string) => {
    return ProductUOM.find(u => u.id === uomId)?.name || 'Pcs';
  };

  const loadProducts = () => {
    try {
      const stored = localStorage.getItem('products_list');
      const seededFlag = localStorage.getItem('products_seeded_v5');
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed && parsed.length > 0 && seededFlag === 'true') {
        setProducts(parsed);
      } else {
        // Seed 30 sample enterprise products
        const seededProducts: Product[] = Array.from({ length: 30 }, (_, i) => ({
          id: crypto.randomUUID(),
          name: i === 0 ? 'Droop Shoulder T-shirt'
            : i === 1 ? 'T-shirt Slim-fit'
              : i === 2 ? 'Winter Hoodie'
                : i === 3 ? 'Casual Hoodie'
                  : i === 4 ? 'Printed Hoodie'
                    : i === 5 ? 'Hoodie Slim-fit'
                      : i === 6 ? 'Winter Sweet Hoodie'
                        : i === 7 ? 'Olives Hoodie'
                          : `Enterprise Product ${i + 1}`,
          code: `GD${36457 + i}`,
          category_id: `cat-${(i % 6) + 1}`,
          brand_id: `br-${(i % 6) + 1}`,
          make_id: `mk-${(i % 5) + 1}`,
          model_id: `md-${(i % 5) + 1}`,
          size_id: `sz-${(i % 5) + 1}`,
          uom_id: `uom-${(i % 5) + 1}`,
          sale_price: 50 + (i * 12.5),
          cost: 30 + (i * 8.5),
          mrp_ex_tax: 45 + (i * 11.5),
          mrp_inc_tax: 53.1 + (i * 13.57),
          opening_qty: 30 + (i * 4) > 100 ? 50 : 30 + (i * 4),
          opening_rate: 30 + (i * 8.5),
          low_stock_level: 10,
          weight: 0.5 + (i * 0.05),
          gst_rate: 18,
          non_filer_gst_rate: 24,
          adt_rate: 2,
          sale_discount: 5,
          purchase_discount: 8,
          fbr_uom: 'PCS',
          sro_item_serial_no: `SRO-SR-${100 + i}`,
          sro_schedule_no: `SCH-N-${200 + i}`,
          fbr_sale_rate: 50 + (i * 12.5),
          fbr_sale_type: 'Taxable',
          hs_code: `HS-${8500 + i}`,
          gst_tax_id: 'tax-gst-18',
          non_filer_tax_id: 'tax-nf-4',
          adt_tax_id: 'tax-adt-1',
          fbr_tax_id: 'tax-fbr-active',
          description: i < 8 ? `${i % 2 === 0 ? 'Comfortable cotton blend stylish hoodie for winter.' : 'Casual lightweight daily wear slim-fit clothing.'}` : `High-quality industrial standard enterprise grade product. Model-${(i % 5) + 1}.`,
          notes: 'Wash with similar colors.',
          is_active: i % 3 !== 2,
          created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          preferred_supplier_id: `sup-${(i % 5) + 1}`
        }));

        setProducts(seededProducts);
        localStorage.setItem('products_list', JSON.stringify(seededProducts));
        localStorage.setItem('products_seeded_v5', 'true');
        window.dispatchEvent(new CustomEvent('ai-sync-data'));
      }
    } catch (e) {
      console.error(e);
      setProducts([]);
    }
  };

  useEffect(() => {
    loadProducts();

    const handleSync = () => loadProducts();
    window.addEventListener('ai-sync-data', handleSync);
    return () => window.removeEventListener('ai-sync-data', handleSync);
  }, []);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      const newProducts = products.filter(p => p.id !== id);
      localStorage.setItem('products_list', JSON.stringify(newProducts));
      setProducts(newProducts);
      setSelectedProductIds(prev => prev.filter(x => x !== id));
      window.dispatchEvent(new CustomEvent('ai-sync-data'));
    }
  };

  const handleEditClick = (p: Product) => {
    window.dispatchEvent(new CustomEvent('open-product-form', { detail: { product: p } }));
  };

  const handleToggleActive = (id: string) => {
    const updatedProducts = products.map(p =>
      p.id === id ? { ...p, is_active: !p.is_active } : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('products_list', JSON.stringify(updatedProducts));
    window.dispatchEvent(new CustomEvent('ai-sync-data'));
  };

  // Bulk Actions
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete the ${selectedProductIds.length} selected products?`)) {
      const newProducts = products.filter(p => !selectedProductIds.includes(p.id));
      localStorage.setItem('products_list', JSON.stringify(newProducts));
      setProducts(newProducts);
      setSelectedProductIds([]);
      window.dispatchEvent(new CustomEvent('ai-sync-data'));
    }
  };

  const handleBulkToggleActive = (active: boolean) => {
    const updatedProducts = products.map(p =>
      selectedProductIds.includes(p.id) ? { ...p, is_active: active } : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('products_list', JSON.stringify(updatedProducts));
    setSelectedProductIds([]);
    window.dispatchEvent(new CustomEvent('ai-sync-data'));
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setPriceOperator('all');
    setPriceValue('');
    setStockOperator('all');
    setStockValue('');
    setSelectedStatus('All');
    setSelectedSupplier('all');
    setSortKey('name');
    setSortDir('asc');
    setSearch('');
    setCurrentPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setShowSortPanel(false);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchQuery =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === 'all' || p.category_id === selectedCategory;

      const matchStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Active' && p.is_active) ||
        (selectedStatus === 'Inactive' && !p.is_active);

      let matchPrice = true;
      if (priceOperator !== 'all' && priceValue !== '') {
        const val = parseFloat(priceValue);
        const price = p.sale_price || 0;
        if (!isNaN(val)) {
          if (priceOperator === '=') matchPrice = price === val;
          else if (priceOperator === '!=') matchPrice = price !== val;
          else if (priceOperator === '<') matchPrice = price < val;
          else if (priceOperator === '>') matchPrice = price > val;
          else if (priceOperator === '<=') matchPrice = price <= val;
          else if (priceOperator === '>=') matchPrice = price >= val;
        }
      }

      let matchStock = true;
      if (stockOperator !== 'all' && stockValue !== '') {
        const val = parseFloat(stockValue);
        const qty = p.opening_qty || 0;
        if (!isNaN(val)) {
          if (stockOperator === '=') matchStock = qty === val;
          else if (stockOperator === '!=') matchStock = qty !== val;
          else if (stockOperator === '<') matchStock = qty < val;
          else if (stockOperator === '>') matchStock = qty > val;
          else if (stockOperator === '<=') matchStock = qty <= val;
          else if (stockOperator === '>=') matchStock = qty >= val;
        }
      }

      const matchSupplier = selectedSupplier === 'all' || p.preferred_supplier_id === selectedSupplier;

      return matchQuery && matchCategory && matchStatus && matchPrice && matchStock && matchSupplier;
    });

    result = [...result].sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortKey === 'price') { av = a.sale_price; bv = b.sale_price; }
      else if (sortKey === 'qty') { av = a.opening_qty; bv = b.opening_qty; }
      else if (sortKey === 'status') { av = a.is_active ? 1 : 0; bv = b.is_active ? 1 : 0; }
      else {
        av = a[sortKey as keyof Product] as string | number || '';
        bv = b[sortKey as keyof Product] as string | number || '';
      }

      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [products, search, selectedCategory, priceOperator, priceValue, stockOperator, stockValue, selectedStatus, selectedSupplier, sortKey, sortDir]);

  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * perPage, currentPage * perPage);

  // KPI calculations
  const totalProducts = products.length;
  const totalSalesProducts = products.filter(p => p.sale_price > 0 && p.is_active).length;
  const availableProducts = products.filter(p => p.opening_qty > 0).length;
  const returnProducts = products.filter(p => !p.is_active).length;

  const stats = [
    { label: 'Total Products', value: totalProducts.toString(), sub: `${totalProducts} catalog items`, icon: FileText, color: brand.primary, bg: brand.surface },
    { label: 'Active Products', value: totalSalesProducts.toString(), sub: `${totalProducts > 0 ? ((totalSalesProducts / totalProducts) * 100).toFixed(0) : 0}% of catalog`, icon: CheckCircle, color: '#15803D', bg: '#F0FDF4' },
    { label: 'In Stock Items', value: availableProducts.toString(), sub: `${availableProducts} items active`, icon: Box, color: '#C2410C', bg: '#FFF7ED' },
    { label: 'Inactive / Return', value: returnProducts.toString(), sub: 'Requires review', icon: AlertCircle, color: '#BE123C', bg: '#FFF1F2' },
  ];

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Product Name' },
    { key: 'code', label: 'Product Code' },
    { key: 'price', label: 'Price' },
    { key: 'qty', label: 'In Stocks' },
    { key: 'status', label: 'Status' },
  ];

  const SortArrow = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-block opacity-50" style={{ color: sortKey === col ? brand.primary : brand.dark }}>
      {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );





  return (
    <div className="min-h-full p-6 space-y-5" style={{ background: '#F4F7FD' }}>

      {/* ── Page Header (InvoiceList Style) ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: brand.dark }}>Product List</h1>
          <p className="text-[12px] font-medium text-slate-400 mt-0.5">
            {filteredProducts.length} products found · Last updated just now
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="white"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => setShowFilterDrawer(true)}
            className="relative"
          >
            Filter
            {(selectedCategory !== 'all' || priceOperator !== 'all' || stockOperator !== 'all' || selectedStatus !== 'All' || selectedSupplier !== 'all' || search !== '') && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                style={{ background: brand.accent || '#EF4444' }}>!</span>
            )}
          </Button>
          <Button
            onClick={onAddProductClick}
            variant="primary"
            size="md"
            icon={Plus}
            className="bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
          >
            Add Product
          </Button>
        </div>
      </motion.div>

      {/* ── Stats Cards (InvoiceList Style) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl p-4 border shadow-sm hover:shadow-md transition-all group cursor-default"
            style={{ borderColor: brand.dark + '10' }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-black tracking-wide">{stat.label}</p>
                <p className="text-2xl font-black mt-1 tracking-tight" style={{ color: brand.dark }}>{stat.value}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-1">{stat.sub}</p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                style={{ background: stat.bg }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Table Card (InvoiceList Style) ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border shadow-sm overflow-hidden"
        style={{ borderColor: brand.dark + '10' }}>

        {/* ── Solid Header Bar (InvoiceList Style) ── */}
        <div className="px-4 py-2.5 flex items-center justify-between text-white"
          style={{ backgroundColor: brand.primary }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <h3 className="text-[11px] font-black tracking-wide">Product Records</h3>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: brand.soft, color: brand.dark }}>
              {filteredProducts.length} Products
            </span>
          </div>

          {/* Search inside header bar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search products..."
                className="h-7 pl-7 pr-3 rounded-lg text-[11px] font-medium border outline-none w-52"
                style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>

            {/* Sort Button */}
            <div className="relative" ref={sortRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setShowSortPanel(p => !p); }}
                className={`border ${showSortPanel ? 'bg-white/25 border-white/25' : 'bg-white/10 border-white/20'} text-white hover:bg-white/20`}
                icon={ArrowUpDown}
              >
                Sort
              </Button>
              <AnimatePresence>
                {showSortPanel && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-9 z-30 bg-white rounded-xl shadow-xl border overflow-hidden w-44"
                    style={{ borderColor: brand.dark + '15' }}>
                    {sortOptions.map(opt => (
                      <button key={opt.key} onClick={() => handleSort(opt.key)}
                        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold hover:bg-slate-50 transition-all"
                        style={{ color: sortKey === opt.key ? brand.primary : brand.dark }}>
                        {opt.label}
                        {sortKey === opt.key && (
                          <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-lg border border-white/20">
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-1 rounded transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-1 rounded transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>


        {/* Bulk Actions Floating Bar */}
        <AnimatePresence>
          {selectedProductIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="bg-slate-900 text-white px-6 py-3 border-t border-slate-800 flex items-center justify-between"
            >
              <span className="text-xs font-bold text-slate-400">
                <strong className="text-white text-sm mr-1">{selectedProductIds.length}</strong> products selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkToggleActive(true)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Mark Active
                </button>
                <button
                  onClick={() => handleBulkToggleActive(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Mark Inactive
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3.5 py-1.5 bg-red-650 hover:bg-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 bg-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedProductIds([])}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Table Mode / Scroll Area (InvoiceList Style) ── */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${selectedCategory}-${priceOperator}-${priceValue}-${stockOperator}-${stockValue}-${selectedStatus}-${sortKey}-${sortDir}-${currentPage}-${search}`}
            className="overflow-x-auto"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          >
            <AnimatePresence mode="wait">
              {viewMode === 'list' ? (
                <motion.div
                  key="list-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ScrollArea className="w-full max-w-full" maxHeight="450px" style={{ overscrollBehavior: 'contain' }}>
                    <table className="w-full">
                      <thead className="sticky top-0 z-10 bg-white">
                        <tr className="border-b" style={{ borderColor: brand.dark + '10' }}>
                          <th className="px-4 py-3 text-center w-12 border-b">
                            <input
                              type="checkbox"
                              checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                              onChange={handleSelectAll}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-550/20 cursor-pointer w-4 h-4"
                            />
                          </th>
                          {([
                            { label: 'Product details', key: 'name', width: 'w-[43%]' },
                            { label: 'Category', key: 'category_id', width: 'w-[13%]' },
                            { label: 'In stocks', key: 'qty', width: 'w-[10%]' },
                            { label: 'Price (Rs.)', key: 'price', width: 'w-[12%]' },
                            { label: 'Status', key: 'status', width: 'w-[10%]' },
                            { label: 'Last updated', key: null, width: 'w-[12%]' },
                            { label: 'Actions', key: null, width: 'w-20' },
                          ] as { label: string; key: SortKey | null; width: string }[]).map((h, idx) => (
                            <th key={h.label}
                              className={`${h.label === 'Actions' ? 'px-2' : 'px-4'} py-3 text-left border-b ${h.key ? 'cursor-pointer hover:bg-blue-50/40 select-none' : ''} transition-colors ${idx !== 0 ? 'border-l border-slate-100' : ''} ${h.width}`}
                              style={{ borderColor: brand.dark + '10' }}
                              onClick={() => h.key && handleSort(h.key)}>
                              <span className="text-[10px] font-black tracking-widest inline-flex items-center gap-0.5 whitespace-nowrap"
                                style={{ color: sortKey === h.key ? brand.primary : '#000000' }}>
                                {h.label}
                                {h.key && <SortArrow col={h.key} />}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((product, i) => {
                          const isSelected = selectedProductIds.includes(product.id);

                          return (
                            <motion.tr key={product.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ type: 'spring', stiffness: 350, damping: 30, delay: i * 0.03 }}
                              className={`group border-b transition-colors hover:bg-slate-50/60 cursor-pointer last:border-0 ${isSelected ? 'bg-blue-50/15' : ''}`}
                              style={{ borderColor: brand.dark + '08' }}
                            >
                              {/* Checkbox */}
                              <td className="px-4 py-3 text-center border-l border-slate-50 first:border-0 w-12">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleSelectRow(product.id)}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-550/20 cursor-pointer w-4 h-4"
                                />
                              </td>

                              {/* Product Details (Name + UOM + Code) */}
                              <td className="px-4 py-3 border-l border-slate-50">
                                <div className="min-w-0">
                                  <h4 className="text-[12px] font-normal truncate max-w-[200px]" style={{ color: brand.dark }}>{product.name}</h4>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[9px] font-medium font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                                      {product.code}
                                    </span>
                                    <span className="text-[10px] font-medium text-slate-400">
                                      · {getUOMName(product.uom_id)}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">
                                {getCategoryName(product.category_id)}
                              </td>

                              {/* Stocks */}
                              <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">
                                {product.opening_qty}
                              </td>

                              {/* Price */}
                              <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">
                                {(product.sale_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>

                              {/* Status */}
                              <td className="px-4 py-3 border-l border-slate-50">
                                {product.is_active
                                  ? <ActiveChip label="Active" size="md" onClick={() => handleToggleActive(product.id)} />
                                  : <InactiveChip label="Inactive" size="md" onClick={() => handleToggleActive(product.id)} />
                                }
                              </td>

                              {/* Last Updated */}
                              <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-500">
                                {product.created_at || '2026-05-30'}
                              </td>

                              {/* Actions */}
                              <td className="px-1 py-3 border-l border-slate-50 w-16 whitespace-nowrap">
                                <div className="flex items-center gap-0">
                                  <Button onClick={() => setViewingProduct(product)}
                                    variant="ghost" size="xs" icon={Eye} title="View"
                                    className="!px-1 text-blue-600 hover:bg-blue-50" />
                                  <Button onClick={() => handleEditClick(product)}
                                    variant="ghost" size="xs" icon={Edit2} title="Edit"
                                    className="!px-1 text-blue-600 hover:bg-blue-50" />
                                  <Button onClick={() => handleDelete(product.id, product.name)}
                                    variant="ghost" size="xs" icon={Trash2} title="Delete"
                                    className="!px-1 text-red-500" />
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}

                        {paginatedProducts.length === 0 && (
                          <tr>
                            <td colSpan={9} className="py-16 text-center">
                              <Box className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                              <p className="text-[13px] font-medium text-slate-400">No products found</p>
                              <p className="text-[11px] text-slate-300 mt-1">Try adjusting your filters or search query</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </ScrollArea>
                </motion.div>
              ) : (
                <motion.div
                  key="grid-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ScrollArea className="w-full max-w-full p-4 bg-slate-50/50" maxHeight="450px" style={{ overscrollBehavior: 'contain' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                      {paginatedProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="h-full flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer group border-slate-100 p-4" onClick={() => setViewingProduct(product)}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[9px] uppercase font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500 tracking-wider">{product.code}</span>
                                {!product.is_active && <span className="text-[9px] uppercase font-medium px-2 py-0.5 rounded bg-red-50 text-red-500 tracking-wider">Inactive</span>}
                              </div>

                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => handleEditClick(product)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(product.id, product.name)}
                                  className="p-1.5 rounded-lg text-red-500 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <h3 className="text-[12px] font-normal text-slate-800 mb-0.5 line-clamp-1">{product.name}</h3>
                            <p className="text-[10px] font-medium text-slate-400 mb-2">{getCategoryName(product.category_id)} • {getBrandName(product.brand_id)}</p>

                            <p className="text-[11px] text-slate-500 font-normal line-clamp-2 h-8 mb-4">{product.description || 'No description provided.'}</p>

                            <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">Rs. {(product.sale_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">Qty: {product.opening_qty} {getUOMName(product.uom_id)}</span>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Pagination (InvoiceList Style) */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between"
            style={{ borderColor: brand.dark + '08', background: brand.surface + '60' }}>
            <p className="text-[11px] font-medium text-black">
              Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filteredProducts.length)} of {filteredProducts.length}
            </p>
            <div className="flex items-center gap-1">
              <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="white" size="xs" icon={ChevronLeft}
                className="w-8 h-8 px-0" />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button key={p} onClick={() => setCurrentPage(p)}
                  variant={currentPage === p ? 'primary' : 'white'} size="xs"
                  className="w-8 h-8 px-0 border-none"
                >
                  {p}
                </Button>
              ))}
              <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="white" size="xs" icon={ChevronRight}
                className="w-8 h-8 px-0" />
            </div>
          </div>
        )}
      </motion.div>

      {/* ── View Product Detail Modal ── */}
      <AnimatePresence>
        {viewingProduct && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-slate-100 font-sans"
            >
              <button
                onClick={() => setViewingProduct(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase tracking-wider">{viewingProduct.code}</span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{viewingProduct.name}</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">{getCategoryName(viewingProduct.category_id)} • {getBrandName(viewingProduct.brand_id)}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Product Information</h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-slate-50 text-xs">
                      <span className="text-slate-500 font-medium">Description</span>
                      <span className="text-slate-800 font-bold text-right max-w-[200px] truncate">{viewingProduct.description || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50 text-xs">
                      <span className="text-slate-500 font-medium">Model</span>
                      <span className="text-slate-800 font-bold">{ProductModel.find(m => m.id === viewingProduct.model_id)?.name || 'Generic'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50 text-xs">
                      <span className="text-slate-500 font-medium">Size</span>
                      <span className="text-slate-800 font-bold">{ProductSize.find(s => s.id === viewingProduct.size_id)?.name || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50 text-xs">
                      <span className="text-slate-500 font-medium">Unit of Measure</span>
                      <span className="text-slate-800 font-bold">{ProductUOM.find(u => u.id === viewingProduct.uom_id)?.name || 'Pcs'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50 text-xs">
                      <span className="text-slate-500 font-medium">Weight</span>
                      <span className="text-slate-800 font-bold">{viewingProduct.weight ? `${viewingProduct.weight} kg` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Pricing & Inventory</h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between py-1 border-b border-slate-50 text-xs">
                      <span className="text-slate-500 font-medium">Sale Price</span>
                      <span className="text-slate-800 font-black text-blue-600">Rs. {viewingProduct.sale_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50 text-xs">
                      <span className="text-slate-500 font-medium">Cost Price</span>
                      <span className="text-slate-800 font-bold">Rs. {viewingProduct.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50 text-xs">
                      <span className="text-slate-500 font-medium">Stocks (Qty)</span>
                      <span className="text-slate-800 font-bold">{viewingProduct.opening_qty} units</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50 text-xs">
                      <span className="text-slate-500 font-medium">Low Stock Level</span>
                      <span className="text-red-500 font-bold">{viewingProduct.low_stock_level} units</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-50 text-xs">
                      <span className="text-slate-500 font-medium">Status</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${viewingProduct.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {viewingProduct.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Tax Compliance & Codes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">GST Rate</div>
                      <div className="text-sm font-black text-slate-700 mt-1">{viewingProduct.gst_rate}%</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Non-Filer Rate</div>
                      <div className="text-sm font-black text-slate-700 mt-1">{viewingProduct.non_filer_gst_rate}%</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">HS Code</div>
                      <div className="text-sm font-black text-slate-700 mt-1">{viewingProduct.hs_code || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setViewingProduct(null);
                    handleEditClick(viewingProduct);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all cursor-pointer"
                >
                  Edit Product
                </button>
                <button
                  onClick={() => setViewingProduct(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Filter Drawer (Side Panel) ── */}
      <ProductFilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        onReset={handleResetFilters}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => { setSelectedCategory(cat); setCurrentPage(1); }}
        priceOperator={priceOperator}
        setPriceOperator={(op) => { setPriceOperator(op); setCurrentPage(1); }}
        priceValue={priceValue}
        setPriceValue={(val) => { setPriceValue(val); setCurrentPage(1); }}
        stockOperator={stockOperator}
        setStockOperator={(op) => { setStockOperator(op); setCurrentPage(1); }}
        stockValue={stockValue}
        setStockValue={(val) => { setStockValue(val); setCurrentPage(1); }}
        selectedStatus={selectedStatus}
        setSelectedStatus={(status) => { setSelectedStatus(status); setCurrentPage(1); }}
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={(sup) => { setSelectedSupplier(sup); setCurrentPage(1); }}
      />
    </div>
  );
};

export default ProductList;
