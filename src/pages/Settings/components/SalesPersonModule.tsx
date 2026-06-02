import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Plus, Pencil, Trash2, Check, Eye, User, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Toggle, ScrollArea } from '../../../components/ui/FormControls';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { FilterDrawer } from '../../../components/ui/FilterDrawer';
import { Modal } from '../../../components/ui/Modal';
import Card from '../../../components/ui/Card';
import { useTheme } from '../../../context/ThemeContext';
import { seedSalespeople } from '../../../utils/settingsData';

export interface SalesPerson {
  id: string;
  name: string;
  targetAmount: number;
  targetQuantity: number;
  commissionPercent: number;
  commissionAmount: number;
  active: boolean;
  createdDate: string;
  contact: string;
  address1: string;
  address2: string;
  city: string;
  telephone1: string;
  telephone2: string;
  fax: string;
  email: string;
  commission?: number;
  MTarget?: number;
  JanT?: number;
  FebT?: number;
  MarchT?: number;
  AprilT?: number;
  MayT?: number;
  JuneT?: number;
  JulyT?: number;
  AugT?: number;
  SeptT?: number;
  OctT?: number;
  NovT?: number;
  DecT?: number;
  SPUserName?: string;
  MtargetQty?: number;
}

interface SalesPersonModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

const emptySP = (): Omit<SalesPerson, 'id'> => ({
  name: '',
  targetAmount: 0,
  targetQuantity: 0,
  commissionPercent: 0,
  commissionAmount: 0,
  active: true,
  createdDate: new Date().toISOString().split('T')[0],
  contact: '',
  address1: '',
  address2: '',
  city: '',
  telephone1: '',
  telephone2: '',
  fax: '',
  email: '',
  commission: 0,
  MTarget: 0,
  JanT: 0,
  FebT: 0,
  MarchT: 0,
  AprilT: 0,
  MayT: 0,
  JuneT: 0,
  JulyT: 0,
  AugT: 0,
  SeptT: 0,
  OctT: 0,
  NovT: 0,
  DecT: 0,
  SPUserName: '',
  MtargetQty: 0,
});

export const SalesPersonModule: React.FC<SalesPersonModuleProps> = ({ brand }) => {
  const [people, setPeople] = useState<SalesPerson[]>(seedSalespeople);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SalesPerson | null>(null);
  const [form, setForm] = useState<Omit<SalesPerson, 'id'>>(emptySP());
  const [viewingTarget, setViewingTarget] = useState<SalesPerson | null>(null);

  const filtered = people.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === 'all' || (filterStatus === 'active' ? p.active : !p.active);
    return matchSearch && matchStatus;
  });

  const openAdd = () => {
    setEditing(null);
    setForm(emptySP());
    setShowForm(true);
  };

  const openEdit = (p: SalesPerson) => {
    setEditing(p);
    setForm({
      name: p.name,
      targetAmount: p.targetAmount,
      targetQuantity: p.targetQuantity,
      commissionPercent: p.commissionPercent,
      commissionAmount: p.commissionAmount,
      active: p.active,
      createdDate: p.createdDate,
      contact: p.contact || '',
      address1: p.address1 || '',
      address2: p.address2 || '',
      city: p.city || '',
      telephone1: p.telephone1 || '',
      telephone2: p.telephone2 || '',
      fax: p.fax || '',
      email: p.email || '',
      commission: p.commission ?? p.commissionPercent ?? 0,
      MTarget: p.MTarget ?? p.targetAmount ?? 0,
      JanT: p.JanT ?? 0,
      FebT: p.FebT ?? 0,
      MarchT: p.MarchT ?? 0,
      AprilT: p.AprilT ?? 0,
      MayT: p.MayT ?? 0,
      JuneT: p.JuneT ?? 0,
      JulyT: p.JulyT ?? 0,
      AugT: p.AugT ?? 0,
      SeptT: p.SeptT ?? 0,
      OctT: p.OctT ?? 0,
      NovT: p.NovT ?? 0,
      DecT: p.DecT ?? 0,
      SPUserName: p.SPUserName ?? '',
      MtargetQty: p.MtargetQty ?? p.targetQuantity ?? 0,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const finalForm = {
      ...form,
      commissionPercent: form.commission ?? form.commissionPercent,
      targetAmount: form.MTarget ?? form.targetAmount,
      targetQuantity: form.MtargetQty ?? form.targetQuantity,
      commissionAmount:
        (form.MTarget ?? form.targetAmount) *
        ((form.commission ?? form.commissionPercent) / 100),
    };
    if (editing) {
      setPeople(prev =>
        prev.map(p => (p.id === editing.id ? { ...editing, ...finalForm } : p))
      );
    } else {
      setPeople(prev => [...prev, { id: `s${Date.now()}`, ...finalForm }]);
    }
    setShowForm(false);
  };

  const handleToggleActive = (id: string) =>
    setPeople(prev => prev.map(p => (p.id === id ? { ...p, active: !p.active } : p)));

  const handleDelete = (id: string) =>
    setPeople(prev => prev.filter(p => p.id !== id));

  const handleReset = () => setFilterStatus('all');

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-64">
          <Input
            variant="compact"
            icon={Search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="white" size="md" icon={SlidersHorizontal} onClick={() => setShowFilter(true)}>
            Filter
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={openAdd}
            style={{ backgroundColor: brand.primary }}
          >
            Add salesperson
          </Button>
        </div>
      </div>

      {/* Salesperson list table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border shadow-sm overflow-hidden"
        style={{ borderColor: brand.dark + '10' }}
      >
        {/* Table header bar */}
        <div
          className="px-4 py-2.5 flex items-center justify-between text-white"
          style={{ backgroundColor: brand.primary }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <h3 className="text-[11px] font-black tracking-wide">Salesperson list</h3>
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: brand.soft, color: brand.dark }}
            >
              {filtered.length} members
            </span>
          </div>
        </div>

        <ScrollArea maxHeight="260px">
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse min-w-[860px]">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b" style={{ borderColor: brand.dark + '10' }}>
                  {[
                    { label: 'Name', w: 'min-w-[120px]' },
                    { label: 'Contact', w: 'min-w-[100px]' },
                    { label: 'Address 1', w: 'min-w-[120px]' },
                    { label: 'Telephone 1', w: 'min-w-[100px]' },
                    { label: 'Email', w: 'min-w-[130px]' },
                    { label: 'Status', w: 'min-w-[80px]' },
                    { label: 'Created date', w: 'min-w-[90px]' },
                    { label: 'Actions', w: 'w-20' },
                  ].map((h, idx) => (
                    <th
                      key={h.label}
                      className={`px-2 py-2 text-left border-b ${idx !== 0 ? 'border-l border-slate-50' : ''} ${h.w} ${h.label === 'Actions' ? '!px-2' : ''}`}
                      style={{ borderColor: brand.dark + '10' }}
                    >
                      <span
                        className="text-[10px] font-black tracking-widest whitespace-nowrap"
                        style={{ color: brand.dark }}
                      >
                        {h.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-[12px] text-slate-400"
                    >
                      No salespeople found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group border-b transition-colors hover:bg-slate-50/60 last:border-0"
                      style={{ borderColor: brand.dark + '08' }}
                    >
                      <td className="px-2 py-2 border-l border-slate-50 text-[12px] font-normal text-slate-600">
                        {p.name}
                      </td>
                      <td className="px-2 py-2 border-l border-slate-50 text-[12px] font-normal text-slate-600">
                        {p.contact || '-'}
                      </td>
                      <td className="px-2 py-2 border-l border-slate-50 text-[12px] font-normal text-slate-600">
                        {p.address1 || '-'}
                      </td>
                      <td className="px-2 py-2 border-l border-slate-50 text-[12px] font-normal text-slate-600">
                        {p.telephone1 || '-'}
                      </td>
                      <td className="px-2 py-2 border-l border-slate-50 text-[12px] font-normal text-slate-600">
                        {p.email || '-'}
                      </td>
                      <td className="px-2 py-2 border-l border-slate-50">
                        {p.active ? (
                          <ActiveChip label="Active" size="md" onClick={() => handleToggleActive(p.id)} />
                        ) : (
                          <InactiveChip label="Inactive" size="md" onClick={() => handleToggleActive(p.id)} />
                        )}
                      </td>
                      <td className="px-2 py-2 border-l border-slate-50 text-[12px] font-normal text-slate-500 whitespace-nowrap">
                        {p.createdDate}
                      </td>
                      <td className="px-2 py-3 border-l border-slate-50 w-20">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Eye}
                            title="View targets"
                            className="!px-1 text-slate-500 hover:text-slate-800"
                            onClick={() => setViewingTarget(p)}
                          />
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Pencil}
                            title="Edit"
                            className="!px-1"
                            onClick={() => openEdit(p)}
                          />
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Trash2}
                            title="Delete"
                            className="!px-1 !text-red-500"
                            onClick={() => handleDelete(p.id)}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </motion.div>

      {/* Modal: Add / Edit salesperson */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit salesperson' : 'Add salesperson'}
        size="lg"
        footer={
          <>
            <Button variant="white" size="md" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Check}
              onClick={handleSave}
              style={{ backgroundColor: brand.primary }}
            >
              {editing ? 'Update salesperson' : 'Save salesperson'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Section 1: Basic contact information */}
          <div className="space-y-1.5">
            <h4
              className="text-[13px] font-black ml-1 flex items-center gap-2"
              style={{ color: brand.dark }}
            >
              <User className="w-3.5 h-3.5" />
              Basic contact information
            </h4>
            <Card className="p-4 shadow-sm" style={{ borderColor: brand.dark + '10' }}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Salesperson name *"
                  variant="compact"
                  placeholder="e.g. Ahmed Raza"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  label="SP user name"
                  variant="compact"
                  placeholder="e.g. ahmed.raza"
                  value={form.SPUserName}
                  onChange={e => setForm({ ...form, SPUserName: e.target.value })}
                />
                <Input
                  label="Contact"
                  variant="compact"
                  placeholder="e.g. 0300-1234567"
                  value={form.contact}
                  onChange={e => setForm({ ...form, contact: e.target.value })}
                />
                <Input
                  label="Email"
                  variant="compact"
                  type="email"
                  placeholder="e.g. ahmed.raza@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
                <Input
                  label="Address 1"
                  variant="compact"
                  placeholder="e.g. Main Boulevard, Gulberg"
                  value={form.address1}
                  onChange={e => setForm({ ...form, address1: e.target.value })}
                />
                <Input
                  label="Address 2"
                  variant="compact"
                  placeholder="e.g. Phase 5, DHA"
                  value={form.address2}
                  onChange={e => setForm({ ...form, address2: e.target.value })}
                />
                <Input
                  label="City"
                  variant="compact"
                  placeholder="e.g. Lahore"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                />
                <Input
                  label="Telephone 1"
                  variant="compact"
                  placeholder="e.g. 042-35711111"
                  value={form.telephone1}
                  onChange={e => setForm({ ...form, telephone1: e.target.value })}
                />
                <Input
                  label="Telephone 2"
                  variant="compact"
                  placeholder="e.g. 042-35722222"
                  value={form.telephone2}
                  onChange={e => setForm({ ...form, telephone2: e.target.value })}
                />
                <Input
                  label="Fax"
                  variant="compact"
                  placeholder="e.g. 042-35733333"
                  value={form.fax}
                  onChange={e => setForm({ ...form, fax: e.target.value })}
                />
              </div>
            </Card>
          </div>

          {/* Section 2: Targets and commission */}
          <div className="space-y-1.5">
            <h4
              className="text-[13px] font-black ml-1 flex items-center gap-2"
              style={{ color: brand.dark }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Targets and commission
            </h4>
            <Card className="p-4 shadow-sm" style={{ borderColor: brand.dark + '10' }}>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Commission (%)"
                  variant="compact"
                  type="number"
                  placeholder="0"
                  value={form.commission === 0 ? '' : String(form.commission)}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setForm({ ...form, commission: val, commissionPercent: val });
                  }}
                />
                <Input
                  label="Monthly target amount (Rs.)"
                  variant="compact"
                  type="number"
                  placeholder="0"
                  value={form.MTarget === 0 ? '' : String(form.MTarget)}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    setForm({ ...form, MTarget: val, targetAmount: val });
                  }}
                />
                <Input
                  label="Monthly target qty"
                  variant="compact"
                  type="number"
                  placeholder="0"
                  value={form.MtargetQty === 0 ? '' : String(form.MtargetQty)}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 0;
                    setForm({ ...form, MtargetQty: val, targetQuantity: val });
                  }}
                />
              </div>
            </Card>
          </div>

          {/* Section 3: Monthly targets breakdown */}
          <div className="space-y-1.5">
            <h4
              className="text-[13px] font-black ml-1 flex items-center gap-2"
              style={{ color: brand.dark }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Monthly targets breakdown (Rs.)
            </h4>
            <Card className="p-4 shadow-sm" style={{ borderColor: brand.dark + '10' }}>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Jan target', key: 'JanT' },
                  { label: 'Feb target', key: 'FebT' },
                  { label: 'March target', key: 'MarchT' },
                  { label: 'April target', key: 'AprilT' },
                  { label: 'May target', key: 'MayT' },
                  { label: 'June target', key: 'JuneT' },
                  { label: 'July target', key: 'JulyT' },
                  { label: 'Aug target', key: 'AugT' },
                  { label: 'Sept target', key: 'SeptT' },
                  { label: 'Oct target', key: 'OctT' },
                  { label: 'Nov target', key: 'NovT' },
                  { label: 'Dec target', key: 'DecT' },
                ].map(m => (
                  <Input
                    key={m.key}
                    label={m.label}
                    variant="compact"
                    type="number"
                    placeholder="0"
                    value={
                      (form[m.key as keyof Omit<SalesPerson, 'id'>] as number) === 0
                        ? ''
                        : String(form[m.key as keyof Omit<SalesPerson, 'id'>])
                    }
                    onChange={e =>
                      setForm({ ...form, [m.key]: parseFloat(e.target.value) || 0 })
                    }
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Section 4: System configuration */}
          <div className="space-y-1.5">
            <h4
              className="text-[13px] font-black ml-1 flex items-center gap-2"
              style={{ color: brand.dark }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              System configuration
            </h4>
            <Card className="p-4 shadow-sm" style={{ borderColor: brand.dark + '10' }}>
              <div className="flex items-center justify-between">
                <div className="w-1/2">
                  <Input
                    label="Created date"
                    variant="compact"
                    type="date"
                    value={form.createdDate}
                    onChange={e => setForm({ ...form, createdDate: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <Toggle
                    checked={form.active}
                    onChange={val => setForm({ ...form, active: val })}
                    label="Active"
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Modal>

      {/* Modal: View sales targets */}
      <Modal
        isOpen={!!viewingTarget}
        onClose={() => setViewingTarget(null)}
        title={`Sales targets — ${viewingTarget?.name || ''}`}
        size="md"
        footer={
          <Button
            variant="primary"
            size="md"
            onClick={() => setViewingTarget(null)}
            style={{ backgroundColor: brand.primary }}
          >
            Close
          </Button>
        }
      >
        {viewingTarget && (
          <Card className="p-4 shadow-sm" style={{ borderColor: brand.dark + '10' }}>
            {/* Summary row */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Monthly target (Rs.)"
                variant="compact"
                readOnly
                value={
                  viewingTarget.MTarget !== undefined
                    ? viewingTarget.MTarget.toLocaleString(undefined, { minimumFractionDigits: 2 })
                    : '0.00'
                }
              />
              <Input
                label="Monthly target qty"
                variant="compact"
                readOnly
                value={
                  viewingTarget.MtargetQty !== undefined
                    ? viewingTarget.MtargetQty.toLocaleString()
                    : '0'
                }
              />
            </div>

            {/* Monthly breakdown */}
            <div className="mt-4">
              <h4
                className="text-[13px] font-black flex items-center gap-2 mb-3"
                style={{ color: brand.dark }}
              >
                Monthly breakdown
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'January', val: viewingTarget.JanT },
                  { label: 'February', val: viewingTarget.FebT },
                  { label: 'March', val: viewingTarget.MarchT },
                  { label: 'April', val: viewingTarget.AprilT },
                  { label: 'May', val: viewingTarget.MayT },
                  { label: 'June', val: viewingTarget.JuneT },
                  { label: 'July', val: viewingTarget.JulyT },
                  { label: 'August', val: viewingTarget.AugT },
                  { label: 'September', val: viewingTarget.SeptT },
                  { label: 'October', val: viewingTarget.OctT },
                  { label: 'November', val: viewingTarget.NovT },
                  { label: 'December', val: viewingTarget.DecT },
                ].map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 border rounded-xl bg-white flex flex-col gap-0.5 border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <span className="text-[10px] font-bold text-slate-400">{m.label}</span>
                    <span className="text-[12px] font-black" style={{ color: brand.dark }}>
                      {(m.val || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </Modal>

      {/* Filter drawer */}
      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onReset={handleReset}
        onApply={() => setShowFilter(false)}
        title="Filter salespersons"
      >
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Status</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
            {[
              { key: 'all', label: 'All' },
              { key: 'active', label: 'Active' },
              { key: 'inactive', label: 'Inactive' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setFilterStatus(opt.key)}
                className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer ${
                  filterStatus === opt.key
                    ? 'bg-white shadow-xs border border-slate-200/40'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent border border-transparent'
                }`}
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
