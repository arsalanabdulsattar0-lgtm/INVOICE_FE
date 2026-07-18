import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Pencil, Trash2, Check, List, Package } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Toggle, ScrollArea } from '../../../components/ui/FormControls';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { Modal } from '../../../components/ui/Modal';
import { TableHeader } from '../../../components/ui/Typography';
import { useTheme } from '../../../context/ThemeContext';
import { seedCompanies } from '../../../utils/settingsData';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { Pagination } from '../../../components/common/Pagination';
import { ProductSetupValuesDrawer } from './ProductSetupValuesDrawer';
import { SectionCard } from '../../../components/ui/SectionCard';
import { AddButton } from '../../../components/ui/ActionButtons';

export interface ProductSetupType {
  id: string;
  companyId: string;
  code: string;
  name: string;
  prefix: string;
  serialStart: number;
  active: boolean;
}

export interface ProductSetupValue {
  id: string;
  typeId: string;
  typeName: string;
  code: string;
  name: string;
  active: boolean;
}

interface ProductSetupModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

const initialTypes: ProductSetupType[] = [
  { id: 't-1', companyId: 'co1', code: 'PROD_CAT', name: 'Product Category', prefix: 'CAT', serialStart: 103, active: true },
  { id: 't-2', companyId: 'co1', code: 'PROD_GRP', name: 'Product Group', prefix: 'GRP', serialStart: 503, active: true },
  { id: 't-3', companyId: 'co2', code: 'PROD_BRAND', name: 'Brand', prefix: 'BRD', serialStart: 1002, active: false }
];

const initialValues: ProductSetupValue[] = [
  { id: 'v-1', typeId: 't-1', typeName: 'Product Category', code: 'CAT-101', name: 'Electronics', active: true },
  { id: 'v-2', typeId: 't-1', typeName: 'Product Category', code: 'CAT-102', name: 'Hardware', active: true },
  { id: 'v-3', typeId: 't-2', typeName: 'Product Group', code: 'GRP-501', name: 'Laptops', active: true },
  { id: 'v-4', typeId: 't-2', typeName: 'Product Group', code: 'GRP-502', name: 'Smartphones', active: true },
  { id: 'v-5', typeId: 't-3', typeName: 'Brand', code: 'BRD-1001', name: 'Apple', active: true }
];

const PAGE_SIZE = 10;

export const ProductSetupModule: React.FC<ProductSetupModuleProps> = ({ brand }) => {
  // --- State ---
  const [types, setTypes] = useState<ProductSetupType[]>(() => {
    try {
      const stored = localStorage.getItem('product_setup_types');
      return stored ? JSON.parse(stored) : initialTypes;
    } catch {
      return initialTypes;
    }
  });

  const [values, setValues] = useState<ProductSetupValue[]>(() => {
    try {
      const stored = localStorage.getItem('product_setup_values');
      return stored ? JSON.parse(stored) : initialValues;
    } catch {
      return initialValues;
    }
  });

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('product_setup_types', JSON.stringify(types));
  }, [types]);

  useEffect(() => {
    localStorage.setItem('product_setup_values', JSON.stringify(values));
  }, [values]);

  // Section 1 State
  const [searchType, setSearchType] = useState('');
  const [currentPageTypes, setCurrentPageTypes] = useState(1);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [editingType, setEditingType] = useState<ProductSetupType | null>(null);
  const [formType, setFormType] = useState<Omit<ProductSetupType, 'id'>>({
    companyId: seedCompanies[0]?.id || '',
    code: '',
    name: '',
    prefix: '',
    serialStart: 100,
    active: true
  });
  const [typeError, setTypeError] = useState('');

  // Deletion modals
  const [deleteTypeModal, setDeleteTypeModal] = useState({ isOpen: false, id: '', name: '' });

  // Drawer state for setup values
  const [activeValueType, setActiveValueType] = useState<ProductSetupType | null>(null);

  // --- Derived Data ---
  const filteredTypes = useMemo(() => {
    return types.filter(t => {
      const q = searchType.toLowerCase();
      const companyName = seedCompanies.find(c => c.id === t.companyId)?.name || '';
      return (
        companyName.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.prefix.toLowerCase().includes(q)
      );
    });
  }, [types, searchType]);

  // Pagination bounds
  const totalPagesTypes = Math.max(1, Math.ceil(filteredTypes.length / PAGE_SIZE));
  const paginatedTypes = useMemo(() => {
    return filteredTypes.slice((currentPageTypes - 1) * PAGE_SIZE, currentPageTypes * PAGE_SIZE);
  }, [filteredTypes, currentPageTypes]);

  // --- CRUD Handlers for Types ---
  const openAddType = () => {
    setEditingType(null);
    const activeCo = sessionStorage.getItem('active_company') || seedCompanies[0]?.id || '';
    setFormType({
      companyId: activeCo,
      code: '',
      name: '',
      prefix: '',
      serialStart: 100,
      active: true
    });
    setTypeError('');
    setShowTypeForm(true);
  };

  const handleToggleTypeActive = (id: string) => {
    setTypes(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const handleToggleValueActive = (valId: string) => {
    setValues(prev => prev.map(v => v.id === valId ? { ...v, active: !v.active } : v));
  };

  const openEditType = (t: ProductSetupType) => {
    setEditingType(t);
    setFormType({
      companyId: t.companyId,
      code: t.code,
      name: t.name,
      prefix: t.prefix,
      serialStart: t.serialStart,
      active: t.active
    });
    setTypeError('');
    setShowTypeForm(true);
  };

  const handleSaveType = () => {
    if (!formType.name.trim()) {
      setTypeError('Name is required.');
      return;
    }
    if (!formType.prefix.trim()) {
      setTypeError('Prefix is required.');
      return;
    }
    if (formType.serialStart < 0) {
      setTypeError('Serial Start must be positive.');
      return;
    }

    const generatedCode = formType.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');

    if (editingType) {
      // If setup type name is updated, we must also update all values referencing it
      const oldName = editingType.name;
      setTypes(prev => prev.map(t => t.id === editingType.id ? { ...editingType, ...formType, code: generatedCode } : t));
      if (oldName !== formType.name) {
        setValues(prev => prev.map(v => v.typeId === editingType.id ? { ...v, typeName: formType.name } : v));
      }
    } else {
      setTypes(prev => [...prev, { id: `t-${Date.now()}`, ...formType, code: generatedCode }]);
    }
    setShowTypeForm(false);
  };

  const handleDeleteType = (id: string, name: string) => {
    setDeleteTypeModal({ isOpen: true, id, name });
  };

  const confirmDeleteType = () => {
    // Delete setup type and all values referencing it
    setTypes(prev => prev.filter(t => t.id !== deleteTypeModal.id));
    setValues(prev => prev.filter(v => v.typeId !== deleteTypeModal.id));
    setDeleteTypeModal(prev => ({ ...prev, isOpen: false }));
    setCurrentPageTypes(1);
  };

  // --- Drawer Value Handlers ---
  const handleSaveDrawerValue = (formBranch: Omit<ProductSetupValue, 'id' | 'typeId' | 'typeName' | 'code'> & { id?: string; typeId?: string }) => {
    const targetTypeId = formBranch.typeId || activeValueType?.id;
    const selectedType = types.find(t => t.id === targetTypeId);
    if (!selectedType) return;

    if (formBranch.id) {
      // Find current value to check if typeId changed
      const oldVal = values.find(v => v.id === formBranch.id);
      const isTypeChanged = oldVal && oldVal.typeId !== selectedType.id;

      let newCode = oldVal?.code || '';
      if (isTypeChanged) {
        newCode = `${selectedType.prefix}-${selectedType.serialStart}`;
      }

      setValues(prev =>
        prev.map(v => (v.id === formBranch.id ? {
          ...v,
          name: formBranch.name,
          active: formBranch.active,
          typeId: selectedType.id,
          typeName: selectedType.name,
          code: newCode
        } : v))
      );

      if (isTypeChanged) {
        // Increment the serial start of the selected type
        setTypes(prev => prev.map(t => t.id === selectedType.id ? { ...t, serialStart: t.serialStart + 1 } : t));
        if (activeValueType && selectedType.id === activeValueType.id) {
          setActiveValueType(prev => prev ? { ...prev, serialStart: prev.serialStart + 1 } : null);
        }
      }
    } else {
      // Auto-generate code
      const generatedCode = `${selectedType.prefix}-${selectedType.serialStart}`;
      const newVal: ProductSetupValue = {
        id: `v-${Date.now()}`,
        typeId: selectedType.id,
        typeName: selectedType.name,
        code: generatedCode,
        name: formBranch.name,
        active: formBranch.active
      };
      setValues(prev => [...prev, newVal]);
      setTypes(prev => prev.map(t => t.id === selectedType.id ? { ...t, serialStart: t.serialStart + 1 } : t));
      
      // Update activeValueType if we are currently looking at the selected type
      if (activeValueType && selectedType.id === activeValueType.id) {
        setActiveValueType(prev => prev ? { ...prev, serialStart: prev.serialStart + 1 } : null);
      }
    }
  };

  const handleDeleteDrawerValue = (valId: string) => {
    setValues(prev => prev.filter(v => v.id !== valId));
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <SectionCard
        title="Product Setup Settings"
        icon={<Package className="w-3.5 h-3.5 text-white" />}
        brand={brand}
        scrollable={false}
        bodyClassName="p-0 flex flex-col min-h-0"
      >
      
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-slate-100 shrink-0 bg-white">
        <div className="w-64">
          <Input
            variant="compact"
            icon={Search}
            value={searchType}
            onChange={e => { setSearchType(e.target.value); setCurrentPageTypes(1); }}
            placeholder="Search setup types..."
          />
        </div>
        <div className="flex items-center gap-2">
          <AddButton size="md" onClick={openAddType} >
            Add Type
          </AddButton>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6 bg-slate-50/30">
        {/* 🛠️🛠️🛠️ SECTION 1: Product Setup Types Card 🛠️🛠️🛠️ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
      >
        <ScrollArea height="290px">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#E2E8F0]">
                {['Name', 'Preview Code', 'Active', 'Actions'].map((h) => (
                  <TableHeader
                    key={h}
                    label={h}
                    width={h === 'Actions' ? 'w-24' : ''}
                    padding={h === 'Actions' ? 'px-2' : 'px-4'}
                    borderLeft={false}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedTypes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[12px] text-slate-400">
                    No setup types configured.
                  </td>
                </tr>
              ) : (
                paginatedTypes.map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 last:border-0"
                  >
                    <td className="px-4 py-2.5 text-[12px] font-normal text-slate-600">{t.name}</td>
                    <td className="px-4 py-2.5 text-[12px] font-normal text-slate-650 font-mono">{t.prefix ? `${t.prefix}-${t.serialStart}` : ''}</td>
                    <td className="px-4 py-2.5">
                      {t.active ? (
                        <ActiveChip label="Active" onClick={() => handleToggleTypeActive(t.id)} />
                      ) : (
                        <InactiveChip label="Inactive" onClick={() => handleToggleTypeActive(t.id)} />
                      )}
                    </td>
                    <td className="px-2 py-2.5 w-24">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={List}
                          title="Values"
                          className="!px-1 text-slate-500 hover:text-slate-800"
                          onClick={() => setActiveValueType(t)}
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Pencil}
                          title="Edit"
                          className="!px-1 text-slate-500 hover:text-slate-800"
                          onClick={() => openEditType(t)}
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Trash2}
                          title="Delete"
                          className="!px-1 !text-red-500"
                          onClick={() => handleDeleteType(t.id, t.name)}
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>

        {/* Reusable Pagination */}
        <div className="p-4 border-t border-slate-100 print-hidden">
          <Pagination
            currentPage={currentPageTypes}
            totalPages={totalPagesTypes}
            totalItems={filteredTypes.length}
            itemsPerPage={PAGE_SIZE}
            onPageChange={setCurrentPageTypes}
          />
        </div>
      </motion.div>

      {/* ─── Modal: Add/Edit Setup Type ─── */}
      <Modal
        isOpen={showTypeForm}
        onClose={() => setShowTypeForm(false)}
        title={editingType ? 'Edit Setup Type' : 'Add Setup Type'}
        size="lg"
        footer={
          <>
            <Button variant="white" size="md" onClick={() => setShowTypeForm(false)}>Cancel</Button>
            <Button
              variant="primary"
              size="md"
              icon={Check}
              onClick={handleSaveType}
              style={{ backgroundColor: brand.primary }}
            >
              {editingType ? 'Update Type' : 'Save Type'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {typeError && (
            <div className="p-3 text-[11px] font-bold text-red-655 bg-red-50 border border-red-100 rounded-xl">
              {typeError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Company *"
              variant="compact"
              value={seedCompanies.find(c => c.id === formType.companyId)?.name || 'Unknown Company'}
              readOnly
            />
            <Input
              label="Name *"
              variant="compact"
              placeholder="e.g. Product Category"
              value={formType.name}
              onChange={e => setFormType({ ...formType, name: e.target.value })}
            />
            <Input
              label="Code Prefix *"
              variant="compact"
              placeholder="e.g. CAT"
              value={formType.prefix}
              onChange={e => setFormType({ ...formType, prefix: e.target.value })}
            />
            <Input
              label="Serial Start *"
              variant="compact"
              type="number"
              placeholder="100"
              value={String(formType.serialStart)}
              onChange={e => setFormType({ ...formType, serialStart: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Preview Code"
              variant="compact"
              value={formType.prefix ? `${formType.prefix}-${formType.serialStart}` : ''}
              readOnly
            />
            <div className="flex items-center pt-5">
              <Toggle
                checked={formType.active}
                onChange={val => setFormType({ ...formType, active: val })}
                label="Active"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── Deletion Modals ─── */}
      <DeleteConfirmationModal
        isOpen={deleteTypeModal.isOpen}
        onClose={() => setDeleteTypeModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDeleteType}
        title="Delete Setup Type?"
        itemName={deleteTypeModal.name}
        warningText="Warning: Deleting this Setup Type will also delete all Setup Values associated with it. This action cannot be undone."
      />

      <ProductSetupValuesDrawer
        isOpen={activeValueType !== null}
        onClose={() => setActiveValueType(null)}
        setupType={activeValueType}
        values={values}
        onSave={handleSaveDrawerValue}
        onDelete={handleDeleteDrawerValue}
        onToggleActive={handleToggleValueActive}
      />
      </div>
      </SectionCard>
    </div>
  );
};
