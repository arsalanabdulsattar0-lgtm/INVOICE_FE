import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Pencil, Trash2, SlidersHorizontal } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Toggle, ScrollArea } from '../../../components/ui/FormControls';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { Modal } from '../../../components/ui/Modal';
import { TableHeader } from '../../../components/ui/Typography';
import { useTheme } from '../../../context/ThemeContext';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { SectionCard } from '../../../components/ui/SectionCard';
import { AddButton } from '../../../components/ui/ActionButtons';

export interface AdjustmentType {
  id: string;
  name: string;
  active: boolean;
}

interface AdjustmentTypeModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

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
        scrollable
        bodyClassName="space-y-6 flex flex-col min-h-0"
      >
        <div className="flex items-center justify-between gap-3 shrink-0">
          <div className="w-64">
            <Input
              variant="compact"
              icon={Search}
              placeholder="Search types..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <AddButton size="sm" onClick={() => handleOpenModal()}
            style={{ backgroundColor: brand.primary }}
          >
            Add Type
          </AddButton>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-none"
          style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
        >
        <ScrollArea height="350px">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50">
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
              {filteredTypes.length > 0 ? (
                filteredTypes.map((t) => (
                  <tr key={t.id} className="border-b border-[#E2E8F0] hover:bg-slate-50/50 transition-colors last:border-0">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700">{t.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      {t.active ? <ActiveChip label="Active" onClick={() => handleToggleActive(t.id)} /> : <InactiveChip label="Inactive" onClick={() => handleToggleActive(t.id)} />}
                    </td>
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(t)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => confirmDelete(t)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-sm text-slate-500 font-medium">
                    No adjustment types found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingType ? "Edit Adjustment Type" : "Add Adjustment Type"}
        style={{ width: '400px' }}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="white" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave} style={{ backgroundColor: brand.primary }}>
              {editingType ? 'Save Changes' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <Input
            label={<span>Type Name <span className="text-red-500">*</span></span>}
            variant="compact"
            placeholder="e.g. Damage, Expiry..."
            value={formName}
            onChange={e => setFormName(e.target.value)}
            error={formError}
          />
          <Toggle
            label="Active Status"
            checked={formActive}
            onChange={setFormActive}
            compact
          />
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
