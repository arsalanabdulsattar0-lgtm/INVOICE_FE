path = "c:/INVOICE_FE/src/pages/Settings/components/PrintTemplatesModule.tsx"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Declare new state variables
state_target = "  const [showTemplateSettingsModal, setShowTemplateSettingsModal] = useState<boolean>(false);"
state_replacement = """  const [showTemplateSettingsModal, setShowTemplateSettingsModal] = useState<boolean>(false);
  const [formulaManagerMode, setFormulaManagerMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingFormulaId, setEditingFormulaId] = useState<string | null>(null);"""

if state_target in code:
    code = code.replace(state_target, state_replacement)
    print("SUCCESS: State variables formulaManagerMode and editingFormulaId declared.")
else:
    print("ERROR: showTemplateSettingsModal state not found!")

# 2. Replace handleAddCustomField with handleSaveFormula
add_custom_field_target = """  const handleAddCustomField = () => {
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
  };"""

save_formula_replacement = """  const handleSaveFormula = () => {
    if (!formulaFieldName.trim()) return;
    if (formulaTokens.length === 0) return;

    if (editingFormulaId) {
      if (editingFormulaId.startsWith('col-formula-')) {
        setAllColumns(prev => prev.map(c => {
          if (c.column_id === editingFormulaId) {
            return {
              ...c,
              column_name: formulaFieldName,
              formula_tokens: formulaTokens
            };
          }
          return c;
        }));
      } else {
        setAllCustomFields(prev => prev.map(cf => {
          if (cf.custom_field_id === editingFormulaId) {
            return {
              ...cf,
              field_name: formulaFieldName,
              formula_tokens: formulaTokens
            };
          }
          return cf;
        }));
      }
    } else {
      if (formulaPlacement === 'column') {
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
    }

    setFormulaManagerMode('list');
    setEditingFormulaId(null);
    resetFormulaModal();
  };"""

if add_custom_field_target in code:
    code = code.replace(add_custom_field_target, save_formula_replacement)
    print("SUCCESS: handleAddCustomField replaced with handleSaveFormula.")
else:
    # Try finding slightly formatted target
    print("WARNING: handleAddCustomField target not found exactly. Trying fallback.")
    code = code.replace("const handleAddCustomField = () => {", "const handleSaveFormula = () => {")

# 3. Update Fields Manager Modal "Add Custom Field" button trigger
fields_add_btn_target = """              <Button
                variant="white"
                size="xs"
                icon={Plus}
                style={{ color: brand.primary, borderColor: `${brand.primary}35` }}
                onClick={() => {
                  setFormulaPlacement('totals');
                  setShowCustomFieldModal(true);
                }}
              >
                Add Custom Field
              </Button>"""

fields_add_btn_replacement = """              <Button
                variant="white"
                size="xs"
                icon={Plus}
                style={{ color: brand.primary, borderColor: `${brand.primary}35` }}
                onClick={() => {
                  setFormulaPlacement('totals');
                  setFormulaManagerMode('add');
                  setEditingFormulaId(null);
                  resetFormulaModal();
                  setShowFieldsModal(false);
                  setShowFormulasModal(true);
                }}
              >
                Add Custom Field
              </Button>"""

if fields_add_btn_target in code:
    code = code.replace(fields_add_btn_target, fields_add_btn_replacement)
    print("SUCCESS: Fields Manager Add Custom Field button action updated.")
else:
    print("WARNING: fields_add_btn_target not found!")

# 4. Update Columns Manager Modal "Add Column" button trigger
columns_add_btn_target = """              <Button
                variant="white"
                size="xs"
                icon={Plus}
                style={{ color: brand.primary, borderColor: `${brand.primary}35` }}
                onClick={() => {
                  setFormulaPlacement('column');
                  setShowCustomFieldModal(true);
                }}
              >
                Add Column
              </Button>"""

columns_add_btn_replacement = """              <Button
                variant="white"
                size="xs"
                icon={Plus}
                style={{ color: brand.primary, borderColor: `${brand.primary}35` }}
                onClick={() => {
                  setFormulaPlacement('column');
                  setFormulaManagerMode('add');
                  setEditingFormulaId(null);
                  resetFormulaModal();
                  setShowColumnsModal(false);
                  setShowFormulasModal(true);
                }}
              >
                Add Column
              </Button>"""

if columns_add_btn_target in code:
    code = code.replace(columns_add_btn_target, columns_add_btn_replacement)
    print("SUCCESS: Columns Manager Add Column button action updated.")
else:
    print("WARNING: columns_add_btn_target not found!")

# 5. Locate and replace the Formulas Manager Modal and Add Formula Field Modal code
# Let's search for Formulas Manager Modal block
formulas_modal_start = "        {/* ── Formulas Manager Modal ── */}"
formulas_modal_end = "        {/* ── Template Settings Modal ── */}"

idx_formulas_start = code.find(formulas_modal_start)
idx_formulas_end = code.find(formulas_modal_end)

if idx_formulas_start != -1 and idx_formulas_end != -1:
    old_formulas_block = code[idx_formulas_start:idx_formulas_end]
    
    new_formulas_block = """        {/* ── Formulas Manager Modal ── */}
        <Modal
          isOpen={showFormulasModal}
          onClose={() => {
            setShowFormulasModal(false);
            setFormulaManagerMode('list');
            setEditingFormulaId(null);
            resetFormulaModal();
          }}
          title={formulaManagerMode === 'list' ? "🧮 Formulas Manager" : formulaManagerMode === 'add' ? "🧮 Create Formula Field" : "🧮 Edit Formula Field"}
          size="2xl"
          footer={
            formulaManagerMode === 'list' ? (
              <Button
                variant="white"
                size="sm"
                onClick={() => {
                  setShowFormulasModal(false);
                  setFormulaManagerMode('list');
                  setEditingFormulaId(null);
                  resetFormulaModal();
                }}
              >
                Close
              </Button>
            ) : (
              <div className="flex justify-end gap-2 w-full">
                <Button
                  variant="white"
                  size="sm"
                  onClick={() => {
                    setFormulaManagerMode('list');
                    setEditingFormulaId(null);
                    resetFormulaModal();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveFormula}
                  style={{ backgroundColor: brand.primary }}
                  disabled={!formulaFieldName.trim() || formulaTokens.length === 0}
                >
                  {formulaManagerMode === 'add' ? 'Create Formula' : 'Save Changes'}
                </Button>
              </div>
            )
          }
        >
          {formulaManagerMode !== 'list' ? (
            <div className="space-y-3">
              {/* Header with Back button */}
              <div className="flex items-center gap-2 pb-2 border-b">
                <button
                  type="button"
                  onClick={() => {
                    setFormulaManagerMode('list');
                    setEditingFormulaId(null);
                    resetFormulaModal();
                  }}
                  className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-700">
                  {formulaManagerMode === 'add' ? 'Create New Formula' : `Edit Formula: ${formulaFieldName}`}
                </span>
              </div>

              {/* Field Name */}
              <Input
                label="Field Label *"
                variant="compact"
                placeholder="e.g. Net Payable, Profit, Balance"
                value={formulaFieldName}
                onChange={e => setFormulaFieldName(e.target.value)}
              />

              {/* Placement */}
              {!editingFormulaId && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>
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
                        className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border transition-all ${
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
              )}

              {/* Formula Builder */}
              <div className="space-y-2">
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 2 }}>
                  Formula Definition
                </label>

                {/* Live preview */}
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-xs font-mono min-h-[34px] flex flex-wrap items-center gap-1">
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
                        formulaAddType === t ? 'bg-indigo-650 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}>
                      {t === 'field' ? '📊 Field' : t === 'operator' ? '➕ Operator' : '🔢 Number'}
                    </button>
                  ))}
                </div>

                {/* Field picker */}
                {formulaAddType === 'field' && (
                  <div className="flex gap-2">
                    <select
                      className="flex-1 border border-slate-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
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
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap cursor-pointer"
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
                          className={`w-8 h-8 rounded-lg text-sm font-bold border transition-colors ${
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
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 whitespace-nowrap cursor-pointer"
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
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-600 hover:bg-green-700 whitespace-nowrap cursor-pointer"
                    >Add</button>
                  </div>
                )}

                {formulaTokens.length > 0 && (
                  <button type="button" onClick={() => setFormulaTokens([])}
                    className="text-[10px] text-red-400 hover:text-red-600 font-medium cursor-pointer">
                    Clear formula
                  </button>
                )}
                <p className="text-[10px] text-slate-400 italic">e.g. Subtotal − Discount + Tax = Net Payable</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-xs font-bold text-slate-400">Manage calculated fields and column formulas.</span>
                <Button
                  variant="white"
                  size="xs"
                  icon={Plus}
                  style={{ color: brand.primary, borderColor: `${brand.primary}35` }}
                  onClick={() => {
                    setFormulaPlacement('totals');
                    setFormulaManagerMode('add');
                    setEditingFormulaId(null);
                    resetFormulaModal();
                  }}
                >
                  Create Formula Field
                </Button>
              </div>

              <div className="space-y-3">
                {(() => {
                  const formulaFields = activeCustomFields.filter(cf => cf.field_type === 'formula');
                  const formulaCols = activeColumns.filter(c => c.is_custom && c.formula_tokens && c.formula_tokens.length > 0);

                  if (formulaFields.length === 0 && formulaCols.length === 0) {
                    return (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                        <p className="text-xs text-slate-400">No formulas created yet. Click above to create one.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {formulaFields.map(f => (
                        <div key={f.custom_field_id} className="border border-slate-200 bg-white p-3 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">📋 Field: {f.field_name}</span>
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="white"
                                size="xs"
                                icon={Pencil}
                                onClick={() => {
                                  setEditingTemplate(null);
                                  setSelectedCustomFieldId(f.custom_field_id);
                                  setFormulaFieldName(f.field_name);
                                  setFormulaPlacement('totals');
                                  setFormulaTokens(f.formula_tokens || []);
                                  setEditingFormulaId(f.custom_field_id);
                                  setFormulaManagerMode('edit');
                                }}
                              >
                                Edit Formula
                              </Button>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomField(f.custom_field_id)}
                                className="p-1.5 rounded hover:bg-red-50 text-slate-350 hover:text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {f.formula_tokens && (
                            <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-2 py-1.5 text-[10.5px] font-mono flex flex-wrap gap-1">
                              {f.formula_tokens.map((tok, i) => (
                                <span key={i} className={`rounded px-1.5 py-0.5 font-bold ${
                                  tok.type === 'field'    ? 'bg-indigo-155 text-indigo-800' :
                                  tok.type === 'operator' ? 'bg-amber-155 text-amber-800' :
                                                           'bg-green-155 text-green-800'
                                }`}>
                                  {tok.type === 'field' ? tok.fieldLabel : tok.type === 'operator' ? tok.operator : tok.constant}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {formulaCols.map(c => (
                        <div key={c.column_id} className="border border-slate-200 bg-white p-3 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">📊 Column: {c.column_name}</span>
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="white"
                                size="xs"
                                icon={Pencil}
                                onClick={() => {
                                  setSelectedColumnId(c.column_id);
                                  setFormulaFieldName(c.column_name);
                                  setFormulaPlacement('column');
                                  setFormulaTokens(c.formula_tokens || []);
                                  setEditingFormulaId(c.column_id);
                                  setFormulaManagerMode('edit');
                                }}
                              >
                                Edit Formula
                              </Button>
                              <button
                                type="button"
                                onClick={() => handleRemoveCustomColumn(c.column_id)}
                                className="p-1.5 rounded hover:bg-red-50 text-slate-350 hover:text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {c.formula_tokens && (
                            <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-2 py-1.5 text-[10.5px] font-mono flex flex-wrap gap-1">
                              {c.formula_tokens.map((tok, i) => (
                                <span key={i} className={`rounded px-1.5 py-0.5 font-bold ${
                                  tok.type === 'field'    ? 'bg-indigo-155 text-indigo-800' :
                                  tok.type === 'operator' ? 'bg-amber-155 text-amber-800' :
                                                           'bg-green-155 text-green-800'
                                }`}>
                                  {tok.type === 'field' ? tok.fieldLabel : tok.type === 'operator' ? tok.operator : tok.constant}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </Modal>
"""
    code = code.replace(old_formulas_block, new_formulas_block)
    print("SUCCESS: Formulas Manager Modal updated to support internal screens.")
else:
    print("ERROR: Formulas Modal block not found!")

# 6. Delete the old showCustomFieldModal modal block entirely
formula_modal_start = "        {/* ── Add Formula Field Modal ── */}"
formula_modal_end = "      {/* Add / Edit modal popup drawer */}"

idx_form_modal_start = code.find(formula_modal_start)
idx_form_modal_end = code.find(formula_modal_end)

if idx_form_modal_start != -1 and idx_form_modal_end != -1:
    code = code[:idx_form_modal_start] + code[idx_form_modal_end:]
    print("SUCCESS: Duplicate Add Formula Field Modal removed.")
else:
    print("ERROR: Duplicate Add Formula Field Modal block not found!")

# 7. Remove the showCustomFieldModal state variable declaration if it's there
code = code.replace("  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);", "")
code = code.replace("  const [showCustomFieldModal, setShowCustomFieldModal] = useState<boolean>(false);", "")

with open(path, "w", encoding="utf-8") as f:
    f.write(code)

print("SUCCESS: Codebase refactored to remove duplicate nested modals.")
