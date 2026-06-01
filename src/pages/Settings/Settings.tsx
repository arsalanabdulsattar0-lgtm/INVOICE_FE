import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Bell, Shield, CreditCard, Palette, Globe, Check, Sun,
  Receipt, Users, Plus, Pencil, Trash2, Search, SlidersHorizontal,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import type { ThemeType } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Toggle } from '../../components/ui/Toggle';
import { ScrollArea } from '../../components/ui/ScrollArea';
import { ActiveChip, InactiveChip } from '../../components/ui/Chip';
import { FilterDrawer } from '../../components/ui/FilterDrawer';
import { Modal } from '../../components/ui/Modal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaxSetup {
  id: string;
  taxCode: string;
  taxType: string;
  taxRate: number;
  province: string;
  active: boolean;
}

interface SalesPerson {
  id: string;
  name: string;
  user: string;
  targetAmount: number;
  targetQuantity: number;
  commissionPercent: number;
  commissionAmount: number;
  active: boolean;
  createdDate: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const seedTaxes: TaxSetup[] = [
  { id: 't1', taxCode: 'GST-17',   taxType: 'GST',    taxRate: 17, province: 'Punjab',    active: true  },
  { id: 't2', taxCode: 'SST-16',   taxType: 'SST',    taxRate: 16, province: 'Sindh',     active: true  },
  { id: 't3', taxCode: 'WHT-10',   taxType: 'WHT',    taxRate: 10, province: 'KPK',       active: false },
  { id: 't4', taxCode: 'FED-5',    taxType: 'FED',    taxRate: 5,  province: 'Federal',   active: true  },
];

const seedSalespeople: SalesPerson[] = [
  { id: 's1', name: 'Ahmed Raza',    user: 'ahmed.raza',    targetAmount: 500000, targetQuantity: 200, commissionPercent: 3,   commissionAmount: 15000, active: true,  createdDate: '2026-01-15' },
  { id: 's2', name: 'Sara Malik',    user: 'sara.malik',    targetAmount: 350000, targetQuantity: 150, commissionPercent: 2.5, commissionAmount: 8750,  active: true,  createdDate: '2026-02-01' },
  { id: 's3', name: 'Usman Tariq',   user: 'usman.tariq',   targetAmount: 200000, targetQuantity: 80,  commissionPercent: 2,   commissionAmount: 4000,  active: false, createdDate: '2026-03-10' },
];

const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Federal', 'AJK', 'GB'];
const TAX_TYPES  = ['GST', 'SST', 'WHT', 'FED', 'Excise', 'Other'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emptyTax = (): Omit<TaxSetup, 'id'> => ({
  taxCode: '', taxType: 'GST', taxRate: 0, province: 'Punjab', active: true,
});

const emptySP = (): Omit<SalesPerson, 'id'> => ({
  name: '', user: '', targetAmount: 0, targetQuantity: 0,
  commissionPercent: 0, commissionAmount: 0, active: true,
  createdDate: new Date().toISOString().split('T')[0],
});

// ─── Tax Setup Module ─────────────────────────────────────────────────────────

const TaxSetupModule: React.FC<{ brand: ReturnType<typeof useTheme>['brand'] }> = ({ brand }) => {
  const [taxes, setTaxes]                   = useState<TaxSetup[]>(seedTaxes);
  const [search, setSearch]                 = useState('');
  const [showFilter, setShowFilter]         = useState(false);
  const [filterType, setFilterType]         = useState('all');
  const [filterProvince, setFilterProvince] = useState('all');
  const [filterStatus, setFilterStatus]     = useState('all');
  const [showForm, setShowForm]             = useState(false);
  const [editing, setEditing]               = useState<TaxSetup | null>(null);
  const [form, setForm]                     = useState<Omit<TaxSetup, 'id'>>(emptyTax());

  const filtered = taxes.filter(t => {
    const matchSearch   = t.taxCode.toLowerCase().includes(search.toLowerCase()) || t.taxType.toLowerCase().includes(search.toLowerCase());
    const matchType     = filterType     === 'all' || t.taxType     === filterType;
    const matchProvince = filterProvince === 'all' || t.province    === filterProvince;
    const matchStatus   = filterStatus   === 'all' || (filterStatus === 'active' ? t.active : !t.active);
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
                      <Button variant="ghost" size="xs" icon={Trash2} title="Delete" className="!px-1 text-red-500" onClick={() => handleDelete(t.id)} />
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

// ─── Sales Person Module ──────────────────────────────────────────────────────

const SalesPersonModule: React.FC<{ brand: ReturnType<typeof useTheme>['brand'] }> = ({ brand }) => {
  const [people, setPeople]                 = useState<SalesPerson[]>(seedSalespeople);
  const [search, setSearch]                 = useState('');
  const [showFilter, setShowFilter]         = useState(false);
  const [filterStatus, setFilterStatus]     = useState('all');
  const [showForm, setShowForm]             = useState(false);
  const [editing, setEditing]               = useState<SalesPerson | null>(null);
  const [form, setForm]                     = useState<Omit<SalesPerson, 'id'>>(emptySP());

  const filtered = people.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.user.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? p.active : !p.active);
    return matchSearch && matchStatus;
  });

  const openAdd  = () => { setEditing(null); setForm(emptySP()); setShowForm(true); };
  const openEdit = (p: SalesPerson) => {
    setEditing(p);
    setForm({ name: p.name, user: p.user, targetAmount: p.targetAmount, targetQuantity: p.targetQuantity, commissionPercent: p.commissionPercent, commissionAmount: p.commissionAmount, active: p.active, createdDate: p.createdDate });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setPeople(prev => prev.map(p => p.id === editing.id ? { ...editing, ...form } : p));
    } else {
      setPeople(prev => [...prev, { id: `s${Date.now()}`, ...form }]);
    }
    setShowForm(false);
  };

  const handleToggleActive = (id: string) =>
    setPeople(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));

  const handleDelete = (id: string) =>
    setPeople(prev => prev.filter(p => p.id !== id));

  const handleReset = () => setFilterStatus('all');

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
            placeholder="Search by name or user..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="white" size="md" icon={SlidersHorizontal} onClick={() => setShowFilter(true)}>Filter</Button>
          <Button variant="primary" size="md" icon={Plus} onClick={openAdd} style={{ backgroundColor: brand.primary }}>Add Salesperson</Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: brand.dark + '10' }}>
        {/* Table header bar */}
        <div className="px-4 py-2.5 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <h3 className="text-[11px] font-black tracking-wide">Sales Person</h3>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: brand.soft, color: brand.dark }}>
              {filtered.length} members
            </span>
          </div>
        </div>

        <ScrollArea maxHeight="340px">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b" style={{ borderColor: brand.dark + '10' }}>
                {[
                  { label: 'Sales Person Name', w: '' },
                  { label: 'User',              w: '' },
                  { label: 'Target Amt (Rs.)',  w: '' },
                  { label: 'Target Qty',        w: '' },
                  { label: 'Commission %',      w: '' },
                  { label: 'Commission Amt (Rs.)', w: '' },
                  { label: 'Status',            w: '' },
                  { label: 'Created Date',      w: '' },
                  { label: 'Actions',           w: 'w-20' },
                ].map((h, idx) => (
                  <th
                    key={h.label}
                    className={`px-4 py-3 text-left border-b ${idx !== 0 ? 'border-l border-slate-50' : ''} ${h.w} ${h.label === 'Actions' ? '!px-2' : ''}`}
                    style={{ borderColor: brand.dark + '10' }}
                  >
                    <span className="text-[10px] font-black tracking-widest whitespace-nowrap" style={{ color: brand.dark }}>
                      {h.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[12px] text-slate-400">No salespeople found.</td>
                </tr>
              ) : filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group border-b transition-colors hover:bg-slate-50/60 last:border-0"
                  style={{ borderColor: brand.dark + '08' }}
                >
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">{p.name}</td>
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">{p.user}</td>
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">{p.targetAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">{p.targetQuantity}</td>
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">{p.commissionPercent}%</td>
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-600">{p.commissionAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 border-l border-slate-50">
                    {p.active
                      ? <ActiveChip label="Active"   size="md" onClick={() => handleToggleActive(p.id)} />
                      : <InactiveChip label="Inactive" size="md" onClick={() => handleToggleActive(p.id)} />}
                  </td>
                  <td className="px-4 py-3 border-l border-slate-50 text-[12px] font-normal text-slate-500 whitespace-nowrap">
                    {p.createdDate}
                  </td>
                  <td className="px-2 py-3 border-l border-slate-50 w-20">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="xs" icon={Pencil} title="Edit" className="!px-1" onClick={() => openEdit(p)} />
                      <Button
                        variant="ghost" size="xs"
                        icon={Trash2}
                        title="Delete"
                        className="!px-1 text-red-500"
                        onClick={() => handleDelete(p.id)}
                      />
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
        title={editing ? 'Edit Salesperson' : 'Add Salesperson'}
        size="lg"
        footer={
          <>
            <Button variant="white" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" size="md" icon={Check} onClick={handleSave} style={{ backgroundColor: brand.primary }}>
              {editing ? 'Update Salesperson' : 'Save Salesperson'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Sales Person Name *"
            variant="compact"
            placeholder="e.g. Ahmed Raza"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="User (login)"
            variant="compact"
            placeholder="e.g. ahmed.raza"
            value={form.user}
            onChange={e => setForm({ ...form, user: e.target.value })}
          />
          <Input
            label="Target Amount (Rs.)"
            variant="compact"
            type="number"
            placeholder="0"
            value={form.targetAmount === 0 ? '' : String(form.targetAmount)}
            onChange={e => setForm({ ...form, targetAmount: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Target Quantity"
            variant="compact"
            type="number"
            placeholder="0"
            value={form.targetQuantity === 0 ? '' : String(form.targetQuantity)}
            onChange={e => setForm({ ...form, targetQuantity: parseInt(e.target.value) || 0 })}
          />
          <Input
            label="Commission Percent (%)"
            variant="compact"
            type="number"
            placeholder="0"
            value={form.commissionPercent === 0 ? '' : String(form.commissionPercent)}
            onChange={e => setForm({ ...form, commissionPercent: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Commission Amount (Rs.)"
            variant="compact"
            type="number"
            placeholder="0"
            value={form.commissionAmount === 0 ? '' : String(form.commissionAmount)}
            onChange={e => setForm({ ...form, commissionAmount: parseFloat(e.target.value) || 0 })}
          />
          <Input
            label="Created Date"
            variant="compact"
            type="date"
            value={form.createdDate}
            onChange={e => setForm({ ...form, createdDate: e.target.value })}
          />
          <div className="flex items-center gap-3 pt-4 col-span-2">
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
        title="Filter Sales Person"
      >
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

// ─── Main Settings component ──────────────────────────────────────────────────

const Settings: React.FC = () => {
  const { theme: activeTheme, setTheme, brand } = useTheme();
  const [activeSection, setActiveSection] = useState<string | null>('appearance');

  const sections = [
    { id: 'profile',       title: 'Profile Settings',     desc: 'Manage your public profile and avatar.',              icon: User      },
    { id: 'notifications', title: 'Notifications',        desc: 'Configure how you receive alerts.',                   icon: Bell      },
    { id: 'security',      title: 'Security',             desc: 'Update password and 2FA settings.',                   icon: Shield    },
    { id: 'billing',       title: 'Billing & Plans',      desc: 'Manage your subscription and payment methods.',       icon: CreditCard },
    { id: 'appearance',    title: 'Appearance',           desc: 'Customize the look and feel of the app.',             icon: Palette   },
    { id: 'regional',      title: 'Regional & Language',  desc: 'Set your preferred currency and time zone.',          icon: Globe     },
    { id: 'tax',           title: 'Tax Setup',            desc: 'Manage tax codes, types, rates, and provinces.',      icon: Receipt   },
    { id: 'sales',         title: 'Sales Person',         desc: 'Manage salespersons, targets, and commissions.',      icon: Users     },
  ];

  const toggle = (id: string) =>
    setActiveSection(prev => (prev === id ? null : id));

  const lightThemes: { id: ThemeType; name: string; desc: string; colors: string[] }[] = [
    { id: 'sky',      name: 'Sky Blue',        desc: 'Crisp sky blue & refreshing aqua tones',       colors: ['#0EA5E9', '#BAE6FD', '#F97316'] },
    { id: 'violet',   name: 'Soft Violet',     desc: 'Elegant violet & dreamy soft purple',          colors: ['#7C3AED', '#DDD6FE', '#F59E0B'] },
    { id: 'mint',     name: 'Mint Fresh',      desc: 'Cool mint & soothing seafoam green',           colors: ['#14B8A6', '#99F6E4', '#F43F5E'] },
    { id: 'peach',    name: 'Peach Blossom',   desc: 'Warm peach & soft blush tones',               colors: ['#FB7185', '#FECDD3', '#38BDF8'] },
    { id: 'lavender', name: 'Lavender Dream',  desc: 'Soft lavender & delicate lilac hues',         colors: ['#A855F7', '#E9D5FF', '#34D399'] },
    { id: 'gold',     name: 'Golden Hour',     desc: 'Warm gold & rich amber warmth',               colors: ['#D97706', '#FDE68A', '#0EA5E9'] },
    { id: 'teal',     name: 'Teal Serenity',   desc: 'Deep teal & calm ocean-inspired palette',     colors: ['#0D9488', '#CCFBF1', '#F59E0B'] },
  ];

  const ThemeCard = ({ opt, isSelected }: { opt: { id: ThemeType; name: string; desc: string; colors: string[] }; isSelected: boolean }) => (
    <motion.button
      key={opt.id}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setTheme(opt.id)}
      className="text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden"
      style={{
        height: 120,
        backgroundColor: isSelected ? brand.surface : '#FAFAFA',
        borderColor: isSelected ? brand.primary : '#E2E8F0',
        borderWidth: isSelected ? 2 : 1,
        boxShadow: isSelected ? `0 0 0 3px ${brand.primary}20, 0 4px 16px ${brand.primary}15` : '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: brand.primary }}
        >
          <Check className="w-3 h-3 stroke-[3]" />
        </motion.div>
      )}
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-20" style={{ backgroundColor: opt.colors[0] }} />
      <div className="relative z-10">
        <h4 className="text-xs font-bold text-slate-800">{opt.name}</h4>
        <p className="text-[10px] text-slate-400 mt-0.5 pr-5 leading-relaxed line-clamp-2">{opt.desc}</p>
      </div>
      <div className="flex gap-1.5 items-center mt-2 relative z-10">
        {opt.colors.map((c, idx) => (
          <div key={idx} className="rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c, width: idx === 0 ? 18 : 12, height: idx === 0 ? 18 : 12 }} />
        ))}
        <span className="text-[9px] font-semibold ml-1" style={{ color: opt.colors[0] }}>{isSelected ? '● Active' : ''}</span>
      </div>
    </motion.button>
  );

  return (
    <div className="p-4 space-y-6" style={{ backgroundColor: brand.mainBg, minHeight: '100%' }}>

      {/* Settings Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-3xl border shadow-sm transition-colors duration-300"
        style={{ backgroundColor: brand.cardBg, borderColor: brand.border }}
      >
        <h2 className="text-xl font-bold transition-colors duration-300" style={{ color: brand.textPrimary }}>Settings</h2>
        <p className="text-xs mt-1 transition-colors duration-300" style={{ color: brand.textSecondary }}>
          Configure your account preferences and application settings.
        </p>
      </motion.div>

      {/* Grid of section cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, i) => {
          const isActive = activeSection === section.id;
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggle(section.id)}
              className="flex items-center gap-6 p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all cursor-pointer group"
              style={{
                backgroundColor: brand.cardBg,
                borderColor: isActive ? brand.primary : brand.border,
                boxShadow: isActive ? `0 0 0 2px ${brand.primary}20` : undefined,
              }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  backgroundColor: isActive ? brand.primary : brand.surface,
                  color: isActive ? '#FFFFFF' : brand.textSecondary,
                }}
              >
                <section.icon className="w-6 h-6" />
              </div>
              <div className="flex-grow">
                <h3 className="text-sm font-bold transition-colors" style={{ color: isActive ? brand.primary : brand.textPrimary }}>
                  {section.title}
                </h3>
                <p className="text-xs mt-1" style={{ color: brand.textSecondary }}>{section.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Appearance Panel ── */}
      <AnimatePresence>
        {activeSection === 'appearance' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="rounded-3xl border shadow-sm overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: brand.cardBg, borderColor: brand.border }}
          >
            <div className="px-6 py-5 border-b" style={{ borderColor: brand.border, background: `linear-gradient(135deg, ${brand.surface}, ${brand.cardBg})` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: brand.primary }}>
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: brand.textPrimary }}>Theme & Branding Selector</h3>
                  <p className="text-xs mt-0.5" style={{ color: brand.textSecondary }}>Select a palette to instantly style the entire application.</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sun className="w-3.5 h-3.5" style={{ color: brand.primary }} />
                  <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: brand.textSecondary }}>Color Themes</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {lightThemes.map(opt => <ThemeCard key={opt.id} opt={opt} isSelected={activeTheme === opt.id} />)}
                </div>
              </div>
              <motion.div
                key={activeTheme}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: `linear-gradient(135deg, ${brand.primary}18, ${brand.soft}40)`, border: `1px solid ${brand.primary}30` }}
              >
                <div className="w-10 h-10 rounded-xl flex-shrink-0 shadow-md" style={{ backgroundColor: brand.primary }} />
                <div>
                  <p className="text-xs font-bold" style={{ color: brand.textPrimary }}>Active Theme Applied ✓</p>
                  <p className="text-[11px] mt-0.5" style={{ color: brand.textSecondary }}>
                    Primary: <strong>{brand.primary}</strong> &nbsp;·&nbsp; Surface: <strong>{brand.surface}</strong>
                  </p>
                </div>
                <div className="flex gap-1.5 ml-auto">
                  {[brand.primary, brand.accent, brand.soft].map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white shadow" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Tax Setup Panel ── */}
      <AnimatePresence>
        {activeSection === 'tax' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="rounded-3xl border shadow-sm overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: brand.cardBg, borderColor: brand.border }}
          >
            {/* Panel header */}
            <div className="px-6 py-5 border-b" style={{ borderColor: brand.border, background: `linear-gradient(135deg,${brand.surface},${brand.cardBg})` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: brand.primary }}>
                  <Receipt className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: brand.textPrimary }}>Tax Setup</h3>
                  <p className="text-xs mt-0.5" style={{ color: brand.textSecondary }}>Configure tax codes, types, rates, and provinces.</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <TaxSetupModule brand={brand} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sales Person Panel ── */}
      <AnimatePresence>
        {activeSection === 'sales' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="rounded-3xl border shadow-sm overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: brand.cardBg, borderColor: brand.border }}
          >
            {/* Panel header */}
            <div className="px-6 py-5 border-b" style={{ borderColor: brand.border, background: `linear-gradient(135deg,${brand.surface},${brand.cardBg})` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: brand.primary }}>
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: brand.textPrimary }}>Sales Person</h3>
                  <p className="text-xs mt-0.5" style={{ color: brand.textSecondary }}>Manage salespersons, targets, and commission structures.</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <SalesPersonModule brand={brand} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Settings;
