import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileText, User, Calendar, Tag, Plus, Trash2,
  Sparkles, CheckCircle, Zap,
  Package, Save, ArrowRight,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/* ── Types ── */
interface LineItem {
  id: string;
  description: string;
  qty: number;
  price: number;
  discount: number;
}

interface InlineFormData {
  client: string;
  subject: string;
  dueDate: string;
  discount: number;
  items: LineItem[];
}

const emptyForm = (): InlineFormData => ({
  client: '',
  subject: '',
  dueDate: '',
  discount: 0,
  items: [{ id: `item-${Date.now()}`, description: '', qty: 1, price: 0, discount: 0 }],
});

/* ── Helpers ── */
function genId() { return `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }
function calcSubtotal(items: LineItem[]) {
  return items.reduce((s, i) => s + i.qty * i.price * (1 - i.discount / 100), 0);
}

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

const AIInlinePanel: React.FC = () => {
  const { brand } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<InlineFormData>(emptyForm());
  const [saved, setSaved] = useState(false);
  const [highlightField, setHighlightField] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* ── Listen for AI events ── */
  useEffect(() => {
    const handleOpen = (e: CustomEvent) => {
      setIsOpen(true);
      setSaved(false);
      const detail = e.detail || {};

      setForm(prev => ({
        ...emptyForm(),
        client: detail.client || prev.client || '',
        subject: detail.subject || '',
        dueDate: detail.dueDate || '',
        discount: typeof detail.discount === 'number' ? detail.discount : prev.discount,
        items: prev.items.length ? prev.items : emptyForm().items,
      }));

      if (detail.focusField) {
        setTimeout(() => setHighlightField(detail.focusField), 300);
      }
    };

    const handleAddProduct = (e: CustomEvent) => {
      const { name, price, qty } = e.detail || {};
      setForm(prev => ({
        ...prev,
        items: [
          ...prev.items,
          { id: genId(), description: name || '', qty: qty || 1, price: price || 0, discount: 0 },
        ],
      }));
      if (!isOpen) setIsOpen(true);
      setHighlightField('items');
    };

    const handleDiscount = (e: CustomEvent) => {
      const pct = Number(e.detail?.percent) || 0;
      setForm(prev => ({ ...prev, discount: pct }));
      setHighlightField('discount');
    };

    const handleSetClient = (e: CustomEvent) => {
      setForm(prev => ({ ...prev, client: e.detail?.value || '' }));
      setHighlightField('client');
    };

    const handleDueDate = (e: CustomEvent) => {
      setForm(prev => ({ ...prev, dueDate: e.detail?.value || '' }));
      setHighlightField('dueDate');
    };

    window.addEventListener('ai-open-inline-panel', handleOpen as EventListener);
    window.addEventListener('ai-inline-add-product', handleAddProduct as EventListener);
    window.addEventListener('ai-inline-discount', handleDiscount as EventListener);
    window.addEventListener('ai-inline-set-client', handleSetClient as EventListener);
    window.addEventListener('ai-inline-due-date', handleDueDate as EventListener);

    return () => {
      window.removeEventListener('ai-open-inline-panel', handleOpen as EventListener);
      window.removeEventListener('ai-inline-add-product', handleAddProduct as EventListener);
      window.removeEventListener('ai-inline-discount', handleDiscount as EventListener);
      window.removeEventListener('ai-inline-set-client', handleSetClient as EventListener);
      window.removeEventListener('ai-inline-due-date', handleDueDate as EventListener);
    };
  }, [isOpen]);

  /* ── Clear highlight after brief flash ── */
  useEffect(() => {
    if (highlightField) {
      const t = setTimeout(() => setHighlightField(null), 1800);
      return () => clearTimeout(t);
    }
  }, [highlightField]);

  /* ── Click outside ── */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 100);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  /* ── Item helpers ── */
  const updateItem = useCallback((id: string, field: keyof LineItem, value: string | number) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i),
    }));
  }, []);

  const addItem = useCallback(() => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { id: genId(), description: '', qty: 1, price: 0, discount: 0 }],
    }));
    setHighlightField('items');
  }, []);

  const removeItem = useCallback((id: string) => {
    setForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }));
  }, []);

  /* ── Save ── */
  const handleSave = useCallback(() => {
    const subtotal = calcSubtotal(form.items);
    const discountAmt = subtotal * (form.discount / 100);
    const total = subtotal - discountAmt;
    const invId = 'INV-' + Math.floor(1000 + Math.random() * 9000);
    const initials = form.client ? form.client.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'IV';
    const colors = ['#2759CD', '#10B981', '#F59E0B', '#8B5CF6', '#EE4932', '#0EA5E9'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const now = new Date().toISOString().split('T')[0];

    const invoice = {
      id: invId,
      client: form.client || 'Unknown Client',
      clientInitials: initials,
      clientColor: color,
      issueDate: now,
      dueDate: form.dueDate || now,
      amount: `$${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      rawAmount: total,
      status: 'Draft',
      payment: 'Net 30',
      type: 'Standard',
    };

    try {
      const stored = localStorage.getItem('invoice_list');
      const list = stored ? JSON.parse(stored) : [];
      localStorage.setItem('invoice_list', JSON.stringify([invoice, ...list]));
      window.dispatchEvent(new CustomEvent('ai-sync-data'));
    } catch { /* */ }

    setSaved(true);
    setTimeout(() => { setIsOpen(false); setSaved(false); setForm(emptyForm()); }, 1600);
  }, [form]);

  const subtotal = calcSubtotal(form.items);
  const discountAmt = subtotal * (form.discount / 100);
  const total = subtotal - discountAmt;

  const fieldGlow = (field: string) =>
    highlightField === field
      ? { boxShadow: `0 0 0 2px ${brand.primary}55, 0 0 12px ${brand.primary}30`, borderColor: brand.primary, transition: 'all 0.3s' }
      : {};

  /* ── Render ── */
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200]"
            style={{ backdropFilter: 'blur(6px)', background: 'rgba(15, 23, 42, 0.45)' }}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.93, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 30 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="fixed z-[201] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl"
            style={{ maxHeight: '90vh' }}
          >
            <div
              className="rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: `0 32px 80px -16px rgba(0,0,0,0.3), 0 0 0 1px ${brand.primary}20, 0 8px 32px -8px ${brand.primary}20`,
                maxHeight: '90vh',
              }}
            >
              {/* ── HEADER ── */}
              <div
                className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-slate-100 shrink-0"
                style={{ background: `linear-gradient(135deg, ${brand.primary}08 0%, transparent 100%)` }}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}bb)`, boxShadow: `0 4px 12px ${brand.primary}40` }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-[15px] font-black text-slate-800">AI Invoice Creator</h2>
                  <p className="text-[11px] text-slate-400 font-medium">Inline • No navigation needed</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── BODY ── */}
              <div className="overflow-y-auto px-6 py-5 space-y-5" style={{ maxHeight: 'calc(90vh - 180px)' }}>

                {/* Row 1: Client + Subject */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Client */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
                      <User className="w-3 h-3" /> Client Name
                    </label>
                    <input
                      value={form.client}
                      onChange={e => setForm(p => ({ ...p, client: e.target.value }))}
                      placeholder="e.g. BlueRitt Technologies"
                      className="w-full h-10 px-4 rounded-xl text-[13px] font-semibold text-slate-700 placeholder:text-slate-300 outline-none border transition-all"
                      style={{ background: '#F8FAFF', borderColor: '#e2e8f0', ...fieldGlow('client') }}
                    />
                  </div>
                  {/* Subject */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
                      <FileText className="w-3 h-3" /> Subject / Project
                    </label>
                    <input
                      value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                      placeholder="e.g. Website Redesign Phase 1"
                      className="w-full h-10 px-4 rounded-xl text-[13px] font-semibold text-slate-700 placeholder:text-slate-300 outline-none border transition-all"
                      style={{ background: '#F8FAFF', borderColor: '#e2e8f0' }}
                    />
                  </div>
                </div>

                {/* Row 2: Due Date + Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
                      <Calendar className="w-3 h-3" /> Due Date
                    </label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                      className="w-full h-10 px-4 rounded-xl text-[13px] font-semibold text-slate-700 outline-none border transition-all"
                      style={{ background: '#F8FAFF', borderColor: '#e2e8f0', ...fieldGlow('dueDate') }}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
                      <Tag className="w-3 h-3" /> Discount %
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={form.discount || ''}
                        onChange={e => setForm(p => ({ ...p, discount: Number(e.target.value) }))}
                        placeholder="0"
                        className="w-full h-10 pl-4 pr-10 rounded-xl text-[13px] font-semibold text-slate-700 placeholder:text-slate-300 outline-none border transition-all"
                        style={{ background: '#F8FAFF', borderColor: '#e2e8f0', ...fieldGlow('discount') }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">%</span>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                      <Package className="w-3 h-3" /> Line Items
                    </label>
                    <button
                      onClick={addItem}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-all hover:opacity-90 cursor-pointer"
                      style={{ background: `${brand.primary}12`, color: brand.primary }}
                    >
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  </div>

                  {/* Items header */}
                  <div className="grid text-[10px] font-black text-slate-400 uppercase tracking-wider px-3 pb-1.5"
                    style={{ gridTemplateColumns: '1fr 60px 90px 60px 28px' }}>
                    <span>Description</span>
                    <span className="text-center">Qty</span>
                    <span className="text-center">Price</span>
                    <span className="text-center">Disc%</span>
                    <span />
                  </div>

                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {form.items.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, height: 0, scale: 0.96 }}
                          animate={{ opacity: 1, height: 'auto', scale: 1 }}
                          exit={{ opacity: 0, height: 0, scale: 0.96 }}
                          transition={{ duration: 0.2 }}
                          className="grid gap-2 items-center rounded-xl px-3 py-2.5 border transition-all"
                          style={{
                            gridTemplateColumns: '1fr 60px 90px 60px 28px',
                            background: idx % 2 === 0 ? '#F8FAFF' : '#FFFFFF',
                            borderColor: highlightField === 'items' ? `${brand.primary}30` : '#e2e8f0',
                            ...( highlightField === 'items' ? { boxShadow: `0 0 0 1px ${brand.primary}20` } : {}),
                          }}
                        >
                          <input
                            value={item.description}
                            onChange={e => updateItem(item.id, 'description', e.target.value)}
                            placeholder={`Item ${idx + 1}…`}
                            className="bg-transparent text-[12px] font-semibold text-slate-700 placeholder:text-slate-300 outline-none"
                          />
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={e => updateItem(item.id, 'qty', Number(e.target.value))}
                            className="bg-transparent text-[12px] font-bold text-center text-slate-700 outline-none w-full"
                          />
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold">$</span>
                            <input
                              type="number"
                              min="0"
                              value={item.price || ''}
                              onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
                              placeholder="0.00"
                              className="bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 pl-5 pr-2 py-1 outline-none w-full"
                            />
                          </div>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount || ''}
                            onChange={e => updateItem(item.id, 'discount', Number(e.target.value))}
                            placeholder="0"
                            className="bg-transparent text-[12px] font-bold text-center text-slate-700 outline-none w-full"
                          />
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={form.items.length === 1}
                            className="flex items-center justify-center w-6 h-6 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all disabled:opacity-30 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Totals */}
                <div
                  className="rounded-2xl p-4 flex flex-col gap-2"
                  style={{ background: `linear-gradient(135deg, ${brand.primary}06 0%, ${brand.primary}10 100%)`, border: `1px solid ${brand.primary}18` }}
                >
                  <div className="flex justify-between text-[12px] text-slate-500 font-semibold">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  {form.discount > 0 && (
                    <div className="flex justify-between text-[12px] font-semibold" style={{ color: '#10B981' }}>
                      <span>Discount ({form.discount}%)</span>
                      <span>-${discountAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 mt-1 pt-2 flex justify-between font-black text-[15px]" style={{ color: brand.primary }}>
                    <span>Total</span>
                    <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* ── FOOTER ── */}
              <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <AnimatePresence mode="wait">
                  {saved ? (
                    <motion.div
                      key="saved"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-black text-white"
                      style={{ background: '#10B981' }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Invoice Saved!
                    </motion.div>
                  ) : (
                    <motion.button
                      key="save"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      onClick={handleSave}
                      whileHover={{ scale: 1.03, boxShadow: `0 8px 24px ${brand.primary}40` }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-black text-white cursor-pointer"
                      style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.primary}cc)` }}
                    >
                      <Save className="w-4 h-4" />
                      Save Invoice
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* AI quick-action strip */}
              <div
                className="px-6 py-3 flex items-center gap-2 border-t border-slate-100"
                style={{ background: `${brand.primary}04` }}
              >
                <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: brand.primary }} />
                <p className="text-[11px] text-slate-400 font-medium">
                  Try: <span className="font-bold text-slate-500">"Add product Laptop"</span> · <span className="font-bold text-slate-500">"Apply 15% discount"</span> · <span className="font-bold text-slate-500">"Set due date next week"</span>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default AIInlinePanel;
