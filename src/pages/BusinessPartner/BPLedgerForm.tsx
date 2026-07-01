import { PageHeader } from '../../components/common/PageHeader';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ComboBox, Select, ScrollArea } from '../../components/ui/FormControls';
import { Button } from '../../components/ui/Button';
import { CardTitle, TableHeader } from '../../components/ui/Typography';
import { FilterDrawer } from '../../components/ui/FilterDrawer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer, ChevronDown, TrendingUp, CreditCard,
  CheckCircle, DollarSign, ChevronRight, Search, BarChart2,
  SlidersHorizontal, User
} from 'lucide-react';
import type { Invoice } from '../../types';
import { BPLedgerPrintTemplate } from './BPLedgerPrintTemplate';

interface BPLedgerFormProps { }

interface LedgerRow {
  no: number;
  invNo: string;
  type: string;
  typeCode: string;
  date: string;
  reference: string;
  detail: string;
  debit: number;
  credit: number;
  balance: number;
}

interface AgingBucket {
  label: string;
  days: string;
  amount: number;
  color: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// SVG Pie Chart — full pie, degree labels inside slices, legend BELOW
// ──────────────────────────────────────────────────────────────────────────────
const PieChart: React.FC<{ buckets: AgingBucket[] }> = ({ buckets }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = buckets.reduce((s, b) => s + b.amount, 0);
  const hasData = total > 0;
  const cx = 90, cy = 90, r = 80;

  const toXY = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  };

  const buildSlicePath = (startA: number, endA: number, outerR: number) => {
    const s = toXY(startA, outerR);
    const e = toXY(endA, outerR);
    const large = endA - startA > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${outerR} ${outerR} 0 ${large} 1 ${e.x} ${e.y} Z`;
  };

  const slices = useMemo(() => {
    if (!hasData) return [];
    let startAngle = -90;
    return buckets.filter(b => b.amount > 0).map(b => {
      const sweep = (b.amount / total) * 360;
      const start = startAngle;
      startAngle += sweep;
      return { ...b, sweep, startAngle: start };
    });
  }, [buckets, total, hasData]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Pie */}
      <div className="relative">
        {hasData ? (
          <svg width={180} height={180} viewBox="0 0 180 180" onMouseLeave={() => setHoveredIdx(null)}>
            {slices.map((slice, i) => {
              const endA = slice.startAngle + slice.sweep;
              const outerR = hoveredIdx === i ? r + 5 : r;
              const lp = toXY(slice.startAngle + slice.sweep / 2, outerR * 0.62);
              return (
                <g key={i} onMouseEnter={() => setHoveredIdx(i)} style={{ cursor: 'pointer' }}>
                  <path
                    d={buildSlicePath(slice.startAngle, endA, outerR)}
                    fill={slice.color}
                    stroke="#fff"
                    strokeWidth={hoveredIdx === i ? 2.5 : 1.5}
                    opacity={hoveredIdx === null || hoveredIdx === i ? 1 : 0.7}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  {slice.sweep > 18 && (
                    <text
                      x={lp.x} y={lp.y}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={hoveredIdx === i ? 11 : 9}
                      fill="#fff" fontWeight="800"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {`${Math.round((slice.amount / total) * 100)}%`}
                    </text>
                  )}
                </g>
              );
            })}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={0.5} />
          </svg>
        ) : (
          <div className="w-[180px] h-[180px] flex items-center justify-center">
            <div className="w-[140px] h-[140px] rounded-full border-[18px] border-slate-100 flex items-center justify-center">
              <p className="text-[10px] text-slate-400 font-bold text-center">No aging<br />data</p>
            </div>
          </div>
        )}
        {hoveredIdx !== null && slices[hoveredIdx] && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-lg pointer-events-none" style={{ zIndex: 99 }}>
            {slices[hoveredIdx].label}: Rs. {slices[hoveredIdx].amount.toLocaleString()}
          </div>
        )}
      </div>

      {/* Legend BELOW the pie */}
      <div className="w-full space-y-1.5 pt-1">
        {buckets.map((b, i) => (
          <div key={i} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: b.color }} />
              <span className="text-[10px] font-bold text-slate-700">{b.label}</span>
              <span className="text-[9px] text-slate-400">({b.days})</span>
            </div>
            <span className="text-[10px] font-extrabold" style={{ color: b.color }}>
              {b.amount > 0 ? `Rs. ${b.amount.toLocaleString()}` : '—'}
            </span>
          </div>
        ))}
        {hasData && (
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Total</span>
            <span className="text-[11px] font-extrabold text-slate-800">Rs. {total.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────
export const BPLedgerForm: React.FC<BPLedgerFormProps> = () => {
  const { brand } = useTheme();

  // ── Load all partners ──────────────────────────────────────────────────────
  const allPartners = useMemo(() => {
    try {
      const stored = localStorage.getItem('customer_list');
      if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return [];
  }, []);

  // ── Company name (dynamic from settings) ─────────────────────────────────
  const companyName = useMemo(() => {
    try {
      const raw = localStorage.getItem('company_settings') || localStorage.getItem('company_info') || '{}';
      const co = JSON.parse(raw);
      return co.name || co.company_name || co.companyName || 'Company';
    } catch { return 'Company'; }
  }, []);

  // ── Filter drawer state (temp = in-drawer, applied = active) ──────────────
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Applied filter values
  const [appliedType, setAppliedType] = useState<'all' | 'customer' | 'supplier'>('all');
  const [appliedPartnerId, setAppliedPartnerId] = useState<string>('');
  const [appliedStartDate, setAppliedStartDate] = useState(() => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
  });
  const [appliedEndDate, setAppliedEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Temp (in-drawer) values
  const [tempType, setTempType] = useState<'all' | 'customer' | 'supplier'>('all');
  const [tempPartnerId, setTempPartnerId] = useState<string>('');
  const [tempStartDate, setTempStartDate] = useState(appliedStartDate);
  const [tempEndDate, setTempEndDate] = useState(appliedEndDate);

  // ── Partners filtered by selected type ─────────────────────────────────────
  const filteredPartners = useMemo(() =>
    tempType === 'all' ? allPartners : allPartners.filter((p: any) => p.bp_type === tempType),
    [allPartners, tempType]
  );

  const accountOptions = useMemo(() =>
    filteredPartners.map((p: any) => ({
      id: p.customer_id || p.id || p.name,
      name: `${p.customer_id || p.id || ''} — ${p.name}`.trim(),
    })), [filteredPartners]);

  const nameOptions = useMemo(() =>
    filteredPartners.map((p: any) => ({
      id: p.customer_id || p.id || p.name,
      name: p.name,
    })), [filteredPartners]);

  // When type changes, reset partner selection if not in the new filtered list
  const filteredIds = useMemo(() => filteredPartners.map((p: any) => p.customer_id || p.id || p.name), [filteredPartners]);
  useEffect(() => {
    if (tempPartnerId && !filteredIds.includes(tempPartnerId)) {
      setTempPartnerId('');
    }
  }, [filteredIds, tempPartnerId]);



  // ── Selected partner ───────────────────────────────────────────────────────
  const selectedPartner = useMemo(() =>
    allPartners.find((p: any) => (p.customer_id || p.id || p.name) === appliedPartnerId) || null,
    [allPartners, appliedPartnerId]
  );

  // ── Search & UI ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([]);
  const [sortKey, setSortKey] = useState<keyof LedgerRow>('no');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const headerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (headerDropdownRef.current && !headerDropdownRef.current.contains(e.target as Node))
        setHeaderDropdownOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Generate ledger data ───────────────────────────────────────────────────
  const ledgerData: LedgerRow[] = useMemo(() => {
    if (!selectedPartner) return [];

    const matchName = (a: string, b: string) => {
      const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/(inc|corp|corporation|ltd|limited|group|traders)$/, '');
      const ca = clean(a), cb = clean(b);
      return ca === cb || ca.startsWith(cb) || cb.startsWith(ca);
    };

    let invoices: Invoice[] = [], purchases: Invoice[] = [];
    try {
      const si = localStorage.getItem('invoice_list');
      if (si) invoices = JSON.parse(si);
      const sp = localStorage.getItem('purchase_list');
      if (sp) purchases = JSON.parse(sp);
    } catch { /* ignore */ }

    const isSupplier = selectedPartner.bp_type === 'supplier';

    const getDetail = (id: string): string => {
      try {
        const stored = localStorage.getItem(`invoice_detail_${id}`);
        if (stored) {
          const items: any[] = JSON.parse(stored);
          if (items.length > 0) {
            const f = items[0];
            const name = f.name || f.description || f.item || '';
            const qty = f.qty || f.quantity || 1;
            const price = f.price || f.unitPrice || f.rate || 0;
            return `${name} Qty: ${qty} @ ${price}${items.length > 1 ? ` +${items.length - 1} more` : ''}`;
          }
        }
      } catch { /* ignore */ }
      return '—';
    };

    const typeCode = (t: string): string => {
      const tl = (t || '').toLowerCase();
      if (tl.includes('sale') && tl.includes('return')) return 'SR';
      if (tl.includes('purchase') && tl.includes('return')) return 'PR';
      if (tl.includes('sale') || tl.includes('service')) return 'SI';
      if (tl.includes('purchase')) return 'PI';
      return t;
    };

    const matchedInvoices = invoices.filter(inv => matchName(selectedPartner.name, inv.customer || ''));
    const matchedPurchases = purchases.filter(inv => matchName(selectedPartner.name, inv.customer || ''));

    // Load adjustments
    const adjustments: any[] = [];
    try {
      const sa = localStorage.getItem('bp_adjustments');
      if (sa) {
        const headers = JSON.parse(sa) as any[];
        headers.filter(h => h.status === 'Posted').forEach(h => {
          const detailRaw = localStorage.getItem(`bp_adjustment_detail_${h.id}`);
          if (detailRaw) {
            const detail = JSON.parse(detailRaw);
            const matchedRows = (detail.items || []).filter((row: any) =>
              row.partnerId === selectedPartner.customer_id ||
              row.partnerId === selectedPartner.id ||
              matchName(selectedPartner.name, row.partnerId)
            );
            matchedRows.forEach((row: any) => {
              adjustments.push({
                id: h.id,
                date: row.date || h.date,
                type: 'BP Adjustment',
                typeCode: 'ADJ',
                reference: row.ref || h.ref || '—',
                detail: `Adj GL: ${row.glCode} — ${row.narration || h.narration || ''}`,
                debit: row.debit || 0,
                credit: row.credit || 0
              });
            });
          }
        });
      }
    } catch { /* ignore */ }

    const mappedAdjustments = adjustments.map(adj => {
      return {
        tx: {
          id: adj.id,
          type: adj.type,
          typeCode: adj.typeCode,
          issueDate: adj.date,
          reference: adj.reference,
          detail: adj.detail
        },
        txDate: adj.date,
        debit: adj.debit,
        credit: adj.credit
      };
    });

    const allTx = [
      ...[...matchedInvoices, ...matchedPurchases].map(tx => {
        const txDate = tx.issueDate || tx.dueDate || '';
        const isSaleType = (tx.type || '').toLowerCase().includes('sale') || (tx.type || '').toLowerCase().includes('service');
        const isReturn = (tx.type || '').toLowerCase().includes('return');
        let debit = 0, credit = 0;
        if (!isSupplier) {
          if (isSaleType && !isReturn) debit = tx.rawAmount || 0;
          else credit = tx.rawAmount || 0;
        } else {
          if (!isSaleType && !isReturn) credit = tx.rawAmount || 0;
          else debit = tx.rawAmount || 0;
        }
        return { tx, txDate, debit, credit };
      }),
      ...mappedAdjustments
    ].filter(({ txDate }) => txDate >= appliedStartDate && txDate <= appliedEndDate);

    allTx.sort((a, b) => new Date(a.txDate).getTime() - new Date(b.txDate).getTime());

    let running = selectedPartner.opening_balance || 0;
    const rows: LedgerRow[] = [{
      no: 0, invNo: '—', type: 'Opening Balance', typeCode: 'OB',
      date: appliedStartDate, reference: 'Balance B/F', detail: '—',
      debit: 0, credit: 0, balance: running,
    }];

    allTx.forEach(({ tx, txDate, debit, credit }, i) => {
      running = running + debit - credit;
      rows.push({
        no: i + 1, invNo: tx.id || '—', type: tx.type || 'Transaction',
        typeCode: tx.type === 'BP Adjustment' ? 'ADJ' : typeCode(tx.type || ''), date: txDate,
        reference: tx.id || '—', detail: tx.type === 'BP Adjustment' ? (tx as any).detail : getDetail(tx.id || ''),
        debit, credit, balance: running,
      });
    });

    return rows;
  }, [selectedPartner, appliedStartDate, appliedEndDate]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const balance = ledgerData.length > 0 ? ledgerData[ledgerData.length - 1].balance : 0;
    const amountPaid = ledgerData.slice(1).reduce((s, r) => s + r.credit, 0);
    const yr = new Date().getFullYear();
    const ytdSales = ledgerData.slice(1).reduce((s, r) =>
      r.typeCode === 'SI' && new Date(r.date).getFullYear() === yr ? s + r.debit : s, 0);
    const creditLimit = selectedPartner?.credit_limit || 0;
    return { balance, amountPaid, ytdSales, creditLimit };
  }, [ledgerData, selectedPartner]);

  // ── Aging buckets ─────────────────────────────────────────────────────────
  const agingBuckets: AgingBucket[] = useMemo(() => {
    const today = new Date();
    const buckets = [
      { label: '0–30 Days', days: '≤30d', color: '#3b82f6', amount: 0 },
      { label: '31–60 Days', days: '31–60d', color: '#f59e0b', amount: 0 },
      { label: '61–90 Days', days: '61–90d', color: '#f97316', amount: 0 },
      { label: 'Over 91 Days', days: '>91d', color: '#ef4444', amount: 0 },
    ];
    ledgerData.slice(1).filter(r => r.debit > 0).forEach(r => {
      const age = Math.floor((today.getTime() - new Date(r.date).getTime()) / 86400000);
      if (age <= 30) buckets[0].amount += r.debit;
      else if (age <= 60) buckets[1].amount += r.debit;
      else if (age <= 90) buckets[2].amount += r.debit;
      else buckets[3].amount += r.debit;
    });
    // Demo fallback so chart is always visible
    if (!buckets.some(b => b.amount > 0)) {
      buckets[0].amount = 45000;
      buckets[1].amount = 30000;
      buckets[2].amount = 15000;
      buckets[3].amount = 10000;
    }
    return buckets;
  }, [ledgerData]);

  // ── Processed rows (search + sort) ────────────────────────────────────────
  const processedRows = useMemo(() => {
    let result = [...ledgerData];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.invNo.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) ||
        r.date.toLowerCase().includes(q) || r.detail.toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const va: any = a[sortKey], vb: any = b[sortKey];
      return typeof va === 'string'
        ? sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
        : sortDir === 'asc' ? va - vb : vb - va;
    });
    return result;
  }, [ledgerData, searchQuery, sortKey, sortDir]);

  const handleSort = (key: any) => {
    if (sortKey === key) setSortDir(sd => sd === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelectedRowIds(e.target.checked ? processedRows.map((_, i) => i) : []);
  const handleSelectRow = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRowIds(prev => prev.includes(idx) ? prev.filter(id => id !== idx) : [...prev, idx]);
  };

  const handlePrint = () => {
    // Load company info from localStorage
    const companyRaw = localStorage.getItem('company_settings') || localStorage.getItem('company_info') || '{}';
    let companyName = 'AM INTERNATIONAL';
    let companyLogo: string | null = null;
    try {
      const co = JSON.parse(companyRaw);
      companyName = co.name || co.company_name || companyName;
      companyLogo = co.logo || null;
    } catch { /* ignore */ }

    const el = document.getElementById('bp-ledger-printable');
    if (!el) { window.print(); return; }

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { window.print(); return; }
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Business Partner Ledger — ${selectedPartner?.name || ''}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 9pt; color: #000; background: #fff; }
        @page { size: A4 portrait; margin: 0; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style>
    </head><body>${el.outerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
    void companyLogo; void companyName;
  };
  const handleExport = () => {
    if (ledgerData.length === 0) return;
    const headers = ['No', 'Inv #', 'Type', 'Date', 'Reference', 'Detail', 'Debit', 'Credit', 'Balance'];
    const rows = ledgerData.map(r => [r.no, r.invNo, r.typeCode, r.date, r.reference, r.detail, r.debit, r.credit, r.balance]);
    const csv = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `Ledger_${selectedPartner?.name || 'BP'}.csv`;
    a.style.visibility = 'hidden';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleApplyFilter = () => {
    setAppliedType(tempType);
    setAppliedPartnerId(tempPartnerId);
    setAppliedStartDate(tempStartDate);
    setAppliedEndDate(tempEndDate);
    setShowFilterDrawer(false);
    setSelectedRowIds([]);
    setSelectedRowId(null);
  };

  const handleResetFilter = () => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 1);
    const sd = d.toISOString().split('T')[0];
    const ed = new Date().toISOString().split('T')[0];
    // Reset temp (in-drawer)
    setTempType('all');
    setTempPartnerId('');
    setTempStartDate(sd);
    setTempEndDate(ed);
    // Also reset applied (active) values immediately — no need to click Apply
    setAppliedType('all');
    setAppliedPartnerId('');
    setAppliedStartDate(sd);
    setAppliedEndDate(ed);
    setSelectedRowIds([]);
    setSelectedRowId(null);
  };

  // ── Badge colors ──────────────────────────────────────────────────────────
  const typeBadgeStyle = (code: string) => {
    if (code === 'SI') return { bg: '#eff6ff', text: '#2563eb' };
    if (code === 'SR') return { bg: '#fef2f2', text: '#dc2626' };
    if (code === 'PI') return { bg: '#f0fdf4', text: '#16a34a' };
    if (code === 'PR') return { bg: '#fff7ed', text: '#ea580c' };
    return { bg: '#f8fafc', text: '#64748b' };
  };

  // ── KPI tiles ─────────────────────────────────────────────────────────────
  const tiles = [
    { label: 'Outstanding Balance', value: `Rs. ${kpis.balance.toLocaleString()}`, sub: `As of ${appliedEndDate}`, icon: DollarSign, iconBg: '#eff6ff', iconColor: '#3b82f6', valColor: '#1e293b' },
    { label: 'Amount Paid', value: `Rs. ${kpis.amountPaid.toLocaleString()}`, sub: 'Total credits received', icon: CheckCircle, iconBg: '#f0fdf4', iconColor: '#22c55e', valColor: '#16a34a' },
    { label: 'YTD Sales', value: `Rs. ${kpis.ytdSales.toLocaleString()}`, sub: `Year ${new Date().getFullYear()}`, icon: TrendingUp, iconBg: '#fdf4ff', iconColor: '#a855f7', valColor: '#7c3aed' },
    { label: 'Credit Limit', value: kpis.creditLimit > 0 ? `Rs. ${kpis.creditLimit.toLocaleString()}` : 'Not set', sub: 'Configured limit', icon: CreditCard, iconBg: '#fff7ed', iconColor: '#f97316', valColor: '#c2410c' },
  ];

  // ── Active filter summary chips ────────────────────────────────────────────
  const activeChips = useMemo(() => {
    const chips: string[] = [];
    if (appliedType !== 'all') chips.push(appliedType === 'customer' ? 'Customers' : 'Suppliers');
    if (selectedPartner) chips.push(selectedPartner.name);
    chips.push(`${appliedStartDate} → ${appliedEndDate}`);
    return chips;
  }, [appliedType, selectedPartner, appliedStartDate, appliedEndDate]);

  return (
    <div className="p-6 space-y-5">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <PageHeader
        title="Business Partner Ledger"
        subtitle="Generate detailed ledger statements for customers and suppliers"
        actions={
          <div className="flex items-center gap-2">
            {/* Print / Export Split */}
            <div className="relative flex items-center bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors h-9" ref={headerDropdownRef}>
              <button type="button" onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition-colors border-none bg-transparent rounded-l-lg cursor-pointer h-9">
                <Printer className="w-3.5 h-3.5 text-slate-500" /> Print
              </button>
              <div className="w-[1px] h-4 bg-slate-200" />
              <button type="button" onClick={() => setHeaderDropdownOpen(o => !o)} className="px-2 py-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors border-none bg-transparent rounded-r-lg cursor-pointer flex items-center justify-center h-9">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {headerDropdownOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    className="absolute right-0 top-10 z-50 bg-white rounded-xl border p-1.5 w-40 shadow-lg" style={{ borderColor: '#E2E8F0' }}>
                    <button type="button" onClick={() => { setHeaderDropdownOpen(false); handlePrint(); }}
                      className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2 text-slate-700 cursor-pointer border-none bg-transparent">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> PDF Document
                    </button>
                    <button type="button" onClick={() => { setHeaderDropdownOpen(false); handleExport(); }}
                      className="w-full text-left px-2.5 py-1.5 text-[10px] font-bold hover:bg-slate-50 rounded-lg transition-all flex items-center gap-2 text-slate-700 cursor-pointer border-none bg-transparent">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Excel (CSV)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter Button */}
            <Button
              variant="white"
              icon={SlidersHorizontal}
              onClick={() => {
                setTempType(appliedType);
                setTempPartnerId(appliedPartnerId);
                setTempStartDate(appliedStartDate);
                setTempEndDate(appliedEndDate);
                setShowFilterDrawer(true);
              }}
              size="md"
            >
              Filter
            </Button>
          </div>
        }
      />

      {/* ── Active filter chips ───────────────────────────────────────────── */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active:</span>
          {activeChips.map((chip, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">{chip}</span>
          ))}
          {selectedPartner && (
            <span
              className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase"
              style={{
                backgroundColor: selectedPartner.bp_type === 'customer' ? '#eff6ff' : '#f0fdf4',
                color: selectedPartner.bp_type === 'customer' ? '#2563eb' : '#16a34a',
              }}
            >{selectedPartner.bp_type}</span>
          )}
        </div>
      )}

      {/* ── KPI Tiles ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map((tile, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border p-4 transition-all hover:shadow-sm cursor-default" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">{tile.label}</p>
                <p className="text-[17px] font-black mt-1 tracking-tight truncate" style={{ color: tile.valColor }}>
                  {selectedPartner ? tile.value : '—'}
                </p>
                <p className="text-[9px] font-medium text-slate-400 mt-0.5 truncate">{tile.sub}</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tile.iconBg }}>
                <tile.icon style={{ color: tile.iconColor, width: 18, height: 18 }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Table + Aging Sidebar ──────────────────────────────────────────── */}
      <div className="flex gap-4 items-start">
        {/* Ledger Table */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
          <div className="px-4 py-2.5 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
            <CardTitle title="Ledger Statement" count={processedRows.length} countLabel="entries" />
            <div className="relative print-hidden">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="h-7 pl-7 pr-3 rounded-lg text-[11px] font-medium border outline-none w-44"
                style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
            </div>
          </div>

          <ScrollArea className="w-full" maxHeight="430px" style={{ overscrollBehavior: 'contain' }}>
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-[#E2E8F0]">
                  <th className="px-2 py-2 text-center w-8 border-b border-[#E2E8F0]">
                    <input type="checkbox" checked={processedRows.length > 0 && selectedRowIds.length === processedRows.length}
                      onChange={handleSelectAll} className="rounded border-slate-300 cursor-pointer w-4 h-4" />
                  </th>
                  <TableHeader label="No" sortKey="no" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} width="w-8" />
                  <TableHeader label="Inv #" sortKey="invNo" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} width="w-[14%]" />
                  <TableHeader label="Type" sortKey="typeCode" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} width="w-[6%]" />
                  <TableHeader label="Date" sortKey="date" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} width="w-[11%]" />
                  <TableHeader label="Reference" sortKey="reference" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} width="w-[12%]" />
                  <TableHeader label="Detail" sortKey="detail" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} width="w-[20%]" />
                  <TableHeader label="Debit" sortKey="debit" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} width="w-[10%] text-right" />
                  <TableHeader label="Credit" sortKey="credit" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} width="w-[10%] text-right" />
                  <TableHeader label="Balance" sortKey="balance" activeSortKey={sortKey} sortDir={sortDir} onSort={handleSort} width="w-[10%] text-right" />
                </tr>
              </thead>
              <tbody>
                {!selectedPartner ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-[13px] text-slate-400">No partner selected</p>
                      <p className="text-[11px] text-slate-400 mt-1">Click the Filter button to select a partner.</p>
                    </td>
                  </tr>
                ) : processedRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-slate-400 font-medium text-[12px]">
                      No transactions found for the selected period.
                    </td>
                  </tr>
                ) : (
                  processedRows.map((row, idx) => {
                    const isSelected = selectedRowId === idx;
                    const isChecked = selectedRowIds.includes(idx);
                    const badge = typeBadgeStyle(row.typeCode);
                    return (
                      <tr key={idx} onClick={() => setSelectedRowId(isSelected ? null : idx)}
                        className={`group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 cursor-pointer last:border-0 ${isChecked ? 'bg-blue-50/20' : isSelected ? 'bg-slate-50' : ''}`}>
                        <td className="px-2 py-2 text-center w-8" onClick={e => handleSelectRow(idx, e)}>
                          <input type="checkbox" checked={isChecked} onChange={() => { }} className="rounded border-slate-300 cursor-pointer w-4 h-4" />
                        </td>
                        <td className="px-2 py-2 text-slate-500 font-semibold text-[11px]">{row.no || '—'}</td>
                        <td className="px-2 py-2 text-slate-700 font-bold text-[11px] truncate max-w-[100px]">{row.invNo}</td>
                        <td className="px-2 py-2">
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wider" style={{ backgroundColor: badge.bg, color: badge.text }}>{row.typeCode}</span>
                        </td>
                        <td className="px-2 py-2 text-slate-500 text-[11px] font-semibold">
                          <div className="flex items-center gap-1">
                            {isSelected && <ChevronRight className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                            {row.date}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-slate-500 text-[11px] font-medium truncate max-w-[90px]">{row.reference}</td>
                        <td className="px-2 py-2 text-slate-500 text-[11px] truncate max-w-[150px]">{row.detail}</td>
                        <td className="px-2 py-2 text-right text-emerald-600 font-bold text-[11px]">{row.debit > 0 ? `Rs. ${row.debit.toLocaleString()}` : '—'}</td>
                        <td className="px-2 py-2 text-right text-rose-600 font-bold text-[11px]">{row.credit > 0 ? `Rs. ${row.credit.toLocaleString()}` : '—'}</td>
                        <td className="px-2 py-2 text-right text-slate-800 font-extrabold text-[11px]">Rs. {row.balance.toLocaleString()}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>

        {/* ── Aging Sidebar ─────────────────────────────────────────────── */}
        <div className="w-[260px] flex-shrink-0">
          <div className="bg-white rounded-2xl border p-4" style={{ borderColor: '#E2E8F0' }}>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="w-4 h-4" style={{ color: brand.primary }} />
              <p className="text-[11px] font-extrabold text-slate-700">Aging Analysis</p>
            </div>
            <PieChart buckets={agingBuckets} />
          </div>
        </div>
      </div>

      {/* ── Filter Drawer ─────────────────────────────────────────────────── */}
      <FilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        onReset={handleResetFilter}
        onApply={handleApplyFilter}
      >
        <div className="space-y-4">
          {/* Partner Type — most important */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500">Business Partner Type</label>
            <Select
              variant="compact"
              value={tempType}
              onChange={e => setTempType(e.target.value as any)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'customer', label: 'Customer' },
                { value: 'supplier', label: 'Supplier' },
              ]}
              style={{ cursor: 'pointer' }}
            />
          </div>

          {/* Account selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500">Account</label>
            <ComboBox
              value={tempPartnerId}
              onChange={val => setTempPartnerId(val || '')}
              options={accountOptions}
              placeholder="Select Account..."
              variant="compact"
            />
          </div>

          {/* Name selector — synced with Account */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500">Business Partner Name</label>
            <ComboBox
              value={tempPartnerId}
              onChange={val => setTempPartnerId(val || '')}
              options={nameOptions}
              placeholder="Select Partner Name..."
              variant="compact"
            />
          </div>

          {/* From Date */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500">From Date</label>
            <input
              type="date"
              value={tempStartDate}
              onChange={e => setTempStartDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-bold text-xs focus:ring-1 focus:ring-slate-300 focus:outline-none cursor-pointer"
              style={{ height: '36px' }}
            />
          </div>

          {/* To Date */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500">To Date</label>
            <input
              type="date"
              value={tempEndDate}
              onChange={e => setTempEndDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-bold text-xs focus:ring-1 focus:ring-slate-300 focus:outline-none cursor-pointer"
              style={{ height: '36px' }}
            />
          </div>
        </div>
      </FilterDrawer>

      {/* ── Hidden Print Template (off-screen) ─────────────────────────── */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none', zIndex: -1 }}>
        <BPLedgerPrintTemplate
          partner={selectedPartner}
          ledgerData={ledgerData}
          dateFrom={appliedStartDate}
          dateTo={appliedEndDate}
          partnerFrom={appliedPartnerId}
          partnerTo={appliedPartnerId}
          companyName={companyName}
        />
      </div>
    </div>
  );
};
