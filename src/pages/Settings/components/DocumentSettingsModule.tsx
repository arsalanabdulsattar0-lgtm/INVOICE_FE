import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { useTheme } from '../../../context/ThemeContext';
import { Layout, Columns, Check, FileText } from 'lucide-react';

interface DocumentSettingsModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

export interface DocumentViewSettings {
  fields: { [key: string]: boolean };
  columns: { [key: string]: boolean };
}

const DOC_TYPES = [
  'Sale Invoice',
  'Sale Return',
  'Service Invoice',
  'Digital Invoice'
];

const DEFAULT_FIELDS: Record<string, string[]> = {
  'Sale Invoice': ['Customer', 'Issue Date', 'Invoice ID', 'Reference', 'Customer Address', 'Due Date', 'Invoice Type', 'Department', 'Sales Person'],
  'Service Invoice': ['Customer', 'Issue Date', 'Invoice ID', 'Reference', 'Customer Address', 'Due Date', 'Invoice Type', 'Department', 'Sales Person'],
  'Digital Invoice': ['Customer', 'Issue Date', 'Invoice ID', 'Reference', 'Customer Address', 'Due Date', 'Invoice Type', 'Department', 'Sales Person'],
  'Sale Return': ['Customer', 'Issue Date', 'Return Invoice No.', 'Reference Invoice', 'Customer Address', 'Due Date', 'Return Reason', 'Department', 'Sales Person'],
};

const DEFAULT_FOOTER: Record<string, string[]> = {
  'Sale Invoice': ['Notes & Special Terms', 'Document Attachments', 'Discount (%)', 'Shipping Charges', 'Round Off'],
  'Service Invoice': ['Notes & Special Terms', 'Document Attachments', 'Discount (%)', 'Shipping Charges', 'Round Off'],
  'Digital Invoice': ['Notes & Special Terms', 'Document Attachments', 'Discount (%)', 'Shipping Charges', 'Round Off'],
  'Sale Return': ['Notes & Special Terms', 'Document Attachments', 'Discount (%)', 'Shipping Charges', 'Round Off'],
};

const DEFAULT_COLUMNS: Record<string, string[]> = {
  'Sale Invoice': ['Product Code', 'Description', 'Unit', 'Details', 'Qty', 'Price', 'Discount', 'Tax', 'Further Tax', 'Total'],
  'Service Invoice': ['Product Code', 'Description', 'Unit', 'Details', 'Qty', 'Price', 'Discount', 'Tax', 'Further Tax', 'Total'],
  'Digital Invoice': ['Product Code', 'Description', 'Unit', 'Details', 'Qty', 'Price', 'Discount', 'Tax', 'Further Tax', 'Total'],
  'Sale Return': ['Product Code', 'Description', 'Unit', 'Details', 'Returned Qty', 'Price', 'Discount', 'Tax', 'Further Tax', 'Total'],
};

const FIELD_DESCRIPTIONS: Record<string, string> = {
  'Customer': 'Show customer details selector in header',
  'Issue Date': 'Show document date field in header',
  'Invoice ID': 'Show invoice number input in header',
  'Reference': 'Show reference PO number in header',
  'Customer Address': 'Show customer billing address in header',
  'Due Date': 'Show invoice due date in header',
  'Invoice Type': 'Show invoice document layout type in header',
  'Notes & Special Terms': 'Show payment terms and notes block in footer',
  'Document Attachments': 'Show file attachments card in footer',
  'Discount (%)': 'Show discount percentage input in summary',
  'Shipping Charges': 'Show shipping charges input in summary',
  'Round Off': 'Show round off adjust input in summary',
  'Return Invoice No.': 'Show return serial number in header',
  'Reference Invoice': 'Show original invoice reference in header',
  'Return Reason': 'Show reason description field in header',
  'Customer ID': 'Show customer selector in header',
  'Department': 'Show department field in header',
  'Sales Person': 'Show sales person field in header'
};

const COLUMN_DESCRIPTIONS: Record<string, string> = {
  'Product Code': 'Show unique product/service code column',
  'Description': 'Show product title and summary details column',
  'Unit': 'Show packaging unit column (e.g. Box, Pcs)',
  'Details': 'Show extra specifications / description details column',
  'Qty': 'Show order quantity input column',
  'Returned Qty': 'Show return quantity input column',
  'Price': 'Show item unit price input column',
  'Discount': 'Show line-item discount input column',
  'Tax': 'Show Sales Tax percentage column',
  'Further Tax': 'Show Further Tax option column',
  'Total': 'Show computed line-item total price column'
};

export const DocumentSettingsModule: React.FC<DocumentSettingsModuleProps> = ({ brand }) => {
  const [activeTab, setActiveTab] = useState<string>('Sale Invoice');
  const [settings, setSettings] = useState<Record<string, DocumentViewSettings>>({});
  const [savedMessage, setSavedMessage] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('document_view_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load document settings', e);
    }
  }, []);

  const getDocSettings = (docType: string): DocumentViewSettings => {
    const docTypeSettings = settings[docType] || { fields: {}, columns: {} };
    
    // Ensure default values exist (all default to true)
    const fields: Record<string, boolean> = {};
    const allFields = [
      ...(DEFAULT_FIELDS[docType] || []),
      ...(DEFAULT_FOOTER[docType] || [])
    ];

    allFields.forEach(f => {
      fields[f] = docTypeSettings.fields?.[f] !== false;
    });

    const columns: Record<string, boolean> = {};
    (DEFAULT_COLUMNS[docType] || []).forEach(c => {
      columns[c] = docTypeSettings.columns?.[c] !== false;
    });

    return { fields, columns };
  };

  const toggleField = (docType: string, fieldName: string) => {
    const current = getDocSettings(docType);
    const updatedFields = {
      ...current.fields,
      [fieldName]: !current.fields[fieldName]
    };

    const newSettings = {
      ...settings,
      [docType]: {
        ...current,
        fields: updatedFields
      }
    };

    setSettings(newSettings);
    localStorage.setItem('document_view_settings', JSON.stringify(newSettings));
    triggerSavedIndicator();
  };

  const toggleColumn = (docType: string, columnName: string) => {
    const current = getDocSettings(docType);
    const updatedColumns = {
      ...current.columns,
      [columnName]: !current.columns[columnName]
    };

    const newSettings = {
      ...settings,
      [docType]: {
        ...current,
        columns: updatedColumns
      }
    };

    setSettings(newSettings);
    localStorage.setItem('document_view_settings', JSON.stringify(newSettings));
    triggerSavedIndicator();
  };

  const triggerSavedIndicator = () => {
    setSavedMessage(true);
    const timer = setTimeout(() => setSavedMessage(false), 1200);
    return () => clearTimeout(timer);
  };

  const currentSettings = getDocSettings(activeTab);

  return (
    <div className="space-y-6 pb-12">
      {/* ── Document Type Tab Bar ── */}
      <div className="flex flex-wrap gap-2 border-b pb-4 border-slate-100">
        {DOC_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 relative cursor-pointer"
            style={{
              backgroundColor: activeTab === type ? brand.primary : 'transparent',
              color: activeTab === type ? '#ffffff' : '#64748B',
              boxShadow: activeTab === type ? `0 4px 12px ${brand.primary}30` : 'none'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center h-5">
        <p className="text-[11px] text-slate-400 font-medium">
          Configure visible fields and columns for <strong className="text-slate-600">{activeTab}</strong>. Changes save automatically.
        </p>
        {savedMessage && (
          <div className="text-[10px] font-black text-emerald-600 flex items-center gap-1 animate-fade-in-out">
            <Check className="w-3.5 h-3.5" /> Settings Saved
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Header Fields Section */}
        <Card className="rounded-2xl overflow-hidden p-0 flex flex-col" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-black text-slate-700 tracking-wide">Header Fields</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              Form Fields
            </span>
          </div>

          <div className="p-4 divide-y divide-slate-100 overflow-y-auto max-h-[356px] custom-scrollbar">
            {DEFAULT_FIELDS[activeTab].map(field => {
              const isVisible = currentSettings.fields[field];
              return (
                <div
                  key={field}
                  onClick={() => toggleField(activeTab, field)}
                  className="flex items-center justify-between py-3 cursor-pointer group hover:bg-slate-50/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{field}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {FIELD_DESCRIPTIONS[field] || 'Show in general document info layer'}
                    </span>
                  </div>
                  <button
                    className="w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer"
                    style={{ backgroundColor: isVisible ? brand.primary : '#CBD5E1' }}
                  >
                    <div
                      className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200"
                      style={{ transform: isVisible ? 'translateX(16px)' : 'translateX(0)' }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Table Columns Section */}
        <Card className="rounded-2xl overflow-hidden p-0 flex flex-col" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-2">
              <Columns className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-black text-slate-700 tracking-wide">Items Table Columns</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              Data Columns
            </span>
          </div>

          <div className="p-4 divide-y divide-slate-100 overflow-y-auto max-h-[356px] custom-scrollbar">
            {DEFAULT_COLUMNS[activeTab].map(column => {
              const isVisible = currentSettings.columns[column];
              return (
                <div
                  key={column}
                  onClick={() => toggleColumn(activeTab, column)}
                  className="flex items-center justify-between py-3 cursor-pointer group hover:bg-slate-50/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{column}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {COLUMN_DESCRIPTIONS[column] || 'Toggle column visibility in item entry grid'}
                    </span>
                  </div>
                  <button
                    className="w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer"
                    style={{ backgroundColor: isVisible ? brand.primary : '#CBD5E1' }}
                  >
                    <div
                      className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200"
                      style={{ transform: isVisible ? 'translateX(16px)' : 'translateX(0)' }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Footer Fields Section */}
        <Card className="rounded-2xl overflow-hidden p-0 flex flex-col" style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}>
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-black text-slate-700 tracking-wide">Footer Fields</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              Summary & Footer
            </span>
          </div>

          <div className="p-4 divide-y divide-slate-100 overflow-y-auto max-h-[356px] custom-scrollbar">
            {DEFAULT_FOOTER[activeTab].map(field => {
              const isVisible = currentSettings.fields[field];
              return (
                <div
                  key={field}
                  onClick={() => toggleField(activeTab, field)}
                  className="flex items-center justify-between py-3 cursor-pointer group hover:bg-slate-50/40 px-2 rounded-xl transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">{field}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {FIELD_DESCRIPTIONS[field] || 'Show in document footer layer'}
                    </span>
                  </div>
                  <button
                    className="w-10 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer"
                    style={{ backgroundColor: isVisible ? brand.primary : '#CBD5E1' }}
                  >
                    <div
                      className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200"
                      style={{ transform: isVisible ? 'translateX(16px)' : 'translateX(0)' }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};
