import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../../components/ui/Card';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Plus, Pencil, Trash2, Check, FolderOpen } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Toggle, ScrollArea } from '../../../components/ui/FormControls';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { FilterDrawer } from '../../../components/ui/FilterDrawer';
import { Modal } from '../../../components/ui/Modal';
import { TableHeader } from '../../../components/ui/Typography';
import { useTheme } from '../../../context/ThemeContext';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';
import { generateNextCode, incrementNextCode } from '../../../utils/codeSettingsHelper';

export interface Department {
  id: string; // Department Code
  name: string; // Department Name
  active: boolean; // Status
  createdDate: string; // Created Date
}

interface DepartmentModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

export const seedDepartments: Department[] = [
  { id: 'HR', name: 'Human Resources', active: true, createdDate: '2026-06-17' },
  { id: 'FIN', name: 'Finance Department', active: true, createdDate: '2026-06-17' },
  { id: 'ACC', name: 'Accounts Department', active: true, createdDate: '2026-06-17' },
  { id: 'SALES', name: 'Sales Department', active: true, createdDate: '2026-06-17' },
  { id: 'PUR', name: 'Purchase Department', active: true, createdDate: '2026-06-17' },
  { id: 'INV', name: 'Inventory Department', active: true, createdDate: '2026-06-17' },
  { id: 'IT', name: 'Information Technology', active: true, createdDate: '2026-06-17' },
];

const emptyDepartment = (code = ''): Omit<Department, 'id'> & { code: string } => ({
  code,
  name: '',
  active: true,
  createdDate: new Date().toISOString().split('T')[0]
});

export const DepartmentModule: React.FC<DepartmentModuleProps> = ({ brand }) => {
  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const stored = localStorage.getItem('departments');
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem('departments', JSON.stringify(seedDepartments));
      return seedDepartments;
    } catch {
      return seedDepartments;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('departments', JSON.stringify(departments));
    } catch (e) {
      console.error('Failed to save departments to localStorage', e);
    }
  }, [departments]);

  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [tempStatus, setTempStatus] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<Omit<Department, 'id'> & { code: string }>(emptyDepartment());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });

  const filtered = useMemo(() => {
    return departments.filter(d => {
      const q = search.toLowerCase();
      const matchSearch =
        d.id.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q);
      const matchStatus =
        filterStatus === 'all' || (filterStatus === 'active' ? d.active : !d.active);
      return matchSearch && matchStatus;
    });
  }, [departments, search, filterStatus]);

  const getActiveCode = () => {
    try {
      const activeCo = sessionStorage.getItem('active_company');
      const activeBr = sessionStorage.getItem('active_branch');
      const currentCoId = activeCo ? JSON.parse(activeCo).id : 'co1';
      const currentBrId = activeBr ? JSON.parse(activeBr).id : 'br-1';
      return generateNextCode('department', currentCoId, currentBrId) || 'HR';
    } catch {
      return 'HR';
    }
  };

  const openAdd = () => {
    setEditing(null);
    setErrors({});
    const generatedCode = getActiveCode();
    setForm(emptyDepartment(generatedCode));
    setShowForm(true);
  };

  const openEdit = (d: Department) => {
    setEditing(d);
    setErrors({});
    setForm({
      code: d.id,
      name: d.name,
      active: d.active,
      createdDate: d.createdDate
    });
    setShowForm(true);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (!form.code.trim()) {
      newErrors.code = 'Department Code is required';
    }

    if (!form.name.trim()) {
      newErrors.name = 'Department Name is required';
    } else {
      const isUnique = !departments.some(
        d =>
          d.name.trim().toLowerCase() === form.name.trim().toLowerCase() &&
          (!editing || d.id !== editing.id)
      );
      if (!isUnique) {
        newErrors.name = 'Department Name must be unique';
      }
    }

    if (!editing) {
      const codeExists = departments.some(
        d => d.id.trim().toLowerCase() === form.code.trim().toLowerCase()
      );
      if (codeExists) {
        newErrors.code = 'This Department Code is already in use';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editing) {
      setDepartments(prev =>
        prev.map(d => (d.id === editing.id ? { ...editing, name: form.name.trim(), active: form.active } : d))
      );
    } else {
      const newDept: Department = {
        id: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        active: form.active,
        createdDate: form.createdDate
      };
      setDepartments(prev => [newDept, ...prev]);

      const activeCo = sessionStorage.getItem('active_company');
      const activeBr = sessionStorage.getItem('active_branch');
      const currentCoId = activeCo ? JSON.parse(activeCo).id : 'co1';
      const currentBrId = activeBr ? JSON.parse(activeBr).id : 'br-1';
      incrementNextCode('department', currentCoId, currentBrId);
    }

    setShowForm(false);
  };

  const handleToggleActive = (id: string) => {
    setDepartments(prev =>
      prev.map(d => (d.id === id ? { ...d, active: !d.active } : d))
    );
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = () => {
    setDepartments(prev => prev.filter(d => d.id !== deleteModal.id));
    setDeleteModal({ isOpen: false, id: '', name: '' });
  };

  const handleReset = () => {
    setFilterStatus('all');
    setTempStatus('all');
    setShowFilter(false);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-64">
          <Input
            variant="compact"
            icon={Search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search By Code or Name..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="white"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => {
              setTempStatus(filterStatus);
              setShowFilter(true);
            }}
          >
            Filter
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={openAdd}
            style={{ backgroundColor: brand.primary }}
          >
            Add Department
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card className="rounded-2xl overflow-hidden p-0" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
        {/* Table header bar */}
        <div className="px-4 py-2.5 flex items-center justify-between text-white" style={{ backgroundColor: brand.primary }}>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <h3 className="text-[11px] font-black tracking-wide">Department Directory</h3>
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: brand.soft, color: brand.dark }}>
              {filtered.length} records
            </span>
          </div>
        </div>

        <ScrollArea height="290px">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#E2E8F0]">
                {['Department Code', 'Department Name', 'Status', 'Created Date', 'Actions'].map((h) => (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[12px] text-slate-400">No department records found.</td>
                </tr>
              ) : filtered.map((d, i) => (
                <motion.tr
                  key={d.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 last:border-0"
                >
                  <td className="px-4 py-3 text-[12px] font-bold text-slate-700">{d.id}</td>
                  <td className="px-4 py-3 text-[12px] font-normal text-slate-600">{d.name}</td>
                  <td
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => handleToggleActive(d.id)}
                    title={d.active ? "Click to Disable" : "Click to Enable"}
                  >
                    {d.active ? (
                      <ActiveChip label="Active" size="md" />
                    ) : (
                      <InactiveChip label="Inactive" size="md" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-[12px] font-normal text-slate-500">{d.createdDate}</td>
                  <td className="px-2 py-3 w-24">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Pencil}
                        title="Edit"
                        className="!px-1"
                        onClick={() => openEdit(d)}
                      />
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={Trash2}
                        title="Delete"
                        className="!px-1 !text-red-500"
                        onClick={() => handleDelete(d.id, d.name)}
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </Card>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Department' : 'Add Department'}
        size="md"
        footer={
          <>
            <Button variant="white" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              variant="primary"
              size="md"
              icon={Check}
              onClick={handleSave}
              style={{ backgroundColor: brand.primary }}
            >
              {editing ? 'Update Department' : 'Save Department'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Department Code *"
            variant="compact"
            readOnly
            value={form.code}
            error={errors.code}
            className="bg-slate-50 border-slate-200 font-bold"
            placeholder="Selected from Code Settings"
          />
          <Input
            label="Department Name *"
            variant="compact"
            placeholder="e.g. Human Resources"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <div className="flex items-center gap-3 pt-2">
            <Toggle
              checked={form.active}
              onChange={val => setForm({ ...form, active: val })}
              label="Status (Active / Inactive)"
            />
          </div>
        </div>
      </Modal>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onReset={handleReset}
        onApply={() => {
          setFilterStatus(tempStatus);
          setShowFilter(false);
        }}
        title="Filter Departments"
      >
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Status</label>
          <div className="grid grid-cols-3 gap-1 bg-slate-100/60 p-0.5 rounded-lg border border-slate-200/30">
            {[{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'inactive', label: 'Inactive' }].map(opt => (
              <button
                key={opt.key}
                onClick={() => setTempStatus(opt.key)}
                className={`py-1 rounded text-[11px] font-bold transition-all text-center cursor-pointer outline-none focus:outline-none ${tempStatus === opt.key ? 'bg-white shadow-xs border border-slate-200/40' : 'text-slate-500 hover:text-slate-800 bg-transparent border border-transparent'}`}
                style={{ color: tempStatus === opt.key ? brand.primary : undefined }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </FilterDrawer>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Delete Department?"
        itemName={deleteModal.name}
        warningText="This action will permanently delete this department. It may affect modules mapping to this department."
      />
    </div>
  );
};
