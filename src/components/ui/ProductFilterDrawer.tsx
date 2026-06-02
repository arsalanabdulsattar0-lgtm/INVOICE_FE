import React from 'react';
import { FilterDrawer } from './FilterDrawer';
import { Input, Select, ComboBox } from './FormControls';
import { useTheme } from '../../context/ThemeContext';
import { ProductCategory, ProductSupplier } from '../../utils/productData';

interface ProductFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  priceOperator: string;
  setPriceOperator: (val: string) => void;
  priceValue: string;
  setPriceValue: (val: string) => void;
  stockOperator: string;
  setStockOperator: (val: string) => void;
  stockValue: string;
  setStockValue: (val: string) => void;
  selectedStatus: 'All' | 'Active' | 'Inactive';
  setSelectedStatus: (val: 'All' | 'Active' | 'Inactive') => void;
  selectedSupplier: string;
  setSelectedSupplier: (val: string) => void;
}

export const ProductFilterDrawer: React.FC<ProductFilterDrawerProps> = ({
  isOpen,
  onClose,
  onReset,
  selectedCategory,
  setSelectedCategory,
  priceOperator,
  setPriceOperator,
  priceValue,
  setPriceValue,
  stockOperator,
  setStockOperator,
  stockValue,
  setStockValue,
  selectedStatus,
  setSelectedStatus,
  selectedSupplier,
  setSelectedSupplier,
}) => {
  const { brand } = useTheme();

  return (
    <FilterDrawer
      isOpen={isOpen}
      onClose={onClose}
      onReset={onReset}
      onApply={onClose}
    >
      {/* Category Filter */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-black">Filter by Category</label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer outline-none ${
              selectedCategory === 'all'
                ? 'text-white font-medium'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            style={{
              backgroundColor: selectedCategory === 'all' ? brand.primary : undefined,
              borderColor: selectedCategory === 'all' ? brand.primary : undefined,
            }}
          >
            All
          </button>
          {ProductCategory.map((cat: { id: string; name: string }) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer outline-none ${
                selectedCategory === cat.id
                  ? 'text-white font-medium'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              style={{
                backgroundColor: selectedCategory === cat.id ? brand.primary : undefined,
                borderColor: selectedCategory === cat.id ? brand.primary : undefined,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500">Filter by Price</label>
        <div className="flex gap-2">
          <Select
            variant="compact"
            value={priceOperator}
            onChange={(e) => setPriceOperator(e.target.value)}
            options={[
              { value: 'all', label: 'Any' },
              { value: '=',   label: '= Equal' },
              { value: '!=',  label: '≠ Not equal' },
              { value: '<',   label: '< Less than' },
              { value: '>',   label: '> Greater than' },
              { value: '<=',  label: '≤ Less or equal' },
              { value: '>=',  label: '≥ Greater or equal' },
            ]}
          />
          <Input
            variant="compact"
            type="number"
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value)}
            placeholder="0.00"
            disabled={priceOperator === 'all'}
          />
        </div>
      </div>

      {/* Inventory Level Filter */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500">Filter by Inventory Level</label>
        <div className="flex gap-2">
          <Select
            variant="compact"
            value={stockOperator}
            onChange={(e) => setStockOperator(e.target.value)}
            options={[
              { value: 'all', label: 'Any' },
              { value: '=',   label: '= Equal' },
              { value: '!=',  label: '≠ Not equal' },
              { value: '<',   label: '< Less than' },
              { value: '>',   label: '> Greater than' },
              { value: '<=',  label: '≤ Less or equal' },
              { value: '>=',  label: '≥ Greater or equal' },
            ]}
          />
          <Input
            variant="compact"
            type="number"
            value={stockValue}
            onChange={(e) => setStockValue(e.target.value)}
            placeholder="0"
            disabled={stockOperator === 'all'}
          />
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500">Filter by Status</label>
        <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
          {[
            { key: 'All', label: 'All' },
            { key: 'Active', label: 'Active' },
            { key: 'Inactive', label: 'Inactive' },
          ].map((opt) => {
            const isActive = selectedStatus === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setSelectedStatus(opt.key as any)}
                className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer outline-none ${
                  isActive
                    ? 'bg-white shadow-xs border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent border border-transparent'
                }`}
                style={{ color: isActive ? brand.primary : undefined }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Supplier Filter */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500">Preferred Supplier</label>
        <ComboBox
          value={selectedSupplier}
          onChange={(val) => setSelectedSupplier(val)}
          options={[
            { id: 'all', name: 'All Suppliers' },
            ...ProductSupplier,
          ]}
          placeholder="Select Supplier"
          variant="compact"
        />
      </div>
    </FilterDrawer>
  );
};
