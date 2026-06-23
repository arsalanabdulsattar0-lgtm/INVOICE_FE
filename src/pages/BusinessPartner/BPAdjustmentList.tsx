import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { PageHeader, CardTitle } from '../../components/ui/Typography';
import { ComboBox, Select, ScrollArea } from '../../components/ui/FormControls';
import { FilterDrawer } from '../../components/ui/FilterDrawer';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer, ChevronDown, SlidersHorizontal, Search,
  Plus, Edit, Trash2, CheckCircle, HelpCircle
} from 'lucide-react';
import type { BPAdjustment } from '../../types/types';

interface BPAdjustmentListProps {
  adjustments: BPAdjustment[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewChange: (view: string) => void;
}

export const BPAdjustmentList: React.FC<BPAdjustmentListProps> = ({
  adjustments,
  onEdit,
  onDelete,
  onViewChange
}) => {
  const { brand } = useTheme();

  // Load partners for filter dropdown
  const allPartners = useMemo(() => {
    try {
      const stored = localStorage.getItem('customer_list');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }, []);

  // Filter drawer states
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [appliedPartnerType, setAppliedPartnerType] = useState<'all' | 'customer' | 'supplier'>('all');
  const [appliedPartnerId, setAppliedPartnerId] = useState<string>('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');

  const [tempPartnerType, setTempPartnerType] = useState<'all' | 'customer' | 'supplier'>('all');
  const [tempPartnerId, setTempPartnerId] = useState<string>('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  // Dropdown options based on type
  const filteredPartners = useMemo(() => {
    if (tempPartnerType === 'all') return allPartners;
    return allPartners.filter((p: any) => p.bp_type === tempPartnerType);
  }, [allPartners, tempPartnerType]);

  const partnerOptions = useMemo(() => {
    return filteredPartners.map((p: any) => ({
      id: p.customer_id || p.id || p.name,
      name: `${p.customer_id || p.id || ''} — ${p.name}`.trim()
    }));
  }, [filteredPartners]);

  // When type changes, reset partner selection if not in new filtered list
  const filteredIds = useMemo(() => filteredPartners.map((p: any) => p.customer_id || p.id || p.name), [filteredPartners]);
  useEffect(() => {
    if (tempPartnerId && !filteredIds.includes(tempPartnerId)) {
      setTempPartnerId('');
    }
  }, [filteredIds, tempPartnerId]);

  // Apply filters
  const handleApplyFilters = () => {
    setAppliedPartnerType(tempPartnerType);
    setAppliedPartnerId(tempPartnerId);
    setAppliedStartDate(tempStartDate);
    setAppliedEndDate(tempEndDate);
    setShowFilterDrawer(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setTempPartnerType('all');
    setTempPartnerId('');
    setTempStartDate('');
    setTempEndDate('');
    setAppliedPartnerType('all');
    setAppliedPartnerId('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setShowFilterDrawer(false);
  };

  // Search query state
  const [searchQuery, setSearchQuery] = useState('');
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const headerDropdownRef = useRef<HTMLDivElement>(null);

  // Sorting
  const [sortKey, setSortKey] = useState<keyof BPAdjustment>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (headerDropdownRef.current && !headerDropdownRef.current.contains(e.target as Node)) {
        setHeaderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Filter list
  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(adj => {
      // Search match
      const q = searchQuery.toLowerCase();
      const matchSearch =
        adj.id.toLowerCase().includes(q) ||
        (adj.partnerName || '').toLowerCase().includes(q) ||
        (adj.ref || '').toLowerCase().includes(q) ||
        (adj.narration || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Partner Type match
      if (appliedPartnerType !== 'all' && adj.partnerType !== appliedPartnerType) return false;

      // Partner Match
      if (appliedPartnerId && adj.partnerId !== appliedPartnerId) return false;

      // Date Range Match
      if (appliedStartDate && adj.date < appliedStartDate) return false;
      if (appliedEndDate && adj.date > appliedEndDate) return false;

      return true;
    });
  }, [adjustments, searchQuery, appliedPartnerType, appliedPartnerId, appliedStartDate, appliedEndDate]);

  // Sort list
  const sortedAdjustments = useMemo(() => {
    return [...filteredAdjustments].sort((a, b) => {
      let av = a[sortKey] || '';
      let bv = b[sortKey] || '';
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      av = String(av).toLowerCase();
      bv = String(bv).toLowerCase();
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filteredAdjustments, sortKey, sortDir]);

  // KPIs
  const stats = useMemo(() => {
    const totalCount = sortedAdjustments.length;
    const totalDebit = sortedAdjustments.reduce((sum, item) => sum + (item.debitTotal || 0), 0);
    const totalCredit = sortedAdjustments.reduce((sum, item) => sum + (item.creditTotal || 0), 0);
    const postedCount = sortedAdjustments.filter(x => x.status === 'Posted').length;
    return { totalCount, totalDebit, totalCredit, postedCount };
  }, [sortedAdjustments]);

  const handleSort = (key: keyof BPAdjustment) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (sortedAdjustments.length === 0) return;
    const headers = ['Voucher No', 'Date', 'Partner Type', 'Partner Name', 'Ref', 'Debit Total', 'Credit Total', 'Status', 'Narration'];
    const rows = sortedAdjustments.map(a => [
      a.id, a.date, a.partnerType, a.partnerName, a.ref, a.debitTotal, a.creditTotal, a.status, a.narration
    ]);
    const csv = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BP_Adjustments_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setHeaderDropdownOpen(false);
  };

  return (
    <div className="min-h-full p-6 space-y-6" style={{ background: '#F4F7FD' }}>
      {/* Page Header */}
      <PageHeader
        title="BP Adjustment List"
        subtitle="Record and manage Business Partner general ledger balance adjustments."
        actions={
          <div className="flex items-center gap-3">
            {/* Print/Export Split Button */}
            <div className="relative flex items-center bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors h-9" ref={headerDropdownRef}>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors border-none bg-transparent rounded-l-lg cursor-pointer h-9"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" /> Print List
              </button>
              <div className="w-[1px] h-5 bg-slate-200" />
              <button
                type="button"
                onClick={() => setHeaderDropdownOpen(!headerDropdownOpen)}
                className="px-2 py-2 hover:bg-slate-50 transition-colors border-none bg-transparent rounded-r-lg cursor-pointer h-9 flex items-center justify-center"
              >
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>
              <AnimatePresence>
                {headerDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-11 bg-white border border-slate-150 rounded-xl shadow-lg py-1.5 min-w-[140px] z-50 text-left border-solid"
                  >
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="w-full text-left px-4 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 border-none bg-transparent cursor-pointer"
                    >
                      Export Excel (CSV)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Button
              onClick={() => setShowFilterDrawer(true)}
              variant="secondary"
              className="flex items-center gap-1.5 cursor-pointer h-9 text-[11px] font-bold"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
            </Button>

            <Button
              onClick={() => onViewChange('add-bp-adjustment')}
              className="flex items-center gap-1.5 cursor-pointer h-9 text-[11px] font-bold"
              style={{ backgroundColor: brand.primary, color: '#FFF' }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Adjustment
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Adjustments', value: stats.totalCount, sub: 'Filtered documents list', icon: SlidersHorizontal, color: brand.primary, bg: '#EFF6FF' },
          { label: 'Total Debit (Rs.)', value: stats.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 }), sub: 'Sum of all debit lines', icon: CheckCircle, color: '#10B981', bg: '#ECFDF5' },
          { label: 'Total Credit (Rs.)', value: stats.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 }), sub: 'Sum of all credit lines', icon: CheckCircle, color: '#8B5CF6', bg: '#F5F3FF' },
          { label: 'Posted Documents', value: `${stats.postedCount} / ${stats.totalCount}`, sub: 'Vouchers affecting balances', icon: HelpCircle, color: '#F59E0B', bg: '#FFFBEB' }
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
              <p className="text-xl font-extrabold text-slate-800">{card.value}</p>
              <span className="text-[9px] text-slate-400 block font-medium">{card.sub}</span>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: card.bg }}>
              <card.icon className="w-5 h-5" style={{ color: card.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Listing Card */}
      <div
        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-none"
        style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
      >
        {/* Table Header Row */}
        <div
          className="flex justify-between items-center px-4 py-2.5"
          style={{ background: brand.primary }}
        >
          <div className="flex items-center gap-2">
            <CardTitle
              title="BP Adjustment Records"
              count={sortedAdjustments.length}
              countLabel="records"
              textColor="text-white font-black uppercase tracking-wider"
            />
          </div>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search adjustments..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-800 placeholder-white/60 focus:placeholder-slate-400 rounded-lg pl-9 pr-4 py-1.5 text-xs font-semibold focus:outline-none transition-all border-none focus:ring-1 focus:ring-white/20"
            />
          </div>
        </div>

        {/* Adjustments Table */}
        <ScrollArea className="w-full h-[calc(100vh-360px)] overflow-auto" style={{ maxHeight: 'none' }}>
          <table className="w-full border-collapse table-layout-fixed text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 select-none">
                <th style={{ width: '4%' }} className="px-3 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">#</th>
                <th style={{ width: '13%' }} onClick={() => handleSort('id')} className="px-3 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600">Adjustment No {sortKey === 'id' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th style={{ width: '10%' }} onClick={() => handleSort('date')} className="px-3 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600">Date {sortKey === 'date' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th style={{ width: '22%' }} onClick={() => handleSort('partnerName')} className="px-3 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600">Main Account {sortKey === 'partnerName' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th style={{ width: '11%' }} onClick={() => handleSort('ref')} className="px-3 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600">Ref {sortKey === 'ref' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th style={{ width: '11%' }} onClick={() => handleSort('debitTotal')} className="px-3 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right cursor-pointer hover:text-slate-600">Debit (Rs.) {sortKey === 'debitTotal' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th style={{ width: '11%' }} onClick={() => handleSort('creditTotal')} className="px-3 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right cursor-pointer hover:text-slate-600">Credit (Rs.) {sortKey === 'creditTotal' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th style={{ width: '9%' }} onClick={() => handleSort('status')} className="px-3 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-600">Status {sortKey === 'status' && (sortDir === 'asc' ? '▲' : '▼')}</th>
                <th style={{ width: '9%' }} className="px-3 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-xs font-bold text-slate-400 bg-slate-50/50">
                    No adjustments found. Click "Add Adjustment" to create one.
                  </td>
                </tr>
              ) : (
                sortedAdjustments.map((adj, idx) => {
                  const isSelected = selectedRowId === adj.id;
                  const typeLabel = adj.partnerType === 'customer' ? 'Customer' : 'Supplier';
                  const isPosted = adj.status === 'Posted';

                  return (
                    <tr
                      key={adj.id}
                      onClick={() => setSelectedRowId(adj.id)}
                      className={`hover:bg-slate-50/70 border-b border-slate-100 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/20' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 text-center text-[11px] text-slate-400 font-bold">
                        {isSelected ? (
                          <span className="text-blue-500 font-black text-xs">&gt;</span>
                        ) : (
                          idx + 1
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] text-blue-600 font-black">{adj.id}</td>
                      <td className="px-3 py-2.5 text-[11px] text-slate-500 font-bold">{adj.date}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col">
                          <span className="text-[11.5px] font-extrabold text-slate-700">{adj.partnerName}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            {typeLabel} ({adj.partnerId})
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[11.5px] font-bold text-slate-600">{adj.ref || '—'}</td>
                      <td className="px-3 py-2.5 text-[11.5px] font-black text-emerald-600 text-right">
                        {adj.debitTotal > 0 ? adj.debitTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td className="px-3 py-2.5 text-[11.5px] font-black text-purple-600 text-right">
                        {adj.creditTotal > 0 ? adj.creditTotal.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                            isPosted
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                              : 'bg-amber-50 text-amber-700 border-amber-250'
                          }`}
                        >
                          {adj.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEdit(adj.id)}
                            className="p-1 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-600 text-slate-500 transition-colors border-none cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(adj.id)}
                            className="p-1 rounded bg-slate-100 hover:bg-red-100 hover:text-red-600 text-slate-500 transition-colors border-none cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      {/* Slide-out Filter Drawer */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        title="Filter Adjustments"
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Voucher Date Range</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={tempStartDate}
                onChange={e => setTempStartDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-bold text-xs focus:ring-1 focus:ring-slate-300 focus:outline-none cursor-pointer h-9"
              />
              <input
                type="date"
                value={tempEndDate}
                onChange={e => setTempEndDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-bold text-xs focus:ring-1 focus:ring-slate-300 focus:outline-none cursor-pointer h-9"
              />
            </div>
          </div>

          <Select
            label="Partner Type"
            value={tempPartnerType}
            onChange={(e: any) => setTempPartnerType(e.target.value)}
            options={[
              { value: 'all', label: 'All Partners' },
              { value: 'customer', label: 'Customers Only' },
              { value: 'supplier', label: 'Suppliers Only' }
            ]}
          />

          <ComboBox
            label="Filter Business Partner"
            value={tempPartnerId}
            onChange={setTempPartnerId}
            options={partnerOptions}
            placeholder="Select partner..."
          />
        </div>
      </FilterDrawer>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            onDelete(deletingId);
            setDeletingId(null);
          }
        }}
        title="Delete BP Adjustment"
        message="Are you sure you want to permanently delete this adjustment record? This will revert any posted balance changes."
      />
    </div>
  );
};

export default BPAdjustmentList;
