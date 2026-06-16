import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search, SlidersHorizontal, Plus, Pencil, Trash2, Check,
  ChevronLeft, ChevronRight, Eye, Copy, ArrowLeft,
  Move, Layers, Settings, ChevronDown, ChevronUp,
  Download, Upload, EyeOff, FileText, Undo, Redo
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input, Select, Toggle, ScrollArea } from '../../../components/ui/FormControls';
import { ActiveChip, InactiveChip } from '../../../components/ui/Chip';
import { FilterDrawer } from '../../../components/ui/FilterDrawer';
import { Modal } from '../../../components/ui/Modal';
import { TableHeader } from '../../../components/ui/Typography';
import { useTheme } from '../../../context/ThemeContext';
import {
  seedPrintTemplates,
  getSeedTemplateFields,
  getSeedTemplateSections,
  getSeedTemplateColumns,
  getSeedCustomFields
} from '../../../utils/settingsData';
import type {
  PrintTemplate,
  PrintTemplateSection,
  PrintTemplateField,
  PrintTemplateCustomField,
  PrintTemplateColumn,
  FormulaToken
} from '../../../utils/settingsData';
import { FORMULA_FIELD_OPTIONS } from '../../../utils/settingsData';
import {
  loadTemplatesFromApi,
  saveTemplatesToApi,
  saveSingleTemplateLayout
} from '../../../utils/templateApi';
import { DeleteConfirmationModal } from '../../../components/ui/DeleteConfirmationModal';

const dummyContext = {
  row: {
    quantity: 5,
    price: 1500,
    discount: 250,
    tax: 625,
    furtherTax: 0
  },
  totals: {
    subtotal: 7500,
    tax_amount: 1125,
    discount_amount: 500,
    shipping_charges: 150,
    other_charges: 0,
    round_off: 0,
    grand_total: 8275,
    paid_amount: 5000,
    balance_due: 3275,
    total_qty: 12,
    total_items: 3
  }
};

interface PrintTemplatesModuleProps {
  brand: ReturnType<typeof useTheme>['brand'];
}

const PAGE_SIZE = 10;

const DOCUMENT_TYPES = [
  'Sales Invoice',
  'Sales Return',
  'Service Invoice',
  'Purchase Invoice',
  'Purchase Return',
  'Quotation',
  'Delivery Note',
  'Credit Note',
  'Debit Note'
];

const PAPER_SIZES = ['A4', 'Letter', 'Thermal', 'Custom'];
const ORIENTATIONS = ['Portrait', 'Landscape'];

const parseCustomCss = (cssString?: string): React.CSSProperties => {
  if (!cssString) return {};
  const styles: any = {};
  cssString.split(';').forEach(rule => {
    const parts = rule.split(':');
    if (parts.length >= 2) {
      const prop = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      if (prop && val) {
        const key = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        styles[key] = val;
      }
    }
  });
  return styles;
};

export const PrintTemplatesModule: React.FC<PrintTemplatesModuleProps> = ({ brand }) => {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [templates, setTemplates] = useState<PrintTemplate[]>(() => {
    try {
      const stored = localStorage.getItem('print_templates');
      if (stored) {
        const parsed: PrintTemplate[] = JSON.parse(stored);
        // Filter out only the old deleted static default templates (pt-1 to pt-12)
        // while keeping the 5 Sales Return (srt-) templates and any user-customized/imported templates (pt-[timestamp]).
        const deletedIds = new Set(['pt-1', 'pt-2', 'pt-3', 'pt-4', 'pt-5', 'pt-6', 'pt-7', 'pt-8', 'pt-9', 'pt-10', 'pt-11', 'pt-12']);
        const filtered = parsed.filter(t => !deletedIds.has(t.template_id));
        if (filtered.length !== parsed.length || filtered.length < seedPrintTemplates.length) {
          const storedIds = new Set(filtered.map(t => t.template_id));
          const missing = seedPrintTemplates.filter(t => !storedIds.has(t.template_id));
          const merged = [...filtered, ...missing];
          localStorage.setItem('print_templates', JSON.stringify(merged));
          return merged;
        }
        return filtered;
      }
      return seedPrintTemplates;
    } catch {
      return seedPrintTemplates;
    }
  });

  const [allSections, setAllSections] = useState<PrintTemplateSection[]>(() => {
    let loaded: PrintTemplateSection[] = [];
    try {
      const stored = localStorage.getItem('print_template_sections');
      if (stored) loaded = JSON.parse(stored);
    } catch {}

    const initialTemplates: PrintTemplate[] = (() => {
      try {
        const storedT = localStorage.getItem('print_templates');
        const list = storedT ? JSON.parse(storedT) : seedPrintTemplates;
        return list.map((t: any) => t.is_default ? { ...t, layout_mode: 'flow' } : t);
      } catch {
        return seedPrintTemplates.map(t => t.is_default ? { ...t, layout_mode: 'flow' } : t);
      }
    })();

    if (loaded.length === 0) {
      const initialSections: PrintTemplateSection[] = [];
      initialTemplates.forEach((t: PrintTemplate) => {
        initialSections.push(...getSeedTemplateSections(t.template_id));
      });
      return initialSections;
    }

    const updatedSections = [...loaded];
    initialTemplates.forEach((t: PrintTemplate) => {
      const seedSections = getSeedTemplateSections(t.template_id);
      const existingForT = updatedSections.filter(s => s.template_id === t.template_id);
      seedSections.forEach(ss => {
        const hasSec = existingForT.some(es => es.section_name === ss.section_name);
        if (!hasSec) {
          updatedSections.push(ss);
        }
      });
    });
    return updatedSections;
  });

  const [allFields, setAllFields] = useState<PrintTemplateField[]>(() => {
    let loaded: PrintTemplateField[] = [];
    try {
      const stored = localStorage.getItem('print_template_fields');
      if (stored) loaded = JSON.parse(stored);
    } catch {}

    const initialTemplates: PrintTemplate[] = (() => {
      try {
        const storedT = localStorage.getItem('print_templates');
        const list = storedT ? JSON.parse(storedT) : seedPrintTemplates;
        return list.map((t: any) => t.is_default ? { ...t, layout_mode: 'flow' } : t);
      } catch {
        return seedPrintTemplates.map(t => t.is_default ? { ...t, layout_mode: 'flow' } : t);
      }
    })();

    if (loaded.length === 0) {
      const initialFields: PrintTemplateField[] = [];
      initialTemplates.forEach((t: PrintTemplate) => {
        initialFields.push(...getSeedTemplateFields(t.template_id));
      });
      return initialFields;
    }

    const updatedFields = loaded.map(f => {
      if (f.position_x === undefined || f.position_y === undefined) {
        const seeds = getSeedTemplateFields(f.template_id);
        const match = seeds.find(sf => sf.field_name === f.field_name);
        if (match) {
          return {
            ...f,
            position_x: f.position_x ?? match.position_x,
            position_y: f.position_y ?? match.position_y,
            width_percent: f.width_percent ?? match.width_percent,
          };
        }
      }
      return f;
    });
    initialTemplates.forEach((t: PrintTemplate) => {
      const seedFields = getSeedTemplateFields(t.template_id);
      const existingForT = updatedFields.filter(f => f.template_id === t.template_id);
      seedFields.forEach(sf => {
        const hasField = existingForT.some(ef => ef.field_name === sf.field_name);
        if (!hasField) {
          updatedFields.push(sf);
        }
      });
    });
    return updatedFields;
  });

  const [allColumns, setAllColumns] = useState<PrintTemplateColumn[]>(() => {
    let loaded: PrintTemplateColumn[] = [];
    try {
      const stored = localStorage.getItem('print_template_columns');
      if (stored) loaded = JSON.parse(stored);
    } catch {}

    const initialTemplates: PrintTemplate[] = (() => {
      try {
        const storedT = localStorage.getItem('print_templates');
        const list = storedT ? JSON.parse(storedT) : seedPrintTemplates;
        return list.map((t: any) => t.is_default ? { ...t, layout_mode: 'flow' } : t);
      } catch {
        return seedPrintTemplates.map(t => t.is_default ? { ...t, layout_mode: 'flow' } : t);
      }
    })();

    if (loaded.length === 0) {
      const initialColumns: PrintTemplateColumn[] = [];
      initialTemplates.forEach((t: PrintTemplate) => {
        initialColumns.push(...getSeedTemplateColumns(t.template_id));
      });
      return initialColumns;
    }

    const updatedColumns = [...loaded];
    initialTemplates.forEach((t: PrintTemplate) => {
      const seedColumns = getSeedTemplateColumns(t.template_id);
      const existingForT = updatedColumns.filter(c => c.template_id === t.template_id);
      seedColumns.forEach(sc => {
        const hasCol = existingForT.some(ec => ec.column_name === sc.column_name);
        if (!hasCol) {
          updatedColumns.push(sc);
        }
      });
    });
    return updatedColumns;
  });

  const [allCustomFields, setAllCustomFields] = useState<PrintTemplateCustomField[]>(() => {
    try {
      const stored = localStorage.getItem('print_template_custom_fields');
      if (stored) return JSON.parse(stored);
    } catch {}
    const seed: PrintTemplateCustomField[] = [];
    seedPrintTemplates.map(t => t.template_id).forEach(tId => {
      seed.push(...getSeedCustomFields(tId));
    });
    return seed;
  });

  // Save states to localStorage and sync to backend API if enabled
  useEffect(() => {
    localStorage.setItem('print_templates', JSON.stringify(templates));
    saveTemplatesToApi('templates', templates);
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('print_template_sections', JSON.stringify(allSections));
    saveTemplatesToApi('sections', allSections);
  }, [allSections]);

  useEffect(() => {
    localStorage.setItem('print_template_fields', JSON.stringify(allFields));
    saveTemplatesToApi('fields', allFields);
  }, [allFields]);

  useEffect(() => {
    localStorage.setItem('print_template_columns', JSON.stringify(allColumns));
    saveTemplatesToApi('columns', allColumns);
  }, [allColumns]);

  useEffect(() => {
    localStorage.setItem('print_template_custom_fields', JSON.stringify(allCustomFields));
    saveTemplatesToApi('customFields', allCustomFields);
  }, [allCustomFields]);

  // Load templates from Backend API on mount if enabled
  useEffect(() => {
    async function syncFromBackend() {
      const serverData = await loadTemplatesFromApi();
      if (serverData) {
        setTemplates(serverData.templates);
        setAllSections(serverData.sections);
        setAllFields(serverData.fields);
        setAllColumns(serverData.columns);
        setAllCustomFields(serverData.customFields);
      }
    }
    syncFromBackend();
  }, []);

  const [view, setView] = useState<'list' | 'designer'>('list');
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);

  // List search & filter states
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filterDocType, setFilterDocType] = useState('all');
  const [filterPaper, setFilterPaper] = useState('all');
  const [tempDocType, setTempDocType] = useState('all');
  const [tempPaper, setTempPaper] = useState('all');
  const [sortKey, setSortKey] = useState<keyof PrintTemplate>('template_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer/Modal Form states
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PrintTemplate | null>(null);
  const [form, setForm] = useState<Omit<PrintTemplate, 'template_id'>>({
    template_name: '',
    document_type: 'Sales Invoice',
    paper_size: 'A4',
    orientation: 'Portrait',
    is_default: false,
    is_active: true,
    logo_size: 80,
    qr_enabled: true,
    barcode_enabled: false,
    signature_enabled: true,
    watermark_enabled: false,
    terms_enabled: true,
    remarks_enabled: true
  });
  const [formError, setFormError] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', name: '' });
  const [isAdminRole, setIsAdminRole] = useState<boolean>(true);

  // Designer local states
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [selectedCustomFieldId, setSelectedCustomFieldId] = useState<string | null>(null);
  const [dragOverField, setDragOverField] = useState<{ id: string; pos: 'left' | 'right' | 'top' | 'bottom' } | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Free Layout Mode Draggability and Renaming States
  const canvasRef = useRef<HTMLDivElement>(null);

  // States and refs for standard preview scaling
  const [previewScale, setPreviewScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const innerContentRef = useRef<HTMLDivElement | null>(null);

  const containerResizeObserverRef = useRef<ResizeObserver | null>(null);
  const innerResizeObserverRef = useRef<ResizeObserver | null>(null);

  const containerRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (containerResizeObserverRef.current) {
      containerResizeObserverRef.current.disconnect();
      containerResizeObserverRef.current = null;
    }

    previewContainerRef.current = node;

    if (node) {
      const updateWidth = () => {
        const width = node.clientWidth - 32; // subtract p-4 padding on both sides
        setContainerWidth(Math.max(0, width));
      };
      
      updateWidth();
      
      const observer = new ResizeObserver(() => {
        updateWidth();
      });
      observer.observe(node);
      containerResizeObserverRef.current = observer;
    }
  }, []);

  const innerContentRefCallback = useCallback((node: HTMLDivElement | null) => {
    if (innerResizeObserverRef.current) {
      innerResizeObserverRef.current.disconnect();
      innerResizeObserverRef.current = null;
    }

    innerContentRef.current = node;

    if (node) {
      const updateHeight = () => {
        setContentHeight(node.scrollHeight);
      };
      
      updateHeight();
      
      const observer = new ResizeObserver(() => {
        updateHeight();
      });
      observer.observe(node);
      innerResizeObserverRef.current = observer;
    } else {
      setContentHeight(0);
    }
  }, []);

  // Clean up observers on unmount
  useEffect(() => {
    return () => {
      if (containerResizeObserverRef.current) {
        containerResizeObserverRef.current.disconnect();
      }
      if (innerResizeObserverRef.current) {
        innerResizeObserverRef.current.disconnect();
      }
    };
  }, []);

  const [draggingElement, setDraggingElement] = useState<{
    id: string;
    type: 'default' | 'custom';
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);

  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editingLabelText, setEditingLabelText] = useState('');

  // Undo/Redo History States
  interface HistorySnapshot {
    templates: PrintTemplate[];
    allSections: PrintTemplateSection[];
    allFields: PrintTemplateField[];
    allColumns: PrintTemplateColumn[];
    allCustomFields: PrintTemplateCustomField[];
  }

  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const lastHistoryStateRef = useRef<HistorySnapshot | null>(null);
  const isUndoRedoActionRef = useRef<boolean>(false);

  // ─── Undo/Redo History Effect ──────────────────────────────────────────────
  useEffect(() => {
    if (view !== 'designer') {
      if (history.length > 0) {
        setHistory([]);
        setHistoryIndex(-1);
        lastHistoryStateRef.current = null;
      }
      return;
    }

    const currentSnapshot: HistorySnapshot = {
      templates,
      allSections,
      allFields,
      allColumns,
      allCustomFields
    };

    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      lastHistoryStateRef.current = currentSnapshot;
      return;
    }

    if (!lastHistoryStateRef.current) {
      setHistory([currentSnapshot]);
      setHistoryIndex(0);
      lastHistoryStateRef.current = currentSnapshot;
      return;
    }

    const changed = 
      lastHistoryStateRef.current.templates !== templates ||
      lastHistoryStateRef.current.allSections !== allSections ||
      lastHistoryStateRef.current.allFields !== allFields ||
      lastHistoryStateRef.current.allColumns !== allColumns ||
      lastHistoryStateRef.current.allCustomFields !== allCustomFields;

    if (changed) {
      setHistory(prev => {
        const truncated = prev.slice(0, historyIndex + 1);
        return [...truncated, currentSnapshot];
      });
      setHistoryIndex(prev => prev + 1);
      lastHistoryStateRef.current = currentSnapshot;
    }
  }, [view, templates, allSections, allFields, allColumns, allCustomFields, historyIndex, history.length]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const snapshot = history[prevIdx];
      isUndoRedoActionRef.current = true;
      setHistoryIndex(prevIdx);
      
      setTemplates(snapshot.templates);
      setAllSections(snapshot.allSections);
      setAllFields(snapshot.allFields);
      setAllColumns(snapshot.allColumns);
      setAllCustomFields(snapshot.allCustomFields);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const snapshot = history[nextIdx];
      isUndoRedoActionRef.current = true;
      setHistoryIndex(nextIdx);

      setTemplates(snapshot.templates);
      setAllSections(snapshot.allSections);
      setAllFields(snapshot.allFields);
      setAllColumns(snapshot.allColumns);
      setAllCustomFields(snapshot.allCustomFields);
    }
  };

  // Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    if (view !== 'designer') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [view, historyIndex, history]);

  const handleMouseDown = (
    e: React.MouseEvent,
    id: string,
    type: 'default' | 'custom',
    currentX: number,
    currentY: number
  ) => {
    if (activeTemplate?.layout_mode !== 'free') return;
    
    // Only allow left click dragging
    if (e.button !== 0) return;
    
    // Check if double click input is active, don't drag if so
    if (editingLabelId === id) return;

    e.stopPropagation();
    
    setDraggingElement({
      id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: currentX,
      startTop: currentY
    });
  };

  useEffect(() => {
    if (!draggingElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      
      const deltaX = e.clientX - draggingElement.startX;
      const deltaY = e.clientY - draggingElement.startY;
      
      const pctDeltaX = (deltaX / rect.width) * 100;
      const pctDeltaY = (deltaY / rect.height) * 100;
      
      let newX = Math.round(draggingElement.startLeft + pctDeltaX);
      let newY = Math.round(draggingElement.startTop + pctDeltaY);
      
      // Keep boundaries [0, 100]
      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));
      
      if (draggingElement.type === 'default') {
        updateFieldProperty(draggingElement.id, { position_x: newX, position_y: newY });
      } else {
        updateCustomFieldProperty(draggingElement.id, { position_x: newX, position_y: newY });
      }
    };

    const handleMouseUp = () => {
      setDraggingElement(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingElement]);

  const [resizingElement, setResizingElement] = useState<{
    id: string;
    type: 'default' | 'custom';
    startX: number;
    startY: number;
    startWidthPercent: number;
    startHeightPx: number;
  } | null>(null);

  const handleResizeMouseDown = (
    e: React.MouseEvent,
    id: string,
    type: 'default' | 'custom',
    currentWidthPercent: number,
    currentHeightPx: number | undefined,
    element: HTMLElement | null
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.button !== 0) return;

    const initialHeight = currentHeightPx ?? (element ? element.offsetHeight : 30);

    setResizingElement({
      id,
      type,
      startX: e.clientX,
      startY: e.clientY,
      startWidthPercent: currentWidthPercent,
      startHeightPx: initialHeight
    });
  };

  useEffect(() => {
    if (!resizingElement) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      
      const deltaX = e.clientX - resizingElement.startX;
      const deltaY = e.clientY - resizingElement.startY;
      
      const pctDeltaX = (deltaX / rect.width) * 100;
      
      let newWidth = Math.round(resizingElement.startWidthPercent + pctDeltaX);
      let newHeight = Math.round(resizingElement.startHeightPx + (deltaY / previewScale));
      
      newWidth = Math.max(1, Math.min(100, newWidth));
      newHeight = Math.max(10, Math.min(2000, newHeight));
      
      if (resizingElement.type === 'default') {
        updateFieldProperty(resizingElement.id, { width_percent: newWidth, height_px: newHeight });
      } else {
        updateCustomFieldProperty(resizingElement.id, { width_percent: newWidth, height_px: newHeight });
      }
    };

    const handleMouseUp = () => {
      setResizingElement(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingElement]);

  const handleDoubleClick = (e: React.MouseEvent, id: string, currentLabel: string) => {
    e.stopPropagation();
    setEditingLabelId(id);
    setEditingLabelText(currentLabel);
  };

  const handleSaveInlineLabel = () => {
    if (!editingLabelId) return;
    
    // Search default fields
    const fld = activeFields.find(f => f.field_id === editingLabelId);
    if (fld) {
      updateFieldProperty(editingLabelId, { custom_label: editingLabelText });
    } else {
      // Search custom fields
      const cf = activeCustomFields.find(c => c.custom_field_id === editingLabelId);
      if (cf) {
        updateCustomFieldProperty(editingLabelId, { field_name: editingLabelText });
      }
    }
    setEditingLabelId(null);
    setEditingLabelText('');
  };

  // Modals for adding Formula Fields
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [formulaFieldName, setFormulaFieldName] = useState('');
  const [formulaPlacement, setFormulaPlacement] = useState<'totals' | 'column'>('totals');

  // Formula builder state
  const [formulaTokens, setFormulaTokens] = useState<FormulaToken[]>([]);
  const [formulaAddType, setFormulaAddType] = useState<'field' | 'operator' | 'constant'>('field');
  const [formulaSelectedField, setFormulaSelectedField] = useState(FORMULA_FIELD_OPTIONS[0]?.key || '');
  const [formulaSelectedOp, setFormulaSelectedOp] = useState<'+' | '-' | '*' | '/'>('-');
  const [formulaConstant, setFormulaConstant] = useState('');

  const resetFormulaModal = () => {
    setFormulaFieldName('');
    setFormulaPlacement('totals');
    setFormulaTokens([]);
    setFormulaConstant('');
    setFormulaAddType('field');
    const firstValid = FORMULA_FIELD_OPTIONS.find(f => f.section === 'Totals' || f.section === 'Summary')?.key || '';
    setFormulaSelectedField(firstValid);
  };

  // ─── Computed Data ──────────────────────────────────────────────────────────
  const activeTemplate = useMemo(() => {
    return templates.find(t => t.template_id === currentTemplateId) || null;
  }, [templates, currentTemplateId]);

  const aspectRatio = useMemo(() => {
    if (!activeTemplate) return 210 / 297;
    const isLandscape = activeTemplate.orientation === 'Landscape';
    const paper = activeTemplate.paper_size || 'A4';
    
    if (paper === 'A4') {
      return isLandscape ? 297 / 210 : 210 / 297;
    }
    if (paper === 'Letter') {
      return isLandscape ? 279 / 216 : 216 / 279;
    }
    if (paper === 'Thermal') {
      return 80 / 180; // Standard thermal preview aspect ratio
    }
    if (paper === 'Custom') {
      const w = parseFloat(activeTemplate.paper_width || '210');
      const h = parseFloat(activeTemplate.paper_height || '297');
      if (w > 0 && h > 0) return w / h;
    }
    return isLandscape ? 297 / 210 : 210 / 297;
  }, [activeTemplate]);

  const targetWidth = activeTemplate?.paper_size === 'Thermal' ? 380 : 794;
  const targetHeight = targetWidth / aspectRatio;

  useEffect(() => {
    const scale = containerWidth > 0 ? Math.min(1.0, containerWidth / targetWidth) : 1;
    setPreviewScale(scale);
  }, [containerWidth, targetWidth]);

  const activeSections = useMemo(() => {
    if (!currentTemplateId) return [];
    return allSections
      .filter(s => s.template_id === currentTemplateId)
      .sort((a, b) => a.display_order - b.display_order);
  }, [allSections, currentTemplateId]);

  const activeFields = useMemo(() => {
    if (!currentTemplateId) return [];
    return allFields
      .filter(f => f.template_id === currentTemplateId)
      .sort((a, b) => a.display_order - b.display_order);
  }, [allFields, currentTemplateId]);

  const activeColumns = useMemo(() => {
    if (!currentTemplateId) return [];
    return allColumns
      .filter(c => c.template_id === currentTemplateId)
      .sort((a, b) => a.display_order - b.display_order);
  }, [allColumns, currentTemplateId]);

  const activeCustomFields = useMemo(() => {
    if (!currentTemplateId) return [];
    return allCustomFields
      .filter(c => c.template_id === currentTemplateId)
      .sort((a, b) => a.display_order - b.display_order);
  }, [allCustomFields, currentTemplateId]);

  const selectedField = useMemo(() => {
    if (!selectedFieldId) return null;
    return activeFields.find(f => f.field_id === selectedFieldId) || null;
  }, [activeFields, selectedFieldId]);

  const selectedColumn = useMemo(() => {
    if (!selectedColumnId) return null;
    return activeColumns.find(c => c.column_id === selectedColumnId) || null;
  }, [activeColumns, selectedColumnId]);

  const selectedCustomField = useMemo(() => {
    if (!selectedCustomFieldId) return null;
    return activeCustomFields.find(c => c.custom_field_id === selectedCustomFieldId) || null;
  }, [activeCustomFields, selectedCustomFieldId]);

  // List derived calculations
  const filtered = useMemo(() => {
    return templates
      .filter(t => {
        const q = search.toLowerCase();
        const matchSearch =
          t.template_name.toLowerCase().includes(q) ||
          t.document_type.toLowerCase().includes(q) ||
          t.paper_size.toLowerCase().includes(q);
        const matchDocType = filterDocType === 'all' || t.document_type === filterDocType;
        const matchPaper = filterPaper === 'all' || t.paper_size === filterPaper;
        return matchSearch && matchDocType && matchPaper;
      })
      .sort((a, b) => {
        const av = String(a[sortKey] ?? '').toLowerCase();
        const bv = String(b[sortKey] ?? '').toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [templates, search, filterDocType, filterPaper, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ─── CRUD Functions ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingTemplate(null);
    setForm({
      template_name: '',
      document_type: 'Sales Invoice',
      paper_size: 'A4',
      orientation: 'Portrait',
      is_default: false,
      is_active: true,
      logo_size: 80,
      qr_enabled: true,
      barcode_enabled: false,
      signature_enabled: true,
      watermark_enabled: false,
      terms_enabled: true,
      remarks_enabled: true
    });
    setFormError('');
    setShowForm(true);
  };

  const openEditBasic = (t: PrintTemplate) => {
    setEditingTemplate(t);
    setForm({
      template_name: t.template_name,
      document_type: t.document_type,
      paper_size: t.paper_size,
      orientation: t.orientation,
      is_default: t.is_default,
      is_active: t.is_active,
      logo_size: t.logo_size || 80,
      qr_enabled: t.qr_enabled,
      barcode_enabled: t.barcode_enabled,
      signature_enabled: t.signature_enabled,
      watermark_enabled: t.watermark_enabled,
      terms_enabled: t.terms_enabled,
      remarks_enabled: t.remarks_enabled,
      logo_url: t.logo_url,
      paper_width: t.paper_width,
      paper_height: t.paper_height
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSaveBasic = () => {
    if (!form.template_name.trim()) {
      setFormError('Template Name is required.');
      return;
    }

    if (editingTemplate) {
      setTemplates(prev =>
        prev.map(t => {
          if (t.template_id === editingTemplate.template_id) {
            return { ...t, ...form };
          }
          if (form.is_default && t.document_type === form.document_type) {
            return { ...t, is_default: false };
          }
          return t;
        })
      );
    } else {
      const newId = `pt-${Date.now()}`;
      const newTemplate: PrintTemplate = {
        template_id: newId,
        ...form
      };

      setTemplates(prev => {
        const updated = form.is_default
          ? prev.map(t => (t.document_type === form.document_type ? { ...t, is_default: false } : t))
          : prev;
        return [...updated, newTemplate];
      });

      // Generate seed sections, fields, columns for the new template
      const newSeedSections = getSeedTemplateSections(newId);
      const newSeedFields = getSeedTemplateFields(newId);
      const newSeedColumns = getSeedTemplateColumns(newId);
      setAllSections(prev => [...prev, ...newSeedSections]);
      setAllFields(prev => [...prev, ...newSeedFields]);
      setAllColumns(prev => [...prev, ...newSeedColumns]);
    }

    setShowForm(false);
  };

  const handleDuplicate = (t: PrintTemplate) => {
    const newId = `pt-${Date.now()}`;
    const duplicated: PrintTemplate = {
      ...t,
      template_id: newId,
      template_name: `${t.template_name} (Copy)`,
      is_default: false
    };

    setTemplates(prev => [...prev, duplicated]);

    // Copy sections
    const sourceSections = allSections.filter(s => s.template_id === t.template_id);
    const newSections = sourceSections.map(s => ({
      ...s,
      section_id: `sec-${newId}-${s.section_id.split('-').pop()}`,
      template_id: newId
    }));
    setAllSections(prev => [...prev, ...newSections]);

    // Copy fields
    const sourceFields = allFields.filter(f => f.template_id === t.template_id);
    const newFields = sourceFields.map((f, i) => ({
      ...f,
      field_id: `fld-${newId}-${i + 1}`,
      template_id: newId
    }));
    setAllFields(prev => [...prev, ...newFields]);

    // Copy columns
    const sourceColumns = allColumns.filter(c => c.template_id === t.template_id);
    const newColumns = sourceColumns.map((c, i) => ({
      ...c,
      column_id: `col-${newId}-${i + 1}`,
      template_id: newId
    }));
    setAllColumns(prev => [...prev, ...newColumns]);

    // Copy custom fields
    const sourceCustom = allCustomFields.filter(c => c.template_id === t.template_id);
    const newCustom = sourceCustom.map((c, i) => ({
      ...c,
      custom_field_id: `cf-${newId}-${i + 1}`,
      template_id: newId
    }));
    setAllCustomFields(prev => [...prev, ...newCustom]);
  };

  const handleDeleteTrigger = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = () => {
    setTemplates(prev => prev.filter(t => t.template_id !== deleteModal.id));
    setAllSections(prev => prev.filter(s => s.template_id !== deleteModal.id));
    setAllFields(prev => prev.filter(f => f.template_id !== deleteModal.id));
    setAllColumns(prev => prev.filter(c => c.template_id !== deleteModal.id));
    setAllCustomFields(prev => prev.filter(c => c.template_id !== deleteModal.id));
    setDeleteModal({ isOpen: false, id: '', name: '' });
    setCurrentPage(1);
  };

  const handleToggleActive = (id: string) => {
    setTemplates(prev =>
      prev.map(t => (t.template_id === id ? { ...t, is_active: !t.is_active } : t))
    );
  };

  const handleSetDefault = (t: PrintTemplate) => {
    setTemplates(prev =>
      prev.map(x => {
        if (x.template_id === t.template_id) return { ...x, is_default: true };
        if (x.document_type === t.document_type) return { ...x, is_default: false };
        return x;
      })
    );
  };

  const handleSort = (key: keyof PrintTemplate) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  // ─── Designer Property Mutators ─────────────────────────────────────────────
  const updateFieldProperty = (fieldId: string, props: Partial<PrintTemplateField>) => {
    setAllFields(prev =>
      prev.map(f => (f.field_id === fieldId ? { ...f, ...props } : f))
    );
  };

  const updateSectionProperty = (sectionId: string, props: Partial<PrintTemplateSection>) => {
    setAllSections(prev =>
      prev.map(s => (s.section_id === sectionId ? { ...s, ...props } : s))
    );
  };

  const updateColumnProperty = (colId: string, props: Partial<PrintTemplateColumn>) => {
    setAllColumns(prev =>
      prev.map(c => (c.column_id === colId ? { ...c, ...props } : c))
    );
  };

  const updateCustomFieldProperty = (cfId: string, props: Partial<PrintTemplateCustomField>) => {
    setAllCustomFields(prev =>
      prev.map(cf => (cf.custom_field_id === cfId ? { ...cf, ...props } : cf))
    );
  };

  const updateFieldRowPosition = (itemId: string, type: 'default' | 'custom', newRow: number) => {
    let updatedFields = allFields;
    let updatedCustom = allCustomFields;
    let sectionName = '';

    if (type === 'default') {
      const field = allFields.find(f => f.field_id === itemId);
      if (!field) return;
      sectionName = field.section_name;
      updatedFields = allFields.map(f => f.field_id === itemId ? { ...f, row_position: newRow } : f);
    } else {
      const customField = allCustomFields.find(cf => cf.custom_field_id === itemId);
      if (!customField) return;
      sectionName = customField.section_name || 'Custom Fields';
      updatedCustom = allCustomFields.map(cf => cf.custom_field_id === itemId ? { ...cf, row_position: newRow } : cf);
    }

    const secFields = updatedFields.filter(f => f.template_id === currentTemplateId && f.section_name === sectionName);
    const secCustom = updatedCustom.filter(cf => cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === sectionName);
    const combined = [
      ...secFields.map(f => ({ ...f, isCustom: false as const })),
      ...secCustom.map(cf => ({ ...cf, isCustom: true as const }))
    ];
    combined.sort((a, b) => {
      const rowA = a.row_position ?? 1;
      const rowB = b.row_position ?? 1;
      if (rowA !== rowB) return rowA - rowB;
      const colA = a.column_position ?? 1;
      const colB = b.column_position ?? 1;
      if (colA !== colB) return colA - colB;
      return a.display_order - b.display_order;
    });

    let currentRow = 0;
    let lastOriginalRow: number | null = null;
    let colIdx = 1;
    const normalized = combined.map((item, index) => {
      const origRow = item.row_position ?? 1;
      if (lastOriginalRow === null || origRow !== lastOriginalRow) {
        currentRow += 1;
        lastOriginalRow = origRow;
        colIdx = 1;
      } else {
        colIdx += 1;
      }
      return { ...item, row_position: currentRow, column_position: colIdx, display_order: index + 1 };
    });

    setAllFields(prev => prev.map(f => {
      if (f.template_id === currentTemplateId && f.section_name === sectionName) {
        const match = normalized.find(item => !item.isCustom && item.field_id === f.field_id);
        if (match) return { ...f, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
      }
      return f;
    }));

    setAllCustomFields(prev => prev.map(cf => {
      if (cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === sectionName) {
        const match = normalized.find(item => item.isCustom && item.custom_field_id === cf.custom_field_id);
        if (match) return { ...cf, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
      }
      return cf;
    }));
  };

  const updateFieldColumnPosition = (itemId: string, type: 'default' | 'custom', newCol: number) => {
    let updatedFields = allFields;
    let updatedCustom = allCustomFields;
    let sectionName = '';

    if (type === 'default') {
      const field = allFields.find(f => f.field_id === itemId);
      if (!field) return;
      sectionName = field.section_name;
      updatedFields = allFields.map(f => f.field_id === itemId ? { ...f, column_position: newCol } : f);
    } else {
      const customField = allCustomFields.find(cf => cf.custom_field_id === itemId);
      if (!customField) return;
      sectionName = customField.section_name || 'Custom Fields';
      updatedCustom = allCustomFields.map(cf => cf.custom_field_id === itemId ? { ...cf, column_position: newCol } : cf);
    }

    const secFields = updatedFields.filter(f => f.template_id === currentTemplateId && f.section_name === sectionName);
    const secCustom = updatedCustom.filter(cf => cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === sectionName);
    const combined = [
      ...secFields.map(f => ({ ...f, isCustom: false as const })),
      ...secCustom.map(cf => ({ ...cf, isCustom: true as const }))
    ];
    combined.sort((a, b) => {
      const rowA = a.row_position ?? 1;
      const rowB = b.row_position ?? 1;
      if (rowA !== rowB) return rowA - rowB;
      const colA = a.column_position ?? 1;
      const colB = b.column_position ?? 1;
      if (colA !== colB) return colA - colB;
      return a.display_order - b.display_order;
    });

    let currentRow = 0;
    let lastOriginalRow: number | null = null;
    let colIdx = 1;
    const normalized = combined.map((item, index) => {
      const origRow = item.row_position ?? 1;
      if (lastOriginalRow === null || origRow !== lastOriginalRow) {
        currentRow += 1;
        lastOriginalRow = origRow;
        colIdx = 1;
      } else {
        colIdx += 1;
      }
      return { ...item, row_position: currentRow, column_position: colIdx, display_order: index + 1 };
    });

    setAllFields(prev => prev.map(f => {
      if (f.template_id === currentTemplateId && f.section_name === sectionName) {
        const match = normalized.find(item => !item.isCustom && item.field_id === f.field_id);
        if (match) return { ...f, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
      }
      return f;
    }));

    setAllCustomFields(prev => prev.map(cf => {
      if (cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === sectionName) {
        const match = normalized.find(item => item.isCustom && item.custom_field_id === cf.custom_field_id);
        if (match) return { ...cf, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
      }
      return cf;
    }));
  };

  const updateTemplateProperty = (props: Partial<PrintTemplate>) => {
    setTemplates(prev =>
      prev.map(t => {
        if (t.template_id === currentTemplateId) {
          const nextT = { ...t, ...props };
          if (nextT.is_default) nextT.layout_mode = 'flow';
          return nextT;
        }
        return t;
      })
    );
  };

  const handleResetFilters = () => {
    setFilterDocType('all');
    setFilterPaper('all');
    setTempDocType('all');
    setTempPaper('all');
    setShowFilter(false);
  };

  // ─── Collapsible Sections Map toggler ──────────────────────────────────────
  const toggleSectionCollapse = (secId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [secId]: !prev[secId]
    }));
  };

  // ─── Drag and Drop Section Handlers ────────────────────────────────────────

  // ─── Drag and Drop Field Handlers ──────────────────────────────────────────
  const [draggedElement, setDraggedElement] = useState<{ id: string; type: 'default' | 'custom' } | null>(null);

  const handleElementDrop = (targetId: string, targetIsCustom: boolean) => {
    if (!draggedElement) return;
    executeFieldMove(draggedElement.id, draggedElement.type, targetId, targetIsCustom ? 'custom' : 'default', 'bottom');
  };



  const executeFieldMove = (
    draggedId: string,
    draggedType: 'default' | 'custom',
    targetId: string,
    targetType: 'default' | 'custom',
    relativePos: 'left' | 'right' | 'top' | 'bottom'
  ) => {
    const sourceElement = draggedType === 'default'
      ? allFields.find(f => f.field_id === draggedId)
      : allCustomFields.find(cf => cf.custom_field_id === draggedId);

    const targetElement = targetType === 'default'
      ? allFields.find(f => f.field_id === targetId)
      : allCustomFields.find(cf => cf.custom_field_id === targetId);

    if (!sourceElement || !targetElement) return;

    const sourceSection = sourceElement.section_name || 'Custom Fields';
    const targetSection = targetElement.section_name || 'Custom Fields';

    if (sourceSection !== targetSection) {
      setDraggedElement(null);
      return;
    }

    let newRow = targetElement.row_position ?? 1;
    let newCol = targetElement.column_position ?? 1;

    if (relativePos === 'left') {
      newCol = newCol - 0.5;
    } else if (relativePos === 'right') {
      newCol = newCol + 0.5;
    } else if (relativePos === 'top') {
      newRow = newRow - 0.5;
      newCol = 1;
    } else if (relativePos === 'bottom') {
      newRow = newRow + 0.5;
      newCol = 1;
    }

    let updatedFields = allFields.map(f => {
      if (f.field_id === draggedId && draggedType === 'default') {
        return { ...f, section_name: targetSection, row_position: newRow, column_position: newCol, is_visible: true };
      }
      return f;
    });

    let updatedCustom = allCustomFields.map(cf => {
      if (cf.custom_field_id === draggedId && draggedType === 'custom') {
        return { ...cf, section_name: targetSection, row_position: newRow, column_position: newCol, is_visible: true };
      }
      return cf;
    });

    const normalizeSectionInPlace = (secName: string) => {
      const secFields = updatedFields.filter(f => f.template_id === currentTemplateId && f.section_name === secName);
      const secCustom = updatedCustom.filter(cf => cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === secName);
      const combined = [
        ...secFields.map(f => ({ ...f, isCustom: false as const })),
        ...secCustom.map(cf => ({ ...cf, isCustom: true as const }))
      ];
      combined.sort((a, b) => {
        const rowA = a.row_position ?? 1;
        const rowB = b.row_position ?? 1;
        if (rowA !== rowB) return rowA - rowB;
        const colA = a.column_position ?? 1;
        const colB = b.column_position ?? 1;
        if (colA !== colB) return colA - colB;
        return a.display_order - b.display_order;
      });
      let currentRow = 0;
      let lastOriginalRow: number | null = null;
      let colIdx = 1;
      const normalized = combined.map((item, index) => {
        const origRow = item.row_position ?? 1;
        if (lastOriginalRow === null || origRow !== lastOriginalRow) {
          currentRow += 1;
          lastOriginalRow = origRow;
          colIdx = 1;
        } else {
          colIdx += 1;
        }
        return { ...item, row_position: currentRow, column_position: colIdx, display_order: index + 1 };
      });
      updatedFields = updatedFields.map(f => {
        if (f.template_id === currentTemplateId && f.section_name === secName) {
          const match = normalized.find(item => !item.isCustom && item.field_id === f.field_id);
          if (match) return { ...f, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
        }
        return f;
      });
      updatedCustom = updatedCustom.map(cf => {
        if (cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === secName) {
          const match = normalized.find(item => item.isCustom && item.custom_field_id === cf.custom_field_id);
          if (match) return { ...cf, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
        }
        return cf;
      });
    };

    normalizeSectionInPlace(sourceSection);
    if (sourceSection !== targetSection) {
      normalizeSectionInPlace(targetSection);
    }

    setAllFields(updatedFields);
    setAllCustomFields(updatedCustom);
    setDraggedElement(null);
  };

  const handleDropFieldOnField = (e: React.DragEvent, targetId: string, targetType: 'default' | 'custom') => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedElement) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const w = rect.width;
    const h = rect.height;

    let relativePos: 'left' | 'right' | 'top' | 'bottom' = 'bottom';
    if (x < w * 0.35) {
      relativePos = 'left';
    } else if (x > w * 0.65) {
      relativePos = 'right';
    } else {
      relativePos = y < h * 0.5 ? 'top' : 'bottom';
    }

    executeFieldMove(draggedElement.id, draggedElement.type, targetId, targetType, relativePos);
  };

  const handleSectionDropField = (targetSection: string) => {
    if (!draggedElement) return;
    const { id: draggedId, type: draggedType } = draggedElement;

    const sourceElement = draggedType === 'default'
      ? allFields.find(f => f.field_id === draggedId)
      : allCustomFields.find(cf => cf.custom_field_id === draggedId);
    if (!sourceElement) return;

    const sourceSection = sourceElement.section_name || 'Custom Fields';
    if (sourceSection !== targetSection) {
      setDraggedElement(null);
      return;
    }

    const targetFields = allFields.filter(f => f.template_id === currentTemplateId && f.section_name === targetSection);
    const targetCustom = allCustomFields.filter(cf => cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === targetSection);
    const maxRow = Math.max(
      0,
      ...targetFields.map(f => f.row_position ?? 1),
      ...targetCustom.map(cf => cf.row_position ?? 1)
    );

    let updatedFields = allFields.map(f => {
      if (f.field_id === draggedId && draggedType === 'default') {
        return { ...f, section_name: targetSection, row_position: maxRow + 1, column_position: 1 };
      }
      return f;
    });

    let updatedCustom = allCustomFields.map(cf => {
      if (cf.custom_field_id === draggedId && draggedType === 'custom') {
        return { ...cf, section_name: targetSection, row_position: maxRow + 1, column_position: 1 };
      }
      return cf;
    });

    const normalizeSectionInPlace = (secName: string) => {
      const secFields = updatedFields.filter(f => f.template_id === currentTemplateId && f.section_name === secName);
      const secCustom = updatedCustom.filter(cf => cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === secName);
      const combined = [
        ...secFields.map(f => ({ ...f, isCustom: false as const })),
        ...secCustom.map(cf => ({ ...cf, isCustom: true as const }))
      ];
      combined.sort((a, b) => {
        const rowA = a.row_position ?? 1;
        const rowB = b.row_position ?? 1;
        if (rowA !== rowB) return rowA - rowB;
        const colA = a.column_position ?? 1;
        const colB = b.column_position ?? 1;
        if (colA !== colB) return colA - colB;
        return a.display_order - b.display_order;
      });
      let currentRow = 0;
      let lastOriginalRow: number | null = null;
      let colIdx = 1;
      const normalized = combined.map((item, index) => {
        const origRow = item.row_position ?? 1;
        if (lastOriginalRow === null || origRow !== lastOriginalRow) {
          currentRow += 1;
          lastOriginalRow = origRow;
          colIdx = 1;
        } else {
          colIdx += 1;
        }
        return { ...item, row_position: currentRow, column_position: colIdx, display_order: index + 1 };
      });
      updatedFields = updatedFields.map(f => {
        if (f.template_id === currentTemplateId && f.section_name === secName) {
          const match = normalized.find(item => !item.isCustom && item.field_id === f.field_id);
          if (match) return { ...f, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
        }
        return f;
      });
      updatedCustom = updatedCustom.map(cf => {
        if (cf.template_id === currentTemplateId && (cf.section_name || 'Custom Fields') === secName) {
          const match = normalized.find(item => item.isCustom && item.custom_field_id === cf.custom_field_id);
          if (match) return { ...cf, row_position: match.row_position, column_position: match.column_position, display_order: match.display_order };
        }
        return cf;
      });
    };

    normalizeSectionInPlace(sourceSection);
    normalizeSectionInPlace(targetSection);

    setAllFields(updatedFields);
    setAllCustomFields(updatedCustom);
    setDraggedElement(null);
  };

  // ─── Drag and Drop Column Handlers ─────────────────────────────────────────
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  const handleColumnDragStart = (e: React.DragEvent, colId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', colId);
    setDraggedColumnId(colId);
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleColumnDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('text/plain') || draggedColumnId;
    if (!draggedId || draggedId === targetColId) return;

    const sourceIdx = activeColumns.findIndex(c => c.column_id === draggedId);
    const targetIdx = activeColumns.findIndex(c => c.column_id === targetColId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const reordered = [...activeColumns];
    const [moved] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    const updated = reordered.map((col, idx) => ({
      ...col,
      display_order: idx + 1
    }));

    setAllColumns(prev =>
      prev.map(c => {
        if (c.template_id === currentTemplateId) {
          const match = updated.find(u => u.column_id === c.column_id);
          return match ? match : c;
        }
        return c;
      })
    );
    setDraggedColumnId(null);
  };

  // ─── Drag and Drop Section Handlers ────────────────────────────────────────
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  const handleSectionDragStart = (secId: string) => {
    setDraggedSectionId(secId);
  };

  const handleSectionDrop = (targetSecId: string) => {
    if (!draggedSectionId || draggedSectionId === targetSecId) return;

    const sourceIdx = activeSections.findIndex(s => s.section_id === draggedSectionId);
    const targetIdx = activeSections.findIndex(s => s.section_id === targetSecId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    const reordered = [...activeSections];
    const [moved] = reordered.splice(sourceIdx, 1);
    reordered.splice(targetIdx, 0, moved);

    const updated = reordered.map((sec, idx) => ({
      ...sec,
      display_order: idx + 1
    }));

    setAllSections(prev =>
      prev.map(s => {
        if (s.template_id === currentTemplateId) {
          const match = updated.find(u => u.section_id === s.section_id);
          return match ? match : s;
        }
        return s;
      })
    );
    setDraggedSectionId(null);
  };

  // ─── Formula Field Builder ──────────────────────────────────────────────────
  const handleAddCustomField = () => {
    if (!formulaFieldName.trim()) return;
    if (formulaTokens.length === 0) return;

    if (formulaPlacement === 'column') {
      // Add as a table column
      const newCol: PrintTemplateColumn = {
        column_id: `col-formula-${currentTemplateId}-${Date.now()}`,
        template_id: currentTemplateId || '',
        column_name: formulaFieldName,
        display_order: activeColumns.length + 1,
        is_visible: false,
        width: '12%',
        is_custom: true,
        formula_tokens: formulaTokens
      };
      setAllColumns(prev => [...prev, newCol]);
    } else {
      // Add as a custom field in Totals / Summary footer
      const newField: PrintTemplateCustomField = {
        custom_field_id: `cf-formula-${currentTemplateId}-${Date.now()}`,
        template_id: currentTemplateId || '',
        field_name: formulaFieldName,
        field_type: 'formula',
        default_value: '',
        display_order: activeCustomFields.length + 1,
        is_visible: false,
        section_name: 'Totals',
        row_position: 10,
        column_position: 1,
        formula_tokens: formulaTokens
      };
      setAllCustomFields(prev => [...prev, newField]);
    }

    setShowCustomFieldModal(false);
    resetFormulaModal();
  };

  const handleRemoveCustomField = (cfId: string) => {
    setAllCustomFields(prev => prev.filter(c => c.custom_field_id !== cfId));
  };

  // ─── Custom Column Builder ──────────────────────────────────────────────────

  const handleRemoveCustomColumn = (colId: string) => {
    setAllColumns(prev => prev.filter(c => c.column_id !== colId));
  };

  // ─── Logo upload handler ────────────────────────────────────────────────────
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        updateTemplateProperty({ logo_url: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  // ─── Import / Export Configurations ──────────────────────────────────────────
  const handleExportTemplate = (t: PrintTemplate) => {
    const config = {
      template: t,
      sections: allSections.filter(s => s.template_id === t.template_id),
      fields: allFields.filter(f => f.template_id === t.template_id),
      columns: allColumns.filter(c => c.template_id === t.template_id),
      customFields: allCustomFields.filter(cf => cf.template_id === t.template_id)
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${t.template_name.replace(/\s+/g, '_')}_config.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target?.result as string);
          if (config.template && config.sections && config.fields) {
            const importedTemplateId = `pt-${Date.now()}`;
            const importedTemplate: PrintTemplate = {
              ...config.template,
              template_id: importedTemplateId,
              template_name: `${config.template.template_name} (Imported)`,
              is_default: false
            };

            setTemplates(prev => [...prev, importedTemplate]);

            // Add sections
            const importedSections = config.sections.map((s: any) => ({
              ...s,
              section_id: `sec-${importedTemplateId}-${s.section_id.split('-').pop()}`,
              template_id: importedTemplateId
            }));
            setAllSections(prev => [...prev, ...importedSections]);

            // Add fields
            const importedFields = config.fields.map((f: any, i: number) => ({
              ...f,
              field_id: `fld-${importedTemplateId}-${i + 1}`,
              template_id: importedTemplateId
            }));
            setAllFields(prev => [...prev, ...importedFields]);

            // Add columns
            if (config.columns) {
              const importedColumns = config.columns.map((c: any, i: number) => ({
                ...c,
                column_id: `col-${importedTemplateId}-${i + 1}`,
                template_id: importedTemplateId
              }));
              setAllColumns(prev => [...prev, ...importedColumns]);
            }

            // Add custom fields
            if (config.customFields) {
              const importedCustom = config.customFields.map((c: any, i: number) => ({
                ...c,
                custom_field_id: `cf-${importedTemplateId}-${i + 1}`,
                template_id: importedTemplateId
              }));
              setAllCustomFields(prev => [...prev, ...importedCustom]);
            }

            alert('Template imported successfully!');
          }
        } catch {
          alert('Failed to parse template JSON file!');
        }
      };
      reader.readAsText(file);
    }
  };

  const getSampleValue = (fieldName: string) => {
    switch (fieldName) {
      case 'Company Name': return 'Antigravity Creative Studio';
      case 'Company Address': return '452 Innovation Blvd, San Francisco, CA 94107';
      case 'Phone': return '+1 (555) 012-3456';
      case 'Email': return 'contact@antigravity.studio';
      case 'Website': return 'www.antigravity.studio';
      case 'NTN': return '1234567-8';
      case 'STRN': case 'STN': case 'STN / STRN': return '03-00-1234-567-89';
      case 'Customer Name': return 'BlueRitt Technologies Inc.';
      case 'Customer Address': return 'House 42, Street 5, Karachi, PK';
      case 'Mobile': return '0300-1234567';
      case 'Customer NTN': return '9876543-2';
      case 'Customer Email': return 'billing@blueritt.com';
      case 'Customer CNIC': return '42201-1234567-1';
      case 'Invoice Number': return 'SI-000248';
      case 'Date': case 'Invoice Date': return '2026-06-11';
      case 'Due Date': return '2026-07-11';
      case 'Sales Person': return 'Ahmed Raza';
      case 'Reference Number': return 'REF-992';
      case 'Warehouse': return 'Lahore Central';
      case 'Payment Terms': return 'Net 30';
      case 'Remarks': return 'Please process this invoice under standard business conditions.';
      case 'Terms & Conditions': return 'Payment is due within 30 days of issue. Balance subject to 2% late penalty.';
      case 'Notes': return 'Goods once sold are non-refundable. Tax paid has been deposited with FBR.';
      case 'Prepared By': return 'Aman Khan';
      case 'Received By': return 'Manager';
      case 'Customer STRN': return '03-09-9999-001-22';
      case 'Customer Code': return 'CUST-9928';
      case 'FBR Invoice Number': return 'FBR-INV-1092837';
      case 'Company Stamp': return '[Antigravity Studio Seal]';
      case 'FBR Logo': return '[FBR Logo]';
      case 'Subtotal': case 'Grand Total': case 'Balance Due': return '8,450.00';
      default: return '0.00';
    }
  };

  const renderFieldContent = (item: any, _sectionName: string) => {
    if (!activeTemplate) return null;
    const isEditingLabel = editingLabelId === (item.isCustom ? item.custom_field_id : item.field_id);
    const itemId = item.isCustom ? item.custom_field_id : item.field_id;

    if (isEditingLabel) {
      return (
        <input
          type="text"
          value={editingLabelText}
          onChange={e => setEditingLabelText(e.target.value)}
          onBlur={handleSaveInlineLabel}
          onKeyDown={e => {
            if (e.key === 'Enter') handleSaveInlineLabel();
          }}
          className="w-full text-[9px] border p-0.5 rounded outline-none"
          autoFocus
          onClick={e => e.stopPropagation()}
        />
      );
    }

    if (item.field_name === 'Company Logo') {
      return activeTemplate.logo_url ? (
        <img
          src={activeTemplate.logo_url}
          alt="Logo"
          style={{
            height: `${activeTemplate.logo_size || 80}px`,
            objectFit: 'contain'
          }}
        />
      ) : (
        <div className="border border-dashed rounded flex items-center justify-center bg-slate-50 text-[8px] text-slate-400 p-2.5 w-32 h-12">
          Upload Logo
        </div>
      );
    }

    if (item.field_name === 'Item Table') {
      const visibleCols = activeColumns.filter(c => c.is_visible);
      return (
        <div className="overflow-hidden bg-white w-full text-[8px]">
          <table className="w-full text-left border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300 text-[7px] font-bold text-slate-500">
                {visibleCols.map(col => (
                  <th
                    key={col.column_id}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      handleColumnDragStart(e, col.column_id);
                    }}
                    onDragOver={handleColumnDragOver}
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleColumnDrop(e, col.column_id);
                    }}
                    className="py-1 px-1.5 font-black text-slate-700 cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors border border-slate-300"
                    style={{ width: col.width, textAlign: col.alignment || 'left' }}
                  >
                    {col.custom_label || col.column_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-300 text-slate-650 text-[7px]">
                {visibleCols.map(col => {
                  let val = '-';
                  if (col.column_name === 'Sr No') val = '1';
                  else if (col.column_name === 'Product Code') val = 'BC-001';
                  else if (col.column_name === 'Product Name') val = 'Sample Product';
                  else if (col.column_name === 'Description') val = 'Deliverables';
                  else if (col.column_name === 'Quantity' || col.column_name === 'Qty') val = '1.00';
                  else if (col.column_name === 'Rate' || col.column_name === 'Unit Price') val = '8,450.00';
                  else if (col.column_name === 'Discount') val = '0.00';
                  else if (col.column_name === 'Tax') val = '1,352.00';
                  else if (col.column_name === 'Amount') val = '9,802.00';
                  else if (col.is_custom && col.formula_tokens && col.formula_tokens.length > 0) {
                    // Evaluate formula using dummy row context
                    try {
                      const fieldMap: Record<string, number> = {
                        'quantity': dummyContext.row.quantity,
                        'price': dummyContext.row.price,
                        'rate': dummyContext.row.price,
                        'line_total': dummyContext.row.quantity * dummyContext.row.price,
                        'discount': dummyContext.row.discount,
                        'tax': dummyContext.row.tax,
                        'further_tax': dummyContext.row.furtherTax,
                        'subtotal': dummyContext.totals.subtotal,
                        'tax_amount': dummyContext.totals.tax_amount,
                        'discount_amount': dummyContext.totals.discount_amount,
                        'shipping_charges': dummyContext.totals.shipping_charges,
                        'other_charges': dummyContext.totals.other_charges,
                        'round_off': dummyContext.totals.round_off,
                        'grand_total': dummyContext.totals.grand_total,
                        'paid_amount': dummyContext.totals.paid_amount,
                        'balance_due': dummyContext.totals.balance_due,
                        'total_qty': dummyContext.totals.total_qty,
                        'total_items': dummyContext.totals.total_items
                      };
                      let result = 0;
                      let pendingOp = '+';
                      for (const tok of col.formula_tokens) {
                        let num = 0;
                        if (tok.type === 'field') num = fieldMap[tok.fieldKey as string] ?? 0;
                        else if (tok.type === 'constant') num = parseFloat(String(tok.constant ?? '0')) || 0;
                        else if (tok.type === 'operator') { pendingOp = tok.operator ?? '+'; continue; }
                        if (pendingOp === '+') result += num;
                        else if (pendingOp === '-') result -= num;
                        else if (pendingOp === '*') result *= num;
                        else if (pendingOp === '/') result = num !== 0 ? result / num : 0;
                        else if (pendingOp === '%') result = result * num / 100;
                      }
                      val = result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    } catch { val = '0.00'; }
                  }
                  return (
                    <td key={col.column_id} className="py-1 px-1.5" style={{ textAlign: col.alignment || 'left' }}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      );
    }

    if (item.field_name === 'QR Code') {
      return activeTemplate.qr_enabled ? (
        <div className="w-10 h-10 border p-0.5 rounded bg-white flex items-center justify-center">
          <svg className="w-full h-full text-slate-800" viewBox="0 0 24 24">
            <path fill="currentColor" d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-2 2h2v2-2v-2zm2 2h3v3h-3v-3zm-2 2h2v2-2v-2zm4-4h2v4h-2v-4zm0 6h2v1h-2v-1z" />
          </svg>
        </div>
      ) : null;
    }

    if (item.field_name === 'Barcode') {
      return activeTemplate.barcode_enabled ? (
        <div className="w-32 py-1">
          <svg className="h-6 w-full text-slate-800" viewBox="0 0 100 20" preserveAspectRatio="none">
            <rect width="100" height="20" fill="white"/>
            <rect x="5" y="2" width="2" height="16" fill="currentColor"/>
            <rect x="10" y="2" width="4" height="16" fill="currentColor"/>
            <rect x="16" y="2" width="1" height="16" fill="currentColor"/>
            <rect x="20" y="2" width="3" height="16" fill="currentColor"/>
            <rect x="25" y="2" width="5" height="16" fill="currentColor"/>
            <rect x="32" y="2" width="2" height="16" fill="currentColor"/>
            <rect x="36" y="2" width="1" height="16" fill="currentColor"/>
            <rect x="40" y="2" width="4" height="16" fill="currentColor"/>
            <rect x="48" y="2" width="2" height="16" fill="currentColor"/>
            <rect x="52" y="2" width="3" height="16" fill="currentColor"/>
            <rect x="58" y="2" width="5" height="16" fill="currentColor"/>
          </svg>
        </div>
      ) : null;
    }

    if (item.field_name === 'Signature') {
      return activeTemplate.signature_enabled ? (
        <div className="w-32 text-center" onDoubleClick={e => handleDoubleClick(e, itemId, item.custom_label || 'Seller Signature')}>
          <div className="border-b border-slate-355 w-full h-3" />
          <span className="text-[7.5px] text-slate-400 block mt-0.5 cursor-pointer hover:bg-slate-50 rounded px-1">
            {item.custom_label || 'Seller Signature'}
          </span>
        </div>
      ) : null;
    }

    if (item.field_name === 'FBR Logo') {
      return (
        <div className="flex items-center gap-1 bg-emerald-50/70 border border-emerald-200 rounded px-1.5 py-0.5 text-[8px] font-bold text-emerald-800">
          <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
          <div className="flex flex-col text-left leading-[1.1]">
            <span>FBR</span>
            <span className="text-[5px] text-emerald-500 font-medium font-sans">Pakistan</span>
          </div>
        </div>
      );
    }

    if (item.field_name === 'Company Stamp') {
      return (
        <div className="w-20 h-10 border border-dashed border-slate-350 rounded-full flex flex-col items-center justify-center opacity-65 select-none bg-slate-50/50">
          <span className="text-[5px] font-bold text-slate-455">Company Stamp</span>
          <span className="text-[4px] text-slate-350">Seal Here</span>
        </div>
      );
    }

    if (item.field_name === 'Watermark') {
      return null;
    }

    const label = item.isCustom ? item.field_name : (item.custom_label || item.field_name);
    const sampleVal = getSampleValue(item.field_name);

    if (item.field_name === 'Remarks' && !activeTemplate.remarks_enabled) return null;
    if (item.field_name === 'Terms & Conditions' && !activeTemplate.terms_enabled) return null;

    const labelColor = item.label_color || item.color;
    const labelBold = item.label_is_bold !== undefined ? item.label_is_bold : item.is_bold;
    const valueColor = item.value_color || item.color;
    const valueBold = item.value_is_bold !== undefined ? item.value_is_bold : item.is_bold;

    if (['Prepared By', 'Received By'].includes(item.field_name)) {
      return (
        <div className="inline-block text-center mr-4" onDoubleClick={e => handleDoubleClick(e, itemId, label)}>
          <div className="border-b border-slate-300 w-24 h-4" />
          <span className="text-[8px] text-slate-450" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{label}</span>
        </div>
      );
    }

    if (['Subtotal', 'Grand Total', 'Balance Due', 'Tax Amount', 'Discount Amount', 'Shipping Charges', 'Round Off', 'Received Amount'].includes(item.field_name)) {
      return (
        <div className="grid grid-cols-12 w-full items-center gap-x-2" onDoubleClick={e => handleDoubleClick(e, itemId, label)}>
          <div className="col-span-7 text-left">
            <span className="text-slate-400 font-bold" style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}>{label}:</span>
          </div>
          <div className="col-span-2 text-center text-slate-400 font-bold" style={{ color: labelColor || undefined }}>
            Rs.
          </div>
          <div className="col-span-3 text-right">
            <span className="font-extrabold" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>
              {item.field_name === 'Balance Due' || item.field_name === 'Grand Total' || item.field_name === 'Subtotal' ? '8,450.00' : '0.00'}
            </span>
          </div>
        </div>
      );
    }

    // For formula custom fields, evaluate and show a sample result
    if (item.isCustom && item.field_type === 'formula' && item.formula_tokens && item.formula_tokens.length > 0) {
      let formulaSample = '0.00';
      try {
        const fieldMap: Record<string, number> = {
          'quantity': dummyContext.row.quantity,
          'price': dummyContext.row.price,
          'rate': dummyContext.row.price,
          'line_total': dummyContext.row.quantity * dummyContext.row.price,
          'discount': dummyContext.row.discount,
          'tax': dummyContext.row.tax,
          'subtotal': dummyContext.totals.subtotal,
          'tax_amount': dummyContext.totals.tax_amount,
          'discount_amount': dummyContext.totals.discount_amount,
          'shipping_charges': dummyContext.totals.shipping_charges,
          'other_charges': dummyContext.totals.other_charges,
          'round_off': dummyContext.totals.round_off,
          'grand_total': dummyContext.totals.grand_total,
          'paid_amount': dummyContext.totals.paid_amount,
          'balance_due': dummyContext.totals.balance_due,
          'total_qty': dummyContext.totals.total_qty,
          'total_items': dummyContext.totals.total_items
        };
        let result = 0;
        let pendingOp = '+';
        for (const tok of item.formula_tokens) {
          let num = 0;
          if (tok.type === 'field') num = fieldMap[tok.fieldKey] ?? 0;
          else if (tok.type === 'constant') num = parseFloat(tok.constant ?? '0') || 0;
          else if (tok.type === 'operator') { pendingOp = tok.operator ?? '+'; continue; }
          if (pendingOp === '+') result += num;
          else if (pendingOp === '-') result -= num;
          else if (pendingOp === '*') result *= num;
          else if (pendingOp === '/') result = num !== 0 ? result / num : 0;
          else if (pendingOp === '%') result = result * num / 100;
        }
        formulaSample = result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } catch { formulaSample = '0.00'; }

      return (
        <div className="grid grid-cols-12 w-full items-center gap-x-2" onDoubleClick={e => handleDoubleClick(e, itemId, label)}>
          <div className="col-span-7 text-left">
            <span className="text-slate-400 font-bold" style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}>{label}:</span>
          </div>
          <div className="col-span-2 text-center text-slate-400 font-bold" style={{ color: labelColor || undefined }}>Rs.</div>
          <div className="col-span-3 text-right">
            <span className="font-extrabold" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{formulaSample}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="inline-flex items-center flex-wrap" onDoubleClick={e => handleDoubleClick(e, itemId, label)}>
        <strong className="text-slate-400 mr-1" style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}>{label}: </strong>
        <span className="text-slate-700" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{item.isCustom ? (item.default_value || 'Sample') : sampleVal}</span>
      </div>
    );
  };

  const renderSectionFields = (sectionName: string) => {
    const secFields = activeFields.filter(f => f.section_name === sectionName);
    const secCustomFields = activeCustomFields.filter(cf => (cf.section_name || 'Custom Fields') === sectionName);
    const combined = [
      ...secFields.map(f => ({ ...f, isCustom: false as const })),
      ...secCustomFields.map(cf => ({ ...cf, isCustom: true as const }))
    ];

    if (combined.length === 0) {
      return <div className="text-[9px] text-slate-400 p-2 italic border border-dashed rounded text-center w-full">Empty Section. Drag fields here.</div>;
    }

    const rowsMap: Record<number, typeof combined> = {};
    combined.forEach(item => {
      const r = item.row_position ?? 1;
      if (!rowsMap[r]) rowsMap[r] = [];
      rowsMap[r].push(item);
    });

    const sortedRowKeys = Object.keys(rowsMap).map(Number).sort((a, b) => a - b);

    return (
      <div className="w-full space-y-2">
        {sortedRowKeys.map(rowNum => {
          const rowItems = rowsMap[rowNum].sort((a, b) => {
            const colA = a.column_position ?? 1;
            const colB = b.column_position ?? 1;
            if (colA !== colB) return colA - colB;
            return a.display_order - b.display_order;
          });

          return (
            <div key={rowNum} className="grid grid-cols-12 gap-x-4 gap-y-2 w-full items-start">
              {rowItems.map(item => {
                const isSelected = item.isCustom ? selectedCustomFieldId === item.custom_field_id : selectedFieldId === item.field_id;
                const itemId = item.isCustom ? item.custom_field_id : item.field_id;
                
                let defaultWidth = 100;
                if (sectionName === 'Customer Information') defaultWidth = 50;
                else if (sectionName === 'Invoice Information') defaultWidth = 33;
                else if (sectionName === 'Totals') defaultWidth = 100;

                const widthPercent = sectionName === 'Totals' ? 100 : (item.width_percent || defaultWidth);
                const isFullBlock = ['Company Logo', 'Item Table', 'Remarks', 'Terms & Conditions', 'FBR Logo', 'Notes'].includes(item.field_name);
                
                let colSpan = 'col-span-12';
                if (!isFullBlock) {
                  if (widthPercent <= 25) colSpan = 'col-span-3';
                  else if (widthPercent <= 33) colSpan = 'col-span-4';
                  else if (widthPercent <= 50) colSpan = 'col-span-6';
                  else colSpan = 'col-span-12';
                }

                const fieldElement = renderFieldContent(item, sectionName);
                if (!fieldElement) return null;

                return (
                  <div
                    key={itemId}
                    className={colSpan}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDraggedElement({ id: itemId, type: item.isCustom ? 'custom' : 'default' });
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const w = rect.width;
                      const h = rect.height;
                      let pos: 'left' | 'right' | 'top' | 'bottom' = 'bottom';
                      if (x < w * 0.35) pos = 'left';
                      else if (x > w * 0.65) pos = 'right';
                      else pos = y < h * 0.5 ? 'top' : 'bottom';
                      
                      if (!dragOverField || dragOverField.id !== itemId || dragOverField.pos !== pos) {
                        setDragOverField({ id: itemId, pos });
                      }
                    }}
                    onDragLeave={() => {
                      setDragOverField(null);
                    }}
                    onDrop={(e) => {
                      setDragOverField(null);
                      handleDropFieldOnField(e, itemId, item.isCustom ? 'custom' : 'default');
                    }}
                    style={{
                      paddingLeft: '2px',
                      paddingRight: '2px',
                      marginLeft: (item.column_position === 3 || item.field_name === 'Signature') ? 'auto' : undefined
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: item.alignment === 'center' ? 'center' : item.alignment === 'right' ? 'flex-end' : 'flex-start',
                        fontSize: item.font_size ? `${item.font_size}px` : undefined,
                        textAlign: item.alignment || (sectionName === 'Totals' ? 'right' : 'left'),
                        fontWeight: item.is_bold ? 'bold' : 'normal',
                        color: item.color,
                        cursor: 'move',
                        backgroundColor: isSelected ? `${brand.primary}10` : (item.background || 'transparent'),
                        borderLeft: dragOverField?.id === itemId && dragOverField.pos === 'left' ? `2px solid ${brand.primary}` : (item.border === 'bottom-light' || item.border === 'bottom-slate' || item.border === 'bottom-black' ? 'none' : item.border || (item.is_visible ? 'none' : '1px dashed #cbd5e1')),
                        borderRight: dragOverField?.id === itemId && dragOverField.pos === 'right' ? `2px solid ${brand.primary}` : (item.border === 'bottom-light' || item.border === 'bottom-slate' || item.border === 'bottom-black' ? 'none' : item.border || (item.is_visible ? 'none' : '1px dashed #cbd5e1')),
                        borderTop: dragOverField?.id === itemId && dragOverField.pos === 'top' ? `2px solid ${brand.primary}` : (item.border === 'bottom-light' || item.border === 'bottom-slate' || item.border === 'bottom-black' ? 'none' : item.border || (item.is_visible ? 'none' : '1px dashed #cbd5e1')),
                        borderBottom: dragOverField?.id === itemId && dragOverField.pos === 'bottom' ? `2px solid ${brand.primary}` : (item.border === 'bottom-light' ? '1px solid #cbd5e1' : item.border === 'bottom-slate' ? '1px solid #475569' : item.border === 'bottom-black' ? '1px solid #000000' : item.border || (item.is_visible ? 'none' : '1px dashed #cbd5e1')),
                        padding: item.padding || '4px',
                        marginBottom: item.margin_bottom ? `${item.margin_bottom}px` : undefined,
                        outline: isSelected ? `1px dashed ${brand.primary}` : undefined,
                        opacity: item.is_visible ? 1 : 0.45,
                      }}
                      className="transition-all hover:bg-slate-50 p-1 rounded"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.isCustom) {
                          setSelectedCustomFieldId(itemId);
                          setSelectedFieldId(null);
                          setSelectedColumnId(null);
                        } else {
                          setSelectedFieldId(itemId);
                          setSelectedCustomFieldId(null);
                          setSelectedColumnId(null);
                        }
                      }}
                    >
                      {fieldElement}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  if (view === 'designer' && activeTemplate) {
    return (
      <div className="space-y-4">
        {/* Designer Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('list')}
              className="p-1.5 rounded-full hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm font-black text-slate-800">
                Template Designer — {activeTemplate.template_name}
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {activeTemplate.document_type} · {activeTemplate.paper_size} · {activeTemplate.orientation}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="white"
              size="sm"
              icon={Undo}
              onClick={undo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              Undo
            </Button>
            <Button
              variant="white"
              size="sm"
              icon={Redo}
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              Redo
            </Button>
            <Button
              variant="white"
              size="sm"
              icon={Download}
              onClick={() => handleExportTemplate(activeTemplate)}
            >
              Export
            </Button>
            <Button
              variant="white"
              size="sm"
              icon={Copy}
              onClick={() => handleDuplicate(activeTemplate)}
            >
              Duplicate
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Check}
              onClick={() => {
                if (activeTemplate) {
                  saveSingleTemplateLayout(activeTemplate, allSections, allFields, allColumns, allCustomFields);
                }
                setView('list');
              }}
              style={{ backgroundColor: brand.primary }}
            >
              Save layout
            </Button>
          </div>
        </div>

        {/* 3-Panel Designer Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 1. Left Panel: Section Builder */}
          <div className="lg:col-span-6 h-[350px] border border-[#E2E8F0] bg-slate-50/50 rounded-xl p-4 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-700">Section Builder</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400">Role:</span>
                <select
                  value={isAdminRole ? 'admin' : 'user'}
                  onChange={e => setIsAdminRole(e.target.value === 'admin')}
                  className="text-[10px] font-bold text-slate-600 bg-white border rounded px-1.5 py-0.5 outline-none cursor-pointer"
                >
                  <option value="user">User</option>
                  <option value="admin">Super Admin</option>
                </select>
              </div>
            </div>

            <ScrollArea maxHeight="100%">
              <div className="space-y-2.5">
                {/* Available Fields Panel (Field Library) */}
                {(() => {
                  const isLibraryCollapsed = !!collapsedSections['available-fields-library'];
                  const hiddenFields = activeFields.filter(f => !f.is_visible);
                  const hiddenCustomFields = activeCustomFields.filter(cf => !cf.is_visible);
                  const libraryCombined = [
                    ...hiddenFields.map(f => ({ ...f, isCustom: false as const })),
                    ...hiddenCustomFields.map(cf => ({ ...cf, isCustom: true as const }))
                  ].sort((a, b) => a.display_order - b.display_order);

                  return (
                    <div
                      className="border border-indigo-150 bg-indigo-50/10 rounded-xl overflow-hidden shadow-3xs hover:shadow-2xs transition-shadow mb-4"
                    >
                      {/* Panel Header */}
                      <div 
                        className="flex items-center justify-between px-3 py-2 bg-indigo-550 border-b border-indigo-100 cursor-pointer select-none"
                        onClick={() => toggleSectionCollapse('available-fields-library')}
                        style={{ backgroundColor: `${brand.primary}15` }}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" style={{ color: brand.primary }} />
                          <span className="text-[11px] font-black text-indigo-900 uppercase tracking-wide" style={{ color: brand.primary }}>Available Fields</span>
                          {libraryCombined.length > 0 && (
                            <span className="text-[9.5px] font-extrabold bg-indigo-100 text-indigo-850 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${brand.primary}30`, color: brand.primary }}>
                              {libraryCombined.length}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="white"
                            size="xs"
                            icon={Plus}
                            style={{ color: brand.primary, borderColor: `${brand.primary}35` }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormulaPlacement('totals');
                              setShowCustomFieldModal(true);
                            }}
                          >
                            Add Field
                          </Button>
                          {isLibraryCollapsed ? (
                            <ChevronDown className="w-3.5 h-3.5 text-indigo-600" style={{ color: brand.primary }} />
                          ) : (
                            <ChevronUp className="w-3.5 h-3.5 text-indigo-600" style={{ color: brand.primary }} />
                          )}
                        </div>
                      </div>

                      {/* Panel Body */}
                      {!isLibraryCollapsed && (
                        <div className="p-3 bg-white space-y-2">
                          {libraryCombined.length === 0 ? (
                            <p className="text-[10px] text-slate-400 text-center py-2">No hidden fields.</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-1.5">
                              {libraryCombined.map((item) => {
                                const itemId = item.isCustom ? item.custom_field_id : item.field_id;
                                const itemName = item.field_name;
                                const isSelected = item.isCustom 
                                  ? selectedCustomFieldId === itemId
                                  : selectedFieldId === itemId;

                                return (
                                  <div
                                    key={itemId}
                                    draggable
                                    onDragStart={() => setDraggedElement({ id: itemId, type: item.isCustom ? 'custom' : 'default' })}
                                    onDragOver={(e) => e.preventDefault()}
                                    className="flex items-center justify-between px-2 py-1 rounded-lg border text-[10px] font-semibold cursor-pointer transition-all hover:bg-slate-50"
                                    style={isSelected ? {
                                      backgroundColor: `${brand.primary}10`,
                                      borderColor: brand.primary,
                                      color: brand.primary
                                    } : {
                                      backgroundColor: '#F8FAFC',
                                      borderColor: '#E2E8F0',
                                      color: '#475569'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (item.isCustom) {
                                        setSelectedCustomFieldId(itemId);
                                        setSelectedFieldId(null);
                                        setSelectedColumnId(null);
                                      } else {
                                        setSelectedFieldId(itemId);
                                        setSelectedCustomFieldId(null);
                                        setSelectedColumnId(null);
                                      }
                                    }}
                                  >
                                    <div className="flex items-center gap-1 min-w-0 flex-grow">
                                      <Move className="w-2.5 h-2.5 text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                                      <span className="truncate" title={item.custom_label || itemName}>{item.custom_label || itemName}</span>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      <button
                                        type="button"
                                        title="Show on canvas"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (item.isCustom) {
                                            updateCustomFieldProperty(itemId, { 
                                              is_visible: true, 
                                              section_name: item.section_name || 'Customer Information' 
                                            });
                                          } else {
                                            updateFieldProperty(itemId, { 
                                              is_visible: true, 
                                              section_name: item.section_name || 'Customer Information' 
                                            });
                                          }
                                        }}
                                        className="text-slate-400 hover:text-indigo-650"
                                        style={{ color: brand.primary }}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                      {item.isCustom && (
                                        <button
                                          type="button"
                                          title="Remove permanently"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveCustomField(itemId);
                                          }}
                                          className="text-slate-350 hover:text-red-500"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {activeSections.map((sec) => {
                  const isCollapsed = !!collapsedSections[sec.section_id];
                  
                  return (
                    <div
                      key={sec.section_id}
                      draggable
                      onDragStart={(e) => {
                        if (draggedElement || draggedColumnId) {
                          e.preventDefault();
                          return;
                        }
                        handleSectionDragStart(sec.section_id);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedElement) {
                          handleSectionDropField(sec.section_name);
                        } else if (draggedSectionId) {
                          handleSectionDrop(sec.section_id);
                        }
                      }}
                      className="border border-slate-200 bg-white rounded-xl overflow-hidden shadow-3xs hover:shadow-2xs transition-shadow cursor-move"
                    >
                      {/* Section Header */}
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-700">{sec.section_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateSectionProperty(sec.section_id, { is_visible: !sec.is_visible })}
                            className="text-slate-450 hover:text-slate-700 cursor-pointer"
                          >
                            {sec.is_visible ? (
                              <Eye className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-slate-300" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleSectionCollapse(sec.section_id)}
                            className="text-slate-450 hover:text-slate-700 cursor-pointer"
                          >
                            {isCollapsed ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronUp className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>


                      {/* Section Fields Body */}
                      {!isCollapsed && (
                        <div className="p-3 bg-white space-y-2">
                          {sec.section_name === 'Product Table' ? (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center pb-1 border-b">
                                <span className="text-[10px] font-bold text-slate-400">Table Columns</span>
                                <Button
                                  variant="white"
                                  size="xs"
                                  icon={Plus}
                                  onClick={() => {
                                    setFormulaPlacement('column');
                                    setShowCustomFieldModal(true);
                                  }}
                                >
                                  Add Column
                                </Button>
                              </div>
                              <div className="space-y-1.5">
                                {activeColumns.map((col) => {
                                  const isSelected = selectedColumnId === col.column_id;
                                  return (
                                    <div
                                      key={col.column_id}
                                      draggable
                                      onDragStart={(e) => {
                                        e.stopPropagation();
                                        handleColumnDragStart(e, col.column_id);
                                      }}
                                      onDragOver={handleColumnDragOver}
                                      onDrop={(e) => {
                                        handleColumnDrop(e, col.column_id);
                                      }}
                                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold cursor-pointer transition-all ${!col.is_visible ? 'opacity-60' : ''}`}
                                      style={isSelected ? {
                                        backgroundColor: `${brand.primary}10`,
                                        borderColor: brand.primary,
                                        color: brand.primary
                                      } : {
                                        backgroundColor: '#F8FAFC',
                                        borderColor: '#E2E8F0',
                                        color: '#334155'
                                      }}
                                      onClick={() => {
                                        setSelectedColumnId(col.column_id);
                                        setSelectedFieldId(null);
                                        setSelectedCustomFieldId(null);
                                      }}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0 flex-grow">
                                        <input
                                          type="checkbox"
                                          checked={col.is_visible}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            updateColumnProperty(col.column_id, { is_visible: e.target.checked });
                                          }}
                                          className="rounded border-slate-350 cursor-pointer w-3.5 h-3.5 mr-1 flex-shrink-0"
                                          onClick={(e) => e.stopPropagation()}
                                        />
                                        <Move className="w-3.5 h-3.5 text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                                        <span className="font-bold truncate" title={col.custom_label || col.column_name}>{col.custom_label || col.column_name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[9px] text-slate-400 font-normal">{col.width || '10%'}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {sec.section_name === 'Custom Fields' && (
                                <div className="flex justify-between items-center pb-1 border-b">
                                  <span className="text-[10px] font-bold text-slate-400">User Defined Custom Fields</span>
                                  <Button
                                    variant="white"
                                    size="xs"
                                    icon={Plus}
                                    onClick={() => {
                                      setFormulaPlacement('totals');
                                      setShowCustomFieldModal(true);
                                    }}
                                  >
                                    Add Field
                                  </Button>
                                </div>
                              )}
                              <div className="space-y-1.5">
                                {(() => {
                                  const secFields = activeFields.filter(f => f.section_name === sec.section_name);
                                  const secCustomFields = activeCustomFields.filter(cf => (cf.section_name || 'Custom Fields') === sec.section_name);
                                  const combined = [
                                    ...secFields.map(f => ({ ...f, isCustom: false as const })),
                                    ...secCustomFields.map(cf => ({ ...cf, isCustom: true as const }))
                                  ].sort((a, b) => a.display_order - b.display_order);

                                  if (combined.length === 0) {
                                    return <p className="text-[10px] text-slate-400 text-center py-2">No fields in this section.</p>;
                                  }

                                  return combined.map((item) => {
                                    const isSelected = item.isCustom 
                                      ? selectedCustomFieldId === item.custom_field_id
                                      : selectedFieldId === item.field_id;
                                    const itemId = item.isCustom ? item.custom_field_id : item.field_id;
                                    const itemName = item.isCustom ? item.field_name : item.field_name;

                                    return (
                                      <div
                                        key={itemId}
                                        draggable
                                        onDragStart={(e) => {
                                          e.stopPropagation();
                                          setDraggedElement({ id: itemId, type: item.isCustom ? 'custom' : 'default' });
                                        }}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                          e.stopPropagation();
                                          handleElementDrop(itemId, item.isCustom);
                                        }}
                                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${!item.is_visible ? 'opacity-60' : ''}`}
                                        style={isSelected ? {
                                          backgroundColor: `${brand.primary}10`,
                                          borderColor: brand.primary,
                                          color: brand.primary
                                        } : {
                                          backgroundColor: '#FFFFFF',
                                          borderColor: '#E2E8F0',
                                          color: '#4B5563'
                                        }}
                                        onClick={() => {
                                          if (item.isCustom) {
                                            setSelectedCustomFieldId(itemId);
                                            setSelectedFieldId(null);
                                            setSelectedColumnId(null);
                                          } else {
                                            setSelectedFieldId(itemId);
                                            setSelectedCustomFieldId(null);
                                            setSelectedColumnId(null);
                                          }
                                        }}
                                      >
                                        <div className="flex items-center gap-1.5 min-w-0 flex-grow">
                                          <input
                                            type="checkbox"
                                            checked={item.is_visible}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              const newVisible = e.target.checked;
                                              if (item.isCustom) {
                                                updateCustomFieldProperty(itemId, { is_visible: newVisible });
                                              } else {
                                                updateFieldProperty(itemId, { is_visible: newVisible });
                                              }
                                            }}
                                            className="rounded border-slate-350 cursor-pointer w-3.5 h-3.5 mr-1 flex-shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                          <Move className="w-3 h-3 text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
                                          <span className="truncate" title={item.custom_label || itemName}>{item.custom_label || itemName}</span>
                                          {item.isCustom && (
                                            <span className="ml-1 text-[8.5px] px-1 bg-slate-100 border border-slate-200 text-slate-500 rounded font-normal capitalize flex-shrink-0">
                                              {item.field_type}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* 3. Right Panel: Properties & Advanced Options */}
          <div className="lg:col-span-6 h-[350px] border border-[#E2E8F0] bg-slate-50/50 rounded-xl p-4 flex flex-col overflow-y-auto">
            <ScrollArea maxHeight="100%">
              <div className="space-y-4">
                {/* Advanced Options Section */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3 shadow-3xs">
                  <h4 className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 pb-1 border-b">
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    Advanced Options
                  </h4>

                  {/* Rename template input */}
                  <Input
                    label="Rename Template"
                    variant="compact"
                    value={activeTemplate.template_name}
                    onChange={e => updateTemplateProperty({ template_name: e.target.value })}
                  />

                  {/* Document Type select */}
                  <Select
                    label="Document Type"
                    variant="compact"
                    value={activeTemplate.document_type}
                    onChange={e => updateTemplateProperty({ document_type: e.target.value })}
                    options={DOCUMENT_TYPES.map(t => ({ value: t, label: t }))}
                  />

                  {/* Layout Mode select */}
                  <Select
                    label="Layout Mode"
                    variant="compact"
                    value={activeTemplate.layout_mode || 'flow'}
                    onChange={e => updateTemplateProperty({ layout_mode: e.target.value as any })}
                    options={[
                      { value: 'flow', label: 'Flow Layout' },
                      { value: 'free', label: 'Free Layout' }
                    ]}
                  />

                  {/* Paper Size select */}
                  <Select
                    label="Paper Size"
                    variant="compact"
                    value={activeTemplate.paper_size}
                    onChange={e => {
                      const size = e.target.value as any;
                      updateTemplateProperty({
                        paper_size: size,
                        paper_width: size === 'Thermal' ? '80mm' : size === 'A5' ? '148mm' : size === 'Letter' ? '216mm' : '210mm',
                        paper_height: size === 'Thermal' ? 'auto' : size === 'A5' ? '210mm' : size === 'Letter' ? '279mm' : '297mm'
                      });
                    }}
                    options={PAPER_SIZES.map(t => ({ value: t, label: t }))}
                  />

                  {activeTemplate.paper_size === 'Custom' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Width (mm)"
                        variant="compact"
                        value={activeTemplate.paper_width || ''}
                        onChange={e => updateTemplateProperty({ paper_width: e.target.value })}
                      />
                      <Input
                        label="Height (mm)"
                        variant="compact"
                        value={activeTemplate.paper_height || ''}
                        onChange={e => updateTemplateProperty({ paper_height: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Orientation select */}
                  <Select
                    label="Orientation"
                    variant="compact"
                    value={activeTemplate.orientation}
                    onChange={e => updateTemplateProperty({ orientation: e.target.value as any })}
                    options={ORIENTATIONS.map(t => ({ value: t, label: t }))}
                  />

                  {/* Logo upload and size slider */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-400">Company Logo</label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="designer-logo-upload"
                      />
                      <label
                        htmlFor="designer-logo-upload"
                        className="flex-grow flex items-center justify-center border border-dashed rounded-lg py-1.5 px-3 bg-slate-50 text-[10px] font-bold text-slate-650 cursor-pointer hover:bg-slate-100 border-slate-300"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        {activeTemplate.logo_url ? 'Change Logo' : 'Upload Logo'}
                      </label>
                      {activeTemplate.logo_url && (
                        <Button
                          variant="danger"
                          size="xs"
                          icon={Trash2}
                          onClick={() => updateTemplateProperty({ logo_url: undefined })}
                        />
                      )}
                    </div>
                  </div>

                  {activeTemplate.logo_url && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Logo Size</span>
                        <span>{activeTemplate.logo_size || 80}px</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="200"
                        value={activeTemplate.logo_size || 80}
                        onChange={e => updateTemplateProperty({ logo_size: parseInt(e.target.value) })}
                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500 outline-none"
                      />
                    </div>
                  )}

                  {/* Advanced Option Toggles */}
                  <div className="space-y-2.5 pt-2 border-t">
                    <Toggle
                      checked={activeTemplate.qr_enabled}
                      onChange={val => updateTemplateProperty({ qr_enabled: val })}
                      label="Enable QR Code"
                    />
                    <Toggle
                      checked={activeTemplate.barcode_enabled}
                      onChange={val => updateTemplateProperty({ barcode_enabled: val })}
                      label="Enable Barcode"
                    />
                    <Toggle
                      checked={activeTemplate.signature_enabled}
                      onChange={val => updateTemplateProperty({ signature_enabled: val })}
                      label="Enable Signature Line"
                    />
                    <Toggle
                      checked={activeTemplate.watermark_enabled}
                      onChange={val => updateTemplateProperty({ watermark_enabled: val })}
                      label="Enable Watermark Background"
                    />
                    <Toggle
                      checked={activeTemplate.terms_enabled}
                      onChange={val => updateTemplateProperty({ terms_enabled: val })}
                      label="Enable Terms & Conditions"
                    />
                    <Toggle
                      checked={activeTemplate.remarks_enabled}
                      onChange={val => updateTemplateProperty({ remarks_enabled: val })}
                      label="Enable Invoice Remarks"
                    />
                  </div>
                </div>

                {/* Selected Field Style Editor */}
                {selectedField ? (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3 shadow-3xs">
                    <h4 className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 pb-1 border-b">
                      <Pencil className="w-3.5 h-3.5 text-slate-400" />
                      Field Styles: {selectedField.field_name}
                    </h4>

                    {/* Rename Field label */}
                    <Input
                      label="Custom Label (Rename)"
                      variant="compact"
                      value={selectedField.custom_label || ''}
                      onChange={e => updateFieldProperty(selectedField.field_id, { custom_label: e.target.value })}
                      placeholder={selectedField.field_name}
                    />

                    {/* Show/Hide */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-650 font-bold">Field Visibility</span>
                      <Toggle
                        checked={selectedField.is_visible}
                        onChange={val => updateFieldProperty(selectedField.field_id, { is_visible: val })}
                        label="Visible"
                      />
                    </div>

                    {/* Grid Positioning */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <Input
                        label="Row Position"
                        variant="compact"
                        type="number"
                        min="1"
                        max="20"
                        value={String(selectedField.row_position || 1)}
                        onChange={e => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          updateFieldRowPosition(selectedField.field_id, 'default', val);
                        }}
                      />
                      <Input
                        label="Column Position"
                        variant="compact"
                        type="number"
                        min="1"
                        max="12"
                        value={String(selectedField.column_position || 1)}
                        onChange={e => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          updateFieldColumnPosition(selectedField.field_id, 'default', val);
                        }}
                      />
                    </div>

                    {activeTemplate.layout_mode === 'free' && (
                      <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50 space-y-2.5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block border-b pb-0.5">Canvas Positioning</span>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            label="Position X (%)"
                            variant="compact"
                            type="number"
                            value={String(selectedField.position_x ?? 5)}
                            onChange={e =>
                              updateFieldProperty(selectedField.field_id, {
                                position_x: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                          <Input
                            label="Position Y (%)"
                            variant="compact"
                            type="number"
                            value={String(selectedField.position_y ?? 5)}
                            onChange={e =>
                              updateFieldProperty(selectedField.field_id, {
                                position_y: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            label="Width (%)"
                            variant="compact"
                            type="number"
                            value={String(selectedField.width_percent ?? 50)}
                            onChange={e =>
                              updateFieldProperty(selectedField.field_id, {
                                width_percent: Math.max(1, Math.min(100, parseInt(e.target.value) || 50))
                              })
                            }
                          />
                          <Input
                            label="Height (px)"
                            variant="compact"
                            type="number"
                            value={String(selectedField.height_px || '')}
                            placeholder="Auto"
                            onChange={e =>
                              updateFieldProperty(selectedField.field_id, {
                                height_px: e.target.value ? Math.max(10, Math.min(2000, parseInt(e.target.value) || 0)) : undefined
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <Input
                            label="Margin L (px)"
                            variant="compact"
                            type="number"
                            value={String(selectedField.margin_left ?? 0)}
                            onChange={e =>
                              updateFieldProperty(selectedField.field_id, {
                                margin_left: Math.max(0, Math.min(500, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                          <Input
                            label="Margin R (px)"
                            variant="compact"
                            type="number"
                            value={String(selectedField.margin_right ?? 0)}
                            onChange={e =>
                              updateFieldProperty(selectedField.field_id, {
                                margin_right: Math.max(0, Math.min(500, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                          <Input
                            label="Margin T (px)"
                            variant="compact"
                            type="number"
                            value={String(selectedField.margin_top ?? 0)}
                            onChange={e =>
                              updateFieldProperty(selectedField.field_id, {
                                margin_top: Math.max(0, Math.min(500, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            label="Font Weight"
                            variant="compact"
                            value={selectedField.font_weight || 'normal'}
                            onChange={e =>
                              updateFieldProperty(selectedField.field_id, {
                                font_weight: e.target.value
                              })
                            }
                            options={[
                              { value: 'normal', label: 'Normal' },
                              { value: 'semibold', label: 'Semibold' },
                              { value: 'bold', label: 'Bold' }
                            ]}
                          />
                          <Input
                            label="Custom CSS"
                            variant="compact"
                            value={selectedField.custom_css || ''}
                            onChange={e => updateFieldProperty(selectedField.field_id, { custom_css: e.target.value })}
                            placeholder="e.g. border-radius: 4px;"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        label="Width"
                        variant="compact"
                        value={String(selectedField.width_percent || (selectedField.section_name === 'Invoice Information' ? 33 : selectedField.section_name === 'Customer Information' ? 50 : 100))}
                        onChange={e =>
                          updateFieldProperty(selectedField.field_id, {
                            width_percent: parseInt(e.target.value)
                          })
                        }
                        options={[
                          { value: '100', label: 'Full (100%)' },
                          { value: '50', label: 'Half (50%)' },
                          { value: '33', label: 'One-Third (33%)' },
                          { value: '25', label: 'One-Quarter (25%)' }
                        ]}
                      />
                      <div className="flex items-center pt-5">
                        <Toggle
                          checked={!!selectedField.is_bold}
                          onChange={val => updateFieldProperty(selectedField.field_id, { is_bold: val })}
                          label="Bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Font Size (px)"
                        variant="compact"
                        type="number"
                        value={String(selectedField.font_size || 10)}
                        onChange={e =>
                          updateFieldProperty(selectedField.field_id, {
                            font_size: Math.max(6, Math.min(32, parseInt(e.target.value) || 10))
                          })
                        }
                      />
                      <Input
                        label="Spacing Below (px)"
                        variant="compact"
                        type="number"
                        value={String(selectedField.margin_bottom || 0)}
                        onChange={e =>
                          updateFieldProperty(selectedField.field_id, {
                            margin_bottom: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                          })
                        }
                      />
                      <Select
                        label="Alignment"
                        variant="compact"
                        value={selectedField.alignment || 'left'}
                        onChange={e =>
                          updateFieldProperty(selectedField.field_id, {
                            alignment: e.target.value as any
                          })
                        }
                        options={[
                          { value: 'left', label: 'Left' },
                          { value: 'center', label: 'Center' },
                          { value: 'right', label: 'Right' }
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="General Text Color"
                        variant="compact"
                        value={selectedField.color || ''}
                        onChange={e => updateFieldProperty(selectedField.field_id, { color: e.target.value })}
                        placeholder="#000000"
                      />
                      <Input
                        label="Background"
                        variant="compact"
                        value={selectedField.background || ''}
                        onChange={e => updateFieldProperty(selectedField.field_id, { background: e.target.value })}
                        placeholder="transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <div className="flex items-center pt-2">
                        <Toggle
                          checked={selectedField.label_is_bold !== undefined ? !!selectedField.label_is_bold : !!selectedField.is_bold}
                          onChange={val => updateFieldProperty(selectedField.field_id, { label_is_bold: val })}
                          label="Label Bold"
                        />
                      </div>
                      <Input
                        label="Label Color"
                        variant="compact"
                        value={selectedField.label_color || ''}
                        onChange={e => updateFieldProperty(selectedField.field_id, { label_color: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center pt-2">
                        <Toggle
                          checked={selectedField.value_is_bold !== undefined ? !!selectedField.value_is_bold : !!selectedField.is_bold}
                          onChange={val => updateFieldProperty(selectedField.field_id, { value_is_bold: val })}
                          label="Value Bold"
                        />
                      </div>
                      <Input
                        label="Value Color"
                        variant="compact"
                        value={selectedField.value_color || ''}
                        onChange={e => updateFieldProperty(selectedField.field_id, { value_color: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <Select
                        label="Border Preset"
                        variant="compact"
                        value={selectedField.border || 'none'}
                        onChange={e => updateFieldProperty(selectedField.field_id, { border: e.target.value })}
                        options={[
                          { value: 'none', label: 'None' },
                          { value: '1px solid #cbd5e1', label: 'Light Solid' },
                          { value: '1px solid #475569', label: 'Slate Solid' },
                          { value: '1px solid #000000', label: 'Black Solid' },
                          { value: '1px dashed #cbd5e1', label: 'Light Dashed' },
                          { value: 'bottom-light', label: 'Bottom Border (Light)' },
                          { value: 'bottom-slate', label: 'Bottom Border (Slate)' },
                          { value: 'bottom-black', label: 'Bottom Border (Black)' },
                        ]}
                      />
                      <Input
                        label="Custom Border CSS"
                        variant="compact"
                        value={selectedField.border || ''}
                        onChange={e => updateFieldProperty(selectedField.field_id, { border: e.target.value })}
                        placeholder="e.g. 1px solid black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Padding"
                        variant="compact"
                        value={selectedField.padding || ''}
                        onChange={e => updateFieldProperty(selectedField.field_id, { padding: e.target.value })}
                        placeholder="0px"
                      />
                    </div>

                    {/* Layout Positioning */}
                    <div className="border border-slate-100 p-2 rounded bg-slate-50 space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block border-b pb-0.5">Layout positioning</span>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Height (px)"
                          variant="compact"
                          type="number"
                          value={String(selectedField.height_px || '')}
                          placeholder="Auto"
                          onChange={e =>
                            updateFieldProperty(selectedField.field_id, {
                              height_px: e.target.value ? Math.max(10, Math.min(2000, parseInt(e.target.value) || 0)) : undefined
                            })
                          }
                        />
                        <Input
                          label="Display Order"
                          variant="compact"
                          type="number"
                          value={String(selectedField.display_order || '')}
                          onChange={e =>
                            updateFieldProperty(selectedField.field_id, {
                              display_order: parseInt(e.target.value) || 1
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Row Position"
                          variant="compact"
                          type="number"
                          value={String(selectedField.row_position ?? 1)}
                          onChange={e =>
                            updateFieldProperty(selectedField.field_id, {
                              row_position: parseInt(e.target.value) || 1
                            })
                          }
                        />
                        <Input
                          label="Col Position"
                          variant="compact"
                          type="number"
                          value={String(selectedField.column_position ?? 1)}
                          onChange={e =>
                            updateFieldProperty(selectedField.field_id, {
                              column_position: parseInt(e.target.value) || 1
                            })
                          }
                        />
                      </div>
                      {activeTemplate.layout_mode === 'free' && (
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t">
                          <Input
                            label="Position X (%)"
                            variant="compact"
                            type="number"
                            value={String(selectedField.position_x ?? 5)}
                            onChange={e =>
                              updateFieldProperty(selectedField.field_id, {
                                position_x: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                          <Input
                            label="Position Y (%)"
                            variant="compact"
                            type="number"
                            value={String(selectedField.position_y ?? 5)}
                            onChange={e =>
                              updateFieldProperty(selectedField.field_id, {
                                position_y: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : selectedCustomField ? (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3 shadow-3xs">
                    <h4 className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 pb-1 border-b">
                      <Pencil className="w-3.5 h-3.5 text-slate-400" />
                      Custom Field: {selectedCustomField.field_name}
                    </h4>

                    <Input
                      label="Field Label"
                      variant="compact"
                      value={selectedCustomField.field_name}
                      onChange={e => updateCustomFieldProperty(selectedCustomField.custom_field_id, { field_name: e.target.value })}
                    />

                    {/* Show/Hide */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-650 font-bold">Field Visibility</span>
                      <Toggle
                        checked={selectedCustomField.is_visible}
                        onChange={val => updateCustomFieldProperty(selectedCustomField.custom_field_id, { is_visible: val })}
                        label="Visible"
                      />
                    </div>

                    {/* Grid Positioning */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <Input
                        label="Row Position"
                        variant="compact"
                        type="number"
                        min="1"
                        max="20"
                        value={String(selectedCustomField.row_position || 1)}
                        onChange={e => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          updateFieldRowPosition(selectedCustomField.custom_field_id, 'custom', val);
                        }}
                      />
                      <Input
                        label="Column Position"
                        variant="compact"
                        type="number"
                        min="1"
                        max="12"
                        value={String(selectedCustomField.column_position || 1)}
                        onChange={e => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          updateFieldColumnPosition(selectedCustomField.custom_field_id, 'custom', val);
                        }}
                      />
                    </div>

                    {selectedCustomField.field_type === 'formula' && selectedCustomField.formula_tokens && (
                      <div className="space-y-1">
                        <span className="text-[11.5px] text-slate-600 font-semibold block">Formula</span>
                        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 px-2 py-1.5 text-[10.5px] font-mono flex flex-wrap gap-1 leading-normal">
                          {selectedCustomField.formula_tokens.map((tok, i) => (
                            <span key={i} className={`rounded px-1 py-0.5 font-bold ${
                              tok.type === 'field'    ? 'bg-indigo-100 text-indigo-800' :
                              tok.type === 'operator' ? 'bg-amber-100 text-amber-700' :
                                                       'bg-green-100 text-green-700'
                            }`}>
                              {tok.type === 'field' ? tok.fieldLabel : tok.type === 'operator' ? tok.operator : tok.constant}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-650 font-bold">Field Visibility</span>
                      <Toggle
                        checked={selectedCustomField.is_visible}
                        onChange={val => updateCustomFieldProperty(selectedCustomField.custom_field_id, { is_visible: val })}
                      />
                    </div>

                    {activeTemplate.layout_mode === 'free' && (
                      <div className="border border-slate-100 p-2.5 rounded-lg bg-slate-50 space-y-2.5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block border-b pb-0.5">Canvas Positioning</span>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            label="Position X (%)"
                            variant="compact"
                            type="number"
                            value={String(selectedCustomField.position_x ?? 10)}
                            onChange={e =>
                              updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                                position_x: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                          <Input
                            label="Position Y (%)"
                            variant="compact"
                            type="number"
                            value={String(selectedCustomField.position_y ?? 60)}
                            onChange={e =>
                              updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                                position_y: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            label="Width (%)"
                            variant="compact"
                            type="number"
                            value={String(selectedCustomField.width_percent ?? 50)}
                            onChange={e =>
                              updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                                width_percent: Math.max(1, Math.min(100, parseInt(e.target.value) || 50))
                              })
                            }
                          />
                          <Input
                            label="Height (px)"
                            variant="compact"
                            type="number"
                            value={String(selectedCustomField.height_px || '')}
                            placeholder="Auto"
                            onChange={e =>
                              updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                                height_px: e.target.value ? Math.max(10, Math.min(2000, parseInt(e.target.value) || 0)) : undefined
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          <Input
                            label="Margin L (px)"
                            variant="compact"
                            type="number"
                            value={String(selectedCustomField.margin_left ?? 0)}
                            onChange={e =>
                              updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                                margin_left: Math.max(0, Math.min(500, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                          <Input
                            label="Margin R (px)"
                            variant="compact"
                            type="number"
                            value={String(selectedCustomField.margin_right ?? 0)}
                            onChange={e =>
                              updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                                margin_right: Math.max(0, Math.min(500, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                          <Input
                            label="Margin T (px)"
                            variant="compact"
                            type="number"
                            value={String(selectedCustomField.margin_top ?? 0)}
                            onChange={e =>
                              updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                                margin_top: Math.max(0, Math.min(500, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            label="Font Weight"
                            variant="compact"
                            value={selectedCustomField.font_weight || 'normal'}
                            onChange={e =>
                              updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                                font_weight: e.target.value
                              })
                            }
                            options={[
                              { value: 'normal', label: 'Normal' },
                              { value: 'semibold', label: 'Semibold' },
                              { value: 'bold', label: 'Bold' }
                            ]}
                          />
                          <Input
                            label="Custom CSS"
                            variant="compact"
                            value={selectedCustomField.custom_css || ''}
                            onChange={e => updateCustomFieldProperty(selectedCustomField.custom_field_id, { custom_css: e.target.value })}
                            placeholder="e.g. border-radius: 4px;"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        label="Width"
                        variant="compact"
                        value={String(selectedCustomField.width_percent || 50)}
                        onChange={e =>
                          updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                            width_percent: parseInt(e.target.value)
                          })
                        }
                        options={[
                          { value: '100', label: 'Full (100%)' },
                          { value: '50', label: 'Half (50%)' },
                          { value: '33', label: 'One-Third (33%)' },
                          { value: '25', label: 'One-Quarter (25%)' }
                        ]}
                      />
                      <div className="flex items-center pt-5">
                        <Toggle
                          checked={!!selectedCustomField.is_bold}
                          onChange={val => updateCustomFieldProperty(selectedCustomField.custom_field_id, { is_bold: val })}
                          label="Bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Font Size (px)"
                        variant="compact"
                        type="number"
                        value={String(selectedCustomField.font_size || 10)}
                        onChange={e =>
                          updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                            font_size: Math.max(6, Math.min(32, parseInt(e.target.value) || 10))
                          })
                        }
                      />
                      <Input
                        label="Spacing Below (px)"
                        variant="compact"
                        type="number"
                        value={String(selectedCustomField.margin_bottom || 0)}
                        onChange={e =>
                          updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                            margin_bottom: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                          })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        label="Alignment"
                        variant="compact"
                        value={selectedCustomField.alignment || 'left'}
                        onChange={e =>
                          updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                            alignment: e.target.value as any
                          })
                        }
                        options={[
                          { value: 'left', label: 'Left' },
                          { value: 'center', label: 'Center' },
                          { value: 'right', label: 'Right' }
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="General Text Color"
                        variant="compact"
                        value={selectedCustomField.color || ''}
                        onChange={e => updateCustomFieldProperty(selectedCustomField.custom_field_id, { color: e.target.value })}
                        placeholder="#000000"
                      />
                      <Input
                        label="Background"
                        variant="compact"
                        value={selectedCustomField.background || ''}
                        onChange={e => updateCustomFieldProperty(selectedCustomField.custom_field_id, { background: e.target.value })}
                        placeholder="transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <div className="flex items-center pt-2">
                        <Toggle
                          checked={selectedCustomField.label_is_bold !== undefined ? !!selectedCustomField.label_is_bold : !!selectedCustomField.is_bold}
                          onChange={val => updateCustomFieldProperty(selectedCustomField.custom_field_id, { label_is_bold: val })}
                          label="Label Bold"
                        />
                      </div>
                      <Input
                        label="Label Color"
                        variant="compact"
                        value={selectedCustomField.label_color || ''}
                        onChange={e => updateCustomFieldProperty(selectedCustomField.custom_field_id, { label_color: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center pt-2">
                        <Toggle
                          checked={selectedCustomField.value_is_bold !== undefined ? !!selectedCustomField.value_is_bold : !!selectedCustomField.is_bold}
                          onChange={val => updateCustomFieldProperty(selectedCustomField.custom_field_id, { value_is_bold: val })}
                          label="Value Bold"
                        />
                      </div>
                      <Input
                        label="Value Color"
                        variant="compact"
                        value={selectedCustomField.value_color || ''}
                        onChange={e => updateCustomFieldProperty(selectedCustomField.custom_field_id, { value_color: e.target.value })}
                        placeholder="#000000"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <Select
                        label="Border Preset"
                        variant="compact"
                        value={selectedCustomField.border || 'none'}
                        onChange={e => updateCustomFieldProperty(selectedCustomField.custom_field_id, { border: e.target.value })}
                        options={[
                          { value: 'none', label: 'None' },
                          { value: '1px solid #cbd5e1', label: 'Light Solid' },
                          { value: '1px solid #475569', label: 'Slate Solid' },
                          { value: '1px solid #000000', label: 'Black Solid' },
                          { value: '1px dashed #cbd5e1', label: 'Light Dashed' },
                          { value: 'bottom-light', label: 'Bottom Border (Light)' },
                          { value: 'bottom-slate', label: 'Bottom Border (Slate)' },
                          { value: 'bottom-black', label: 'Bottom Border (Black)' },
                        ]}
                      />
                      <Input
                        label="Custom Border CSS"
                        variant="compact"
                        value={selectedCustomField.border || ''}
                        onChange={e => updateCustomFieldProperty(selectedCustomField.custom_field_id, { border: e.target.value })}
                        placeholder="e.g. 1px solid black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Padding"
                        variant="compact"
                        value={selectedCustomField.padding || ''}
                        onChange={e => updateCustomFieldProperty(selectedCustomField.custom_field_id, { padding: e.target.value })}
                        placeholder="0px"
                      />
                    </div>

                    {/* Layout Positioning */}
                    <div className="border border-slate-100 p-2 rounded bg-slate-50 space-y-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block border-b pb-0.5">Layout positioning</span>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Height (px)"
                          variant="compact"
                          type="number"
                          value={String(selectedCustomField.height_px || '')}
                          placeholder="Auto"
                          onChange={e =>
                            updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                              height_px: e.target.value ? Math.max(10, Math.min(2000, parseInt(e.target.value) || 0)) : undefined
                            })
                          }
                        />
                        <Input
                          label="Display Order"
                          variant="compact"
                          type="number"
                          value={String(selectedCustomField.display_order || '')}
                          onChange={e =>
                            updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                              display_order: parseInt(e.target.value) || 1
                            })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          label="Row Position"
                          variant="compact"
                          type="number"
                          value={String(selectedCustomField.row_position ?? 1)}
                          onChange={e =>
                            updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                              row_position: parseInt(e.target.value) || 1
                            })
                          }
                        />
                        <Input
                          label="Col Position"
                          variant="compact"
                          type="number"
                          value={String(selectedCustomField.column_position ?? 1)}
                          onChange={e =>
                            updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                              column_position: parseInt(e.target.value) || 1
                            })
                          }
                        />
                      </div>
                      {activeTemplate.layout_mode === 'free' && (
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t">
                          <Input
                            label="Position X (%)"
                            variant="compact"
                            type="number"
                            value={String(selectedCustomField.position_x ?? 10)}
                            onChange={e =>
                              updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                                position_x: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                          <Input
                            label="Position Y (%)"
                            variant="compact"
                            type="number"
                            value={String(selectedCustomField.position_y ?? 60)}
                            onChange={e =>
                              updateCustomFieldProperty(selectedCustomField.custom_field_id, {
                                position_y: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
                              })
                            }
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="danger"
                        size="sm"
                        fullWidth
                        icon={Trash2}
                        onClick={() => {
                          handleRemoveCustomField(selectedCustomField.custom_field_id);
                          setSelectedCustomFieldId(null);
                        }}
                      >
                        Delete Custom Field
                      </Button>
                    </div>
                  </div>
                ) : selectedColumn ? (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-3 shadow-3xs">
                    <h4 className="text-[11px] font-black text-slate-700 flex items-center gap-1.5 pb-1 border-b">
                      <Pencil className="w-3.5 h-3.5 text-slate-400" />
                      Column: {selectedColumn.column_name}
                    </h4>

                    <Input
                      label="Column Label"
                      variant="compact"
                      value={selectedColumn.custom_label || selectedColumn.column_name}
                      onChange={e => updateColumnProperty(selectedColumn.column_id, { custom_label: e.target.value })}
                    />

                    <Input
                      label="Width"
                      variant="compact"
                      value={selectedColumn.width || ''}
                      onChange={e => updateColumnProperty(selectedColumn.column_id, { width: e.target.value })}
                      placeholder="e.g. 10%, 120px"
                    />

                    <Select
                      label="Alignment"
                      variant="compact"
                      value={selectedColumn.alignment || 'left'}
                      onChange={e =>
                        updateColumnProperty(selectedColumn.column_id, {
                          alignment: e.target.value as any
                        })
                      }
                      options={[
                        { value: 'left', label: 'Left' },
                        { value: 'center', label: 'Center' },
                        { value: 'right', label: 'Right' }
                      ]}
                    />

                    {selectedColumn.is_custom && selectedColumn.formula_tokens && (
                      <div className="space-y-1">
                        <span className="text-[11.5px] text-slate-600 font-semibold block">Formula</span>
                        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 px-2 py-1.5 text-[10.5px] font-mono flex flex-wrap gap-1 leading-normal">
                          {selectedColumn.formula_tokens.map((tok, i) => (
                            <span key={i} className={`rounded px-1 py-0.5 font-bold ${
                              tok.type === 'field'    ? 'bg-indigo-100 text-indigo-800' :
                              tok.type === 'operator' ? 'bg-amber-100 text-amber-700' :
                                                       'bg-green-100 text-green-700'
                            }`}>
                              {tok.type === 'field' ? tok.fieldLabel : tok.type === 'operator' ? tok.operator : tok.constant}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-650 font-bold">Column Visibility</span>
                      <Toggle
                        checked={selectedColumn.is_visible}
                        onChange={val => updateColumnProperty(selectedColumn.column_id, { is_visible: val })}
                      />
                    </div>

                    {selectedColumn.is_custom && (
                      <div className="pt-2">
                        <Button
                          variant="danger"
                          size="sm"
                          fullWidth
                          icon={Trash2}
                          onClick={() => {
                            handleRemoveCustomColumn(selectedColumn.column_id);
                            setSelectedColumnId(null);
                          }}
                        >
                          Delete Column
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed rounded-lg border-slate-200 bg-white">
                    <p className="text-[10px] text-slate-400">
                      Select a field or column in the builder to customize styling & layout.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          {/* 2. Center Panel: Live print-like Preview Canvas */}
          <div className="col-span-12 h-[650px] border border-[#E2E8F0] bg-slate-100 rounded-xl p-4 flex flex-col justify-between overflow-hidden relative">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-slate-500 px-1 border-b pb-1 select-none">
              <span>Live Print Preview</span>
              <span>100% Visual Consistency</span>
            </div>
            {/* Conditional Layout Engine */}
            {activeTemplate.layout_mode === 'free' ? (
              <div
                ref={containerRefCallback}
                className="flex-grow bg-slate-100 overflow-y-auto overflow-x-hidden relative p-4 flex flex-col items-center custom-scrollbar rounded-lg"
              >
                <div
                  ref={canvasRef}
                  className="bg-white shadow-lg border border-slate-350 relative transition-all"
                  style={{
                    width: `${targetWidth}px`,
                    height: `${targetHeight}px`,
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top center',
                    marginBottom: `${(previewScale - 1) * targetHeight}px`,
                    flexShrink: 0,
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (!draggedElement || !canvasRef.current) return;
                    const rect = canvasRef.current.getBoundingClientRect();
                    const dropX = Math.round(Math.max(0, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100)));
                    const dropY = Math.round(Math.max(0, Math.min(90, ((e.clientY - rect.top) / rect.height) * 100)));
                    if (draggedElement.type === 'default') {
                      updateFieldProperty(draggedElement.id, { is_visible: true, position_x: dropX, position_y: dropY });
                    } else {
                      updateCustomFieldProperty(draggedElement.id, { is_visible: true, position_x: dropX, position_y: dropY });
                    }
                    setDraggedElement(null);
                  }}
                >
                    {activeFields
                      .filter(f => f.is_visible)
                      .map(f => {
                        const isSelected = selectedFieldId === f.field_id;
                        const isEditingLabel = editingLabelId === f.field_id;
                        
                        let elementContent = null;
                        
                        if (f.field_name === 'Company Logo') {
                          elementContent = activeTemplate.logo_url ? (
                            <img
                              src={activeTemplate.logo_url}
                              alt="Logo"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full border border-dashed rounded flex items-center justify-center bg-slate-50 text-[8px] text-slate-400">
                              Upload Logo
                            </div>
                          );
                        } else if (f.field_name === 'Item Table') {
                          const visibleCols = activeColumns.filter(c => c.is_visible);
                          elementContent = (
                            <div className="border rounded bg-white overflow-hidden w-full h-full text-[8px] flex flex-col justify-between">
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-50 border-b text-[7px] font-bold text-slate-500">
                                    {visibleCols.map(col => (
                                      <th
                                        key={col.column_id}
                                        draggable
                                        onDragStart={(e) => {
                                          e.stopPropagation();
                                          handleColumnDragStart(e, col.column_id);
                                        }}
                                        onDragOver={handleColumnDragOver}
                                        onDrop={(e) => {
                                          e.stopPropagation();
                                          handleColumnDrop(e, col.column_id);
                                        }}
                                        className="py-1 px-1.5 font-black text-slate-700 cursor-grab active:cursor-grabbing hover:bg-slate-100 transition-colors"
                                        style={{ width: col.width, textAlign: col.alignment || 'left' }}
                                      >
                                        {col.custom_label || col.column_name}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b text-slate-600 text-[7px]">
                                    {visibleCols.map(col => {
                                      let val = '-';
                                      if (col.column_name === 'Sr No') val = '1';
                                      else if (col.column_name === 'Product Code') val = 'BC-001';
                                      else if (col.column_name === 'Product Name') val = 'Sample Product';
                                      else if (col.column_name === 'Description') val = 'Deliverables';
                                      else if (col.column_name === 'Quantity' || col.column_name === 'Qty') val = '1.00';
                                      else if (col.column_name === 'Rate' || col.column_name === 'Unit Price') val = '8,450.00';
                                      else if (col.column_name === 'Discount') val = '0.00';
                                      else if (col.column_name === 'Tax') val = '1,352.00';
                                      else if (col.column_name === 'Amount') val = '9,802.00';
                                      else if (col.is_custom && col.formula_tokens && col.formula_tokens.length > 0) {
                                        try {
                                          const fieldMap: Record<string, number> = {
                                            'quantity': dummyContext.row.quantity,
                                            'price': dummyContext.row.price,
                                            'rate': dummyContext.row.price,
                                            'line_total': dummyContext.row.quantity * dummyContext.row.price,
                                            'discount': dummyContext.row.discount,
                                            'tax': dummyContext.row.tax,
                                            'further_tax': dummyContext.row.furtherTax,
                                            'subtotal': dummyContext.totals.subtotal,
                                            'tax_amount': dummyContext.totals.tax_amount,
                                            'discount_amount': dummyContext.totals.discount_amount,
                                            'grand_total': dummyContext.totals.grand_total,
                                            'paid_amount': dummyContext.totals.paid_amount,
                                            'balance_due': dummyContext.totals.balance_due,
                                          };
                                          let result = 0;
                                          let pendingOp = '+';
                                          for (const tok of col.formula_tokens) {
                                            let num = 0;
                                            if (tok.type === 'field') num = fieldMap[tok.fieldKey as string] ?? 0;
                                            else if (tok.type === 'constant') num = parseFloat(String(tok.constant ?? '0')) || 0;
                                            else if (tok.type === 'operator') { pendingOp = tok.operator ?? '+'; continue; }
                                            if (pendingOp === '+') result += num;
                                            else if (pendingOp === '-') result -= num;
                                            else if (pendingOp === '*') result *= num;
                                            else if (pendingOp === '/') result = num !== 0 ? result / num : 0;
                                          }
                                          val = result.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                        } catch { val = '0.00'; }
                                      }
                                      return (
                                        <td key={col.column_id} className="py-1 px-1.5" style={{ textAlign: col.alignment || 'left' }}>
                                          {val}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          );
                        } else if (f.field_name === 'QR Code') {
                          elementContent = (
                            <div className="w-10 h-10 border p-0.5 rounded bg-white flex items-center justify-center">
                              <svg className="w-full h-full text-slate-800" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-2 2h2v2-2v-2zm2 2h3v3h-3v-3zm-2 2h2v2-2v-2zm4-4h2v4h-2v-4zm0 6h2v1h-2v-1z" />
                              </svg>
                            </div>
                          );
                        } else if (f.field_name === 'Barcode') {
                          elementContent = (
                            <svg className="h-6 w-full text-slate-800" viewBox="0 0 100 20" preserveAspectRatio="none">
                              <rect width="100" height="20" fill="white"/>
                              <rect x="5" y="2" width="2" height="16" fill="currentColor"/>
                              <rect x="10" y="2" width="4" height="16" fill="currentColor"/>
                              <rect x="16" y="2" width="1" height="16" fill="currentColor"/>
                              <rect x="20" y="2" width="3" height="16" fill="currentColor"/>
                              <rect x="25" y="2" width="5" height="16" fill="currentColor"/>
                              <rect x="32" y="2" width="2" height="16" fill="currentColor"/>
                              <rect x="36" y="2" width="1" height="16" fill="currentColor"/>
                              <rect x="40" y="2" width="4" height="16" fill="currentColor"/>
                              <rect x="48" y="2" width="2" height="16" fill="currentColor"/>
                              <rect x="52" y="2" width="3" height="16" fill="currentColor"/>
                              <rect x="58" y="2" width="5" height="16" fill="currentColor"/>
                            </svg>
                          );
                        } else if (f.field_name === 'FBR Logo') {
                          elementContent = (
                            <div className="flex items-center gap-1 bg-emerald-50/70 border border-emerald-200 rounded px-1.5 py-0.5 text-[8px] font-bold text-emerald-800">
                              <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                <path d="M2 12h20" />
                              </svg>
                              <div className="flex flex-col text-left leading-[1.1]">
                                <span>FBR</span>
                                <span className="text-[5px] text-emerald-500 font-medium font-sans">Pakistan</span>
                              </div>
                            </div>
                          );
                        } else if (f.field_name === 'Company Stamp') {
                          elementContent = (
                            <div className="w-18 h-9 border border-dashed border-slate-355 rounded-full flex flex-col items-center justify-center opacity-65 select-none bg-slate-50/50">
                              <span className="text-[5px] font-bold text-slate-455">Company Stamp</span>
                              <span className="text-[4px] text-slate-355">Seal Here</span>
                            </div>
                          );
                        } else if (f.field_name === 'Signature') {
                          elementContent = (
                            <div className="w-full text-center">
                              <div className="border-b border-slate-350 w-full h-3" />
                              {isEditingLabel ? (
                                <input
                                  type="text"
                                  value={editingLabelText}
                                  onChange={e => setEditingLabelText(e.target.value)}
                                  onBlur={handleSaveInlineLabel}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveInlineLabel();
                                  }}
                                  className="w-full text-[9px] border p-0.5 rounded outline-none mt-0.5 text-center"
                                  autoFocus
                                  onClick={e => e.stopPropagation()}
                                />
                              ) : (
                                <span 
                                  className="text-[7px] text-slate-400 block mt-0.5 cursor-pointer hover:bg-slate-50 rounded px-1"
                                  onDoubleClick={(e) => handleDoubleClick(e, f.field_id, f.custom_label || 'Seller Signature')}
                                >
                                  {f.custom_label || 'Seller Signature'}
                                </span>
                              )}
                            </div>
                          );
                        } else if (['Subtotal', 'Grand Total', 'Balance Due', 'Tax Amount', 'Discount Amount', 'Shipping Charges', 'Round Off', 'Received Amount'].includes(f.field_name)) {
                          const isSpaceBetween = !f.alignment || f.alignment === 'left';
                          elementContent = (
                            <div className="flex w-full items-center" style={{ justifyContent: isSpaceBetween ? 'space-between' : f.alignment === 'center' ? 'center' : 'flex-end', gap: '8px' }}>
                              {isEditingLabel ? (
                                <input
                                  type="text"
                                  value={editingLabelText}
                                  onChange={e => setEditingLabelText(e.target.value)}
                                  onBlur={handleSaveInlineLabel}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveInlineLabel();
                                  }}
                                  className="w-[60%] text-[9px] border p-0.5 rounded outline-none"
                                  autoFocus
                                  onClick={e => e.stopPropagation()}
                                />
                              ) : (
                                <span 
                                  className="text-slate-400 font-bold mr-1 cursor-pointer hover:bg-slate-50 rounded px-1"
                                  onDoubleClick={(e) => handleDoubleClick(e, f.field_id, f.custom_label || f.field_name)}
                                  style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal' }}
                                >
                                  {f.custom_label || f.field_name}:
                                </span>
                              )}
                              <span className="font-extrabold" style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal' }}>{f.field_name === 'Balance Due' || f.field_name === 'Grand Total' || f.field_name === 'Subtotal' ? '8,450.00' : '0.00'}</span>
                            </div>
                          );
                        } else {
                          const sampleVal = 
                            f.field_name === 'Company Name' ? 'Antigravity Studio' :
                            f.field_name === 'Company Address' ? '452 Innovation Blvd, San Francisco, CA' :
                            f.field_name === 'Phone' ? '+1 (555) 012-3456' :
                            f.field_name === 'Email' ? 'contact@antigravity.studio' :
                            f.field_name === 'Website' ? 'www.antigravity.studio' :
                            f.field_name === 'NTN' ? '1234567-8' :
                            f.field_name === 'STRN' || f.field_name === 'STN' || f.field_name === 'STN / STRN' ? '03-00-1234-567-89' :
                            f.field_name === 'Customer Name' ? 'BlueRitt Technologies' :
                            f.field_name === 'Customer Address' ? 'House 42, Street 5, Karachi, PK' :
                            f.field_name === 'Mobile' ? '0300-1234567' :
                            f.field_name === 'Customer NTN' ? '9876543-2' :
                            f.field_name === 'Customer STRN' ? '03-09-9999-001-22' :
                            f.field_name === 'Customer CNIC' ? '42201-1234567-1' :
                            f.field_name === 'Customer Code' ? 'CUST-9928' :
                            f.field_name === 'Customer Email' ? 'billing@blueritt.com' :
                            f.field_name === 'Invoice Number' ? 'SI-000248' :
                            f.field_name === 'Date' || f.field_name === 'Invoice Date' ? '2026-06-11' :
                            f.field_name === 'Due Date' ? '2026-07-11' :
                            f.field_name === 'Sales Person' ? 'Ahmed Raza' :
                            f.field_name === 'Reference Number' ? 'REF-992' :
                            f.field_name === 'Warehouse' ? 'Lahore Central' :
                            f.field_name === 'Payment Terms' ? 'Net 30' :
                            f.field_name === 'FBR Invoice Number' ? 'FBR-INV-1092837' :
                            f.field_name === 'Prepared By' ? 'Aman Khan' :
                            f.field_name === 'Received By' ? 'Manager' :
                            f.field_name === 'Remarks' ? 'Remarks details go here.' :
                            f.field_name === 'Terms & Conditions' ? 'Standard terms apply.' : 
                            f.field_name === 'Notes' ? 'Goods once sold are non-refundable.' : 'Sample Value';
                          
                          elementContent = (
                            <div className="w-full flex" style={{ justifyContent: f.alignment === 'center' ? 'center' : f.alignment === 'right' ? 'flex-end' : 'flex-start' }}>
                              {isEditingLabel ? (
                                <input
                                  type="text"
                                  value={editingLabelText}
                                  onChange={e => setEditingLabelText(e.target.value)}
                                  onBlur={handleSaveInlineLabel}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveInlineLabel();
                                  }}
                                  className="w-full text-[9px] border p-0.5 rounded outline-none"
                                  autoFocus
                                  onClick={e => e.stopPropagation()}
                                />
                              ) : (
                                <div className="inline-flex items-center flex-wrap" onDoubleClick={(e) => handleDoubleClick(e, f.field_id, f.custom_label || f.field_name)}>
                                  <strong className="text-slate-400 mr-1" style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal' }}>{f.custom_label || f.field_name}: </strong>
                                  <span className="text-slate-700" style={{ color: f.color || undefined, fontWeight: f.is_bold ? 'bold' : 'normal' }}>{sampleVal}</span>
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div
                            key={f.field_id}
                            style={{
                              position: 'absolute',
                              left: `${f.position_x ?? 5}%`,
                              top: `${f.position_y ?? 5}%`,
                              width: f.width_percent ? `${f.width_percent}%` : 'auto',
                              height: f.height_px ? `${f.height_px}px` : 'auto',
                              fontSize: f.font_size ? `${f.font_size}px` : '10px',
                              fontWeight: f.font_weight === 'bold' || f.is_bold ? 'bold' : f.font_weight === 'semibold' ? '600' : 'normal',
                              color: f.color || '#1e293b',
                              background: isSelected ? `${brand.primary}10` : (f.background || 'transparent'),
                              border: f.border || 'none',
                              padding: f.padding || '2px',
                              marginTop: f.margin_top ? `${f.margin_top}px` : undefined,
                              marginBottom: f.margin_bottom ? `${f.margin_bottom}px` : undefined,
                              textAlign: f.alignment || 'left',
                              cursor: 'move',
                              zIndex: isSelected ? 50 : 10,
                              outline: isSelected ? `2px dashed ${brand.primary}` : '1px dashed transparent',
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: f.alignment === 'center' ? 'center' : f.alignment === 'right' ? 'flex-end' : 'flex-start',
                              ...parseCustomCss(f.custom_css)
                            }}
                            className="hover:outline-blue-300 rounded group select-none relative"
                            onMouseDown={(e) => handleMouseDown(e, f.field_id, 'default', f.position_x ?? 5, f.position_y ?? 5)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFieldId(f.field_id);
                              setSelectedColumnId(null);
                              setSelectedCustomFieldId(null);
                            }}
                          >
                            {elementContent}
                            {isSelected && (
                              <div
                                className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize z-50 rounded-tl border-t border-l"
                                style={{
                                  backgroundColor: brand.primary,
                                  borderColor: 'white'
                                }}
                                onMouseDown={(e) => handleResizeMouseDown(e, f.field_id, 'default', f.width_percent ?? 50, f.height_px, e.currentTarget.parentElement)}
                              />
                            )}
                          </div>
                        );
                      })}

                    {/* Render Custom Fields in Free Layout */}
                    {activeCustomFields
                      .filter(cf => cf.is_visible)
                      .map(cf => {
                        const isSelected = selectedCustomFieldId === cf.custom_field_id;
                        const isEditingLabel = editingLabelId === cf.custom_field_id;

                        return (
                          <div
                            key={cf.custom_field_id}
                            style={{
                              position: 'absolute',
                              left: `${cf.position_x ?? 10}%`,
                              top: `${cf.position_y ?? 60}%`,
                              width: cf.width_percent ? `${cf.width_percent}%` : 'auto',
                              height: cf.height_px ? `${cf.height_px}px` : 'auto',
                              fontSize: cf.font_size ? `${cf.font_size}px` : '10px',
                              fontWeight: cf.font_weight === 'bold' || cf.is_bold ? 'bold' : cf.font_weight === 'semibold' ? '600' : 'normal',
                              color: cf.color || '#1e293b',
                              background: isSelected ? `${brand.primary}10` : (cf.background || 'transparent'),
                              border: cf.border || 'none',
                              padding: cf.padding || '2px',
                              marginTop: cf.margin_top ? `${cf.margin_top}px` : undefined,
                              marginBottom: cf.margin_bottom ? `${cf.margin_bottom}px` : undefined,
                              textAlign: cf.alignment || 'left',
                              cursor: 'move',
                              zIndex: isSelected ? 50 : 10,
                              outline: isSelected ? `2px dashed ${brand.primary}` : '1px dashed transparent',
                              display: 'flex',
                              flexDirection: 'row',
                              justifyContent: cf.alignment === 'center' ? 'center' : cf.alignment === 'right' ? 'flex-end' : 'flex-start',
                              ...parseCustomCss(cf.custom_css)
                            }}
                            className="hover:outline-blue-300 rounded group select-none relative"
                            onMouseDown={(e) => handleMouseDown(e, cf.custom_field_id, 'custom', cf.position_x ?? 10, cf.position_y ?? 60)}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomFieldId(cf.custom_field_id);
                              setSelectedFieldId(null);
                              setSelectedColumnId(null);
                            }}
                          >
                            <div className="w-full flex" style={{ justifyContent: cf.alignment === 'center' ? 'center' : cf.alignment === 'right' ? 'flex-end' : 'flex-start' }}>
                              {isEditingLabel ? (
                                  <input
                                    type="text"
                                    value={editingLabelText}
                                    onChange={e => setEditingLabelText(e.target.value)}
                                    onBlur={handleSaveInlineLabel}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') handleSaveInlineLabel();
                                    }}
                                    className="w-full text-[9px] border p-0.5 rounded outline-none"
                                    autoFocus
                                    onClick={e => e.stopPropagation()}
                                  />
                                ) : (
                                  <div className="inline-flex items-center flex-wrap" onDoubleClick={(e) => handleDoubleClick(e, cf.custom_field_id, cf.custom_label || cf.field_name)}>
                                    <strong className="text-slate-400 mr-1" style={{ color: cf.color || undefined, fontWeight: cf.is_bold ? 'bold' : 'normal' }}>{cf.custom_label || cf.field_name}: </strong>
                                    <span className="text-slate-700" style={{ color: cf.color || undefined, fontWeight: cf.is_bold ? 'bold' : 'normal' }}>{getSampleValue(cf.field_name)}</span>
                                  </div>
                                )}
                            </div>
                              {isSelected && (
                                <div
                                  className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize z-50 rounded-tl border-t border-l"
                                  style={{
                                    backgroundColor: brand.primary,
                                    borderColor: 'white'
                                  }}
                                  onMouseDown={(e) => handleResizeMouseDown(e, cf.custom_field_id, 'custom', cf.width_percent ?? 50, cf.height_px, e.currentTarget.parentElement)}
                                />
                              )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div
                  ref={containerRefCallback}
                  className="flex-grow bg-slate-100 overflow-y-auto overflow-x-hidden relative p-4 flex flex-col items-center custom-scrollbar"
                >
                  <div
                    ref={innerContentRefCallback}
                    style={{
                      width: activeTemplate?.paper_size === 'Thermal' ? '380px' : '794px',
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top center',
                      marginBottom: `${(previewScale - 1) * contentHeight}px`,
                      flexShrink: 0,
                    }}
                    className="bg-white border border-slate-350 rounded-lg p-6 shadow-md transition-all duration-150"
                  >
                    {activeTemplate?.paper_size === 'Thermal' ? (
                    <div className="flex flex-col gap-4 text-[9px]">
                      {activeSections.filter(sec => sec.is_visible).map((sec) => {
                        if (sec.section_name === 'Attachments') {
                          return (
                            <div key={sec.section_id} className="space-y-1 py-1 border-b">
                              <span className="text-[9px] font-bold text-slate-400 block">Attachments</span>
                              <div className="flex gap-2 text-[8px] text-blue-500">
                                <span className="flex items-center gap-1 border rounded px-1.5 py-0.5 bg-slate-50">
                                  <FileText className="w-2.5 h-2.5 text-slate-400" />
                                  delivery_proof.pdf
                                </span>
                              </div>
                            </div>
                          );
                        }

                        const dynamicFields = renderSectionFields(sec.section_name);
                        if (!dynamicFields) return null;

                        return (
                          <div key={sec.section_id} className="w-full"
                               onDragOver={e => e.preventDefault()}
                               onDrop={() => { if (draggedElement) handleSectionDropField(sec.section_name); }}
                          >
                            <span className="text-[8px] font-bold text-slate-400 block border-b pb-0.5 mb-1 uppercase tracking-wider">{sec.section_name}</span>
                            {dynamicFields}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    // BEAUTIFUL A4/LETTER SOLID LAYOUT MATCHING USER'S IMAGE
                    <div className="space-y-6 flex flex-col justify-start">
                      <div>
                        {/* 1. Header (Company details & centered Title) */}
                        {activeSections.find(s => s.section_name === 'Company Information' && s.is_visible) && (
                          <div className="w-full flex justify-between items-start border-b pb-4 mb-2"
                               onDragOver={e => e.preventDefault()}
                               onDrop={() => { if (draggedElement) handleSectionDropField('Company Information'); }}
                          >
                            <div className="flex-grow">
                              {renderSectionFields('Company Information')}
                            </div>
                          </div>
                        )}

                        {/* Centered Document Title */}
                        <div className="w-full text-center my-3">
                          <h1 className="text-base font-extrabold tracking-wider text-slate-800 uppercase pb-1 border-b-2 border-slate-700 inline-block">
                            {activeTemplate?.document_type || 'Sale Tax Invoice'}
                          </h1>
                        </div>

                        {/* 2. Side-by-Side Information Boxes (Invoice & Customer details) */}
                        <div className="grid grid-cols-2 gap-4 mb-4 items-stretch">
                          {activeSections.find(s => s.section_name === 'Invoice Information' && s.is_visible) ? (
                            <div className="flex flex-col space-y-1.5 h-full justify-between"
                                 onDragOver={e => e.preventDefault()}
                                 onDrop={() => { if (draggedElement) handleSectionDropField('Invoice Information'); }}
                            >
                              {(() => {
                                const secFields = activeFields.filter(f => f.section_name === 'Invoice Information');
                                const secCustomFields = activeCustomFields.filter(cf => (cf.section_name || 'Custom Fields') === 'Invoice Information');
                                const combined = [
                                  ...secFields.map(f => ({ ...f, isCustom: false as const })),
                                  ...secCustomFields.map(cf => ({ ...cf, isCustom: true as const }))
                                ].sort((a, b) => a.display_order - b.display_order);

                                return combined.map(item => {
                                  const sampleVal = 
                                    item.field_name === 'Invoice Number' ? 'SI-000248' :
                                    item.field_name === 'Date' || item.field_name === 'Invoice Date' ? '2026-06-11' :
                                    item.field_name === 'Due Date' ? '2026-07-11' :
                                    item.field_name === 'Sales Person' ? 'Ahmed Raza' :
                                    item.field_name === 'Reference Number' ? 'REF-992' :
                                    item.field_name === 'Warehouse' ? 'Lahore Central' :
                                    item.field_name === 'Payment Terms' ? 'Net 30' :
                                    item.field_name === 'FBR Invoice Number' ? 'FBR-INV-1092837' : 'Sample';

                                  const isSelected = selectedFieldId === (item.isCustom ? item.custom_field_id : item.field_id);
                                  const isEditingLabel = editingLabelId === (item.isCustom ? item.custom_field_id : item.field_id);

                                  const labelColor = item.label_color || item.color;
                                  const labelBold = item.label_is_bold !== undefined ? item.label_is_bold : item.is_bold;
                                  const valueColor = item.value_color || item.color;
                                  const valueBold = item.value_is_bold !== undefined ? item.value_is_bold : item.is_bold;

                                  const borderVal = item.border === 'bottom-light' ? '1px solid #cbd5e1' :
                                                    item.border === 'bottom-slate' ? '1px solid #475569' :
                                                    item.border === 'bottom-black' ? '1px solid #000000' :
                                                    item.border === 'none' ? 'none' :
                                                    item.border || '1px solid #cbd5e1';

                                  const borderStyles = item.border && (item.border.startsWith('bottom-') || item.border === 'none') ? {
                                    borderBottom: item.border === 'none' ? 'none' : borderVal,
                                    borderTop: 'none',
                                    borderLeft: 'none',
                                    borderRight: 'none'
                                  } : {
                                    border: isSelected ? '1px solid rgb(59, 130, 246)' : borderVal
                                  };

                                  return (
                                    <div 
                                      key={item.isCustom ? item.custom_field_id : item.field_id} 
                                      className={`rounded px-3 py-1.5 flex justify-between items-center cursor-pointer text-[9px] ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
                                      style={{ 
                                        ...borderStyles,
                                        backgroundColor: item.background || '#ffffff',
                                        fontSize: item.font_size ? `${item.font_size}px` : undefined,
                                        padding: item.padding || undefined,
                                        marginBottom: item.margin_bottom ? `${item.margin_bottom}px` : undefined,
                                        opacity: item.is_visible ? 1 : 0.45,
                                        border: item.is_visible ? borderStyles.border : '1px dashed #cbd5e1',
                                      }}
                                      onClick={() => setSelectedFieldId(item.isCustom ? item.custom_field_id : item.field_id)}
                                    >
                                      {isEditingLabel ? (
                                        <input
                                          type="text"
                                          value={editingLabelText}
                                          onChange={e => setEditingLabelText(e.target.value)}
                                          onBlur={handleSaveInlineLabel}
                                          onKeyDown={e => { if (e.key === 'Enter') handleSaveInlineLabel(); }}
                                          className="w-full text-[9px] border p-0.5 rounded outline-none"
                                          autoFocus
                                          onClick={e => e.stopPropagation()}
                                        />
                                      ) : (
                                        <strong 
                                          className="text-slate-500 mr-2 cursor-pointer hover:bg-slate-50 rounded px-1"
                                          onDoubleClick={(e) => handleDoubleClick(e, item.isCustom ? item.custom_field_id : item.field_id, item.custom_label || item.field_name)}
                                          style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}
                                        >
                                          {item.custom_label || item.field_name}:
                                        </strong>
                                      )}
                                      <span className="text-slate-850" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{sampleVal}</span>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          ) : <div />}

                          {activeSections.find(s => s.section_name === 'Customer Information' && s.is_visible) ? (
                            <div 
                              className="rounded p-3 flex flex-col justify-start text-[9px]"
                              style={{ 
                                border: '1px solid #cbd5e1', 
                                backgroundColor: '#ffffff', 
                                color: '#1e293b',
                                minHeight: '100%' 
                              }}
                              onDragOver={e => e.preventDefault()}
                              onDrop={() => { if (draggedElement) handleSectionDropField('Customer Information'); }}
                            >
                              <div className="font-extrabold border-b border-slate-300 pb-1 mb-2 text-slate-800 uppercase tracking-wider text-left text-[9px]">
                                Customer Details
                              </div>
                              <div className="space-y-1.5">
                                {(() => {
                                  const secFields = activeFields.filter(f => f.section_name === 'Customer Information');
                                  const secCustomFields = activeCustomFields.filter(cf => (cf.section_name || 'Custom Fields') === 'Customer Information');
                                  const combined = [
                                    ...secFields.map(f => ({ ...f, isCustom: false as const })),
                                    ...secCustomFields.map(cf => ({ ...cf, isCustom: true as const }))
                                  ].sort((a, b) => a.display_order - b.display_order);

                                  return combined.map(item => {
                                    const sampleVal = 
                                      item.field_name === 'Customer Name' ? 'BlueRitt Technologies' :
                                      item.field_name === 'Customer Address' ? 'House 42, Street 5, Karachi, PK' :
                                      item.field_name === 'Mobile' ? '0300-1234567' :
                                      item.field_name === 'Customer NTN' ? '9876543-2' :
                                      item.field_name === 'Customer STRN' ? '03-09-9999-001-22' :
                                      item.field_name === 'Customer CNIC' ? '42201-1234567-1' :
                                      item.field_name === 'Customer Code' ? 'CUST-9928' :
                                      item.field_name === 'Customer Email' ? 'billing@blueritt.com' : 'Sample';

                                    const isSelected = selectedFieldId === (item.isCustom ? item.custom_field_id : item.field_id);
                                    const isEditingLabel = editingLabelId === (item.isCustom ? item.custom_field_id : item.field_id);

                                    const labelColor = item.label_color || item.color;
                                    const labelBold = item.label_is_bold !== undefined ? item.label_is_bold : item.is_bold;
                                    const valueColor = item.value_color || item.color;
                                    const valueBold = item.value_is_bold !== undefined ? item.value_is_bold : item.is_bold;

                                    const borderVal = item.border === 'bottom-light' ? '1px solid #cbd5e1' :
                                                      item.border === 'bottom-slate' ? '1px solid #475569' :
                                                      item.border === 'bottom-black' ? '1px solid #000000' :
                                                      item.border === 'none' ? 'none' :
                                                      item.border || '1px solid #f1f5f9';

                                    const borderStyles = item.border && (item.border.startsWith('bottom-') || item.border === 'none') ? {
                                      borderBottom: item.border === 'none' ? 'none' : borderVal,
                                      borderTop: 'none',
                                      borderLeft: 'none',
                                      borderRight: 'none'
                                    } : {
                                      borderBottom: borderVal
                                    };

                                    return (
                                      <div 
                                        key={item.isCustom ? item.custom_field_id : item.field_id} 
                                        className={`flex justify-between items-start pb-1.5 last:border-0 last:pb-0 cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                                        style={{
                                          ...borderStyles,
                                          fontSize: item.font_size ? `${item.font_size}px` : undefined,
                                          padding: item.padding || undefined,
                                          marginBottom: item.margin_bottom ? `${item.margin_bottom}px` : undefined,
                                          opacity: item.is_visible ? 1 : 0.45,
                                          borderBottom: item.is_visible ? borderStyles.borderBottom : '1px dashed #cbd5e1',
                                        }}
                                        onClick={() => setSelectedFieldId(item.isCustom ? item.custom_field_id : item.field_id)}
                                      >
                                        {isEditingLabel ? (
                                          <input
                                            type="text"
                                            value={editingLabelText}
                                            onChange={e => setEditingLabelText(e.target.value)}
                                            onBlur={handleSaveInlineLabel}
                                            onKeyDown={e => { if (e.key === 'Enter') handleSaveInlineLabel(); }}
                                            className="w-[60%] text-[8px] border p-0.5 rounded outline-none"
                                            autoFocus
                                            onClick={e => e.stopPropagation()}
                                          />
                                        ) : (
                                          <strong 
                                            className="text-slate-500 mr-2 shrink-0 cursor-pointer hover:bg-slate-50 rounded px-1"
                                            onDoubleClick={(e) => handleDoubleClick(e, item.isCustom ? item.custom_field_id : item.field_id, item.custom_label || item.field_name)}
                                            style={{ color: labelColor || undefined, fontWeight: labelBold ? 'bold' : 'normal' }}
                                          >
                                            {item.custom_label || item.field_name}:
                                          </strong>
                                        )}
                                        <span className="text-slate-800 text-right break-words max-w-[65%]" style={{ color: valueColor || undefined, fontWeight: valueBold ? 'bold' : 'normal' }}>{sampleVal}</span>
                                      </div>
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          ) : <div />}
                        </div>

                        {/* 3. Product Table */}
                        {activeSections.find(s => s.section_name === 'Product Table' && s.is_visible) && (
                          <div className="w-full my-4"
                               onDragOver={e => e.preventDefault()}
                               onDrop={() => { if (draggedElement) handleSectionDropField('Product Table'); }}
                          >
                            {renderSectionFields('Product Table')}
                          </div>
                        )}

                        {/* Attachments if any */}
                        <div className="space-y-1 py-1 border-b w-full">
                          <span className="text-[9px] font-bold text-slate-400 block">Attachments</span>
                          <div className="flex gap-2 text-[8px] text-blue-500">
                            <span className="flex items-center gap-1 border rounded px-1.5 py-0.5 bg-slate-50">
                              <FileText className="w-2.5 h-2.5 text-slate-400" />
                              delivery_proof.pdf
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 4. Footer Section (Side-by-Side Note & Totals Box) */}
                      <div className="grid grid-cols-12 gap-6 items-end w-full pt-4 border-t">
                        {/* Left: Notes, Remarks, Signatures */}
                        <div className="col-span-7 space-y-4"
                             onDragOver={e => e.preventDefault()}
                             onDrop={() => { if (draggedElement) handleSectionDropField('Footer'); }}
                        >
                          <div className="space-y-3">
                            {renderSectionFields('Footer')}
                          </div>
                        </div>

                        {/* Right: Bordered Totals Box */}
                        {activeSections.find(s => s.section_name === 'Totals' && s.is_visible) && (
                          <div className="col-span-5 border border-slate-300 rounded p-3 bg-slate-50/50 text-[9px]"
                               onDragOver={e => e.preventDefault()}
                               onDrop={() => { if (draggedElement) handleSectionDropField('Totals'); }}
                          >
                            <div className="font-bold border-b pb-1 mb-2 text-slate-700 uppercase tracking-wider text-right">Summary</div>
                            <div className="space-y-1.5 flex flex-col items-end w-full">
                              {renderSectionFields('Totals')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )}
          </div>

        </div>

        {/* ── Add Formula Field Modal ── */}
        <Modal
          isOpen={showCustomFieldModal}
          onClose={() => { setShowCustomFieldModal(false); resetFormulaModal(); }}
          title="🧮 Add Formula Field"
          size="sm"
          footer={
            <>
              <Button variant="white" size="sm" onClick={() => { setShowCustomFieldModal(false); resetFormulaModal(); }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleAddCustomField}
                style={{ backgroundColor: brand.primary }}
              >
                Add Formula Field
              </Button>
            </>
          }
        >
          <div className="space-y-3">

            {/* Field Name */}
            <Input
              label="Field Label *"
              variant="compact"
              placeholder="e.g. Net Payable, Profit, Balance"
              value={formulaFieldName}
              onChange={e => setFormulaFieldName(e.target.value)}
            />

            {/* Placement */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary, #64748b)', display: 'block', marginBottom: 6 }}>
                Add To
              </label>
              <div className="flex gap-2">
                {(['totals', 'column'] as const).map(p => (
                  <button key={p} type="button"
                    onClick={() => {
                      setFormulaPlacement(p);
                      const firstValid = FORMULA_FIELD_OPTIONS.find(f => {
                        if (p === 'totals') return f.section === 'Totals' || f.section === 'Summary';
                        return f.section === 'Column';
                      })?.key || '';
                      setFormulaSelectedField(firstValid);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      formulaPlacement === p
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p === 'totals' ? '📋 Summary / Footer' : '📊 Table Column'}
                  </button>
                ))}
              </div>
            </div>

            {/* Formula Builder */}
            <div className="space-y-2">
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary, #64748b)', display: 'block', marginBottom: 2 }}>
                Formula
              </label>

              {/* Live preview */}
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-mono min-h-[34px] flex flex-wrap items-center gap-1">
                {formulaTokens.length === 0 && <span className="text-slate-400 italic">Build your formula below…</span>}
                {formulaTokens.map((tok, i) => (
                  <span key={i} className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-semibold ${
                    tok.type === 'field'    ? 'bg-indigo-100 text-indigo-800' :
                    tok.type === 'operator' ? 'bg-amber-100 text-amber-700' :
                                             'bg-green-100 text-green-700'
                  }`}>
                    {tok.type === 'field' ? tok.fieldLabel : tok.type === 'operator' ? tok.operator : tok.constant}
                    <button type="button" onClick={() => setFormulaTokens(prev => prev.filter((_, j) => j !== i))}
                      className="ml-0.5 text-slate-400 hover:text-red-500 font-bold leading-none">×</button>
                  </span>
                ))}
              </div>

              {/* Tab row */}
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-[11px] font-semibold w-fit">
                {(['field', 'operator', 'constant'] as const).map(t => (
                  <button key={t} type="button"
                    onClick={() => setFormulaAddType(t)}
                    className={`px-3 py-1 transition-colors ${
                      formulaAddType === t ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                    {t === 'field' ? '📊 Field' : t === 'operator' ? '➕ Operator' : '🔢 Number'}
                  </button>
                ))}
              </div>

              {/* Field picker */}
              {formulaAddType === 'field' && (
                <div className="flex gap-2">
                  <select
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={formulaSelectedField}
                    onChange={e => setFormulaSelectedField(e.target.value)}
                  >
                    {['Totals', 'Summary', 'Column']
                      .filter(sec => {
                        if (formulaPlacement === 'totals') {
                          return sec === 'Totals' || sec === 'Summary';
                        } else {
                          return sec === 'Column';
                        }
                      })
                      .map(section => (
                        <optgroup key={section} label={section}>
                          {FORMULA_FIELD_OPTIONS.filter(f => f.section === section).map(f => (
                            <option key={f.key} value={f.key}>{f.label}</option>
                          ))}
                        </optgroup>
                      ))}
                  </select>
                  <button type="button"
                    onClick={() => {
                      const opt = FORMULA_FIELD_OPTIONS.find(f => f.key === formulaSelectedField);
                      if (opt) setFormulaTokens(prev => [...prev, { type: 'field', fieldKey: opt.key, fieldLabel: opt.label }]);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
                  >Add</button>
                </div>
              )}

              {/* Operator picker */}
              {formulaAddType === 'operator' && (
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1">
                    {(['+', '-', '*', '/'] as const).map(op => (
                      <button key={op} type="button"
                        onClick={() => setFormulaSelectedOp(op)}
                        className={`w-9 h-9 rounded-lg text-base font-bold border transition-colors ${
                          formulaSelectedOp === op
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
                        }`}>
                        {op}
                      </button>
                    ))}
                  </div>
                  <button type="button"
                    onClick={() => setFormulaTokens(prev => [...prev, { type: 'operator', operator: formulaSelectedOp }])}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 whitespace-nowrap"
                  >Add Operator</button>
                </div>
              )}

              {/* Constant picker */}
              {formulaAddType === 'constant' && (
                <div className="flex gap-2">
                  <input type="number" placeholder="Enter number"
                    className="w-32 border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={formulaConstant}
                    onChange={e => setFormulaConstant(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        const n = parseFloat(formulaConstant);
                        if (!isNaN(n)) setFormulaTokens(prev => [...prev, { type: 'constant', constant: n }]);
                        setFormulaConstant('');
                      }
                    }}
                  />
                  <button type="button"
                    onClick={() => {
                      const n = parseFloat(formulaConstant);
                      if (!isNaN(n)) setFormulaTokens(prev => [...prev, { type: 'constant', constant: n }]);
                      setFormulaConstant('');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-600 hover:bg-green-700 whitespace-nowrap"
                  >Add</button>
                </div>
              )}

              {formulaTokens.length > 0 && (
                <button type="button" onClick={() => setFormulaTokens([])}
                  className="text-[10px] text-red-400 hover:text-red-600 font-medium">
                  Clear formula
                </button>
              )}
              <p className="text-[10px] text-slate-400 italic">e.g. Subtotal − Discount + Tax = Net Payable</p>
            </div>
          </div>
        </Modal>

      </div>
    );
  }

  // ─── List View ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-64">
          <Input
            variant="compact"
            icon={Search}
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search template name, document..."
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Import Template Config file selector */}
          <input
            type="file"
            accept=".json"
            onChange={handleImportTemplate}
            className="hidden"
            ref={fileInputRef}
          />
          <Button
            variant="white"
            size="md"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </Button>

          <Button
            variant="white"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => {
              setTempDocType(filterDocType);
              setTempPaper(filterPaper);
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
            Add Template
          </Button>
        </div>
      </div>

      {/* Templates List Table Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border overflow-hidden"
        style={{ borderColor: '#E2E8F0', boxShadow: 'none' }}
      >
        <div
          className="px-4 py-2.5 flex items-center justify-between text-white"
          style={{ backgroundColor: brand.primary }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <h3 className="text-[11px] font-black tracking-wide">Print Templates</h3>
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: brand.soft, color: brand.dark }}
            >
              {filtered.length} layouts
            </span>
          </div>
        </div>

        <ScrollArea height="290px" className="w-full overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="border-b border-[#E2E8F0]">
                {[
                  { label: 'Template Name', key: 'template_name' as keyof PrintTemplate, w: 'min-w-[150px]' },
                  { label: 'Document Type', key: 'document_type' as keyof PrintTemplate, w: 'min-w-[120px]' },
                  { label: 'Paper Size', key: 'paper_size' as keyof PrintTemplate, w: 'min-w-[100px]' },
                  { label: 'Orientation', key: 'orientation' as keyof PrintTemplate, w: 'min-w-[90px]' },
                  { label: 'Default', key: undefined, w: 'min-w-[80px]' },
                  { label: 'Status', key: undefined, w: 'min-w-[80px]' },
                  { label: 'Actions', key: undefined, w: 'w-24' }
                ].map(h => (
                  <TableHeader
                    key={h.label}
                    label={h.label}
                    sortKey={h.key}
                    activeSortKey={sortKey}
                    sortDir={sortDir}
                    onSort={h.key ? () => handleSort(h.key!) : undefined}
                    width={h.w}
                    padding={h.label === 'Actions' ? 'px-2' : 'px-4'}
                    borderLeft={false}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[12px] text-slate-400">
                    No print templates found.
                  </td>
                </tr>
              ) : (
                paginated.map((t, i) => (
                  <motion.tr
                    key={t.template_id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="group border-b border-[#E2E8F0] transition-colors hover:bg-slate-50/60 last:border-0"
                  >
                    <td className="px-4 py-2.5 text-[12px] font-bold text-slate-700">
                      {t.template_name}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-normal text-slate-650">
                      {t.document_type}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-normal text-slate-650">
                      {t.paper_size}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] font-normal text-slate-650">
                      {t.orientation}
                    </td>
                    <td className="px-4 py-2.5">
                      {t.is_default ? (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wide">
                          Default
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(t)}
                          className="text-[9px] font-black text-blue-500 hover:text-blue-700 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          Set Default
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {t.is_active ? (
                        <ActiveChip label="Active" size="md" onClick={() => handleToggleActive(t.template_id)} />
                      ) : (
                        <InactiveChip label="Inactive" size="md" onClick={() => handleToggleActive(t.template_id)} />
                      )}
                    </td>
                    <td className="px-2 py-2.5 w-24">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Pencil}
                          title="Design"
                          className="!px-1 text-blue-500 hover:text-blue-800"
                          onClick={() => {
                            setCurrentTemplateId(t.template_id);
                            setView('designer');
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Settings}
                          title="Edit Details"
                          className="!px-1 text-slate-500"
                          onClick={() => openEditBasic(t)}
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Copy}
                          title="Duplicate"
                          className="!px-1 text-slate-500"
                          onClick={() => handleDuplicate(t)}
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Download}
                          title="Export JSON"
                          className="!px-1 text-emerald-500 hover:text-emerald-700"
                          onClick={() => handleExportTemplate(t)}
                        />
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Trash2}
                          title="Delete"
                          className="!px-1 !text-red-500"
                          onClick={() => handleDeleteTrigger(t.template_id, t.template_name)}
                        />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div
            className="px-4 py-3 border-t flex items-center justify-between"
            style={{ borderColor: '#E2E8F0', background: brand.surface + '60' }}
          >
            <p className="text-[11px] font-medium text-slate-400">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="white"
                size="xs"
                icon={ChevronLeft}
                className="w-8 h-8 px-0"
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  variant={currentPage === p ? 'primary' : 'white'}
                  size="xs"
                  className="w-8 h-8 px-0 border-none"
                  style={currentPage === p ? { backgroundColor: brand.primary } : undefined}
                >
                  {p}
                </Button>
              ))}
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="white"
                size="xs"
                icon={ChevronRight}
                className="w-8 h-8 px-0"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Add / Edit modal popup drawer */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingTemplate ? 'Edit Template Basics' : 'Create Print Template'}
        size="md"
        footer={
          <>
            <Button variant="white" size="md" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={Check}
              onClick={handleSaveBasic}
              style={{ backgroundColor: brand.primary }}
            >
              {editingTemplate ? 'Update basics' : 'Create Template'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
              {formError}
            </div>
          )}

          <Input
            label="Template Name *"
            variant="compact"
            placeholder="e.g. A4 Tax Layout"
            value={form.template_name}
            onChange={e => setForm({ ...form, template_name: e.target.value })}
          />

          <Select
            label="Document Type"
            variant="compact"
            value={form.document_type}
            onChange={e => setForm({ ...form, document_type: e.target.value })}
            options={DOCUMENT_TYPES.map(t => ({ value: t, label: t }))}
          />

          <Select
            label="Paper Size"
            variant="compact"
            value={form.paper_size}
            onChange={e => setForm({ ...form, paper_size: e.target.value as any })}
            options={PAPER_SIZES.map(t => ({ value: t, label: t }))}
          />

          <Select
            label="Orientation"
            variant="compact"
            value={form.orientation}
            onChange={e => setForm({ ...form, orientation: e.target.value as any })}
            options={ORIENTATIONS.map(t => ({ value: t, label: t }))}
          />

          <div className="flex items-center justify-between pt-2">
            <Toggle
              checked={form.is_default}
              onChange={val => setForm({ ...form, is_default: val })}
              label="Set as default template for this document type"
            />
          </div>

          <div className="flex items-center justify-between">
            <Toggle
              checked={form.is_active}
              onChange={val => setForm({ ...form, is_active: val })}
              label="Active"
            />
          </div>
        </div>
      </Modal>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        onReset={handleResetFilters}
        onApply={() => {
          setFilterDocType(tempDocType);
          setFilterPaper(tempPaper);
          setCurrentPage(1);
          setShowFilter(false);
        }}
        title="Filter Templates"
      >
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Document Type</label>
          <Select
            variant="compact"
            value={tempDocType}
            onChange={e => setTempDocType(e.target.value)}
            options={[{ value: 'all', label: 'All Document Types' }, ...DOCUMENT_TYPES.map(t => ({ value: t, label: t }))]}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500">Paper Size</label>
          <Select
            variant="compact"
            value={tempPaper}
            onChange={e => setTempPaper(e.target.value)}
            options={[{ value: 'all', label: 'All Paper Sizes' }, ...PAPER_SIZES.map(t => ({ value: t, label: t }))]}
          />
        </div>
      </FilterDrawer>

      {/* Delete Confirmation popup */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="Delete Print Template?"
        itemName={deleteModal.name}
        warningText="Warning: Deleting this template will permanently clear all its visual coordinates and styling properties. This action cannot be undone."
      />
    </div>
  );
};
