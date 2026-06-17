import re
import sys
import os

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

path = "c:/INVOICE_FE/src/pages/Settings/components/PrintTemplatesModule.tsx"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

original_len = len(content)
print(f"File loaded: {original_len} chars")

# ============================================================
# STEP 1: Add new state variables after formulaConstant line
# ============================================================
old_state = "  const [formulaConstant, setFormulaConstant] = useState('');"
new_state = """  const [formulaConstant, setFormulaConstant] = useState('');
  // Crystal Reports Formula Manager extra state
  const [formulaValidationErrors, setFormulaValidationErrors] = useState<string[]>([]);
  const [formulaDescription, setFormulaDescription] = useState('');
  const [formulaCategory, setFormulaCategory] = useState<'summary' | 'column'>('summary');
  const [formulaSearchQuery, setFormulaSearchQuery] = useState('');"""

if old_state in content:
    content = content.replace(old_state, new_state, 1)
    print("STEP 1 OK: Added new formula state variables")
else:
    print("STEP 1 FAIL: Could not find target state line")

# ============================================================
# STEP 2: Replace the Formulas Manager Modal block
# ============================================================
start_marker = "        {/* -- Formulas Manager Modal -- */}"
# Actually the marker uses special dashes, let's find it by searching for the exact comment
start_marker_actual = "        {/* \u2500\u2500 Formulas Manager Modal \u2500\u2500 */}"
start_idx = content.find(start_marker_actual)
if start_idx == -1:
    # Try without special chars
    start_idx = content.find("{/* \u2500\u2500 Formulas Manager Modal \u2500\u2500 */}")
    if start_idx == -1:
        # Search more broadly
        idx = content.find("Formulas Manager Modal")
        if idx != -1:
            # Find the start of the line
            line_start = content.rfind("\n", 0, idx)
            start_idx = line_start + 1
            print(f"STEP 2: Found 'Formulas Manager Modal' at char {idx}, line start at {start_idx}")
        else:
            print("STEP 2 FAIL: Cannot find Formulas Manager Modal marker")
            start_idx = -1

if start_idx != -1:
    # From start_idx, find first </Modal>
    first_modal_end = content.find("        </Modal>", start_idx)
    if first_modal_end == -1:
        print("STEP 2 FAIL: cannot find first </Modal>")
    else:
        first_modal_end_full = first_modal_end + len("        </Modal>")
        
        # Check what's right after the first </Modal>
        after_first = content[first_modal_end_full:first_modal_end_full + 200]
        print(f"After first </Modal>: {repr(after_first[:100])}")
        
        # If there's stray JSX (button, handleRemoveCustomColumn), find the second </Modal>
        if "handleRemoveCustomColumn" in after_first or "<button" in after_first:
            second_modal_end = content.find("        </Modal>", first_modal_end_full)
            if second_modal_end == -1:
                end_idx = first_modal_end_full
                print("STEP 2: Only found one </Modal>")
            else:
                end_idx = second_modal_end + len("        </Modal>")
                print(f"STEP 2: Found orphaned JSX block, using second </Modal> as end")
        else:
            end_idx = first_modal_end_full
            print("STEP 2: No orphaned JSX, using first </Modal> as end")
        
        old_block = content[start_idx:end_idx]
        print(f"STEP 2: Block to replace: {len(old_block)} chars")
        
        # The new Crystal Reports-style Formula Manager
        new_block = """        {/* -- Crystal Reports Formula Manager Modal -- */}
        <Modal
          isOpen={showFormulasModal}
          onClose={() => {
            setShowFormulasModal(false);
            setEditingFormulaId(null);
            resetFormulaModal();
            setFormulaValidationErrors([]);
            setFormulaDescription('');
            setFormulaCategory('summary');
            setFormulaSearchQuery('');
          }}
          title="Formula Manager"
          size="5xl"
          footer={null}
        >
          {(() => {
            const summaryFormulas = activeCustomFields.filter(cf => cf.field_type === 'formula');
            const columnFormulas  = activeColumns.filter(c => c.is_custom && c.formula_tokens && c.formula_tokens.length > 0);
            const allFormulaNames = [...summaryFormulas.map(f => f.field_name), ...columnFormulas.map(c => c.column_name)];
            const fq = formulaSearchQuery.toLowerCase().trim();
            const filteredSummary = summaryFormulas.filter(f => !fq || f.field_name.toLowerCase().includes(fq));
            const filteredColumn  = columnFormulas.filter(c  => !fq || c.column_name.toLowerCase().includes(fq));

            const fieldMap: Record<string, number> = {
              subtotal: 7500, tax_amount: 1125, discount_amount: 500,
              shipping_charges: 150, other_charges: 0, round_off: 0,
              grand_total: 8275, paid_amount: 5000, balance_due: 3275,
              total_qty: 12, total_items: 3,
              line_qty: 5, line_unit_price: 1500, line_total: 7500,
              line_discount: 250, line_tax: 625,
            };

            const evalTokens = (tokens: FormulaToken[]): number => {
              try {
                let result = 0; let pendingOp = '+';
                for (const tok of tokens) {
                  if (tok.type === 'operator') { pendingOp = tok.operator ?? '+'; continue; }
                  const num = tok.type === 'field' ? (fieldMap[tok.fieldKey ?? ''] ?? 0) : parseFloat(String(tok.constant ?? '0')) || 0;
                  if (pendingOp === '+') result += num;
                  else if (pendingOp === '-') result -= num;
                  else if (pendingOp === '*') result *= num;
                  else if (pendingOp === '/') result = num !== 0 ? result / num : 0;
                  else if (pendingOp === '%') result = result * num / 100;
                }
                return result;
              } catch { return 0; }
            };

            const tokensToExpr = (tokens: FormulaToken[]) =>
              tokens.map(tok =>
                tok.type === 'field' ? (tok.fieldLabel ?? '') :
                tok.type === 'operator' ? ` ${tok.operator} ` : String(tok.constant ?? '')
              ).join('');

            const validateFormula = (): string[] => {
              const errors: string[] = [];
              if (!formulaFieldName.trim()) errors.push('Formula name is required.');
              if (formulaTokens.length === 0) errors.push('Formula expression cannot be empty.');
              if (formulaTokens.length > 0 && formulaTokens[0].type === 'operator')
                errors.push('Formula cannot start with an operator.');
              if (formulaTokens.length > 0 && formulaTokens[formulaTokens.length - 1].type === 'operator')
                errors.push('Formula cannot end with an operator.');
              for (let i = 0; i < formulaTokens.length - 1; i++) {
                if (formulaTokens[i].type === 'operator' && formulaTokens[i + 1].type === 'operator')
                  errors.push('Invalid syntax: two consecutive operators.');
              }
              const editingName = editingFormulaId
                ? (summaryFormulas.find(f => f.custom_field_id === editingFormulaId)?.field_name
                    ?? columnFormulas.find(c => c.column_id === editingFormulaId)?.column_name ?? '')
                : '';
              if (allFormulaNames.filter(n => n !== editingName).some(n => n.toLowerCase() === formulaFieldName.trim().toLowerCase()))
                errors.push('A formula with this name already exists.');
              let lastOp = '';
              for (const tok of formulaTokens) {
                if (tok.type === 'operator') { lastOp = tok.operator ?? ''; continue; }
                if (lastOp === '/' && tok.type === 'constant' && (tok.constant === 0 || tok.constant === undefined))
                  errors.push('Warning: Possible division by zero detected.');
              }
              return errors;
            };

            const previewResult = formulaTokens.length > 0
              ? evalTokens(formulaTokens).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : null;
            const expressionStr = tokensToExpr(formulaTokens);

            const editingEntityName = editingFormulaId
              ? (columnFormulas.find(c => c.column_id === editingFormulaId)?.column_name
                  ?? summaryFormulas.find(f => f.custom_field_id === editingFormulaId)?.field_name
                  ?? formulaFieldName)
              : '';

            const availableFields = FORMULA_FIELD_OPTIONS.filter(f =>
              formulaCategory === 'column' ? f.section === 'Column' : (f.section === 'Totals' || f.section === 'Summary')
            );

            const handleValidatedSave = () => {
              const errors = validateFormula();
              setFormulaValidationErrors(errors);
              if (errors.length > 0) return;
              handleSaveFormula();
              setFormulaValidationErrors([]);
              setFormulaDescription('');
            };

            const handleDuplicateFormula = (id: string, isCol: boolean) => {
              if (isCol) {
                const col = columnFormulas.find(c => c.column_id === id);
                if (!col) return;
                const nid = `col-formula-${currentTemplateId}-${Date.now()}`;
                setAllColumns(prev => [...prev, { ...col, column_id: nid, column_name: `${col.column_name} (Copy)`, is_visible: false }]);
              } else {
                const cf = summaryFormulas.find(f => f.custom_field_id === id);
                if (!cf) return;
                const nid = `cf-formula-${currentTemplateId}-${Date.now()}`;
                setAllCustomFields(prev => [...prev, { ...cf, custom_field_id: nid, field_name: `${cf.field_name} (Copy)`, is_visible: false }]);
              }
            };

            const handleToggleFormula = (id: string, isCol: boolean) => {
              if (isCol) setAllColumns(prev => prev.map(c => c.column_id === id ? { ...c, is_visible: !c.is_visible } : c));
              else setAllCustomFields(prev => prev.map(cf => cf.custom_field_id === id ? { ...cf, is_visible: !cf.is_visible } : cf));
            };

            const itemStyle = (isSel: boolean, accent: string): React.CSSProperties => ({
              display: 'flex', alignItems: 'center', padding: '6px 8px',
              borderRadius: 6, cursor: 'pointer', marginBottom: 2,
              background: isSel ? `${accent}15` : 'transparent',
              border: `1px solid ${isSel ? `${accent}40` : 'transparent'}`,
            });

            return (
              <div style={{ display: 'flex', height: '620px', overflow: 'hidden' }}>

                {/* LEFT PANEL */}
                <div style={{ width: 272, flexShrink: 0, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                  <div style={{ padding: '12px 12px 10px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: '#334155', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Formula Explorer</span>
                      <button type="button"
                        onClick={() => { setEditingFormulaId(null); resetFormulaModal(); setFormulaValidationErrors([]); setFormulaDescription(''); setFormulaCategory('summary'); setFormulaPlacement('totals'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: brand.primary, background: `${brand.primary}15`, border: `1px solid ${brand.primary}30`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer' }}>
                        <Plus style={{ width: 11, height: 11 }} /> New
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Search style={{ position: 'absolute', left: 7, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, color: '#94a3b8' }} />
                      <input type="text" placeholder="Search formulas..." value={formulaSearchQuery}
                        onChange={e => setFormulaSearchQuery(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 26, paddingRight: 8, paddingTop: 5, paddingBottom: 5, fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 6, outline: 'none', background: '#fff', color: '#334155' }} />
                    </div>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }} className="custom-scrollbar">
                    {/* Summary Formulas */}
                    <div style={{ marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '5px 4px 4px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                        Summary Formulas
                        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, background: '#eef2ff', color: '#6366f1', padding: '0 5px', borderRadius: 10 }}>{filteredSummary.length}</span>
                      </div>
                      {filteredSummary.length === 0 && <div style={{ fontSize: 10, color: '#94a3b8', padding: '5px 10px', fontStyle: 'italic', textAlign: 'center' }}>{fq ? 'No matches' : 'None created yet'}</div>}
                      {filteredSummary.map(f => {
                        const isSel = editingFormulaId === f.custom_field_id;
                        return (
                          <div key={f.custom_field_id} style={itemStyle(isSel, brand.primary)}
                            onClick={() => { setEditingFormulaId(f.custom_field_id); setFormulaFieldName(f.field_name); setFormulaPlacement('totals'); setFormulaCategory('summary'); setFormulaTokens(f.formula_tokens || []); setFormulaValidationErrors([]); setFormulaDescription(''); }}>
                            <span style={{ fontSize: 12, marginRight: 6 }}>{'<>'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11, fontWeight: isSel ? 700 : 500, color: isSel ? brand.primary : '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.field_name}</div>
                              <div style={{ fontSize: 9, color: f.is_visible ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>{f.is_visible ? '● Active' : '○ Inactive'}</div>
                            </div>
                            {isSel && (
                              <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                                <button type="button" title="Duplicate" onClick={e => { e.stopPropagation(); handleDuplicateFormula(f.custom_field_id, false); }} style={{ padding: 3, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><Copy style={{ width: 11, height: 11 }} /></button>
                                <button type="button" title="Toggle" onClick={e => { e.stopPropagation(); handleToggleFormula(f.custom_field_id, false); }} style={{ padding: 3, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: f.is_visible ? '#22c55e' : '#94a3b8' }}><Check style={{ width: 11, height: 11 }} /></button>
                                <button type="button" title="Delete" onClick={e => { e.stopPropagation(); handleRemoveCustomField(f.custom_field_id); if (editingFormulaId === f.custom_field_id) { setEditingFormulaId(null); resetFormulaModal(); setFormulaValidationErrors([]); } }} style={{ padding: 3, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: '#f43f5e' }}><Trash2 style={{ width: 11, height: 11 }} /></button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Column Formulas */}
                    <div style={{ marginTop: 10, marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '5px 4px 4px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                        Table Column Formulas
                        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, background: '#fffbeb', color: '#d97706', padding: '0 5px', borderRadius: 10 }}>{filteredColumn.length}</span>
                      </div>
                      {filteredColumn.length === 0 && <div style={{ fontSize: 10, color: '#94a3b8', padding: '5px 10px', fontStyle: 'italic', textAlign: 'center' }}>{fq ? 'No matches' : 'None created yet'}</div>}
                      {filteredColumn.map(c => {
                        const isSel = editingFormulaId === c.column_id;
                        return (
                          <div key={c.column_id} style={{ ...itemStyle(isSel, '#f59e0b'), background: isSel ? '#fffbeb' : 'transparent', border: `1px solid ${isSel ? '#fcd34d' : 'transparent'}` }}
                            onClick={() => { setEditingFormulaId(c.column_id); setFormulaFieldName(c.column_name); setFormulaPlacement('column'); setFormulaCategory('column'); setFormulaTokens(c.formula_tokens || []); setFormulaValidationErrors([]); setFormulaDescription(''); }}>
                            <span style={{ fontSize: 12, marginRight: 6 }}>{'[]'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11, fontWeight: isSel ? 700 : 500, color: isSel ? '#b45309' : '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.column_name}</div>
                              <div style={{ fontSize: 9, color: c.is_visible ? '#22c55e' : '#94a3b8', fontWeight: 600 }}>{c.is_visible ? '● Active' : '○ Inactive'}</div>
                            </div>
                            {isSel && (
                              <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                                <button type="button" title="Duplicate" onClick={e => { e.stopPropagation(); handleDuplicateFormula(c.column_id, true); }} style={{ padding: 3, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}><Copy style={{ width: 11, height: 11 }} /></button>
                                <button type="button" title="Toggle" onClick={e => { e.stopPropagation(); handleToggleFormula(c.column_id, true); }} style={{ padding: 3, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: c.is_visible ? '#22c55e' : '#94a3b8' }}><Check style={{ width: 11, height: 11 }} /></button>
                                <button type="button" title="Delete" onClick={e => { e.stopPropagation(); handleRemoveCustomColumn(c.column_id); if (editingFormulaId === c.column_id) { setEditingFormulaId(null); resetFormulaModal(); setFormulaValidationErrors([]); } }} style={{ padding: 3, borderRadius: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: '#f43f5e' }}><Trash2 style={{ width: 11, height: 11 }} /></button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Custom Formulas section label */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '5px 4px 3px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                        Custom Formulas
                        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, background: '#ecfdf5', color: '#059669', padding: '0 5px', borderRadius: 10 }}>{summaryFormulas.length + columnFormulas.length}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', padding: '3px 10px', fontStyle: 'italic', lineHeight: 1.4 }}>All user-created formulas listed above.</div>
                    </div>
                  </div>

                  <div style={{ padding: '8px 12px', borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>{summaryFormulas.length + columnFormulas.length} formula(s) total</div>
                  </div>
                </div>

                {/* RIGHT PANEL – Formula Editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>

                  {/* Editor Header */}
                  <div style={{ padding: '12px 18px 10px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#1e293b' }}>
                        {editingFormulaId ? `Edit Formula: ${editingEntityName}` : 'Create New Formula'}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                        {editingFormulaId ? (formulaPlacement === 'totals' ? 'Summary / Footer Formula' : 'Table Column Formula') : 'Define a new formula for your invoice template'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {editingFormulaId && (() => {
                        const isCol = editingFormulaId.startsWith('col-formula-');
                        const entity = isCol ? columnFormulas.find(c => c.column_id === editingFormulaId) : summaryFormulas.find(f => f.custom_field_id === editingFormulaId);
                        return (
                          <>
                            <button type="button" onClick={() => handleDuplicateFormula(editingFormulaId, isCol)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                              <Copy style={{ width: 11, height: 11 }} /> Duplicate
                            </button>
                            <button type="button" onClick={() => handleToggleFormula(editingFormulaId, isCol)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: entity?.is_visible ? '#22c55e' : '#94a3b8', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                              <Check style={{ width: 11, height: 11 }} /> {entity?.is_visible ? 'Enabled' : 'Disabled'}
                            </button>
                          </>
                        );
                      })()}
                      <button type="button" onClick={() => { setShowFormulasModal(false); setEditingFormulaId(null); resetFormulaModal(); setFormulaValidationErrors([]); setFormulaDescription(''); setFormulaCategory('summary'); setFormulaSearchQuery(''); }}
                        style={{ fontSize: 10, fontWeight: 600, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Editor Body */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }} className="custom-scrollbar">

                    {/* Validation Errors Banner */}
                    {formulaValidationErrors.length > 0 && (
                      <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>Validation Errors</div>
                        {formulaValidationErrors.map((err, i) => (
                          <div key={i} style={{ fontSize: 10.5, color: '#ef4444', marginBottom: 2 }}>* {err}</div>
                        ))}
                      </div>
                    )}

                    {/* Name + Category row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Formula Name *</label>
                        <input type="text" placeholder="e.g. Net Payable, Profit, Balance" value={formulaFieldName}
                          onChange={e => { setFormulaFieldName(e.target.value); if (formulaValidationErrors.length > 0) setFormulaValidationErrors([]); }}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 11.5, border: '1.5px solid #e2e8f0', borderRadius: 7, outline: 'none', color: '#1e293b', background: '#fff' }}
                          onFocus={e => (e.target.style.borderColor = brand.primary)}
                          onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Formula Category</label>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {(['summary', 'column'] as const).map(cat => (
                            <button key={cat} type="button" disabled={!!editingFormulaId}
                              onClick={() => { setFormulaCategory(cat); setFormulaPlacement(cat === 'column' ? 'column' : 'totals'); setFormulaTokens([]); setFormulaValidationErrors([]); const fv = FORMULA_FIELD_OPTIONS.find(f => cat === 'column' ? f.section === 'Column' : (f.section === 'Totals' || f.section === 'Summary'))?.key || ''; setFormulaSelectedField(fv); }}
                              style={{ flex: 1, padding: '7px 10px', borderRadius: 7, cursor: editingFormulaId ? 'default' : 'pointer', fontSize: 10.5, fontWeight: 700, border: formulaCategory === cat ? 'none' : '1.5px solid #e2e8f0', background: formulaCategory === cat ? (cat === 'column' ? '#f59e0b' : brand.primary) : '#f8fafc', color: formulaCategory === cat ? '#fff' : '#64748b', opacity: editingFormulaId ? 0.6 : 1 }}>
                              {cat === 'summary' ? 'Summary / Footer' : 'Table Column'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Description <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
                      <input type="text" placeholder="Describe what this formula calculates..." value={formulaDescription}
                        onChange={e => setFormulaDescription(e.target.value)}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 11, border: '1.5px solid #e2e8f0', borderRadius: 7, outline: 'none', color: '#1e293b', background: '#fff' }}
                        onFocus={e => (e.target.style.borderColor = brand.primary)}
                        onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
                    </div>

                    {/* Formula Expression Display */}
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>Formula Expression</label>
                      <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: 8, padding: '10px 12px', minHeight: 44, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, fontFamily: 'monospace' }}>
                        {formulaTokens.length === 0 && <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Build your formula below...</span>}
                        {formulaTokens.map((tok, i) => (
                          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, borderRadius: 5, padding: '2px 7px', background: tok.type === 'field' ? '#e0e7ff' : tok.type === 'operator' ? '#fef3c7' : '#dcfce7', color: tok.type === 'field' ? '#4338ca' : tok.type === 'operator' ? '#b45309' : '#15803d' }}>
                            {tok.type === 'field' ? tok.fieldLabel : tok.type === 'operator' ? tok.operator : String(tok.constant)}
                            <button type="button" onClick={() => { setFormulaTokens(prev => prev.filter((_, j) => j !== i)); if (formulaValidationErrors.length > 0) setFormulaValidationErrors([]); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6, fontSize: 12, fontWeight: 800, lineHeight: 1, padding: 0 }}>x</button>
                          </span>
                        ))}
                      </div>
                      {formulaTokens.length > 0 && <button type="button" onClick={() => { setFormulaTokens([]); setFormulaValidationErrors([]); }} style={{ fontSize: 10, color: '#f43f5e', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer', marginTop: 4, padding: 0 }}>Clear all tokens</button>}
                    </div>

                    {/* Formula Builder */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px', marginBottom: 14 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Formula Builder</div>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                        {(['field', 'operator', 'constant'] as const).map(t => (
                          <button key={t} type="button" onClick={() => setFormulaAddType(t)}
                            style={{ padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 10.5, fontWeight: 700, border: formulaAddType === t ? 'none' : '1px solid #e2e8f0', background: formulaAddType === t ? (t === 'field' ? '#6366f1' : t === 'operator' ? '#f59e0b' : '#10b981') : '#fff', color: formulaAddType === t ? '#fff' : '#64748b' }}>
                            {t === 'field' ? 'Available Fields' : t === 'operator' ? 'Operators' : 'Constants'}
                          </button>
                        ))}
                      </div>

                      {formulaAddType === 'field' && (
                        <div>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>{formulaCategory === 'column' ? 'Line-level fields:' : 'Summary and totals fields:'}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {availableFields.map(f => (
                              <button key={f.key} type="button" onClick={() => { setFormulaTokens(prev => [...prev, { type: 'field', fieldKey: f.key, fieldLabel: f.label }]); if (formulaValidationErrors.length > 0) setFormulaValidationErrors([]); }}
                                style={{ padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 10.5, fontWeight: 600, background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' }}>
                                + {f.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {formulaAddType === 'operator' && (
                        <div>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>Arithmetic:</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                            {(['+', '-', '*', '/', '%'] as const).map(op => (
                              <button key={op} type="button" onClick={() => { setFormulaTokens(prev => [...prev, { type: 'operator', operator: op }]); if (formulaValidationErrors.length > 0) setFormulaValidationErrors([]); }}
                                style={{ width: 40, height: 40, borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 800, background: '#fef3c7', color: '#92400e', border: '1.5px solid #fcd34d' }}>
                                {op}
                              </button>
                            ))}
                          </div>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>Comparison &amp; Logic:</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {['>', '<', '>=', '<=', '==', '!='].map(op => (
                              <button key={op} type="button" onClick={() => setFormulaTokens(prev => [...prev, { type: 'operator', operator: op as any }])}
                                style={{ padding: '4px 10px', height: 32, borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700, background: '#f0fdf4', color: '#166534', border: '1.5px solid #bbf7d0' }}>
                                {op}
                              </button>
                            ))}
                            {['AND', 'OR'].map(op => (
                              <button key={op} type="button" onClick={() => setFormulaTokens(prev => [...prev, { type: 'operator', operator: op as any }])}
                                style={{ padding: '4px 12px', height: 32, borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 800, background: '#fdf4ff', color: '#7e22ce', border: '1.5px solid #e9d5ff' }}>
                                {op}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {formulaAddType === 'constant' && (
                        <div>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>Enter a numeric constant:</div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="number" placeholder="e.g. 100, 0.05" value={formulaConstant}
                              onChange={e => setFormulaConstant(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') { const n = parseFloat(formulaConstant); if (!isNaN(n)) { setFormulaTokens(prev => [...prev, { type: 'constant', constant: n }]); setFormulaConstant(''); if (formulaValidationErrors.length > 0) setFormulaValidationErrors([]); } } }}
                              style={{ flex: 1, padding: '7px 10px', fontSize: 11, border: '1.5px solid #e2e8f0', borderRadius: 7, outline: 'none', color: '#1e293b', background: '#fff' }}
                              onFocus={e => (e.target.style.borderColor = '#10b981')}
                              onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
                            <button type="button" onClick={() => { const n = parseFloat(formulaConstant); if (!isNaN(n)) { setFormulaTokens(prev => [...prev, { type: 'constant', constant: n }]); setFormulaConstant(''); if (formulaValidationErrors.length > 0) setFormulaValidationErrors([]); } }}
                              style={{ padding: '7px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700, background: '#10b981', color: '#fff', border: 'none' }}>
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Formula Preview */}
                    {formulaTokens.length > 0 && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, color: '#15803d', marginBottom: 8 }}>Formula Preview</div>
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 9.5, color: '#16a34a', fontWeight: 700, marginBottom: 3 }}>Expression:</div>
                          <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#14532d', background: '#dcfce7', padding: '6px 10px', borderRadius: 6, wordBreak: 'break-all' }}>{expressionStr || '(empty)'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 9.5, color: '#16a34a', fontWeight: 700, marginBottom: 4 }}>Sample Result (demo values — Subtotal=7500, Tax=1125, Discount=500, Grand Total=8275):</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ fontFamily: 'monospace', fontSize: 10.5, color: '#64748b', background: '#f0fdf4', padding: '4px 8px', borderRadius: 5 }}>{expressionStr}</div>
                            <span style={{ color: '#22c55e', fontWeight: 800, fontSize: 16 }}>=</span>
                            <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '5px 12px', borderRadius: 6, border: '1px solid #86efac' }}>{previewResult}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Editor Footer */}
                  <div style={{ padding: '12px 18px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0 }}>
                    <div>
                      {editingFormulaId && (
                        <button type="button"
                          onClick={() => { const isCol = editingFormulaId.startsWith('col-formula-'); if (isCol) handleRemoveCustomColumn(editingFormulaId); else handleRemoveCustomField(editingFormulaId); setEditingFormulaId(null); resetFormulaModal(); setFormulaValidationErrors([]); setFormulaDescription(''); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700, background: '#fff1f2', color: '#f43f5e', border: '1.5px solid #fecdd3' }}>
                          <Trash2 style={{ width: 12, height: 12 }} /> Delete Formula
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button"
                        onClick={() => { setEditingFormulaId(null); resetFormulaModal(); setFormulaValidationErrors([]); setFormulaDescription(''); setFormulaCategory('summary'); }}
                        style={{ padding: '7px 16px', borderRadius: 7, cursor: 'pointer', fontSize: 11, fontWeight: 700, background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0' }}>
                        Cancel
                      </button>
                      <button type="button" onClick={handleValidatedSave}
                        disabled={!formulaFieldName.trim() || formulaTokens.length === 0}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 18px', borderRadius: 7, cursor: (!formulaFieldName.trim() || formulaTokens.length === 0) ? 'not-allowed' : 'pointer', fontSize: 11, fontWeight: 800, background: (!formulaFieldName.trim() || formulaTokens.length === 0) ? '#e2e8f0' : brand.primary, color: (!formulaFieldName.trim() || formulaTokens.length === 0) ? '#94a3b8' : '#fff', border: 'none' }}>
                        <Check style={{ width: 13, height: 13 }} />
                        {editingFormulaId ? 'Save Formula' : 'Create Formula'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>"""

        content = content[:start_idx] + new_block + content[end_idx:]
        print(f"STEP 2 OK: Replaced {len(old_block)} chars with {len(new_block)} chars")

# Write back
with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Done! New file size: {len(content)} chars")
