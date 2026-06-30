import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Database } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Toggle } from '../../../components/ui/FormControls';
import { SectionHeader } from '../../../components/ui/Typography';
import Card from '../../../components/ui/Card';
import { seedCompanies, seedBranches } from '../../../utils/settingsData';
import type { Company, Branch } from '../../../utils/settingsData';
import type { Warehouse } from './WarehouseModule';
import { getCodeSettingsForBranch } from '../../../utils/codeSettingsHelper';

interface WarehouseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse: Warehouse | null;
  onSave: (warehouse: Omit<Warehouse, 'id'> & { id?: string }) => void;
}

const emptyWarehouse = (): Omit<Warehouse, 'id'> => ({
  name: '',
  code: '',
  companyId: 'co1', // Default to co1 (Acme Corporation)
  branchId: '',
  city: '',
  address: '',
  isDefault: false,
  isActive: true,
});

export const WarehouseDrawer: React.FC<WarehouseDrawerProps> = ({
  isOpen,
  onClose,
  warehouse,
  onSave,
}) => {
  const { brand } = useTheme();

  const [form, setForm] = useState<Omit<Warehouse, 'id'>>(emptyWarehouse());
  const [error, setError] = useState('');

  const companies = useMemo<Company[]>(() => {
    try {
      const stored = localStorage.getItem('company_records');
      return stored ? JSON.parse(stored) : seedCompanies;
    } catch {
      return seedCompanies;
    }
  }, []);

  const branches = useMemo<Branch[]>(() => {
    try {
      const stored = localStorage.getItem('branch_records');
      return stored ? JSON.parse(stored) : seedBranches;
    } catch {
      return seedBranches;
    }
  }, []);

  // Get branches filtered by selected company in form
  const availableBranches = branches.filter(b => b.companyId === form.companyId);

  console.log('WarehouseDrawer debugging:', {
    formCompanyId: form.companyId,
    branchesCount: branches.length,
    availableBranchesCount: availableBranches.length,
    availableBranches,
  });

  // Get current company name
  const companyName = companies.find(c => c.id === form.companyId)?.name || 'Acme Corporation';

  // Sync form state when drawer opens or warehouse changes
  useEffect(() => {
    if (isOpen) {
      if (warehouse) {
        setForm({
          name: warehouse.name,
          code: warehouse.code,
          companyId: warehouse.companyId,
          branchId: warehouse.branchId,
          city: warehouse.city,
          address: warehouse.address,
          isDefault: warehouse.isDefault,
          isActive: warehouse.isActive,
        });
      } else {
        setForm(emptyWarehouse());
      }
      setError('');
    }
  }, [isOpen, warehouse]);

  const codeSetting = useMemo(() => {
    if (!form.companyId || !form.branchId) {
      return { mode: 'auto' as const, prefix: 'WH-', nextNumber: 1, padding: 3 };
    }
    return getCodeSettingsForBranch(form.companyId, form.branchId).warehouse;
  }, [form.companyId, form.branchId]);

  // Generate code on the fly for new warehouses if auto-coding is enabled
  useEffect(() => {
    if (isOpen && !warehouse && form.companyId && form.branchId) {
      const activeSetting = getCodeSettingsForBranch(form.companyId, form.branchId).warehouse;
      if (activeSetting.mode === 'auto') {
        const formattedNum = String(activeSetting.nextNumber).padStart(activeSetting.padding, '0');
        setForm(prev => ({
          ...prev,
          code: `${activeSetting.prefix}${formattedNum}`
        }));
      } else {
        setForm(prev => ({
          ...prev,
          code: ''
        }));
      }
    }
  }, [isOpen, warehouse, form.companyId, form.branchId]);

  const handleSaveClick = () => {
    if (!form.companyId) {
      setError('Company is required.');
      return;
    }
    if (!form.branchId) {
      setError('Branch selection is required.');
      return;
    }
    if (!form.name.trim()) {
      setError('Warehouse Name is required.');
      return;
    }
    if (!form.code.trim()) {
      setError('Warehouse Code is required.');
      return;
    }

    const cityValue = warehouse?.city || '';

    onSave({
      ...form,
      city: cityValue,
      id: warehouse?.id,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Glass Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '105%' }}
            animate={{ x: 0 }}
            exit={{ x: '105%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-[1000] w-full sm:w-[480px] bg-white border-l flex flex-col overflow-hidden"
            style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b flex-shrink-0" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5" style={{ color: brand.primary }} />
                <h2 className="text-sm font-black text-slate-800">
                  {warehouse ? 'Edit Warehouse' : 'Add Warehouse'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer outline-none focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-grow p-5 overflow-y-auto space-y-4 custom-scrollbar">
              {error && (
                <div className="p-3 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <SectionHeader title="Warehouse Details" icon={Database} />
                <Card className="p-4 space-y-4" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
                  <Input
                    label="Company"
                    variant="compact"
                    value={companyName}
                    readOnly
                  />

                  <Select
                    label="Branch *"
                    variant="compact"
                    value={form.branchId}
                    onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                    options={[
                      { value: '', label: 'Select Branch...' },
                      ...availableBranches.map(b => ({ value: b.id, label: `${b.name} (${b.code})` }))
                    ]}
                  />

                  {form.branchId && (
                    <Input
                      label="Selected Branch Code"
                      variant="compact"
                      value={availableBranches.find(b => b.id === form.branchId)?.code || ''}
                      readOnly
                    />
                  )}

                  <Input
                    label="Warehouse Code"
                    variant="compact"
                    placeholder="e.g. WH-001"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    readOnly={codeSetting.mode === 'auto'}
                  />

                  <Input
                    label="Warehouse Name *"
                    variant="compact"
                    placeholder="e.g. Lahore Main Warehouse"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />

                  <div className="pt-2">
                    <Toggle
                      checked={form.isActive}
                      onChange={(val) => setForm({ ...form, isActive: val })}
                      label="Active"
                    />
                  </div>
                </Card>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#E2E8F0] flex justify-end items-center gap-2 bg-slate-50/50 flex-shrink-0">
              <Button onClick={onClose} variant="white" size="md">
                Cancel
              </Button>
              <Button
                onClick={handleSaveClick}
                variant="primary"
                size="md"
                icon={Check}
                style={{ backgroundColor: brand.primary }}
              >
                {warehouse ? 'Update Warehouse' : 'Save Warehouse'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
