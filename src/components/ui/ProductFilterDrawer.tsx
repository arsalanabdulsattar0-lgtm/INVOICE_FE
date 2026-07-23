import React from 'react';
import { FilterDrawer } from './FilterDrawer';
import { useTheme } from '../../context/ThemeContext';
import { ProductCategory, ProductSupplier } from '../../utils/productData';
import { Select } from './Select';
import { ComboBox } from './ComboBox';
import { Input } from './Input';

interface ProductFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  // Product ID range filters
  fromProductId: string;
  setFromProductId: (val: string) => void;
  toProductId: string;
  setToProductId: (val: string) => void;
  productCodes: string[];
  // Price Level
  priceOperator: string;
  setPriceOperator: (val: string) => void;
  priceValue: string;
  setPriceValue: (val: string) => void;
  // Inventory Level
  stockOperator: string;
  setStockOperator: (val: string) => void;
  stockValue: string;
  setStockValue: (val: string) => void;
  // Status
  selectedStatus: 'All' | 'Active' | 'LowStock';
  setSelectedStatus: (val: 'All' | 'Active' | 'LowStock') => void;
  // Supplier
  selectedSupplier: string;
  setSelectedSupplier: (val: string) => void;
}

export const ProductFilterDrawer: React.FC<ProductFilterDrawerProps> = ({
  isOpen,
  onClose,
  onReset,
  selectedCategory,
  setSelectedCategory,
  fromProductId,
  setFromProductId,
  toProductId,
  setToProductId,
  productCodes,
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

  // Local temporary states
  const [localCategory, setLocalCategory] = React.useState(selectedCategory);
  const [localFromProductId, setLocalFromProductId] = React.useState(fromProductId);
  const [localToProductId, setLocalToProductId] = React.useState(toProductId);
  const [localPriceOperator, setLocalPriceOperator] = React.useState(priceOperator);
  const [localPriceValue, setLocalPriceValue] = React.useState(priceValue);
  const [localStockOperator, setLocalStockOperator] = React.useState(stockOperator);
  const [localStockValue, setLocalStockValue] = React.useState(stockValue);
  const [localStatus, setLocalStatus] = React.useState(selectedStatus);
  const [localSupplier, setLocalSupplier] = React.useState(selectedSupplier);

  // Sync local states when the drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setLocalCategory(selectedCategory || 'All');
      setLocalFromProductId(fromProductId || 'All');
      setLocalToProductId(toProductId || 'All');
      setLocalPriceOperator(priceOperator || 'all');
      setLocalPriceValue(priceValue || '');
      setLocalStockOperator(stockOperator || 'all');
      setLocalStockValue(stockValue || '');
      setLocalStatus(selectedStatus || 'All');
      setLocalSupplier(selectedSupplier || 'all');
    }
  }, [isOpen, selectedCategory, fromProductId, toProductId, priceOperator, priceValue, stockOperator, stockValue, selectedStatus, selectedSupplier]);

  const handleApply = () => {
    setSelectedCategory(localCategory);
    setFromProductId(localFromProductId);
    setToProductId(localToProductId);
    setPriceOperator(localPriceOperator);
    setPriceValue(localPriceValue);
    setStockOperator(localStockOperator);
    setStockValue(localStockValue);
    setSelectedStatus(localStatus);
    setSelectedSupplier(localSupplier);
    onClose();
  };

  const handleResetClick = () => {
    setLocalCategory('All');
    setLocalFromProductId('All');
    setLocalToProductId('All');
    setLocalPriceOperator('all');
    setLocalPriceValue('');
    setLocalStockOperator('all');
    setLocalStockValue('');
    setLocalStatus('All');
    setLocalSupplier('all');
    onReset();
    onClose();
  };

  const productCodeOptions = [
    { id: 'All', name: 'All' },
    ...productCodes.map(code => ({ id: code, name: code }))
  ];

  return (
    <FilterDrawer
      isOpen={isOpen}
      onClose={onClose}
      onReset={handleResetClick}
      onApply={handleApply}
    >
      <div className="space-y-4">
        {/* Category Filter */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-black">Filter by Category</label>
          <div className="flex flex-wrap gap-1.5">
            {[{ id: 'All', name: 'All Categories' }, ...ProductCategory].map((cat: { id: string; name: string }) => {
              const isSelected = localCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setLocalCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer outline-none ${
                    isSelected
                      ? 'text-white font-medium'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  style={{
                    backgroundColor: isSelected ? brand.primary : undefined,
                    borderColor: isSelected ? brand.primary : undefined,
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product ID Range Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-black ml-1">Product ID Range</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-[9px] text-slate-400 ml-1 mb-0.5">From</span>
              <ComboBox
                variant="compact"
                value={localFromProductId}
                onChange={setLocalFromProductId}
                options={productCodeOptions}
                placeholder="From ID..."
              />
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 ml-1 mb-0.5">To</span>
              <ComboBox
                variant="compact"
                value={localToProductId}
                onChange={setLocalToProductId}
                options={productCodeOptions}
                placeholder="To ID..."
              />
            </div>
          </div>
        </div>

        {/* Price Level Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-black ml-1">Price Level</label>
          <div className="grid grid-cols-2 gap-3">
            <Select
              variant="compact"
              value={localPriceOperator}
              onChange={(e) => setLocalPriceOperator(e.target.value)}
              options={[
                { value: 'all', label: 'All' },
                { value: '=', label: 'Equals' },
                { value: '!=', label: 'Not Equals' },
                { value: '>', label: 'Greater Than' },
                { value: '<', label: 'Less Than' },
                { value: '>=', label: 'Greater or Equal' },
                { value: '<=', label: 'Less or Equal' },
              ]}
            />
            <Input
              variant="compact"
              type="number"
              placeholder="Price (Rs.)"
              value={localPriceValue}
              onChange={(e) => setLocalPriceValue(e.target.value)}
              disabled={localPriceOperator === 'all'}
            />
          </div>
        </div>

        {/* Inventory Level Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-black ml-1">Inventory Level</label>
          <div className="grid grid-cols-2 gap-3">
            <Select
              variant="compact"
              value={localStockOperator}
              onChange={(e) => setLocalStockOperator(e.target.value)}
              options={[
                { value: 'all', label: 'All' },
                { value: '=', label: 'Equals' },
                { value: '!=', label: 'Not Equals' },
                { value: '>', label: 'Greater Than' },
                { value: '<', label: 'Less Than' },
                { value: '>=', label: 'Greater or Equal' },
                { value: '<=', label: 'Less or Equal' },
              ]}
            />
            <Input
              variant="compact"
              type="number"
              placeholder="Quantity"
              value={localStockValue}
              onChange={(e) => setLocalStockValue(e.target.value)}
              disabled={localStockOperator === 'all'}
            />
          </div>
        </div>

        {/* Supplier Filter */}
        <Select
          variant="compact"
          label="Preferred Supplier"
          value={localSupplier}
          onChange={(e) => setLocalSupplier(e.target.value)}
          options={[
            { value: 'all', label: 'All Suppliers' },
            ...ProductSupplier.map(s => ({ value: s.id, label: s.name }))
          ]}
        />

        {/* Status Filter */}
        <Select
          variant="compact"
          label="Status"
          value={localStatus}
          onChange={(e) => setLocalStatus(e.target.value as any)}
          options={[
            { value: 'All', label: 'All Statuses' },
            { value: 'Active', label: 'Active' },
            { value: 'LowStock', label: 'Low Stock' },
          ]}
        />
      </div>
    </FilterDrawer>
  );
};
