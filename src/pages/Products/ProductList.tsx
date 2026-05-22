import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Plus, Search, DollarSign, Percent, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Card from '../../components/ui/Card';

export interface Product {
  id: string;
  name: string;
  price: number;
  tax: number;
  description: string;
}

interface Props {
  onAddProductClick: () => void;
}

const ProductList: React.FC<Props> = ({ onAddProductClick }) => {
  const { brand } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load products from localStorage
  const loadProducts = () => {
    try {
      const stored = localStorage.getItem('products_list');
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed && parsed.length > 0) {
        setProducts(parsed);
      } else {
        // Seed 30 sample products on first load
        const seededProducts: Product[] = [
          { id: crypto.randomUUID(), name: 'Logic Board Pro v4',    price: 450.00, tax: 15, description: 'SKU: LB-V4-001 · High performance logic board' },
          { id: crypto.randomUUID(), name: 'Wireless Mesh Node',    price: 120.00, tax: 10, description: 'SKU: WMN-2024 · Extended range WiFi node' },
          { id: crypto.randomUUID(), name: 'Thermal Paste XG',      price:  15.00, tax:  5, description: 'SKU: TP-XG-01 · Premium thermal compound' },
          { id: crypto.randomUUID(), name: 'Fiber Patch Cord 1M',   price:   8.00, tax:  5, description: 'SKU: FPC-OS2-1M · Single mode OS2' },
          { id: crypto.randomUUID(), name: 'Core Processor i9',     price: 599.00, tax: 15, description: 'SKU: CP-I9-14G · 14th Gen, 24 Cores' },
          { id: crypto.randomUUID(), name: 'High-Speed RAM 32GB',   price: 110.00, tax: 10, description: 'SKU: RAM-DDR5-32 · DDR5 5200MHz' },
          { id: crypto.randomUUID(), name: 'NVMe SSD 2TB',          price: 180.00, tax: 15, description: 'SKU: SSD-NVME-2TB · Gen4 PCIe 7000MB/s' },
          { id: crypto.randomUUID(), name: 'ATX Gaming Chassis',    price:  95.00, tax: 15, description: 'SKU: CASE-ATX-AF · Airflow optimized' },
          { id: crypto.randomUUID(), name: 'PSU 850W Gold',         price: 130.00, tax: 15, description: 'SKU: PSU-850G · 80+ Gold Certified' },
          { id: crypto.randomUUID(), name: 'RTX 4070 GPU',          price: 620.00, tax: 15, description: 'SKU: GPU-RTX4070 · 12GB GDDR6X' },
          { id: crypto.randomUUID(), name: 'AIO Liquid Cooler 360', price: 160.00, tax: 15, description: 'SKU: AIO-360-PRO · 3x120mm Radiator' },
          { id: crypto.randomUUID(), name: 'Mini PC Barebone Kit',  price: 320.00, tax: 15, description: 'SKU: MINI-BBK-01 · Intel NUC-style' },
          { id: crypto.randomUUID(), name: 'USB-C Hub 10-in-1',    price:  45.00, tax: 10, description: 'SKU: USBC-HUB-10 · 4K HDMI + PD100W' },
          { id: crypto.randomUUID(), name: 'Mechanical Keyboard',   price:  89.00, tax: 10, description: 'SKU: KB-MECH-TKL · TKL Red Switches' },
          { id: crypto.randomUUID(), name: 'Gaming Mouse 25K DPI',  price:  65.00, tax: 10, description: 'SKU: MS-25K-RGB · Optical Pro Sensor' },
          { id: crypto.randomUUID(), name: '27" 4K IPS Monitor',    price: 380.00, tax: 15, description: 'SKU: MON-27-4K · 144Hz, HDR600' },
          { id: crypto.randomUUID(), name: 'Network Switch 24P',    price: 210.00, tax: 15, description: 'SKU: NSW-24G-PoE · Managed PoE+' },
          { id: crypto.randomUUID(), name: 'Cat6A Ethernet Cable',  price:  12.00, tax:  5, description: 'SKU: CAT6A-5M · 5 Meter, Shielded' },
          { id: crypto.randomUUID(), name: 'UPS 1500VA',            price: 175.00, tax: 15, description: 'SKU: UPS-1500-LCD · Pure Sine Wave' },
          { id: crypto.randomUUID(), name: 'Wi-Fi Access Point Pro', price: 240.00, tax: 15, description: 'SKU: AP-AX3000 · Wi-Fi 6, MU-MIMO' },
          { id: crypto.randomUUID(), name: 'Server Rack Cabinet 12U', price: 295.00, tax: 15, description: 'SKU: RACK-12U-GL · Tempered Glass' },
          { id: crypto.randomUUID(), name: 'KVM Switch 4-Port',     price:  55.00, tax: 10, description: 'SKU: KVM-4P-USB · HDMI 4K Output' },
          { id: crypto.randomUUID(), name: 'External HDD 8TB',      price: 145.00, tax: 15, description: 'SKU: EHD-8TB-USB3 · USB 3.2 Gen2' },
          { id: crypto.randomUUID(), name: 'Webcam 4K Ultra',       price:  90.00, tax: 10, description: 'SKU: WC-4K-AF · Auto-focus + Ring Light' },
          { id: crypto.randomUUID(), name: 'Noise-Cancel Headset',  price: 115.00, tax: 10, description: 'SKU: HS-NC-PRO · 40H Battery, ANC' },
          { id: crypto.randomUUID(), name: 'Software License ERP',  price: 500.00, tax: 15, description: 'SKU: SW-ERP-ANN · Annual, 10 Users' },
          { id: crypto.randomUUID(), name: 'Cloud Backup 1TB/yr',   price:  99.00, tax: 15, description: 'SKU: CLB-1TB-YR · Encrypted, AES-256' },
          { id: crypto.randomUUID(), name: 'IT Support Contract',   price: 800.00, tax:  0, description: 'SKU: SVC-IT-MON · Monthly Managed IT' },
          { id: crypto.randomUUID(), name: 'Structured Cabling Job', price: 350.00, tax:  0, description: 'SKU: SVC-CABLE-LG · Per floor installation' },
          { id: crypto.randomUUID(), name: 'Data Recovery Service', price: 250.00, tax:  0, description: 'SKU: SVC-DR-BASIC · HDD/SSD recovery' },
        ];
        setProducts(seededProducts);
        localStorage.setItem('products_list', JSON.stringify(seededProducts));
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
      window.dispatchEvent(new CustomEvent('ai-sync-data'));
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 lg:p-8 font-sans pb-32" style={{ backgroundColor: brand.surface }}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b pb-6" style={{ borderColor: brand.dark + '10' }}>
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: brand.dark }}>Products</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage your inventory and services</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border text-sm font-medium text-slate-700 bg-white placeholder:text-slate-400 focus:outline-none transition-all w-[240px]"
                style={{ borderColor: brand.dark + '20' }}
              />
            </div>
            
            <button
              onClick={onAddProductClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-sm hover:opacity-90"
              style={{ backgroundColor: brand.primary }}
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center flex flex-col items-center shadow-sm" style={{ borderColor: brand.dark + '10' }}>
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-300">
              <Box className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
              {searchQuery ? "We couldn't find any products matching your search criteria." : "Your inventory is currently empty. Start by adding your first product or service."}
            </p>
            {!searchQuery && (
              <button
                onClick={onAddProductClick}
                className="text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
                style={{ color: brand.primary, backgroundColor: `${brand.primary}15` }}
              >
                Add your first product
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full flex flex-col hover:-translate-y-1 transition-transform cursor-default group border-transparent hover:border-slate-200" style={{ boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)' }}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                        <Box className="w-5 h-5" style={{ color: brand.primary }} />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-bold text-slate-800 mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-2 h-8">{product.description || 'No description provided'}</p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-black text-slate-800">{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded text-xs font-bold text-slate-500">
                        <Percent className="w-3 h-3" />
                        {product.tax}% Tax
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
