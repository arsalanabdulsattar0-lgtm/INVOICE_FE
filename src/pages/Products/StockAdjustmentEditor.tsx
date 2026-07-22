import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { ScrollArea, Input, Select, Toggle } from '../../components/ui/FormControls';
import { PageHeader, CardTitle } from '../../components/ui/Typography';
import Card from '../../components/ui/Card';
import { Plus, Trash2, Save, Printer } from 'lucide-react';
import type { StockAdjustmentData, StockAdjustmentDetailRow } from '../../types/types';

interface Props {
  data?: StockAdjustmentData;
  onSave?: (data: StockAdjustmentData) => void;
  onViewChange?: (view: string) => void;
}

export const StockAdjustmentEditor: React.FC<Props> = ({
  data,
  onSave,
  onViewChange
}) => {
  const { brand } = useTheme();

  // Load all customers
  const allCustomers = useMemo(() => {
    try {
      const stored = localStorage.getItem('customer_list');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }, []);

  const customerOptions = useMemo(() => {
    return allCustomers.map((c: any) => ({
      value: c.customer_id || c.id || c.name,
      label: `${c.customer_id || c.id || ''} - ${c.name}`.trim()
    }));
  }, [allCustomers]);

  // Load all products
  const allProducts = useMemo(() => {
    try {
      const stored = localStorage.getItem('products_list');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  }, []);

  // Form State
  const [adjustmentType, setAdjustmentType] = useState<string>(data?.adjustmentType || 'General');
  const [customerId, setCustomerId] = useState<string>(data?.customerId || '');
  const [srNo] = useState<string>(data?.srNo || `SA-${Math.floor(Math.random() * 10000)}`);
  const [reference, setReference] = useState<string>(data?.reference || '');
  
  const [serialNosOut, setSerialNosOut] = useState<string>(data?.serialNosOut || '');
  const [serialNosIn, setSerialNosIn] = useState<string>(data?.serialNosIn || '');
  const [includeInTaxRecord, setIncludeInTaxRecord] = useState<boolean>(data?.includeInTaxRecord || false);

  const [activeRowIdx, setActiveRowIdx] = useState<number>(-1);

  const dropdownRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownIdx(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [rows, setRows] = useState<StockAdjustmentDetailRow[]>(() => {
    if (data?.items && data.items.length > 0) return [...data.items];
    return [];
  });

  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);
  const [rowSearchVal, setRowSearchVal] = useState<string>('');
  
  const filteredDropdownOptions = useMemo(() => {
    if (!rowSearchVal) return allProducts;
    return allProducts.filter((p: any) => 
      (p.code?.toLowerCase() || p.id?.toLowerCase() || '').includes(rowSearchVal.toLowerCase()) ||
      (p.name?.toLowerCase() || '').includes(rowSearchVal.toLowerCase())
    );
  }, [allProducts, rowSearchVal]);

  function createEmptyRow(): StockAdjustmentDetailRow {
    return {
      productId: '',
      productName: '',
      unit: 'PCS',
      date: new Date().toISOString().split('T')[0],
      detail: 'Adjustment',
      batchNo: '',
      qtyIn: 0,
      qtyOut: 0,
      unitPrice: 0,
      amount: 0,
      locId: 'L001'
    };
  }

  const handleAddRow = () => {
    setRows([...rows, createEmptyRow()]);
  };

  const handleRowChange = (idx: number, field: keyof StockAdjustmentDetailRow, value: any) => {
    const newRows = [...rows];
    const row = { ...newRows[idx], [field]: value };

    // Auto-fill product name & price
    if (field === 'productId' && value) {
      const product = allProducts.find((p: any) => p.code === value || p.id === value);
      if (product) {
        row.productName = product.name || '';
        row.unitPrice = product.sale_price || product.cost || 0;
      }
    }

    // Auto calculate amount
    if (field === 'qtyIn' || field === 'qtyOut' || field === 'unitPrice' || field === 'productId') {
      const qIn = Number(row.qtyIn) || 0;
      const qOut = Number(row.qtyOut) || 0;
      const price = Number(row.unitPrice) || 0;
      row.amount = (qIn - qOut) * price;
    }

    newRows[idx] = row;
    setRows(newRows);
  };

  const handleSaveBtn = () => {
    const finalData: StockAdjustmentData = {
      adjustmentNumber: data?.adjustmentNumber || `SA-${Date.now()}`,
      adjustmentType,
      customerId,
      customerName: allCustomers.find((c: any) => (c.customer_id || c.id) === customerId)?.name || '',
      srNo,
      serialNosOut,
      serialNosIn,
      includeInTaxRecord,
      items: rows.filter(r => r.productId.trim() !== '')
    };
    if (onSave) onSave(finalData);
    if (onViewChange) onViewChange('dashboard'); // Go back or stay
  };

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { window.print(); return; }

    const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const adjNo = data?.adjustmentNumber || 'SA-DRAFT';
    
    // Calculate totals
    const totalQtyIn = rows.reduce((acc, row) => acc + (Number(row.qtyIn) || 0), 0);
    const totalQtyOut = rows.reduce((acc, row) => acc + (Number(row.qtyOut) || 0), 0);
    const totalAmount = rows.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);

    win.document.write(`<!DOCTYPE html><html><head>
      <title>Stock Adjustment Voucher — ${adjNo}</title>
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
        <h1>Stock Adjustment Voucher Statement</h1>
        <p>VOUCHER NO: ${adjNo}</p>
      </div>
      <div class="meta-grid">
        <div>
          <span class="meta-label">Date:</span> ${printDate}<br/>
          <span class="meta-label">Customer ID:</span> ${customerId || '—'}<br/>
          <span class="meta-label">Adjustment Type:</span> ${adjustmentType}
        </div>
        <div style="text-align: right;">
          <span class="meta-label">SR No:</span> ${srNo || '—'}
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">Sr#</th>
            <th style="width: 15%;">Product ID</th>
            <th style="width: 25%;">Product Name</th>
            <th style="width: 10%;">Batch No</th>
            <th style="width: 10%; text-align: right;">Qty In</th>
            <th style="width: 10%; text-align: right;">Qty Out</th>
            <th style="width: 10%; text-align: right;">Unit Price</th>
            <th style="width: 15%; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${row.productId || '—'}</td>
              <td>${row.productName || '—'}</td>
              <td>${row.batchNo || '—'}</td>
              <td class="text-right">${Number(row.qtyIn) || 0}</td>
              <td class="text-right">${Number(row.qtyOut) || 0}</td>
              <td class="text-right">${Number(row.unitPrice).toFixed(2)}</td>
              <td class="text-right">${Number(row.amount).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold; background: #fafafa;">
            <td colspan="4" style="text-align: right;">Total:</td>
            <td class="text-right">${totalQtyIn}</td>
            <td class="text-right">${totalQtyOut}</td>
            <td></td>
            <td class="text-right">${totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style="font-size: 9pt; margin-top: 10px;">
        <span class="meta-label">Serial Nos Out:</span> ${serialNosOut || '—'}<br/>
        <span class="meta-label">Serial Nos In:</span> ${serialNosIn || '—'}
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

  return (
    <div className="min-h-full p-6 space-y-6" style={{ background: '#F4F7FD' }}>
      <PageHeader
        title="Stock Adjustment"
        subtitle="Manage inventory stock adjustments"
      />

      {/* Header Fields & Actions */}
      <Card className="p-4 bg-white" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 flex-1">
            <Select
              variant="compact"
              label="Adjustment Type"
              value={adjustmentType}
              onChange={e => setAdjustmentType(e.target.value)}
              options={[
                { value: 'General', label: 'General' },
                { value: 'Damage', label: 'Damage' },
                { value: 'Wastage', label: 'Wastage' }
              ]}
            />
            <Select
              variant="compact"
              label="Customer"
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              options={[{ value: '', label: '-- Select Customer --' }, ...customerOptions]}
            />
            <Input
              variant="compact"
              label="Sr No."
              value={srNo}
              readOnly
            />
            <Input
              variant="compact"
              label="Reference"
              value={reference}
              onChange={e => setReference(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 select-none">
            <Button
              onClick={handleSaveBtn}
              className="flex items-center gap-1.5 h-8 px-4 text-xs font-bold cursor-pointer"
              style={{ backgroundColor: brand.primary, color: '#FFF' }}
            >
              <Save className="w-4 h-4" /> Save
            </Button>
            <Button
              onClick={() => onViewChange?.('dashboard')}
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
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead>
              <tr className="bg-white border-b border-[#E2E8F0] select-none">
                <th className="w-[40px] pl-4 pr-2 py-3.5 text-center text-[10px] font-black tracking-widest text-black">#</th>
                <th className="w-[100px] px-2 py-3.5 text-[10px] font-black tracking-widest text-black">Product ID</th>
                <th className="w-[180px] px-2 py-3.5 text-[10px] font-black tracking-widest text-black">Product Name</th>
                <th className="w-[60px] px-2 py-3.5 text-[10px] font-black tracking-widest text-black">Unit</th>
                <th className="w-[100px] px-2 py-3.5 text-[10px] font-black tracking-widest text-black">Date</th>
                <th className="w-[100px] px-2 py-3.5 text-[10px] font-black tracking-widest text-black">Detail</th>
                <th className="w-[80px] px-2 py-3.5 text-[10px] font-black tracking-widest text-black">Batch No</th>
                <th className="w-[70px] px-2 py-3.5 text-right text-[10px] font-black tracking-widest text-black">Qty In</th>
                <th className="w-[70px] px-2 py-3.5 text-right text-[10px] font-black tracking-widest text-black">Qty Out</th>
                <th className="w-[80px] px-2 py-3.5 text-right text-[10px] font-black tracking-widest text-black">Unit Price</th>
                <th className="w-[80px] px-2 py-3.5 text-[10px] font-black tracking-widest text-black">Amount</th>
                <th className="w-[80px] px-2 py-3.5 text-[10px] font-black tracking-widest text-black">Warehouse</th>
                <th className="w-[60px] px-2 py-3.5 text-center text-[10px] font-black tracking-widest text-black">Delete</th>
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
                  <td className="pl-4 pr-2 py-3 text-center text-[12px] font-medium text-slate-400">
                    {isRowActive ? (
                      <span className="text-blue-600 font-extrabold text-sm">✏️</span>
                    ) : (
                      idx + 1
                    )}
                  </td>
                  <td className="px-2 py-3 relative overflow-visible" ref={openDropdownIdx === idx ? dropdownRef : null}>
                    <Input
                      variant="compact"
                      type="text"
                      className="w-full font-medium"
                      value={row.productId}
                      onClick={() => {
                        setActiveRowIdx(idx);
                        setOpenDropdownIdx(idx);
                        setRowSearchVal('');
                      }}
                      onChange={e => {
                        handleRowChange(idx, 'productId', e.target.value);
                        setRowSearchVal(e.target.value);
                        setOpenDropdownIdx(idx);
                      }}
                      placeholder="Select..."
                    />
                    
                    {/* Custom Dropdown popover */}
                    {openDropdownIdx === idx && (
                      <div
                        className="absolute left-2 mt-1 bg-white border border-[#E2E8F0] shadow-xl z-[999] max-h-56 overflow-y-auto text-left border-solid w-[550px]"
                      >
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 select-none text-[10px] font-black text-slate-400">
                              <th className="p-2 border-r border-slate-200" style={{ width: '15%' }}>Product ID</th>
                              <th className="p-2 border-r border-slate-200" style={{ width: '45%' }}>Product Name</th>
                              <th className="p-2 border-r border-slate-200 text-right" style={{ width: '15%' }}>Total In Stock</th>
                              <th className="p-2 border-r border-slate-200" style={{ width: '15%' }}>Default Warehouse</th>
                              <th className="p-2" style={{ width: '10%' }}>Unit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDropdownOptions.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-3 text-center text-slate-400 font-semibold">
                                  No products found
                                </td>
                              </tr>
                            ) : (
                              filteredDropdownOptions.map((p: any) => (
                                <tr
                                  key={p.id || p.code}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRowChange(idx, 'productId', p.code || p.id);
                                    setOpenDropdownIdx(null);
                                  }}
                                  className="hover:bg-[#009bf2] hover:text-white border-b border-slate-100 cursor-pointer transition-colors group"
                                >
                                  <td className="p-2 border-r border-slate-100 font-black group-hover:text-white text-blue-600 text-[11px]">{p.code || p.id}</td>
                                  <td className="p-2 border-r border-slate-100 text-slate-700 group-hover:text-white font-medium text-[11px] whitespace-normal break-words max-w-[200px]">{p.name}</td>
                                  <td className="p-2 border-r border-slate-100 text-right font-medium">{p.stock || p.opening_stock || 0}</td>
                                  <td className="p-2 border-r border-slate-100">{p.location || 'L001'}</td>
                                  <td className="p-2">{p.unit || 'PCS'}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <Input
                      variant="compact"
                      type="text"
                      className="w-full"
                      value={row.productName}
                      onChange={e => handleRowChange(idx, 'productName', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <Input
                      variant="compact"
                      type="text"
                      className="w-full"
                      value={row.unit}
                      onChange={e => handleRowChange(idx, 'unit', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <Input
                      variant="compact"
                      type="date"
                      className="w-full cursor-pointer"
                      value={row.date}
                      onChange={e => handleRowChange(idx, 'date', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <Input
                      variant="compact"
                      type="text"
                      className="w-full"
                      value={row.detail}
                      onChange={e => handleRowChange(idx, 'detail', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <Input
                      variant="compact"
                      type="text"
                      className="w-full"
                      value={row.batchNo || ''}
                      onChange={e => handleRowChange(idx, 'batchNo', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <Input
                      variant="compact"
                      type="number"
                      className="w-full text-right"
                      value={row.qtyIn || ''}
                      onChange={e => handleRowChange(idx, 'qtyIn', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <Input
                      variant="compact"
                      type="number"
                      className="w-full text-right"
                      value={row.qtyOut || ''}
                      onChange={e => handleRowChange(idx, 'qtyOut', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-3">
                    <Input
                      variant="compact"
                      type="number"
                      className="w-full text-right"
                      value={row.unitPrice || ''}
                      onChange={e => handleRowChange(idx, 'unitPrice', e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-3 text-right text-[11px] font-black tracking-wider text-slate-700 bg-slate-50/30">
                    {row.amount.toFixed(2)}
                  </td>
                  <td className="px-2 py-3">
                    <Input
                      variant="compact"
                      type="text"
                      className="w-full"
                      value={row.locId}
                      onChange={e => handleRowChange(idx, 'locId', e.target.value)}
                    />
                  </td>
                  <td className="w-[60px] px-2 py-3 text-center">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newRows = [...rows];
                        newRows.splice(idx, 1);
                        setRows(newRows);
                        if (activeRowIdx === idx) setActiveRowIdx(-1);
                      }}
                      variant="ghost"
                      size="xs"
                      icon={Trash2}
                      title="Delete"
                      className="!px-1 !text-red-500 cursor-pointer"
                    />
                  </td>
                </tr>
              )})}
              
              <tr className="bg-white hover:bg-slate-50/50 cursor-pointer transition-colors" onClick={handleAddRow}>
                <td className="pl-4 pr-2 py-4 text-center text-slate-300 font-bold">*</td>
                <td colSpan={12} className="px-3 py-4 text-[10px] font-bold text-slate-400 italic">
                  + Click here to append a new transaction adjustment line...
                </td>
              </tr>
            </tbody>
          </table>
        </ScrollArea>
      </div>

    </div>
  );
};
