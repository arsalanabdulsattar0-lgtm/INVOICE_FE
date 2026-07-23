import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Pencil, Trash2, SlidersHorizontal, Check } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Toggle, ScrollArea } from '../../../components/ui/FormControls';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { Modal } from '../../../components/ui/Modal';
import { TableHeader } from '../../../components/ui/Typography';
import { useTheme } from '../../../context/ThemeContext';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { SectionCard } from '../../../components/ui/SectionCard';
import { AddButton } from '../../../components/ui/ActionButtons';
import { Pagination } from '../../../components/common/Pagination';

export interface AdjustmentType {
  id: string;
  name: string;
  active: boolean;
}

interface AdjustmentTypeModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

const PAGE_SIZE = 10;

const initialTypes: AdjustmentType[] = [
  { id: '1', name: 'General', active: true },
  { id: '2', name: 'Factory Status', active: true },
  { id: '3', name: 'Factory Return', active: true },
  { id: '4', name: 'Excess', active: true },
  { id: '5', name: 'Short', active: true },
  { id: '6', name: 'waste', active: true },
  { id: '7', name: 'Complaint Return', active: true },
  { id: '8', name: 'complaint', active: true },
];

export const AdjustmentTypeModule: React.FC<AdjustmentTypeModuleProps> = ({ brand }) => {
  const [types, setTypes] = useState<AdjustmentType[]>(initialTypes);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<AdjustmentType | null>(null);
  const [formName, setFormName] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formError, setFormError] = useState('');

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<AdjustmentType | null>(null);

  const filteredTypes = useMemo(() => {
    return types.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  }, [types, search]);

  const totalPages = Math.max(1, Math.ceil(filteredTypes.length / PAGE_SIZE));
  const paginatedTypes = useMemo(() => {
    return filteredTypes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  }, [filteredTypes, currentPage]);

  const handleOpenModal = (t?: AdjustmentType) => {
    if (t) {
      setEditingType(t);
      setFormName(t.name);
      setFormActive(t.active);
    } else {
      setEditingType(null);
      setFormName('');
      setFormActive(true);
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      setFormError('Type name is required');
      return;
    }

    if (editingType) {
      setTypes(prev => prev.map(t => t.id === editingType.id ? { ...t, name: formName, active: formActive } : t));
    } else {
      const newType: AdjustmentType = {
        id: Math.random().toString(36).substr(2, 9),
        name: formName,
        active: formActive
      };
      setTypes(prev => [...prev, newType]);
    }
    setIsModalOpen(false);
  };

  const handleToggleActive = (id: string) => {
    setTypes(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const confirmDelete = (t: AdjustmentType) => {
    setTypeToDelete(t);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (typeToDelete) {
      setTypes(prev => prev.filter(t => t.id !== typeToDelete.id));
    }
    setDeleteModalOpen(false);
    setTypeToDelete(null);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <SectionCard
        title="Adjustment Types"
        icon={<SlidersHorizontal className="w-4 h-4 text-white" />}
        brand={brand}
        scrollable={false}
        bodyClassName="space-y-5 p-6 flex flex-col min-h-0 overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="w-64">
            <Input
              variant="compact"
              icon={Search}
              placeholder="Search types..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <AddButton size="md" onClick={() => handleOpenModal()} >
            Add Type
          </AddButton>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border overflow-hidden shadow-none flex-1 flex flex-col min-h-0"
          style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
        >
          <ScrollArea height="280px" className="flex-1">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-[#E2E8F0]">
                  {['Name', 'Status', 'Actions'].map((h) => (
                    <TableHeader
                      key={h}
                      label={h}
                      width={h === 'Actions' ? 'w-24' : h === 'Status' ? 'w-32' : ''}
                      padding={h === 'Actions' ? 'px-2' : 'px-6'}
                      borderLeft={false}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedTypes.length > 0 ? (
                  paginatedTypes.map((t) => (
                    <tr key={t.id} className="border-b border-[#E2E8F0] hover:bg-slate-50/50 transition-colors last:border-0">
                      <td className="px-6 py-3">
                        <span className="text-[12px] font-normal text-slate-700">{t.name}</span>
                      </td>
                      <td className="px-6 py-3">
                        {t.active ? <ActiveChip label="Active" onClick={() => handleToggleActive(t.id)} /> : <InactiveChip label="Inactive" onClick={() => handleToggleActive(t.id)} />}
                      </td>
                      <td className="px-2 py-3 w-24">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Pencil}
                            title="Edit"
                            className="!px-1 text-slate-500 hover:text-slate-800"
                            onClick={() => handleOpenModal(t)}
                          />
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Trash2}
                            title="Delete"
                            className="!px-1 !text-red-500"
                            onClick={() => confirmDelete(t)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-xs text-slate-400 font-medium">
                      No adjustment types found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea>

          {/* Reusable Pagination */}
          <div className="p-4 border-t border-slate-100 print-hidden">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredTypes.length}
              itemsPerPage={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          </div>
        </motion.div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingType ? "Edit Adjustment Type" : "Add Adjustment Type"}
          size="md"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="white" size="md" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                size="md"
                icon={Check}
                onClick={handleSave}
                style={{ backgroundColor: brand.primary }}
              >
                {editingType ? 'Update Type' : 'Save Type'}
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            {formError && (
              <div className="p-3 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {formError}
              </div>
            )}

            <Input
              label="Type Name *"
              variant="compact"
              placeholder="e.g. Damage Write-Off"
              value={formName}
              onChange={e => setFormName(e.target.value)}
            />

            <div className="flex items-center pt-2">
              <Toggle
                label="Active Status"
                checked={formActive}
                onChange={setFormActive}
              />
            </div>
          </div>
        </Modal>

        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Adjustment Type"
          itemName={typeToDelete?.name || ''}
        />
      </SectionCard>
    </div>
  );
};
