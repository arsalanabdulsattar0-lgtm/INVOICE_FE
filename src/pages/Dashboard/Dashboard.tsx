import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  DollarSign
} from 'lucide-react';
import type { Invoice } from '../Invoices/InvoiceList';

interface DashboardProps {
  invoiceItems?: Invoice[];
}

const Dashboard: React.FC<DashboardProps> = ({ invoiceItems = [] }) => {
  // Calculation of stats
  const totalInvoices = invoiceItems.length;
  const paidInvoices = invoiceItems.filter(inv => inv.status === 'Paid');
  const pendingInvoices = invoiceItems.filter(inv => inv.status === 'Pending');
  const overdueInvoices = invoiceItems.filter(inv => inv.status === 'Overdue');
  const draftInvoices = invoiceItems.filter(inv => inv.status === 'Draft');

  const totalRevenue = invoiceItems.reduce((sum, inv) => sum + (inv.rawAmount || 0), 0);
  const paidRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.rawAmount || 0), 0);
  const pendingRevenue = pendingInvoices.reduce((sum, inv) => sum + (inv.rawAmount || 0), 0) + 
                         overdueInvoices.reduce((sum, inv) => sum + (inv.rawAmount || 0), 0);

  // Format currency
  const formatCurrency = (value: number) => {
    return '$' + value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Status breakdown percentages
  const totalCount = invoiceItems.length || 1;
  const paidPercent = (paidInvoices.length / totalCount) * 100;
  const pendingPercent = (pendingInvoices.length / totalCount) * 100;
  const overduePercent = (overdueInvoices.length / totalCount) * 100;
  const draftPercent = (draftInvoices.length / totalCount) * 100;

  const stats = [
    { 
      label: 'Total Revenue', 
      value: formatCurrency(totalRevenue), 
      icon: DollarSign, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50', 
      trend: `${totalInvoices} Invoices` 
    },
    { 
      label: 'Paid Invoices', 
      value: String(paidInvoices.length), 
      icon: CheckCircle2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      trend: `${((paidInvoices.length / totalCount) * 100).toFixed(0)}% of total` 
    },
    { 
      label: 'Pending Invoices', 
      value: String(pendingInvoices.length), 
      icon: Clock, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50', 
      trend: formatCurrency(pendingRevenue) 
    },
    { 
      label: 'Overdue Invoices', 
      value: String(overdueInvoices.length), 
      icon: TrendingUp, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50', 
      trend: `${overdueInvoices.length > 0 ? 'Urgent action' : 'All clear'}` 
    },
  ];

  const recentInvoices = [...invoiceItems]
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financial Overview</h1>
        <p className="text-slate-500 text-sm">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -5, rotateX: 2, rotateY: 2 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group cursor-default"
            style={{ perspective: '1000px' }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invoice Status Distribution Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-8 shadow-sm h-80 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-transparent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Invoice Status Distribution</h3>
            <p className="text-xs text-slate-400 mt-1">Breakdown of invoices by their current workflow status</p>
          </div>

          <div className="space-y-5">
            {/* Stacked Progress Bar */}
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
              {paidPercent > 0 && (
                <div style={{ width: `${paidPercent}%`, backgroundColor: '#10B981' }} className="h-full transition-all duration-500" title={`Paid: ${paidPercent.toFixed(0)}%`} />
              )}
              {pendingPercent > 0 && (
                <div style={{ width: `${pendingPercent}%`, backgroundColor: '#F59E0B' }} className="h-full transition-all duration-500" title={`Pending: ${pendingPercent.toFixed(0)}%`} />
              )}
              {overduePercent > 0 && (
                <div style={{ width: `${overduePercent}%`, backgroundColor: '#EF4444' }} className="h-full transition-all duration-500" title={`Overdue: ${overduePercent.toFixed(0)}%`} />
              )}
              {draftPercent > 0 && (
                <div style={{ width: `${draftPercent}%`, backgroundColor: '#94A3B8' }} className="h-full transition-all duration-500" title={`Draft: ${draftPercent.toFixed(0)}%`} />
              )}
            </div>

            {/* Legend / Breakdown grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10B981' }} />
                  Paid ({paidInvoices.length})
                </div>
                <p className="text-base font-black text-slate-800">{paidPercent.toFixed(0)}%</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#F59E0B' }} />
                  Pending ({pendingInvoices.length})
                </div>
                <p className="text-base font-black text-slate-800">{pendingPercent.toFixed(0)}%</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#EF4444' }} />
                  Overdue ({overdueInvoices.length})
                </div>
                <p className="text-base font-black text-slate-800">{overduePercent.toFixed(0)}%</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#94A3B8' }} />
                  Draft ({draftInvoices.length})
                </div>
                <p className="text-base font-black text-slate-800">{draftPercent.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 border-t pt-4">
            <span>Total Invoice Volume: <strong className="text-slate-700 font-bold">{formatCurrency(totalRevenue)}</strong></span>
            <span>Active Collection Rate: <strong className="text-emerald-600 font-bold">{((paidRevenue / (totalRevenue || 1)) * 100).toFixed(1)}%</strong></span>
          </div>
        </div>

        {/* Recent Invoices Card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm h-80 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Invoices</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black text-white shrink-0"
                     style={{ background: inv.clientColor || '#2759CD' }}>
                  {inv.clientInitials || 'IV'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">#{inv.id} &bull; {inv.client}</p>
                  <p className="text-[10px] text-slate-400">
                    {inv.issueDate} &bull; <span className="font-semibold text-slate-600">{inv.amount}</span>
                  </p>
                </div>
                <div className="text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0"
                     style={{ 
                       background: inv.status === 'Paid' ? '#F0FDF4' : inv.status === 'Pending' ? '#FFF7ED' : inv.status === 'Overdue' ? '#FFF1F2' : '#F1F5F9',
                       color: inv.status === 'Paid' ? '#15803D' : inv.status === 'Pending' ? '#C2410C' : inv.status === 'Overdue' ? '#BE123C' : '#64748B'
                     }}>
                  {inv.status}
                </div>
              </div>
            ))}
            {recentInvoices.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-10">No invoices created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
