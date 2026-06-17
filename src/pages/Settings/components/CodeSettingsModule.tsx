import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../../components/ui/Card';
import { useTheme } from '../../../context/ThemeContext';
import { Input, Select } from '../../../components/ui/FormControls';
import { seedCompanies, seedBranches } from '../../../utils/settingsData';
import type { Company, Branch } from '../../../utils/settingsData';
import {
  FileText, Database, Users, Shield, Package, Building2, Check
} from 'lucide-react';
import type {
  BranchCodeSettings, EntityCodeSetting
} from '../../../utils/codeSettingsHelper';
import { DEFAULT_ENTITY_SETTINGS } from '../../../utils/codeSettingsHelper';

interface CodeSettingsModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

const ENTITIES = [
  { id: 'sale_invoice', label: 'Sale Invoice Code', desc: 'Manage Sale Invoice code prefix and sequence.', icon: FileText },
  { id: 'sale_return', label: 'Sale Return Code', desc: 'Manage Sale Return code prefix and sequence.', icon: FileText },
  { id: 'service_invoice', label: 'Service Invoice Code', desc: 'Manage Service Invoice code prefix and sequence.', icon: FileText },
  { id: 'digital_invoice', label: 'Digital Invoice Code', desc: 'Manage Digital Invoice code prefix and sequence.', icon: FileText },
  { id: 'warehouse', label: 'Warehouse Code', desc: 'Manage Warehouse code prefix and sequence.', icon: Database },
  { id: 'salesperson', label: 'Salesperson Code', desc: 'Manage Salesperson code prefix and sequence.', icon: Users },
  { id: 'customer', label: 'Customer Code', desc: 'Manage Customer code prefix and sequence.', icon: Shield },
  { id: 'product', label: 'Product Code', desc: 'Manage Product code prefix and sequence.', icon: Package },
  { id: 'branch', label: 'Branch Code', desc: 'Manage Branch code prefix and sequence.', icon: Building2 },
  { id: 'department', label: 'Department Code', desc: 'Manage Department code prefix and sequence.', icon: Building2 }
] as const;

export const CodeSettingsModule: React.FC<CodeSettingsModuleProps> = ({ brand }) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [settings, setSettings] = useState<Record<string, Record<string, BranchCodeSettings>>>({});
  const [savedMessage, setSavedMessage] = useState<boolean>(false);

  // Load companies
  const companies = useMemo<Company[]>(() => {
    try {
      const stored = localStorage.getItem('company_records');
      return stored ? JSON.parse(stored) : seedCompanies;
    } catch {
      return seedCompanies;
    }
  }, []);

  // Load branches
  const branches = useMemo<Branch[]>(() => {
    try {
      const stored = localStorage.getItem('branch_records');
      return stored ? JSON.parse(stored) : seedBranches;
    } catch {
      return seedBranches;
    }
  }, []);

  // Available branches for current company
  const availableBranches = useMemo(() => {
    return branches.filter(b => b.companyId === selectedCompanyId);
  }, [branches, selectedCompanyId]);

  // Load initial settings and active context
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('code_generation_settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (e) {
      console.error('Failed to load code settings from localstorage', e);
    }

    // Default to active contexts
    try {
      const activeCo = sessionStorage.getItem('active_company');
      const activeBr = sessionStorage.getItem('active_branch');
      
      const currentCoId = activeCo ? JSON.parse(activeCo).id : (companies[0]?.id || '');
      setSelectedCompanyId(currentCoId);

      const currentBrId = activeBr ? JSON.parse(activeBr).id : '';
      if (currentBrId) {
        setSelectedBranchId(currentBrId);
      } else {
        const firstBranch = branches.find(b => b.companyId === currentCoId);
        setSelectedBranchId(firstBranch?.id || '');
      }
    } catch {
      setSelectedCompanyId(companies[0]?.id || '');
      const firstBranch = branches.find(b => b.companyId === (companies[0]?.id || ''));
      setSelectedBranchId(firstBranch?.id || '');
    }
  }, [companies, branches]);



  // Get active branch settings
  const activeBranchSettings = useMemo((): BranchCodeSettings => {
    if (!selectedCompanyId || !selectedBranchId) {
      return {
        sale_invoice: { ...DEFAULT_ENTITY_SETTINGS.sale_invoice },
        sale_return: { ...DEFAULT_ENTITY_SETTINGS.sale_return },
        service_invoice: { ...DEFAULT_ENTITY_SETTINGS.service_invoice },
        digital_invoice: { ...DEFAULT_ENTITY_SETTINGS.digital_invoice },
        warehouse: { ...DEFAULT_ENTITY_SETTINGS.warehouse },
        salesperson: { ...DEFAULT_ENTITY_SETTINGS.salesperson },
        customer: { ...DEFAULT_ENTITY_SETTINGS.customer },
        product: { ...DEFAULT_ENTITY_SETTINGS.product },
        branch: { ...DEFAULT_ENTITY_SETTINGS.branch },
        department: { ...DEFAULT_ENTITY_SETTINGS.department }
      };
    }
    const companySettings = settings[selectedCompanyId] || {};
    const branchSettings = companySettings[selectedBranchId] || {};

    return {
      sale_invoice: { ...DEFAULT_ENTITY_SETTINGS.sale_invoice, ...branchSettings.sale_invoice },
      sale_return: { ...DEFAULT_ENTITY_SETTINGS.sale_return, ...branchSettings.sale_return },
      service_invoice: { ...DEFAULT_ENTITY_SETTINGS.service_invoice, ...branchSettings.service_invoice },
      digital_invoice: { ...DEFAULT_ENTITY_SETTINGS.digital_invoice, ...branchSettings.digital_invoice },
      warehouse: { ...DEFAULT_ENTITY_SETTINGS.warehouse, ...branchSettings.warehouse },
      salesperson: { ...DEFAULT_ENTITY_SETTINGS.salesperson, ...branchSettings.salesperson },
      customer: { ...DEFAULT_ENTITY_SETTINGS.customer, ...branchSettings.customer },
      product: { ...DEFAULT_ENTITY_SETTINGS.product, ...branchSettings.product },
      branch: { ...DEFAULT_ENTITY_SETTINGS.branch, ...branchSettings.branch },
      department: { ...DEFAULT_ENTITY_SETTINGS.department, ...branchSettings.department },
    };
  }, [settings, selectedCompanyId, selectedBranchId]);

  // Save specific settings key
  const saveSetting = (entityId: keyof BranchCodeSettings, updated: EntityCodeSetting) => {
    if (!selectedCompanyId || !selectedBranchId) return;

    const newSettings = {
      ...settings,
      [selectedCompanyId]: {
        ...(settings[selectedCompanyId] || {}),
        [selectedBranchId]: {
          ...activeBranchSettings,
          [entityId]: updated
        }
      }
    };

    setSettings(newSettings);
    localStorage.setItem('code_generation_settings', JSON.stringify(newSettings));
    
    setSavedMessage(true);
    const timer = setTimeout(() => setSavedMessage(false), 1200);
    return () => clearTimeout(timer);
  };

  // Live code preview helper
  const getPreview = (entity: EntityCodeSetting) => {
    if (entity.mode === 'manual') return 'Manual Entry';
    return `${entity.prefix || ''}${entity.nextNumber || 1}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Company & Branch Filter Bar */}
      <Card className="p-4" style={{ borderColor: brand.border, backgroundColor: brand.cardBg, boxShadow: 'none' }}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-500" />
            <h3 className="text-xs font-black text-slate-700 tracking-wide">Context Selection</h3>
          </div>
          <div className="flex-grow">
            <Select
              label="Select Branch"
              variant="compact"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              options={[
                { value: 'all', label: 'Overall Company (All Branches)' },
                ...availableBranches.map(b => ({ value: b.id, label: b.name }))
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Header Saved message */}
      <div className="flex justify-between items-center h-5">
        <p className="text-[11px] text-slate-400 font-medium">
          Define sequence coding templates for each entity. Auto mode automatically generates sequential numbers.
        </p>
        {savedMessage && (
          <div className="text-[10px] font-black text-emerald-600 flex items-center gap-1 animate-fade-in-out">
            <Check className="w-3.5 h-3.5" /> Settings Saved
          </div>
        )}
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ENTITIES.map(entity => {
          const entitySetting = activeBranchSettings[entity.id];
          const Icon = entity.icon;

          return (
            <Card key={entity.id} className="rounded-2xl overflow-hidden p-0 flex flex-col" style={{ borderColor: brand.border, backgroundColor: brand.cardBg, boxShadow: 'none' }}>
              {/* Card Header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50 shrink-0">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-black text-slate-700 tracking-wide">{entity.label}</h3>
                </div>
                {/* Live Preview badge */}
                <span className="text-[9px] font-black px-2 py-0.5 rounded-md" style={{ color: brand.primary, backgroundColor: `${brand.primary}15` }}>
                  Preview: {getPreview(entitySetting)}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-4">
                <p className="text-[10px] text-slate-400 font-medium">{entity.desc}</p>
                
                 {/* Mode Selector */}
                <div className="flex items-center gap-3 py-2 border-b border-slate-100">
                  <input
                    id={`auto-${entity.id}`}
                    type="checkbox"
                    checked={entitySetting.mode === 'auto'}
                    onChange={(e) => {
                      saveSetting(entity.id, {
                        ...entitySetting,
                        mode: e.target.checked ? 'auto' : 'manual'
                      });
                    }}
                    className="rounded border-slate-350 cursor-pointer w-4 h-4 transition-all duration-150"
                    style={{ accentColor: brand.primary }}
                  />
                  <label htmlFor={`auto-${entity.id}`} className="flex flex-col cursor-pointer select-none">
                    <span className="text-xs font-bold text-slate-700">Auto Generate Code</span>
                    <span className="text-[9px] text-slate-400">Generate formatted sequences automatically</span>
                  </label>
                </div>

                {/* Configurations — Only if Auto is active */}
                {entitySetting.mode === 'auto' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Input
                      label="Code Prefix"
                      variant="compact"
                      value={entitySetting.prefix}
                      onChange={(e) => {
                        saveSetting(entity.id, {
                          ...entitySetting,
                          prefix: e.target.value
                        });
                      }}
                      placeholder="e.g. INV-"
                    />
                    <Input
                      label="Serial Start"
                      variant="compact"
                      type="number"
                      value={entitySetting.nextNumber}
                      onChange={(e) => {
                        saveSetting(entity.id, {
                          ...entitySetting,
                          nextNumber: Math.max(1, parseInt(e.target.value) || 1)
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
