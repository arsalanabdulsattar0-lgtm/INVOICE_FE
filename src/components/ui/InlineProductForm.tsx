import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Box, Tag, DollarSign, Percent, Save } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { Product } from '../../pages/Products/ProductList';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Product>;
}

const InlineProductForm: React.FC<Props> = ({ isOpen, onClose, initialData }) => {
  const { brand } = useTheme();
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    tax: 0,
    description: ''
  });

  // Reset or populate form when it opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData?.name || '',
        price: initialData?.price || 0,
        tax: initialData?.tax || 0,
        description: initialData?.description || ''
      });
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    if (!formData.name) {
      alert("Product name is required");
      return;
    }

    try {
      const stored = localStorage.getItem('products_list');
      const products: Product[] = stored ? JSON.parse(stored) : [];
      
      const newProduct: Product = {
        id: initialData?.id || crypto.randomUUID(),
        name: formData.name,
        price: formData.price || 0,
        tax: formData.tax || 0,
        description: formData.description || ''
      };

      if (initialData?.id) {
        // Update existing
        const index = products.findIndex(p => p.id === initialData.id);
        if (index > -1) products[index] = newProduct;
        else products.push(newProduct);
      } else {
        products.push(newProduct);
      }

      localStorage.setItem('products_list', JSON.stringify(products));
      window.dispatchEvent(new CustomEvent('ai-sync-data'));
      onClose();
    } catch (e) {
      console.error(e);
      alert("Failed to save product.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Glass Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] bg-slate-900/10 backdrop-blur-[2px]"
            onClick={onClose}
          />
          
          {/* Floating Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[120] w-[400px] max-w-[90vw] bg-white/80 backdrop-blur-xl border shadow-2xl rounded-2xl overflow-hidden"
            style={{ borderColor: brand.dark + '20' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/50 border border-slate-100">
                  <Box className="w-4 h-4" style={{ color: brand.primary }} />
                </div>
                <h3 className="text-sm font-black text-slate-800">
                  {initialData?.id ? 'Edit Product' : 'Add Product'}
                </h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Product Name</label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Logic Board Pro"
                    className="w-full bg-white/50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-slate-800 focus:outline-none transition-all placeholder:text-slate-300"
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Price</label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      placeholder="0.00"
                      className="w-full bg-white/50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-slate-800 focus:outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Tax */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Tax Rate</label>
                  <div className="relative">
                    <Percent className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      value={formData.tax || ''}
                      onChange={(e) => setFormData({...formData, tax: parseFloat(e.target.value)})}
                      placeholder="0"
                      className="w-full bg-white/50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-slate-800 focus:outline-none transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Additional details..."
                  className="w-full bg-white/50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none transition-all placeholder:text-slate-300 resize-none h-20"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200/50 flex justify-end gap-2 bg-slate-50/50">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-200/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:opacity-90 hover:scale-105 active:scale-95"
                style={{ backgroundColor: brand.primary }}
              >
                <Save className="w-3.5 h-3.5" />
                {initialData?.id ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InlineProductForm;
