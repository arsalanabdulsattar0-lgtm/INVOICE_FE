import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { ScrollArea, Input, Select } from '../../components/ui/FormControls';
import { PageHeader, CardTitle } from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import { Plus, Trash2, Save, Printer } from 'lucide-react';
import type { BPAdjustmentData, BPAdjustmentDetailRow } from '../../types/types';

interface Props {
  data: BPAdjustmentData;
  onChange: (data: BPAdjustmentData) => void;
  onSave?: (data: BPAdjustmentData) => void;
  onViewChange?: (view: string) => void;
}

export const BPAdjustmentEditor: React.FC<Props> = ({
  data,
  onChange,
  onSave,
  onViewChange
}) => {
  const { brand } = useTheme();

  // Load all business partners
  const allPartners = useMemo(() => {
    try {
      const stored = localStorage.getItem('customer_list');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }, []);

  const [refVal, setRefVal] = useState<string>(() => data.ref || '');
  const narrationVal = data.narration || '';
  const date = data.date || new Date().toISOString().split('T')[0];
  const voucherType = data.voucherType || 'Adjustment';
  const status = data.status || 'Posted';

  // Load rows
  const [rows, setRows] = useState<BPAdjustmentDetailRow[]>(() => {
    if (data.items && data.items.length > 0) return [...data.items];
    return [];
  });

  const [departmentVal, setDepartmentVal] = useState<string>(() => rows[0]?.deptCode || 'D002');

  // Track the active row index for header details display
  const [activeRowIdx, setActiveRowIdx] = useState<number>(0);
  
  // Track open dropdown index and cell search inputs
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);
  const [rowSearchVal, setRowSearchVal] = useState<string>('');
  const dropdownRef = useRef<HTMLTableCellElement>(null);

  // Filter partners based on selected type
  const filteredPartners = useMemo(() => {
    return allPartners;
  }, [allPartners]);

  const partnerOptions = useMemo(() => {
    return filteredPartners.map((p: any) => ({
      id: p.customer_id || p.id || p.name,
      name: `${p.customer_id || p.id || ''} — ${p.name}`.trim(),
      rawName: p.name,
      balance: p.opening_balance || 0,
      accountType: p.bp_type === 'supplier' ? 'TRADE PAYABLE' : 'CREDIT SALE',
      bp_type: p.bp_type || 'customer'
    }));
  }, [filteredPartners]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownIdx(null);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  // Find active customer info from active row
  const activeRowCustomerInfo = useMemo(() => {
    const activeRow = rows[activeRowIdx];
    if (!activeRow) return { name: '—', accountType: '—', balance: '0.00 Dr' };
    const p = partnerOptions.find((opt: any) => opt.id === activeRow.partnerId);
    if (!p) return { name: '—', accountType: '—', balance: '0.00 Dr' };
    const balSuffix = p.bp_type === 'supplier' ? 'Cr' : 'Dr';
    return {
      name: p.rawName,
      accountType: p.accountType,
      balance: `${p.balance.toFixed(2)} ${balSuffix}`
    };
  }, [rows, activeRowIdx, partnerOptions]);

  // Helper to look up partner balance for any row
  const getRowPartnerBalance = (partnerId: string) => {
    const p = partnerOptions.find((opt: any) => opt.id === partnerId);
    if (!p) return '0.00 Dr';
    const balSuffix = p.bp_type === 'supplier' ? 'Cr' : 'Dr';
    return `${p.balance.toFixed(2)} ${balSuffix}`;
  };

  // Synchronize changes back to parent
  useEffect(() => {
    // Main account fields mapped to active row customer
    const activeRow = rows[activeRowIdx];
    const partnerId = activeRow ? activeRow.partnerId : '';
    const partnerName = activeRowCustomerInfo.name !== '—' ? activeRowCustomerInfo.name : '';
    const activePartnerType = activeRowCustomerInfo.accountType === 'TRADE PAYABLE' ? 'supplier' : 'customer';

    onChange({
      ...data,
      partnerType: activePartnerType,
      partnerId,
      partnerName,
      ref: refVal,
      date,
      narration: narrationVal,
      voucherType,
      status,
      items: rows
    });
  }, [rows, activeRowIdx, activeRowCustomerInfo, refVal, date, narrationVal, voucherType, status]);

  // Load active departments
  const departmentOptions = useMemo(() => {
    try {
      const stored = localStorage.getItem('departments');
      if (stored) {
        const list = JSON.parse(stored);
        const active = list.filter((d: any) => d.active);
        if (active.length > 0) {
          return active.map((d: any) => ({ value: d.id, label: `${d.id}-${d.name}` }));
        }
      }
    } catch {}
    return [
      { value: 'D001', label: 'D001-HR' },
      { value: 'D002', label: 'D002-Finance' },
      { value: 'D003', label: 'D003-Accounts' },
      { value: 'D004', label: 'D004-Sales' },
      { value: 'D005', label: 'D005-Purchase' }
    ];
  }, []);

  // Load taxes
  const taxOptions = [
    { value: 'None', label: 'None (0%)', rate: 0 },
    { value: 'T001', label: 'T001 (18%)', rate: 18 },
    { value: 'T002', label: 'T002 (15%)', rate: 15 },
    { value: 'T003', label: 'T003 (5%)', rate: 5 }
  ];

  // GL accounts list
  const glOptions = [
    { value: '4000', label: '4000 — Sales Revenue' },
    { value: '4100', label: '4100 — Service Income' },
    { value: '4200', label: '4200 — Other Revenue' },
    { value: '5000', label: '5000 — Cost of Sales' },
    { value: '6000', label: '6000 — Bad Debts Expense' },
    { value: '6100', label: '6100 — General Admin Expenses' },
    { value: '7000', label: '7000 — Taxes Expense' },
    { value: '2000', label: '2000 — Accounts Payable' },
    { value: '1200', label: '1200 — Accounts Receivable' }
  ];

  // Filter dropdown options based on search query
  const filteredDropdownOptions = useMemo(() => {
    if (!rowSearchVal) return partnerOptions;
    const q = rowSearchVal.toLowerCase();
    return partnerOptions.filter((p: any) =>
      p.id.toLowerCase().includes(q) ||
      p.rawName.toLowerCase().includes(q)
    );
  }, [partnerOptions, rowSearchVal]);

  // Add row
  const handleAddRow = () => {
    const defaultPartner = partnerOptions[0] || { id: '' };
    const newRow: BPAdjustmentDetailRow = {
      partnerId: defaultPartner.id,
      date: date,
      voucherNo: data.adjustmentNumber,
      ref: refVal,
      glCode: '4000',
      narration: narrationVal,
      analysisCode: '',
      deptCode: departmentVal,
      debit: 0,
      credit: 0,
      taxId: 'None',
      taxAmt: 0,
      voucherType: voucherType
    };
    setRows(prev => [...prev, newRow]);
    setActiveRowIdx(rows.length); // switch focus to newly added row
  };

  // Update row fields
  const handleUpdateRow = (idx: number, field: keyof BPAdjustmentDetailRow, val: any) => {
    setRows(prev => {
      const copy = [...prev];
      const row = { ...copy[idx] };

      if (field === 'debit') {
        row.debit = parseFloat(val) || 0;
        if (row.debit > 0) row.credit = 0;
      } else if (field === 'credit') {
        row.credit = parseFloat(val) || 0;
        if (row.credit > 0) row.debit = 0;
      } else {
        (row as any)[field] = val;
      }

      // Recalculate tax
      const taxRate = taxOptions.find(t => t.value === row.taxId)?.rate || 0;
      const baseAmount = row.debit > 0 ? row.debit : row.credit;
      row.taxAmt = parseFloat(((baseAmount * taxRate) / 100).toFixed(2));

      copy[idx] = row;
      return copy;
    });
  };

  // Delete row
  const handleDeleteRow = (idx: number) => {
    if (rows.length <= 1) {
      alert('At least one transaction line is required!');
      return;
    }
    const newRows = rows.filter((_, i) => i !== idx);
    setRows(newRows);
    // Adjust active index
    if (activeRowIdx >= newRows.length) {
      setActiveRowIdx(newRows.length - 1);
    }
  };

  // Totals
  const totalDebit = useMemo(() => rows.reduce((s, r) => s + r.debit, 0), [rows]);
  const totalCredit = useMemo(() => rows.reduce((s, r) => s + r.credit, 0), [rows]);

  // Save Voucher
  const handleSave = () => {
    const hasEmptyPartner = rows.some(r => !r.partnerId);
    if (hasEmptyPartner) {
      alert('Please make sure all details rows have a selected Customer ID!');
      return;
    }
    if (onSave) {
      onSave({
        adjustmentNumber: data.adjustmentNumber,
        date,
        partnerType: activeRowCustomerInfo.accountType === 'TRADE PAYABLE' ? 'supplier' : 'customer',
        partnerId: rows[activeRowIdx]?.partnerId || '',
        partnerName: activeRowCustomerInfo.name,
        voucherNo: data.adjustmentNumber,
        ref: refVal,
        narration: narrationVal,
        voucherType,
        status,
        items: rows
      });
    }
    if (onViewChange) {
      onViewChange('bp-adjustments');
    }
  };

  // Print Voucher
  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { window.print(); return; }

    const printDate = new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');

    win.document.write(`<!DOCTYPE html><html><head>
      <title>BP Adjustment Voucher — ${data.adjustmentNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 9pt; color: #000; background: #fff; padding: 15mm 20mm; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .header h1 { font-size: 16pt; font-weight: bold; margin-bottom: 2px; }
        .header p { font-size: 10pt; font-weight: bold; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
        .meta-line { font-size: 9pt; }
        .meta-label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 8.5pt; }
        th, td { border: 1px solid #000; padding: 5px 8px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; }
        .text-right { text-align: right; }
        .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center; }
        .sig-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 4px; font-size: 8pt; font-weight: bold; }
        @media print { body { padding: 0; } }
      </style>
    </head><body>
      <div class="header">
        <h1>BP Adjustment Voucher Statement</h1>
        <p>VOUCHER NO: ${data.adjustmentNumber}</p>
      </div>
      <div class="meta-grid">
        <div>
          <span class="meta-label">Date:</span> ${printDate}<br/>
          <span class="meta-label">Reference:</span> ${refVal || '—'}<br/>
          <span class="meta-label">Adjustment Type:</span> ${activeRowCustomerInfo.accountType === 'TRADE PAYABLE' ? 'Supplier' : 'Customer'}
        </div>
        <div style="text-align: right;">
          <span class="meta-label">Voucher Type:</span> ${voucherType}<br/>
          <span class="meta-label">Status:</span> ${status}
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">Sr#</th>
            <th style="width: 25%;">Customer/Supplier ID</th>
            <th style="width: 20%;">Account/GL</th>
            <th style="width: 22%;">Ref & Details</th>
            <th style="width: 14%; text-align: right;">Debit (Rs.)</th>
            <th style="width: 14%; text-align: right;">Credit (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${row.partnerId}</td>
              <td>${row.glCode}</td>
              <td>${row.narration || row.ref || '—'}</td>
              <td class="text-right">${row.debit > 0 ? row.debit.toFixed(2) : '0.00'}</td>
              <td class="text-right">${row.credit > 0 ? row.credit.toFixed(2) : '0.00'}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold; background: #fafafa;">
            <td colspan="4" style="text-align: right;">Total:</td>
            <td class="text-right">${totalDebit.toFixed(2)}</td>
            <td class="text-right">${totalCredit.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style="font-size: 9pt; margin-top: 10px;">
        <span class="meta-label">Voucher Description:</span> ${narrationVal || '—'}
      </div>

      <div class="footer">
        <div><div class="sig-line">Prepared By</div></div>
        <div><div class="sig-line">Checked By</div></div>
        <div><div class="sig-line">Authorized Signatory</div></div>
      </div>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  // Helper to resolve partner display value (code - name)
  const getPartnerDisplayVal = (idx: number, partnerId: string) => {
    if (idx === activeRowIdx && openDropdownIdx === idx) {
      return rowSearchVal !== '' ? rowSearchVal : partnerId;
    }
    if (!partnerId) return '';
    const opt = partnerOptions.find((p: { id: string; rawName: string }) => p.id === partnerId);
    if (!opt) return partnerId;
    return `${partnerId} - ${opt.rawName}`;
  };

  return (
    <div className="min-h-full p-6 space-y-6" style={{ background: '#F4F7FD' }}>
      {/* Page Header */}
      <PageHeader
        title={data.adjustmentNumber ? `Business Partner Adjustment: ${data.adjustmentNumber}` : 'Business Partner Adjustment'}
        subtitle="Record ledger adjustments matching reference desktop standards."
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Reference & Department Header Box */}
        <Card className="p-4 bg-white" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            {/* Left Side: Fields */}
            <div className="w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                variant="compact"
                label="Reference"
                placeholder="Voucher Reference"
                value={refVal}
                onChange={e => setRefVal(e.target.value)}
              />

              <Select
                variant="compact"
                label="Department"
                value={departmentVal}
                onChange={e => setDepartmentVal(e.target.value)}
                options={departmentOptions}
              />
            </div>

            {/* Right Side: Buttons */}
            <div className="flex items-center gap-3 self-end md:self-auto select-none">
              <Button
                onClick={handleSave}
                className="flex items-center gap-1.5 h-8 px-4 text-xs font-bold cursor-pointer"
                style={{ backgroundColor: brand.primary, color: '#FFF' }}
              >
                <Save className="w-4 h-4" /> Save
              </Button>

              <Button
                onClick={() => {
                  if (onViewChange) onViewChange('dashboard');
                }}
                variant="secondary"
                className="flex items-center gap-1.5 h-8 px-4 text-xs font-bold cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                onClick={handlePrint}
                variant="secondary"
                className="flex items-center gap-1.5 h-8 px-4 text-xs font-bold cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print
              </Button>
            </div>
          </div>
        </Card>

        {/* Editable Multi-row Grid */}
        <div className="bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
          {/* Solid Header Bar */}
          <div className="px-4 py-2.5 flex items-center justify-between text-white"
            style={{ backgroundColor: brand.primary }}>
            <CardTitle title="Transaction Lines Details" count={rows.length} countLabel="records" />
            <Button
              onClick={handleAddRow}
              variant="secondary"
              className="flex items-center gap-1.5 h-7 px-3 text-[10px] font-bold border-white/20 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Detail Line
            </Button>
          </div>

          <ScrollArea className="w-full h-[calc(100vh-320px)] overflow-auto" style={{ maxHeight: 'none' }}>
            <table className="w-full min-w-[1150px] table-fixed border-collapse text-left">
              <thead>
                <tr className="bg-white border-b border-[#E2E8F0] select-none">
                  <th style={{ width: '3%' }} className="pl-4 pr-2 py-3.5 text-center text-[10px] font-black tracking-widest text-black">#</th>
                  <th style={{ width: '14%' }} className="px-3 py-3.5 text-[10px] font-black tracking-widest text-black">Business Partner No.</th>
                  <th style={{ width: '10%' }} className="px-3 py-3.5 text-[10px] font-black tracking-widest text-black">Date</th>
                  <th style={{ width: '7%' }} className="px-3 py-3.5 text-[10px] font-black tracking-widest text-black">Voucher No</th>
                  <th style={{ width: '9%' }} className="px-3 py-3.5 text-[10px] font-black tracking-widest text-black">GL Account</th>
                  <th style={{ width: '12%' }} className="px-3 py-3.5 text-[10px] font-black tracking-widest text-black">Narration</th>
                  <th style={{ width: '7%' }} className="px-3 py-3.5 text-right text-[10px] font-black tracking-widest text-black">Debit (Rs.)</th>
                  <th style={{ width: '7%' }} className="px-3 py-3.5 text-right text-[10px] font-black tracking-widest text-black">Credit (Rs.)</th>
                  <th style={{ width: '10%' }} className="px-3 py-3.5 text-[10px] font-black tracking-widest text-black">Tax ID</th>
                  <th style={{ width: '10%' }} className="px-3 py-3.5 text-left text-[10px] font-black tracking-widest text-black">Tax Amt</th>
                  <th style={{ width: '7%' }} className="px-3 py-3.5 text-[10px] font-black tracking-widest text-black">Balance</th>
                  <th style={{ width: '4%' }} className="pl-2 pr-8 py-3.5 text-center text-[10px] font-black tracking-widest text-black">Delete</th>
                </tr>
              </thead>
              <tbody className="overflow-visible">
                {rows.map((row, idx) => {
                  const isRowActive = idx === activeRowIdx;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setActiveRowIdx(idx)}
                      className={`border-b border-[#E2E8F0] hover:bg-slate-50/60 transition-colors ${
                        isRowActive ? 'bg-blue-50/10' : ''
                      }`}
                    >
                      {/* Active Row Indicator */}
                      <td className="pl-4 pr-2 py-3 text-center text-[12px] font-medium text-slate-400">
                        {isRowActive ? (
                          <span className="text-blue-600 font-extrabold text-sm">✏️</span>
                        ) : (
                          idx + 1
                        )}
                      </td>

                      {/* Business Partner No. — Custom Multi-column Combobox Inline Dropdown */}
                      <td className="px-2 py-3 relative overflow-visible" ref={isRowActive ? dropdownRef : undefined}>
                        <Input
                          variant="compact"
                          type="text"
                          value={getPartnerDisplayVal(idx, row.partnerId)}
                          onClick={() => {
                            setActiveRowIdx(idx);
                            setOpenDropdownIdx(idx);
                            setRowSearchVal('');
                          }}
                          onChange={e => {
                            handleUpdateRow(idx, 'partnerId', e.target.value);
                            setRowSearchVal(e.target.value);
                            setOpenDropdownIdx(idx);
                          }}
                          placeholder="Select ID..."
                          className="w-full font-medium"
                        />
                        
                        {/* Custom Dropdown popover */}
                        {openDropdownIdx === idx && (
                          <div
                            className="absolute left-2 mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-[999] max-h-56 overflow-y-auto text-left border-solid w-[320px]"
                          >
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-100 border-b border-slate-200 select-none text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                  <th className="p-2 pl-3" style={{ width: '35%' }}>Customer ID</th>
                                  <th className="p-2">Customer</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredDropdownOptions.length === 0 ? (
                                  <tr>
                                    <td colSpan={2} className="p-3 text-center text-slate-400 font-semibold">
                                      No partners found
                                    </td>
                                  </tr>
                                ) : (
                                  filteredDropdownOptions.map((p: any) => (
                                    <tr
                                      key={p.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleUpdateRow(idx, 'partnerId', p.id);
                                        setOpenDropdownIdx(null);
                                      }}
                                      className="hover:bg-blue-50/60 border-b border-slate-100 cursor-pointer transition-colors"
                                    >
                                      <td className="p-2 pl-3 font-black text-blue-600 text-[11px]">{p.id}</td>
                                      <td className="p-2 text-slate-700 font-extrabold text-[11px]">{p.rawName}</td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-2 py-3">
                        <Input
                          variant="compact"
                          type="date"
                          value={row.date}
                          onChange={e => handleUpdateRow(idx, 'date', e.target.value)}
                          className="w-full cursor-pointer"
                        />
                      </td>

                      {/* Voucher No */}
                      <td className="px-2 py-3">
                        <Input
                          variant="compact"
                          type="text"
                          value={row.voucherNo}
                          onChange={e => handleUpdateRow(idx, 'voucherNo', e.target.value)}
                          className="w-full"
                        />
                      </td>

                      {/* GL Account */}
                      <td className="px-2 py-3">
                        <Select
                          variant="compact"
                          value={row.glCode}
                          onChange={e => handleUpdateRow(idx, 'glCode', e.target.value)}
                          className="w-full cursor-pointer"
                          options={glOptions}
                        />
                      </td>

                      {/* Narration */}
                      <td className="px-2 py-3">
                        <Input
                          variant="compact"
                          type="text"
                          value={row.narration}
                          onChange={e => handleUpdateRow(idx, 'narration', e.target.value)}
                          className="w-full font-normal"
                          placeholder="Line details..."
                        />
                      </td>

                      {/* Debit */}
                      <td className="px-2 py-3">
                        <Input
                          variant="compact"
                          type="number"
                          value={row.debit || ''}
                          onChange={e => handleUpdateRow(idx, 'debit', e.target.value)}
                          className="w-full font-bold text-right text-emerald-600"
                          placeholder="0.00"
                        />
                      </td>

                      {/* Credit */}
                      <td className="px-2 py-3">
                        <Input
                          variant="compact"
                          type="number"
                          value={row.credit || ''}
                          onChange={e => handleUpdateRow(idx, 'credit', e.target.value)}
                          className="w-full font-bold text-right text-purple-600"
                          placeholder="0.00"
                        />
                      </td>

                      {/* TaxID */}
                      <td className="px-2 py-3">
                        <Select
                          variant="compact"
                          value={row.taxId}
                          onChange={e => handleUpdateRow(idx, 'taxId', e.target.value)}
                          className="w-full cursor-pointer"
                          options={taxOptions}
                        />
                      </td>

                      {/* Tax Amt */}
                      <td className="px-2 py-3">
                        <Input
                          variant="compact"
                          type="text"
                          readOnly
                          value={row.taxAmt > 0 ? row.taxAmt.toFixed(2) : '0.00'}
                          className="w-full font-medium text-left text-slate-600 !bg-slate-50/50"
                        />
                      </td>

                      {/* Balance */}
                      <td className="px-2 py-3">
                        <Input
                          variant="compact"
                          type="text"
                          readOnly
                          value={getRowPartnerBalance(row.partnerId)}
                          className="w-full font-bold text-center text-[#000080] !bg-slate-50/50"
                        />
                      </td>

                      {/* Delete */}
                      <td className="pl-2 pr-8 py-3 text-center">
                        <Button
                          type="button"
                          onClick={() => handleDeleteRow(idx)}
                          variant="ghost"
                          size="xs"
                          icon={Trash2}
                          title="Delete"
                          className="!px-1 !text-red-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  );
                })}

                {/* Mock Empty Row displaying asterisk (*) matching standard desktop grids */}
                <tr
                  onClick={handleAddRow}
                  className="border-b border-[#E2E8F0] hover:bg-slate-50/50 cursor-pointer bg-slate-50/10 text-slate-400 font-bold"
                >
                  <td className="pl-4 pr-2 py-3 text-center text-sm font-black text-slate-400">*</td>
                  <td colSpan={11} className="pl-3 pr-4 py-3 text-[10.5px] font-black text-slate-400 italic select-none">
                    + Click here to append a new transaction adjustment line...
                  </td>
                </tr>
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default BPAdjustmentEditor;
