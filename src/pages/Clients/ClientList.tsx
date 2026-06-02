import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Mail, Phone, MapPin, MoreHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DEFAULT_CLIENTS } from '../../utils/customerData';

export interface Client {
  name: string;
  email: string;
  phone: string;
  location: string;
  totalInvoiced: string;
}

const ClientList: React.FC = () => {
  const [clients] = useState<Client[]>(() => {
    try {
      const stored = localStorage.getItem('client_list');
      const parsed = stored ? JSON.parse(stored) : DEFAULT_CLIENTS;
      return parsed;
    } catch {
      return [
        { name: 'BlueRitt Technologies', email: 'billing@blueritt.com', phone: '+1 234 567 890', location: 'Austin, TX', totalInvoiced: 'Rs. 45,200' },
        { name: 'Acme Corp', email: 'finance@acme.com', phone: '+1 987 654 321', location: 'New York, NY', totalInvoiced: 'Rs. 12,800' },
        { name: 'Global Solutions', email: 'hello@globalsol.com', phone: '+1 555 123 456', location: 'San Francisco, CA', totalInvoiced: 'Rs. 8,900' },
        { name: 'Starlight Media', email: 'accounts@starlight.io', phone: '+1 444 777 888', location: 'London, UK', totalInvoiced: 'Rs. 2,450' },
        { name: 'Ahmed', email: 'ahmed@example.com', phone: '+92 300 1234567', location: 'Lahore, Pakistan', totalInvoiced: 'Rs. 0.00' },
      ];
      return DEFAULT_CLIENTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('client_list', JSON.stringify(clients));
    } catch { /* ignore */ }
  }, [clients]);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customers</h2>
          <p className="text-slate-400 text-xs mt-1">Manage your customer database and relationships.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search clients..."
              className="w-full sm:w-64 bg-slate-50 border-none rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>
          <Button variant="primary" size="md" icon={Plus} className="bg-indigo-600 hover:bg-indigo-500 shadow-indigo-100">
            Add Client
          </Button>
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clients.map((client, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <span className="text-xl font-bold">{client.name[0]}</span>
              </div>
              <Button variant="ghost" size="xs" icon={MoreHorizontal} className="px-2 py-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-4">{client.name}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Mail className="w-4 h-4 text-slate-300" />
                {client.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <Phone className="w-4 h-4 text-slate-300" />
                {client.phone}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <MapPin className="w-4 h-4 text-slate-300" />
                {client.location}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Invoiced</p>
                <p className="text-lg font-bold text-slate-900">{client.totalInvoiced}</p>
              </div>
              <Button variant="ghost" size="xs" className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-bold px-3 py-1.5">
                View Profile
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClientList;
