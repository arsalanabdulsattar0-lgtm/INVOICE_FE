export interface EntityCodeSetting {
  mode: 'auto' | 'manual';
  prefix: string;
  nextNumber: number;
  padding: number;
}

export interface BranchCodeSettings {
  sale_invoice: EntityCodeSetting;
  sale_return: EntityCodeSetting;
  service_invoice: EntityCodeSetting;
  digital_invoice: EntityCodeSetting;
  warehouse: EntityCodeSetting;
  salesperson: EntityCodeSetting;
  customer: EntityCodeSetting;
  product: EntityCodeSetting;
  branch: EntityCodeSetting;
}

export const DEFAULT_ENTITY_SETTINGS: Record<string, EntityCodeSetting> = {
  sale_invoice: { mode: 'auto', prefix: 'SI-', nextNumber: 1, padding: 1 },
  sale_return: { mode: 'auto', prefix: 'RTN-', nextNumber: 1, padding: 1 },
  service_invoice: { mode: 'auto', prefix: 'SRV-', nextNumber: 1, padding: 1 },
  digital_invoice: { mode: 'auto', prefix: 'DIG-', nextNumber: 1, padding: 1 },
  warehouse: { mode: 'auto', prefix: 'WH-', nextNumber: 1, padding: 1 },
  salesperson: { mode: 'auto', prefix: 'SP-', nextNumber: 1, padding: 1 },
  customer: { mode: 'auto', prefix: 'CUS-', nextNumber: 1, padding: 1 },
  product: { mode: 'auto', prefix: 'PRD-', nextNumber: 1, padding: 1 },
  branch: { mode: 'auto', prefix: 'BR-', nextNumber: 1, padding: 1 }
};

export const getCodeSettingsForBranch = (companyId: string, branchId: string): BranchCodeSettings => {
  try {
    const stored = localStorage.getItem('code_generation_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed[companyId]) {
        const branchSettings = parsed[companyId][branchId] || {};
        const companyLevelSettings = parsed[companyId]['all'] || {};
        
        return {
          sale_invoice: { ...DEFAULT_ENTITY_SETTINGS.sale_invoice, ...companyLevelSettings.sale_invoice, ...branchSettings.sale_invoice },
          sale_return: { ...DEFAULT_ENTITY_SETTINGS.sale_return, ...companyLevelSettings.sale_return, ...branchSettings.sale_return },
          service_invoice: { ...DEFAULT_ENTITY_SETTINGS.service_invoice, ...companyLevelSettings.service_invoice, ...branchSettings.service_invoice },
          digital_invoice: { ...DEFAULT_ENTITY_SETTINGS.digital_invoice, ...companyLevelSettings.digital_invoice, ...branchSettings.digital_invoice },
          warehouse: { ...DEFAULT_ENTITY_SETTINGS.warehouse, ...companyLevelSettings.warehouse, ...branchSettings.warehouse },
          salesperson: { ...DEFAULT_ENTITY_SETTINGS.salesperson, ...companyLevelSettings.salesperson, ...branchSettings.salesperson },
          customer: { ...DEFAULT_ENTITY_SETTINGS.customer, ...companyLevelSettings.customer, ...branchSettings.customer },
          product: { ...DEFAULT_ENTITY_SETTINGS.product, ...companyLevelSettings.product, ...branchSettings.product },
          branch: { ...DEFAULT_ENTITY_SETTINGS.branch, ...companyLevelSettings.branch, ...branchSettings.branch },
        };
      }
    }
  } catch (e) {
    console.error('Failed to load code settings', e);
  }
  return {
    sale_invoice: { ...DEFAULT_ENTITY_SETTINGS.sale_invoice },
    sale_return: { ...DEFAULT_ENTITY_SETTINGS.sale_return },
    service_invoice: { ...DEFAULT_ENTITY_SETTINGS.service_invoice },
    digital_invoice: { ...DEFAULT_ENTITY_SETTINGS.digital_invoice },
    warehouse: { ...DEFAULT_ENTITY_SETTINGS.warehouse },
    salesperson: { ...DEFAULT_ENTITY_SETTINGS.salesperson },
    customer: { ...DEFAULT_ENTITY_SETTINGS.customer },
    product: { ...DEFAULT_ENTITY_SETTINGS.product },
    branch: { ...DEFAULT_ENTITY_SETTINGS.branch }
  };
};

export const generateNextCode = (
  entityType: keyof BranchCodeSettings,
  companyId: string,
  branchId: string
): string => {
  const branchSettings = getCodeSettingsForBranch(companyId, branchId);
  const setting = branchSettings[entityType];
  if (setting.mode === 'manual') {
    return '';
  }
  const formattedNum = String(setting.nextNumber);
  return `${setting.prefix}${formattedNum}`;
};

export const incrementNextCode = (
  entityType: keyof BranchCodeSettings,
  companyId: string,
  branchId: string
): void => {
  try {
    const stored = localStorage.getItem('code_generation_settings');
    const parsed = stored ? JSON.parse(stored) : {};
    
    if (!parsed[companyId]) parsed[companyId] = {};
    
    const hasBranchSpecific = parsed[companyId][branchId] && parsed[companyId][branchId][entityType];
    const hasCompanyLevel = parsed[companyId]['all'] && parsed[companyId]['all'][entityType];
    
    const targetBranchId = hasBranchSpecific ? branchId : (hasCompanyLevel ? 'all' : branchId);
    
    if (!parsed[companyId][targetBranchId]) {
      parsed[companyId][targetBranchId] = {};
    }
    
    const activeSetting = getCodeSettingsForBranch(companyId, branchId)[entityType];
    activeSetting.nextNumber = Number(activeSetting.nextNumber || 1) + 1;
    
    parsed[companyId][targetBranchId][entityType] = activeSetting;
    
    localStorage.setItem('code_generation_settings', JSON.stringify(parsed));
  } catch (e) {
    console.error('Failed to increment next code', e);
  }
};
