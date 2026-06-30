const fs = require('fs');

let content = fs.readFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', 'utf8');

// 1. Business Partner & Inventory Layouts
const regexInv = /        \) : activeTab === 'customer' \? \([\s\S]*?\) : activeTab === 'document' \? \(/;

const invReplacement = `        ) : activeTab === 'customer' ? (
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 min-h-0">
            <DocumentSettingsModule brand={brand} activeTab="Customer" hideTabs={false} />
          </div>
        ) : activeTab === 'inventory' ? (
          <div className="flex-grow flex gap-6 min-h-0 overflow-hidden">
            {/* Left Side Panel */}
            <Card className="w-[180px] p-3 flex flex-col h-full overflow-y-auto border border-[#E2E8F0] shadow-sm shrink-0">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1 mb-2">Inventory Modules</h4>
              <div className="space-y-1">
                {TAB_MODULES['inventory'].map(mod => {
                  const isActive = activeModule === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setActiveModule(mod.id)}
                      className={\`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none outline-none cursor-pointer \${isActive ? 'text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}\`}
                      style={isActive ? { backgroundColor: brand.primary } : undefined}
                    >
                      {mod.label}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Right Side Panel */}
            <div className="flex-grow flex flex-col h-full min-h-0 overflow-hidden">
              {activeModule === 'product' && (
                <div className="flex w-full h-full gap-4">
                  <div className="w-1/2 overflow-y-auto custom-scrollbar">
                    <ProductSetupModule brand={brand} />
                  </div>
                  <div className="w-1/2 overflow-y-auto custom-scrollbar">
                    <DocumentSettingsModule brand={brand} activeTab="Inventory" hideTabs={true} />
                  </div>
                </div>
              )}
              {activeModule === 'warehouse' && (
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                  <WarehouseModule brand={brand} />
                </div>
              )}
              {activeModule === 'stock_adjustment' && (
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                  <AdjustmentTypeModule brand={brand} />
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'document' ? (`;

if (regexInv.test(content)) {
  content = content.replace(regexInv, invReplacement);
  console.log('Fixed Inventory and Customer tabs rendering logic');
} else {
  console.log('Could not find regex target');
}

// 2. Remove Add button from table header
const oldTableAdd = /<th className="px-4 py-3 text-center text-\[10px\] font-bold text-slate-400 uppercase tracking-wider w-24">\s*<Button[\s\S]*?Add\s*<\/Button>\s*<\/th>/;
if (oldTableAdd.test(content)) {
  content = content.replace(oldTableAdd, '<th className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider w-24">Actions</th>');
  console.log('Removed Add button from table header');
}

// 3. Add Field button next to Save Button in footer
const footerSave = /<div className="flex gap-3">\s*<Button\s*variant="primary"\s*size="sm"\s*onClick=\{handleSaveSettings\}[\s\S]*?Save\s*<\/Button>\s*<\/div>/g;
content = content.replace(footerSave, `<div className="flex gap-3">
                <AddButton
                  size="sm"
                  onClick={() => {
                    const newId = \`row-\${Date.now()}-\${Math.random()}\`;
                    setGrid(prev => [
                      ...prev,
                      { id: newId, type: 'Custom Text', value: 'TEXT', separator: '\\\\' }
                    ]);
                    setEditingRowId(newId);
                    setEditingRowData({ type: 'Custom Text', value: 'TEXT', separator: '\\\\' });
                  }}
                >
                  Add Field
                </AddButton>
                <SaveButton size="sm" onClick={handleSaveSettings}>
                  Save
                </SaveButton>
              </div>`);
console.log('Replaced footer save with Add Field and SaveButton');

if (!content.includes('import { SaveButton, AddButton }')) {
  content = content.replace("import { SaveButton } from '../../../components/ui/ActionButtons';", "import { SaveButton, AddButton } from '../../../components/ui/ActionButtons';");
}
if (!content.includes('import { SaveButton, AddButton }') && content.includes("import { Button }")) {
  content = content.replace("import { Button } from '../../../components/ui/Button';", "import { Button } from '../../../components/ui/Button';\nimport { SaveButton, AddButton } from '../../../components/ui/ActionButtons';");
}

fs.writeFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', content, 'utf8');
