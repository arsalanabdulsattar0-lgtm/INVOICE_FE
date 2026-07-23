import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '../../context/ThemeContext';
import { PageHeader, CardTitle } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input, ComboBox, TextArea, ScrollArea } from '../../components/ui/FormControls';
import Card from '../../components/ui/Card';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { AlertModal } from '../../components/ui/AlertModal';
import { Toast } from '../../components/ui/Toast';
import { Plus, Trash2, Save, Printer, RefreshCw, X } from 'lucide-react';
import type { StockTransferData, StockTransferDetailRow } from '../../types/types';

interface WarehouseListItem {
  id: string;
  name: string;
  code: string;
}

export const StockTransferPage: React.FC<{ onViewChange: (view: string) => void }> = ({ onViewChange }) => {
  const { brand } = useTheme();

  // ─── Active Company & Branch Context ─────────────────────────────────────────
  const currentCoId = useMemo(() => {
    try {
      const activeCo = sessionStorage.getItem('active_company');
      return activeCo ? JSON.parse(activeCo).id : 'co1';
    } catch {
      return 'co1';
    }
  }, []);

  const currentBrId = useMemo(() => {
    try {
      const activeBr = sessionStorage.getItem('active_branch');
      return activeBr ? JSON.parse(activeBr).id : 'br-1';
    } catch {
      return 'br-1';
    }
  }, []);

  // ─── Form State Management ───────────────────────────────────────────────────
  const [transferNumber, setTransferNumber] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [gtsNo, setGtsNo] = useState('');
  const [reference, setReference] = useState('');
  const [detail, setDetail] = useState('');
  const [rows, setRows] = useState<StockTransferDetailRow[]>([]);

  // Overlay & Dialog States
  const [activeRowIdx, setActiveRowIdx] = useState<number>(-1);
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);
  const [rowSearchVal, setRowSearchVal] = useState<string>('');
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });
  const [openUpwards, setOpenUpwards] = useState(false);

  const updateCoordsForIdx = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const dropdownHeight = 220; // estimated max height
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenUpwards = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setOpenUpwards(shouldOpenUpwards);
    setDropdownCoords({
      top: shouldOpenUpwards
        ? rect.top - dropdownHeight - 4
        : rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 350)
    });
  };

  // Dialog & Notification states
  const [toast, setToast] = useState<{ isOpen: boolean; title?: string; messages: string[]; type?: 'error' | 'success' }>({
    isOpen: false,
    messages: [],
    title: '',
    type: 'error'
  });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; variant?: 'warning' | 'error' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'warning'
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const dropdownRef = useRef<HTMLTableCellElement>(null);

  // ─── Data Loaders ────────────────────────────────────────────────────────────

  // Load configured warehouses
  const warehouses = useMemo<WarehouseListItem[]>(() => {
    try {
      const stored = localStorage.getItem('warehouse_records');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          return parsed.map((w: any) => ({
            id: w.code || w.id,
            name: w.name,
            code: w.code || w.id
          }));
        }
      }
    } catch {}
    // Seed fallbacks matching WarehousesPage layout
    return [
      { id: 'L001', name: 'SHOP KEH', code: 'L001' },
      { id: 'L002', name: 'MC', code: 'L002' },
      { id: 'L004', name: 'NS', code: 'L004' }
    ];
  }, []);

  const warehouseOptionsCombo = useMemo(() => {
    return warehouses.map(w => ({
      id: w.code,
      name: w.name,
      subtitle: `Code: ${w.code}`
    }));
  }, [warehouses]);

  // Load products list from catalog
  const allProducts = useMemo(() => {
    try {
      const stored = localStorage.getItem('products_list');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'p-1', name: 'Flavopure', code: '0001', unit: 'PCS' },
      { id: 'p-2', name: 'Fragrances', code: '0002', unit: 'PCS' },
      { id: 'p-3', name: 'Powder', code: '0003', unit: 'PCS' },
      { id: 'p-4', name: 'Liquid', code: '0004', unit: 'PCS' }
    ];
  }, []);

  // Filtered product suggestions in dropdown table
  const filteredDropdownOptions = useMemo(() => {
    if (!rowSearchVal) return allProducts;
    return allProducts.filter((p: any) =>
      ((p.code || '').toLowerCase().includes(rowSearchVal.toLowerCase()) || (p.id || '').toLowerCase().includes(rowSearchVal.toLowerCase())) ||
      (p.name?.toLowerCase() || '').includes(rowSearchVal.toLowerCase())
    );
  }, [allProducts, rowSearchVal]);

  // Click outside listener for inline product search dropdown
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

  // ─── Real-time Available Stock Lookup ─────────────────────────────────────────
  const getWarehouseStockQty = (prodCodeOrId: string, whCode: string, batch?: string): number => {
    if (!prodCodeOrId) return 0;
    try {
      // First try location_wise_stock (set after actual stock adjustments)
      if (whCode) {
        const storedStock = localStorage.getItem('location_wise_stock');
        if (storedStock) {
          const stockList = JSON.parse(storedStock);
          const matches = stockList.filter((item: any) =>
            (item.product_code === prodCodeOrId || item.product_id === prodCodeOrId) &&
            (item.warehouse_id === whCode)
          );
          if (matches.length > 0) {
            if (batch) {
              const batchMatch = matches.find((item: any) => item.batch_no === batch);
              return batchMatch ? Number(batchMatch.quantity) || 0 : 0;
            }
            return matches.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0);
          }
        }
      }
      // Fallback: use opening_qty from product catalog
      const storedProducts = localStorage.getItem('products_list');
      if (storedProducts) {
        const productList = JSON.parse(storedProducts);
        const product = productList.find((p: any) =>
          p.code === prodCodeOrId || p.id === prodCodeOrId
        );
        if (product) return Number(product.opening_qty) || 0;
      }
    } catch {}
    return 0;
  };

  // Recalculate available stock on location or rows change
  const updatedRows = useMemo(() => {
    return rows.map(row => ({
      ...row,
      currentStock: getWarehouseStockQty(row.productId, fromLocation, row.batchNo)
    }));
  }, [rows, fromLocation]);

  // Generate transfer number on mount and setup default empty row
  useEffect(() => {
    generateNextTransferNumber();
    setRows([createEmptyRow()]);
  }, []);

  // ─── Form Actions & Operations ────────────────────────────────────────────────

  const generateNextTransferNumber = () => {
    try {
      const stored = localStorage.getItem('stock_transfers_list');
      const list = stored ? JSON.parse(stored) : [];
      const nextNum = list.length + 1;
      setTransferNumber(`TR-${1000 + nextNum}`);
    } catch {
      setTransferNumber(`TR-${1001}`);
    }
  };

  const createEmptyRow = (): StockTransferDetailRow => {
    return {
      productId: '',
      productName: '',
      unit: 'PCS',
      batchNo: '',
      currentStock: 0,
      transferQty: 0
    };
  };

  const handleAddRow = () => {
    setRows([...rows, createEmptyRow()]);
  };

  const handleRemoveRow = (idx: number) => {
    const updated = rows.filter((_, i) => i !== idx);
    setRows(updated.length > 0 ? updated : [createEmptyRow()]);
  };

  const handleRowChange = (idx: number, field: keyof StockTransferDetailRow, value: any) => {
    const newRows = [...rows];
    const row = { ...newRows[idx], [field]: value };

    if (field === 'productId' && value) {
      const product = allProducts.find((p: any) => p.code === value || p.id === value);
      if (product) {
        row.productName = product.name || '';
        row.unit = product.unit || 'PCS';
        row.currentStock = getWarehouseStockQty(value, fromLocation, row.batchNo);
      }
    }

    if (field === 'batchNo') {
      row.currentStock = getWarehouseStockQty(row.productId, fromLocation, value);
    }

    newRows[idx] = row;
    setRows(newRows);
  };

  const handleFromLocationChange = (val: string) => {
    setFromLocation(val);
    setRows(prevRows =>
      prevRows.map(row => ({
        ...row,
        currentStock: getWarehouseStockQty(row.productId, val, row.batchNo)
      }))
    );
  };


  // ─── Action Handlers ─────────────────────────────────────────────────────────

  const handleClose = () => {
    onViewChange?.('dashboard');
  };


  const handleSave = () => {
    const validationErrors: string[] = [];

    if (!date) validationErrors.push('Date is required.');
    if (!fromLocation) validationErrors.push('From Location is required.');
    if (!toLocation) validationErrors.push('To Location is required.');
    if (fromLocation && toLocation && fromLocation === toLocation) {
      validationErrors.push('From Location and To Location cannot be the same.');
    }

    const filledRows = rows.filter(r => r.productId.trim() !== '');
    if (filledRows.length === 0) {
      validationErrors.push('At least one item must be added to transfer.');
    }

    filledRows.forEach((row, i) => {
      const idxStr = `Row ${i + 1} (${row.productName || row.productId || 'Empty product'}): `;
      if (row.transferQty <= 0) {
        validationErrors.push(idxStr + 'Transfer Quantity must be greater than 0.');
      }
      const available = getWarehouseStockQty(row.productId, fromLocation, row.batchNo);
      if (row.transferQty > available) {
        validationErrors.push(idxStr + `Transfer Quantity exceeds available stock (${available}).`);
      }
    });

    if (validationErrors.length > 0) {
      setToast({
        isOpen: true,
        title: 'Validation Failed',
        messages: validationErrors,
        type: 'error'
      });
      return;
    }

    try {
      const newTransfer: StockTransferData = {
        transferNumber,
        date,
        sourceWarehouseId: fromLocation,
        sourceWarehouseName: warehouses.find(w => w.code === fromLocation)?.name || fromLocation,
        destinationWarehouseId: toLocation,
        destinationWarehouseName: warehouses.find(w => w.code === toLocation)?.name || toLocation,
        gtsNo,
        reference,
        remarks: detail,
        items: filledRows.map(r => ({
          productId: r.productId,
          productName: r.productName,
          unit: r.unit,
          batchNo: r.batchNo,
          currentStock: getWarehouseStockQty(r.productId, fromLocation, r.batchNo),
          transferQty: Number(r.transferQty)
        })),
        status: 'Posted'
      };

      const storedStock = localStorage.getItem('location_wise_stock');
      let stockList = storedStock ? JSON.parse(storedStock) : [];

      filledRows.forEach(row => {
        // A. Deduct from source warehouse
        const sourceIndex = stockList.findIndex((item: any) =>
          (item.product_code === row.productId || item.product_id === row.productId) &&
          item.warehouse_id === fromLocation &&
          (row.batchNo ? item.batch_no === row.batchNo : !item.batch_no)
        );

        if (sourceIndex !== -1) {
          stockList[sourceIndex].quantity = Math.max(0, Number(stockList[sourceIndex].quantity) - Number(row.transferQty));
        }

        // B. Add to destination warehouse
        const destIndex = stockList.findIndex((item: any) =>
          (item.product_code === row.productId || item.product_id === row.productId) &&
          item.warehouse_id === toLocation &&
          (row.batchNo ? item.batch_no === row.batchNo : !item.batch_no)
        );

        if (destIndex !== -1) {
          stockList[destIndex].quantity = Number(stockList[destIndex].quantity) + Number(row.transferQty);
        } else {
          stockList.push({
            id: `ls-${row.productId}-${toLocation}-${Date.now()}`,
            warehouse_id: toLocation,
            warehouse_name: warehouses.find(w => w.code === toLocation)?.name || toLocation,
            product_id: row.productId,
            product_code: row.productId,
            product_name: row.productName,
            batch_no: row.batchNo || '',
            quantity: Number(row.transferQty),
            details: 'Received via Transfer',
            expiry_date: '',
            is_hold: false
          });
        }
      });

      localStorage.setItem('location_wise_stock', JSON.stringify(stockList));

      const storedTransfers = localStorage.getItem('stock_transfers_list');
      const list = storedTransfers ? JSON.parse(storedTransfers) : [];
      list.unshift(newTransfer);
      localStorage.setItem('stock_transfers_list', JSON.stringify(list));

      setToast({
        isOpen: true,
        title: 'Success',
        messages: ['Stock transfer saved and inventory updated successfully.'],
        type: 'success'
      });

      setTimeout(() => {
        onViewChange?.('dashboard');
      }, 1000);

    } catch (err: any) {
      setToast({
        isOpen: true,
        title: 'Error Saving',
        messages: [err.message || 'An error occurred while saving the stock transfer.'],
        type: 'error'
      });
    }
  };

  const handlePrint = () => {
    const activeTransferNo = transferNumber || 'TR-DRAFT';
    const sourceWhName = warehouses.find(w => w.code === fromLocation)?.name || fromLocation || '—';
    const destWhName = warehouses.find(w => w.code === toLocation)?.name || toLocation || '—';

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) {
      window.print();
      return;
    }

    const printDate = new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const totalTransferred = rows.reduce((sum, r) => sum + (Number(r.transferQty) || 0), 0);

    win.document.write(`<!DOCTYPE html><html><head>
      <title>Stock Transfer Voucher — ${activeTransferNo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 9pt; color: #000; background: #fff; padding: 15mm 20mm; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
        .header h1 { font-size: 16pt; font-weight: bold; margin-bottom: 2px; text-transform: uppercase; }
        .header p { font-size: 10pt; font-weight: bold; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
        .meta-line { font-size: 9pt; }
        .meta-label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 8.5pt; }
        th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
        th { background: #f0f0f0; font-weight: bold; }
        .text-right { text-align: right; }
        .remarks-box { border: 1px solid #000; padding: 8px; margin-bottom: 30px; border-radius: 4px; }
        .remarks-title { font-weight: bold; margin-bottom: 4px; text-decoration: underline; }
        .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center; }
        .sig-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 4px; font-size: 8pt; font-weight: bold; }
        @media print { body { padding: 0; } }
      </style>
    </head><body>
      <div class="header">
        <h1>Stock Transfer Voucher</h1>
        <p>VOUCHER NO: ${activeTransferNo}</p>
      </div>
      <div class="meta-grid">
        <div>
          <span class="meta-label">Date:</span> ${printDate}<br/>
          <span class="meta-label">From Location:</span> ${sourceWhName}<br/>
          <span class="meta-label">To Location:</span> ${destWhName}
        </div>
        <div style="text-align: right;">
          <span class="meta-label">G.T.S No:</span> ${gtsNo || '—'}<br/>
          <span class="meta-label">Reference:</span> ${reference || '—'}
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">Sr#</th>
            <th style="width: 20%;">Product ID</th>
            <th style="width: 40%;">Description / Product Name</th>
            <th style="width: 15%;">Batch No</th>
            <th style="width: 20%; text-align: right;">Transfer Qty</th>
          </tr>
        </thead>
        <tbody>
          ${rows.filter(r => r.productId.trim() !== '').map((row, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${row.productId || '—'}</td>
              <td>${row.productName || '—'}</td>
              <td>${row.batchNo || '—'}</td>
              <td class="text-right">${Number(row.transferQty)}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold; background: #fafafa;">
            <td colspan="4" style="text-align: right;">Total Transferred Items:</td>
            <td class="text-right">${totalTransferred}</td>
          </tr>
        </tbody>
      </table>

      ${detail ? `
      <div class="remarks-box">
        <div class="remarks-title">Details / Remarks</div>
        <div>${detail}</div>
      </div>` : ''}

      <div class="footer">
        <div><div class="sig-line">Issued By</div></div>
        <div><div class="sig-line">Verified By</div></div>
        <div><div class="sig-line">Received By</div></div>
      </div>
    </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  // ─── Actions for Header Bar ──────────────────────────────────────────
  const headerActions = (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleSave}
        variant="primary"
        size="md"
        icon={Save}
        className="cursor-pointer font-bold rounded-lg px-4"
      >
        Save
      </Button>
      <Button
        onClick={handleClose}
        variant="white"
        size="md"
        className="cursor-pointer font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-4 hover:bg-slate-50"
      >
        Cancel
      </Button>
      <Button
        onClick={handlePrint}
        variant="white"
        size="md"
        icon={Printer}
        className="cursor-pointer font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-4 hover:bg-slate-50"
      >
        Print
      </Button>
    </div>
  );

  // ─── Render Components ──────────────────────────────────────────────────────

  return (
    <div className="min-h-full p-6 space-y-5" style={{ background: '#F4F7FD' }}>
      <PageHeader
        title="Stock Transfer"
        subtitle="Record inventory movement between locations"
        actions={headerActions}
      />

      {/* Main Form Fields Card */}
      <Card className="p-4 bg-white border border-[#E2E8F0] shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Input
            variant="compact"
            label="Transfer No"
            value={transferNumber}
            readOnly
            className="bg-slate-50 font-bold font-mono text-blue-600 cursor-not-allowed"
          />

          <div className="w-full space-y-1">
            <label className="text-[11px] text-black ml-1 flex items-center gap-1 font-bold text-slate-400">
              Date <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              type="date"
              className="w-full border rounded-lg h-7 px-2.5 text-[11px] font-normal text-[#304166] placeholder-slate-400 outline-none transition-all form-input-container bg-white border-slate-200"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="w-full space-y-1">
            <label className="text-[11px] text-black ml-1 flex items-center gap-1 font-bold text-slate-400">
              From Location <span className="text-red-500 font-bold">*</span>
            </label>
            <ComboBox
              variant="compact"
              value={fromLocation}
              onChange={handleFromLocationChange}
              options={warehouseOptionsCombo}
              placeholder="Select source location"
            />
          </div>

          <div className="w-full space-y-1">
            <label className="text-[11px] text-black ml-1 flex items-center gap-1 font-bold text-slate-400">
              To Location <span className="text-red-500 font-bold">*</span>
            </label>
            <ComboBox
              variant="compact"
              value={toLocation}
              onChange={setToLocation}
              options={warehouseOptionsCombo}
              placeholder="Select destination location"
            />
          </div>

          <Input
            variant="compact"
            label="G.T.S No"
            value={gtsNo}
            onChange={e => setGtsNo(e.target.value)}
            placeholder="Gate pass slip number"
          />

          <Input
            variant="compact"
            label="Reference"
            value={reference}
            onChange={e => setReference(e.target.value)}
            placeholder="Reference note"
          />
        </div>
      </Card>

      {/* Editable Table Card */}
      <div
        className="bg-white rounded-2xl border overflow-hidden shadow-none"
        style={{ borderColor: '#E2E8F0' }}
      >
        <div
          className="px-4 py-2.5 flex items-center justify-between text-white"
          style={{ backgroundColor: brand.primary }}
        >
          <CardTitle title="Transfer Items Details" count={updatedRows.length} countLabel="lines" />
          <Button
            onClick={handleAddRow}
            variant="secondary"
            className="flex items-center gap-1.5 h-7 px-3 text-[10px] font-bold border-white/20 bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add Detail Line
          </Button>
        </div>

        <ScrollArea className="w-full max-h-[400px] overflow-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="bg-white border-b border-[#E2E8F0] select-none text-[10px] font-black text-black uppercase tracking-wider">
                <th className="w-12 pl-4 pr-2 py-3 text-center">#</th>
                <th className="w-56 px-2 py-3">Product ID</th>
                <th className="px-2 py-3">Description</th>
                <th className="w-32 px-2 py-3 text-right">Available Stock</th>
                <th className="w-32 px-2 py-3 text-right">Transfer Quantity</th>
                <th className="w-16 px-2 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {updatedRows.map((row: StockTransferDetailRow, idx: number) => {
                const isRowActive = idx === activeRowIdx;
                return (
                  <tr
                    key={idx}
                    onClick={() => setActiveRowIdx(idx)}
                    className={`border-b border-[#E2E8F0] hover:bg-slate-50/50 transition-colors ${
                      isRowActive ? 'bg-blue-50/10' : ''
                    }`}
                  >
                    <td className="pl-4 pr-2 py-3 text-center text-[12px] font-semibold text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="px-2 py-2 relative overflow-visible" ref={openDropdownIdx === idx ? dropdownRef : null}>
                      <Input
                        variant="compact"
                        type="text"
                        className="w-full font-mono text-[11px]"
                        value={row.productId}
                        onClick={(e) => {
                          setActiveRowIdx(idx);
                          setOpenDropdownIdx(idx);
                          setRowSearchVal('');
                          updateCoordsForIdx(e.currentTarget);
                        }}
                        onChange={e => {
                          handleRowChange(idx, 'productId', e.target.value);
                          setRowSearchVal(e.target.value);
                          setOpenDropdownIdx(idx);
                          updateCoordsForIdx(e.currentTarget);
                        }}
                        placeholder="Type or select..."
                      />

                      {/* Product lookup dropdown overlay table (Product ID, Product, In Stock) */}
                      {openDropdownIdx === idx && createPortal(
                        <div
                          ref={dropdownRef}
                          className="fixed bg-white border border-[#E2E8F0] shadow-2xl z-[99999] max-h-56 overflow-y-auto text-left w-[500px] rounded-xl overflow-hidden border-solid"
                          style={{
                            top: dropdownCoords.top,
                            left: dropdownCoords.left,
                          }}
                        >
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-100 border-b border-slate-200 select-none text-[9px] font-black text-slate-500 uppercase">
                                <th className="p-2 border-r border-slate-200" style={{ width: '25%' }}>Product ID</th>
                                <th className="p-2 border-r border-slate-200" style={{ width: '55%' }}>Product</th>
                                <th className="p-2 text-right" style={{ width: '20%' }}>In Stock</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredDropdownOptions.length === 0 ? (
                                <tr>
                                  <td colSpan={3} className="p-4 text-center text-slate-400 font-semibold">
                                    No products matching query
                                  </td>
                                </tr>
                              ) : (
                                filteredDropdownOptions.map((p: any) => {
                                  const localQty = getWarehouseStockQty(p.code || p.id, fromLocation, row.batchNo);
                                  const displayQty = localQty > 0 ? localQty : (Number(p.opening_qty) || 0);
                                  return (
                                    <tr
                                      key={p.id || p.code}
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleRowChange(idx, 'productId', p.code || p.id);
                                        setOpenDropdownIdx(null);
                                      }}
                                      className="hover:bg-[#009bf2] hover:text-white border-b border-slate-100 cursor-pointer transition-colors text-[11px]"
                                    >
                                      <td className="p-2 border-r border-slate-100 font-bold text-blue-600 font-mono hover:text-white">{p.code || p.id}</td>
                                      <td className="p-2 border-r border-slate-100 text-slate-700 font-medium whitespace-normal">{p.name}</td>
                                      <td className="p-2 text-right font-semibold text-slate-600">{displayQty}</td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>,
                        document.body
                      )}
                    </td>

                    <td className="px-2 py-2">
                      <Input
                        variant="compact"
                        type="text"
                        className="w-full text-[11px] bg-slate-50 cursor-not-allowed"
                        value={row.productName}
                        readOnly
                      />
                    </td>

                    <td className="px-2 py-2 text-right">
                      <span className="text-[12px] font-bold text-slate-600 font-mono px-3">
                        {row.currentStock}
                      </span>
                    </td>

                    <td className="px-2 py-2">
                      <Input
                        variant="compact"
                        type="number"
                        min="0"
                        className="w-full text-right text-[11px] font-bold"
                        value={row.transferQty || ''}
                        onChange={e => handleRowChange(idx, 'transferQty', e.target.value === '' ? 0 : Number(e.target.value))}
                      />
                    </td>

                    <td className="px-2 py-2 text-center">
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Trash2}
                        onClick={() => handleRemoveRow(idx)}
                        className="text-red-500 hover:text-red-700 mx-auto cursor-pointer"
                        title="Delete Line"
                      />
                    </td>
                  </tr>
                );
              })}
              
              <tr className="bg-white hover:bg-slate-50/50 cursor-pointer transition-colors" onClick={handleAddRow}>
                <td className="pl-4 pr-2 py-4 text-center text-slate-300 font-bold">*</td>
                <td colSpan={5} className="px-3 py-4 text-[10px] font-bold text-slate-400 italic">
                  + Click here to append a new transaction transfer line...
                </td>
              </tr>
            </tbody>
          </table>
        </ScrollArea>
      </div>

      {/* Toast Notification for errors / success messages */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        title={toast.title}
        messages={toast.messages}
        type={toast.type}
      />

      {/* Confirmation & Alert Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
      />
    </div>
  );
};
