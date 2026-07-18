import React, { useMemo } from 'react';
import { usePermissions } from '../../context/PermissionContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DashboardTabSwitcher } from './components/DashboardTabSwitcher';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Invoice } from '../Invoices/invoiceTypes';

interface Dashboard1Props {
  invoiceItems?: Invoice[];
  onViewChange?: (view: string) => void;
}

const Dashboard1: React.FC<Dashboard1Props> = ({ onViewChange }) => {
  const { isFunctionEnabled } = usePermissions();
  const companyIdToUse = (() => {
    try {
      const stored = localStorage.getItem('invoice_settings');
      if (stored) return JSON.parse(stored).company?.id || 'co1';
    } catch {}
    return 'co1';
  })();

  const isSpecificUser = (() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.email === 'arsalanabdulsattar0@gmail.com';
      }
    } catch {}
    return false;
  })();

  const sparkline1 = useMemo(() => [{v: 10}, {v: 15}, {v: 12}, {v: 20}, {v: 18}, {v: 25}, {v: 30}], []);
  const sparkline2 = useMemo(() => [{v: 5}, {v: 8}, {v: 12}, {v: 10}, {v: 15}, {v: 22}, {v: 20}], []);
  const sparkline3 = useMemo(() => [{v: 2}, {v: 1}, {v: 3}, {v: 2}, {v: 4}, {v: 3}, {v: 5}], []);
  const sparkline4 = useMemo(() => [{v: 8}, {v: 7}, {v: 6}, {v: 5}, {v: 4}, {v: 3}, {v: 2}], []);

  // ── Load products (Force Dummy Data for Preview) ──────────────────────────────
  const products = useMemo(() => {
    // ALWAYS return Dummy Data so the user can preview the UI with data
    return [
      { name: 'Paracetamol 500mg', code: 'PRC-001', batchNo: 'BT-1024', opening_qty: 450, low_stock_level: 500, expiry_date: new Date(Date.now() - 30*86400000).toISOString(), mfg_date: new Date(Date.now() - 200*86400000).toISOString() }, 
      { name: 'Amoxicillin 250mg', code: 'AMX-002', batchNo: 'BT-1025', opening_qty: 120, low_stock_level: 200, expiry_date: new Date(Date.now() + 15*86400000).toISOString(), mfg_date: new Date(Date.now() - 150*86400000).toISOString() }, 
      { name: 'Ibuprofen 400mg',   code: 'IBU-003', batchNo: 'BT-1026', opening_qty: 1500, low_stock_level: 300, expiry_date: new Date(Date.now() + 120*86400000).toISOString(), mfg_date: new Date(Date.now() - 100*86400000).toISOString() }, 
      { name: 'Cetirizine 10mg',   code: 'CET-004', batchNo: 'BT-1027', opening_qty: 0, low_stock_level: 100, expiry_date: new Date(Date.now() + 60*86400000).toISOString(), mfg_date: new Date(Date.now() - 80*86400000).toISOString() }, 
      { name: 'Azithromycin 500mg',code: 'AZI-005', batchNo: 'BT-1028', opening_qty: 850, low_stock_level: 400, expiry_date: new Date(Date.now() + 25*86400000).toISOString(), mfg_date: new Date(Date.now() - 40*86400000).toISOString() }, 
      { name: 'Vitamin C Zinc',    code: 'VIT-006', batchNo: 'BT-1029', opening_qty: 300, low_stock_level: 100, expiry_date: new Date(Date.now() + 300*86400000).toISOString(), mfg_date: new Date(Date.now() - 20*86400000).toISOString() }, 
    ];
  }, []);

  // ── Batch summary counts ─────────────────────────────────────────────────
  const batchSummary = useMemo(() => {
    const total = products.length;
    const expired = products.filter((p: any) => {
      if (!p.expiry_date) return false;
      return new Date(p.expiry_date) < new Date();
    }).length;
    const active = total - expired;
    return { total, active, expired };
  }, [products]);

  // ── 3. Batch Expiry Alerts ───────────────────────────────────────────────
  const expiryAlerts = useMemo(() => {
    return products
      .filter((p: any) => p.expiry_date)
      .map((p: any, idx: number) => {
        const daysLeft = Math.ceil((new Date(p.expiry_date).getTime() - Date.now()) / 86400000);
        return {
          productName: p.name || '—',
          batchNo: p.batchNo || `BT-${String(idx + 1).padStart(4, '0')}`,
          expiryDate: p.expiry_date,
          daysLeft,
        };
      })
      .filter((p: any) => p.daysLeft <= 90)
      .sort((a: any, b: any) => a.daysLeft - b.daysLeft);
  }, [products]);

  // ── 4. Low Stock Alerts ──────────────────────────────────────────────────
  const stockAlerts = useMemo(() => {
    return products
      .filter((p: any) => (p.opening_qty ?? 0) <= (p.low_stock_level ?? 0))
      .map((p: any) => ({
        productName: p.name || '—',
        productCode: p.code || '—',
        currentStock: p.opening_qty ?? 0,
        reorderLevel: p.low_stock_level ?? 0,
      }))
      .sort((a: any, b: any) => a.currentStock - b.currentStock);
  }, [products]);

  // ── Chart Data ────────────────────────────
  const barChartData = [
    { name: 'Jan', added: 120, consumed: 80 },
    { name: 'Feb', added: 210, consumed: 150 },
    { name: 'Mar', added: 180, consumed: 200 },
    { name: 'Apr', added: 240, consumed: 190 },
    { name: 'May', added: 300, consumed: 250 },
    { name: 'Jun', added: 280, consumed: 220 },
  ];

  const pieChartData = [
    { name: 'Healthy Stock', value: products.length - stockAlerts.length, color: '#84CC16' }, // Green
    { name: 'Low Stock', value: stockAlerts.filter((s:any) => s.currentStock > 0).length, color: '#F59E0B' }, // Amber
    { name: 'Out of Stock', value: stockAlerts.filter((s:any) => s.currentStock <= 0).length, color: '#EF4444' }, // Red
  ];

  const formatDate = (d: string) => {
    if (!d || d === '—') return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return d; }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-100 p-3 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <p className="text-slate-800 font-bold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-600 text-sm">{entry.name}: <span className="font-bold text-slate-800">{entry.value}</span></span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent === 0) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Page Header WITH Tab Switcher */}
        <div className="mb-2">
          <PageHeader
            title="Inventory Operations Dashboard"
            actions={
              !isSpecificUser ? (
                <DashboardTabSwitcher
                  companyId={companyIdToUse}
                  activeTab="dashboard1"
                  onViewChange={onViewChange}
                />
              ) : undefined
            }
          />
        </div>

        {/* TOP ROW: 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Batches */}
          <div className="bg-white rounded-[14px] px-5 py-4 border border-slate-200 relative overflow-hidden flex justify-between items-center hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#16a34a] rounded-l-[14px]" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-900 tracking-wide mb-1.5 uppercase">Total Batches</p>
              <h3 className="text-[20px] font-bold text-slate-900 leading-tight truncate">
                {batchSummary.total.toLocaleString()}
              </h3>
              <div className="text-[11px] text-slate-400 mt-1">
                <span className="text-emerald-500 font-bold">28%</span> Than Last Month
              </div>
            </div>
            <div className="w-[80px] h-[35px] ml-3 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkline1}>
                  <Line type="monotone" dataKey="v" stroke="#16a34a" strokeWidth={1.8} dot={false} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: Active Batches */}
          <div className="bg-white rounded-[14px] px-5 py-4 border border-slate-200 relative overflow-hidden flex justify-between items-center hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#2563eb] rounded-l-[14px]" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-900 tracking-wide mb-1.5 uppercase">Active Batches</p>
              <h3 className="text-[20px] font-bold text-slate-900 leading-tight truncate">
                {batchSummary.active.toLocaleString()}
              </h3>
              <div className="text-[11px] text-slate-400 mt-1">
                <span className="text-emerald-500 font-bold">12%</span> Than Last Month
              </div>
            </div>
            <div className="w-[80px] h-[35px] ml-3 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkline2}>
                  <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={1.8} dot={false} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3: Expired Batches */}
          <div className="bg-white rounded-[14px] px-5 py-4 border border-slate-200 relative overflow-hidden flex justify-between items-center hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#0891b2] rounded-l-[14px]" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-900 tracking-wide mb-1.5 uppercase">Expired Batches</p>
              <h3 className="text-[20px] font-bold text-slate-900 leading-tight truncate">
                {batchSummary.expired.toLocaleString()}
              </h3>
              <div className="text-[11px] text-slate-400 mt-1">
                <span className="text-emerald-500 font-bold">21%</span> Than Last Month
              </div>
            </div>
            <div className="w-[80px] h-[35px] ml-3 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkline3}>
                  <Line type="monotone" dataKey="v" stroke="#0891b2" strokeWidth={1.8} dot={false} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 4: Low Stock */}
          <div className="bg-white rounded-[14px] px-5 py-4 border border-slate-200 relative overflow-hidden flex justify-between items-center hover:-translate-y-1 transition-transform cursor-pointer">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ea580c] rounded-l-[14px]" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-900 tracking-wide mb-1.5 uppercase">Low Stock Items</p>
              <h3 className="text-[20px] font-bold text-slate-900 leading-tight truncate">
                {stockAlerts.length.toLocaleString()}
              </h3>
              <div className="text-[11px] text-slate-400 mt-1">
                <span className="text-rose-500 font-bold">1%</span> Than Last Month
              </div>
            </div>
            <div className="w-[80px] h-[35px] ml-3 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkline4}>
                  <Line type="monotone" dataKey="v" stroke="#ea580c" strokeWidth={1.8} dot={false} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Bar Chart and Pie Chart matching layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-[24px] p-6 border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-slate-900">Batch Movement</h2>
              <div className="px-4 py-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>6 Months</span>
                <ArrowRight className="w-3 h-3 rotate-90" />
              </div>
            </div>
            <div className="flex-1 min-h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={barChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent', stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="added" stroke="#ef4444" strokeWidth={3} fill="url(#colorAdded)" name="Added" />
                  <Area type="monotone" dataKey="consumed" stroke="#a855f7" strokeWidth={3} fill="url(#colorConsumed)" name="Consumed" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-2 rounded-[2px] bg-[#ef4444]" />
                <span className="text-xs font-medium text-slate-500">Added</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-2 rounded-[2px] bg-[#a855f7]" />
                <span className="text-xs font-medium text-slate-500">Consumed</span>
              </div>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-[24px] p-6 border border-slate-200 flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Stock Status</h2>
            <div className="flex-1 min-h-[200px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    innerRadius={0}
                    outerRadius={85}
                    dataKey="value"
                    stroke="white"
                    strokeWidth={2}
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-4">
              {pieChartData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-2 rounded-[2px]" style={{ backgroundColor: d.color }} />
                  <span className="text-sm font-medium text-slate-500">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: The Tables (Batch Expiry and Low Stock) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* 1. BATCH EXPIRY ALERTS */}
          <div className="bg-white rounded-[24px] p-6 border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Batch Expiry Alerts</h2>
              <div className="px-4 py-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>By Date</span>
                <ArrowRight className="w-3 h-3 rotate-90" />
              </div>
            </div>

            {expiryAlerts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4" />
                <p className="text-[15px] font-bold text-slate-700">No Expiry Alerts</p>
                <p className="text-sm text-slate-500 mt-1">All batches are within the safe expiry range.</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      {['Product', 'Batch ID', 'Expiry Date', 'Status'].map(h => (
                        <th key={h} className="pb-4 text-sm font-bold text-slate-500 border-b border-slate-100 whitespace-nowrap px-2 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expiryAlerts.slice(0, 5).map((a: any, idx: number) => (
                      <tr key={idx} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => onViewChange?.('products')}>
                        <td className="py-4 px-2 text-base font-semibold text-slate-800 border-b border-slate-50">
                          {a.productName}
                        </td>
                        <td className="py-4 px-2 text-sm font-medium text-slate-500 border-b border-slate-50">{a.batchNo}</td>
                        <td className="py-4 px-2 text-sm font-medium text-slate-500 border-b border-slate-50">{formatDate(a.expiryDate)}</td>
                        <td className="py-4 px-2 border-b border-slate-50">
                          <span className={`inline-flex items-center px-3 py-1 rounded-[8px] text-xs font-bold ${
                            a.daysLeft < 0 
                              ? 'bg-red-50 text-red-600 border border-red-100' 
                              : 'bg-orange-50 text-orange-600 border border-orange-100'
                          }`}>
                            {a.daysLeft < 0 ? 'Expired' : 'Expiring Soon'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 2. LOW STOCK ALERTS */}
          <div className="bg-white rounded-[24px] p-6 border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Low Stock Alerts</h2>
              <div className="px-4 py-1.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>By Stock</span>
                <ArrowRight className="w-3 h-3 rotate-90" />
              </div>
            </div>

            {stockAlerts.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4" />
                <p className="text-[15px] font-bold text-slate-700">No Low Stock Alerts</p>
                <p className="text-sm text-slate-500 mt-1">Current inventory levels are healthy.</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      {['Product', 'Code', 'Current Stock', 'Status'].map(h => (
                        <th key={h} className="pb-4 text-sm font-bold text-slate-400 border-b border-slate-100 whitespace-nowrap px-2 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stockAlerts.slice(0, 5).map((s: any, idx: number) => (
                      <tr key={idx} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => onViewChange?.('products')}>
                        <td className="py-4 px-2 text-base font-semibold text-slate-800 border-b border-slate-50">
                          {s.productName}
                        </td>
                        <td className="py-4 px-2 text-sm font-medium text-slate-500 border-b border-slate-50">{s.productCode}</td>
                        <td className="py-4 px-2 text-base font-bold text-slate-900 border-b border-slate-50">{s.currentStock.toLocaleString()}</td>
                        <td className="py-4 px-2 border-b border-slate-50">
                          <span className={`inline-flex items-center px-3 py-1 rounded-[8px] text-xs font-bold ${
                            s.currentStock <= 0 
                              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {s.currentStock <= 0 ? 'Out of Stock' : 'Low Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard1;
