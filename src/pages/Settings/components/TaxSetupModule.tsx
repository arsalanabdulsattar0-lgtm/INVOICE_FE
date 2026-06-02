import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Plus, Pencil, Trash2, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Toggle } from '../../../components/ui/Toggle';
import { ScrollArea } from '../../../components/ui/ScrollArea';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { FilterDrawer } from '../../../components/ui/FilterDrawer';
import { Modal } from '../../../components/ui/Modal';
import { useTheme } from '../../../context/ThemeContext';
import { seedTaxes, PROVINCES, TAX_TYPES } from '../../../utils/settingsData';

export interface TaxSetup {
  id: string;
  taxCode: string;
  taxType: string;
  taxRate: number;
  province: string;
  active: boolean;
}

interface TaxSetupModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

const emptyTax = (): Omit<TaxSetup, 'id'> => ({
  taxCode: '', taxType: 'GST', taxRate: 0, province: 'Punjab', active: true,
});

export const TaxSetupModule: React.FC<TaxSetupModuleProps> = ({ brand }) => {
  const [taxes, setTaxes] = useState<TaxSetup[]>(seedTaxes);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterProvince, setFilterProvince] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TaxSetup | null>(null);
  const [form, setForm] = useState<Omit<TaxSetup, 'id'>>(emptyTax());

  const filtered = taxes.filter(t => {
    const matchSearch = t.taxCode.toLowerCase().includes(search.toLowerCase()) || t.taxType.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || t.taxType === filterType;
    const matchProvince = filterProvince === 'all' || t.province === filterProvince;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? t.active : !t.active);
    return matchSearch && matchType && matchProvince && matchStatus;
  });

  const openAdd = () => { setEditing(null); setForm(emptyTax()); setShowForm(true); };
  const openEdit = (t: TaxSetup) => { setEditing(t); setForm({ taxCode: t.taxCode, taxType: t.taxType, taxRate: t.taxRate, province: t.province, active: t.active }); setShowForm(true); };

  const handleSave = () => {
    if (!form.taxCode.trim()) return;
    if (editing) {
      setTaxes(prev => prev.map(t => t.id === editing.id ? { ...editing, ...form } : t));
    } else {
      setTaxes(prev => [...prev, { id: `t${Date.now()}`, ...form }]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => setTaxes(prev => prev.filter(t => t.id !== id));

  const handleReset = () => { setFilterType('all'); setFilterProvince('all'); setFilterStatus('all'); };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-64">
          <Input
            variant="compact"
            icon={Search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by code or type..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="white" size="md" icon={SlidersHorizontal} onClick={() => setShowFilter(true)}>Filter</Button>
          <Button variant="primary" size="md" icon={Plus} onClick={openAdd} style={{ backgroundColor: brand.primary }}>Add Tax</Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: brand.dark + '10' }}>
        {/* Table header bar */}
        <div className="px-4 py-2.5 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <h3 className="text-[11px] font-black tracking-wide">Tax Configurations</h3>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: brand.soft, color: brand.dark }}>
              {filtered.length} records
            </span>
          </div>
        </div>

        <ScrollArea maxHeight="340px">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b" style={{ borderColor: brand.dark + '10' }}>
                {['Tax Code', 'Tax Type', 'Tax Rate (%)', 'Province', 'Status', 'Actions'].map((h, idx) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-left border-b ${idx !== 0 ? 'border-l border-slate-50' : ''} ${h === 'Actions' ? 'w-20 !px-2' : ''}`}
                    style={{ borderColor: brand.dark + '10' }}
                  >
                    <span className="text-[10px] font-black tracking-widest whitespace-nowrap" style={{ color: brand.dark }}>
                      {h}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-slate-400">No tax records found.</td>
                </tr>
              ) : filtered.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group border-b transition-colors hover:bg-slate-50/60 last:border-0"
                  style={{ borderColor: brand.dark + '08' }}
                >
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">{t.taxCode}</td>
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">{t.taxType}</td>
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">{t.taxRate}%</td>
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">{t.province}</td>
                  <td className="px-4 py-3 border-l border-slate-50">
                    {t.active
                      ? <ActiveChip label="Active" size="md" />
                      : <InactiveChip label="Inactive" size="md" />}
                  </td>
                  <td className="px-2 py-3 border-l border-slate-50 w-20">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="xs" icon={Pencil} title="Edit" className="!px-1" onClick={() => openEdit(t)} />
                      <Button variant="ghost" size="xs" icon={Trash2} title="Delete" className="!px-1 !text-red-500" onClick={() => handleDelete(t.id)} />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Tax Setup' : 'Add Tax Setup'}
        size="lg"
        footer={
          <>
            <Button variant="white" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" size="md" icon={Check} onClick={handleSave} style={{ backgroundColor: brand.primary }}>
              {editing ? 'Update Tax' : 'Save Tax'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Tax Code *"
            variant="compact"
            placeholder="e.g. GST-17"
            value={form.taxCode}
            onChange={e => setForm({ ...form, taxCode: e.target.value })}
          />
          <Select
            label="Tax Type"
            variant="compact"
            value={form.taxType}
            onChange={e => setForm({ ...form, taxType: e.target.value })}
            options={TAX_TYPES.map(t => ({ value: t, label: t }))}
          />
          <Input
            label="Tax Rate (%)"
            variant="compact"
            type="number"
            placeholder="0"
            value={form.taxRate === 0 ? '' : String(form.taxRate)}
            onChange={e => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
          />
          <Select
            label="Province"
            variant="compact"
            value={form.province}
            onChange={e => setForm({ ...form, province: e.target.value })}
            options={PROVINCES.map(p => ({ value: p, label: p }))}
          />
          <div className="col-span-2 flex items-center gap-3 pt-4">
            <Toggle
              checked={form.active}
              onChange={val => setForm({ ...form, active: val })}
              label="Active"
            />
          </div>
        </div>
      </Modal>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onReset={handleReset}
        onApply={() => setShowFilter(false)}
        title="Filter Taxes"
      >
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Tax type</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
            {['all', ...TAX_TYPES].map(opt => (
              <button
                key={opt}
                onClick={() => setFilterType(opt)}
                className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer ${filterType === opt ? 'bg-white shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-800 bg-transparent border border-transparent'}`}
                style={{ color: filterType === opt ? brand.primary : undefined }}
              >
                {opt === 'all' ? 'All' : opt}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Province</label>
          <Select
            variant="compact"
            value={filterProvince}
            onChange={e => setFilterProvince(e.target.value)}
            options={[{ value: 'all', label: 'All provinces' }, ...PROVINCES.map(p => ({ value: p, label: p }))]}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Status</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
            {[{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'inactive', label: 'Inactive' }].map(opt => (
              <button
                key={opt.key}
                onClick={() => setFilterStatus(opt.key)}
                className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer ${filterStatus === opt.key ? 'bg-white shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-800 bg-transparent border border-transparent'}`}
                style={{ color: filterStatus === opt.key ? brand.primary : undefined }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </FilterDrawer>
    </div>
  );
};
