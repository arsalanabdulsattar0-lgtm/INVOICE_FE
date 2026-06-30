const fs = require('fs');

let content = fs.readFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', 'utf8');

// 1. inventory TAB_MODULES
const badInv = /\binventory:\s*\[\s*\{\s*id:\s*'inventory',\s*label:\s*'Inventory'\s*\}\s*\]/;
if (badInv.test(content)) {
  content = content.replace(badInv, `inventory: [\n    { id: 'product', label: 'Product' },\n    { id: 'warehouse', label: 'Warehouse' },\n    { id: 'stock_adjustment', label: 'Adjustment Type' }\n  ]`);
  console.log('Fixed inventory TAB_MODULES');
}

// 2. handleTabSwitch
const badReturn = /if \(tab === 'sales' \|\| tab === 'purchases' \|\| tab === 'inventory'\) return;/;
if (badReturn.test(content)) {
  content = content.replace(badReturn, "if (tab === 'sales' || tab === 'purchases') return;");
  console.log('Fixed handleTabSwitch');
}

// 3. activeTab === 'customer' ONLY CUSTOM FIELD
const docMatch = "        ) : activeTab === 'document' ? (";
if (content.includes(docMatch) && !content.includes("activeTab === 'customer' ?")) {
  const replacement = `        ) : activeTab === 'customer' ? (\n          <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 min-h-0">\n            <DocumentSettingsModule brand={brand} activeTab="Customer" hideTabs={false} />\n          </div>\n` + docMatch;
  content = content.replace(docMatch, replacement);
  console.log('Fixed customer custom fields');
}

// 4. Move Add button outside table
const oldTableAdd = /<th className="px-4 py-3 text-center text-\[10px\] font-bold text-slate-400 uppercase tracking-wider w-24">\s*<Button[\s\S]*?Add\s*<\/Button>\s*<\/th>/;
if (oldTableAdd.test(content)) {
  content = content.replace(oldTableAdd, '<th className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider w-24">Actions</th>');
  console.log('Removed Add button from table header');
}

// 5. Place Add and Save buttons correctly
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
