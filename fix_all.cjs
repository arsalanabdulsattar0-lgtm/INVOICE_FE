const fs = require('fs');

let content = fs.readFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', 'utf8');

// 1. Fix TAB_MODULES.inventory
const badInventoryMatch = /\binventory:\s*\[\s*\{\s*id:\s*'inventory',\s*label:\s*'Inventory'\s*\}\s*\]/;
if (badInventoryMatch.test(content)) {
  content = content.replace(badInventoryMatch, `inventory: [\n    { id: 'product', label: 'Product' },\n    { id: 'warehouse', label: 'Warehouse' },\n    { id: 'stock_adjustment', label: 'Adjustment Type' }\n  ]`);
  console.log('Fixed TAB_MODULES.inventory');
}

// 2. Fix Business Partner ONLY CUSTOM FIELD
const regexTabs = /\s*\) : activeTab === 'customer' \? \([\s\S]*?\) : activeTab === 'document' \? \(/;
if (regexTabs.test(content)) {
  const replacement = `\n        ) : activeTab === 'customer' ? (\n          <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 min-h-0">\n            <DocumentSettingsModule brand={brand} activeTab="Customer" hideTabs={false} />\n          </div>\n        ) : activeTab === 'document' ? (`;
  content = content.replace(regexTabs, replacement);
  console.log('Fixed Business Partner tab rendering');
}

// 3. Fix handleTabSwitch for inventory
const badReturnMatch = /if \(tab === 'sales' \|\| tab === 'purchases' \|\| tab === 'inventory'\) return; \/\/ these tabs use direct layouts/;
if (badReturnMatch.test(content)) {
  content = content.replace(badReturnMatch, "if (tab === 'sales' || tab === 'purchases') return; // these tabs use direct layouts");
  console.log('Fixed handleTabSwitch for inventory');
}

// 4. Fix Add Field button
const addFieldMatch = /<Button\s+variant="outline"\s+size="md"([\s\S]*?)icon=\{Plus\}\s*>\s*Add Field\s*<\/Button>\s*<SaveButton size="md"/;
if (addFieldMatch.test(content)) {
  content = content.replace(addFieldMatch, `<AddButton\n                size="sm"$1>\n                Add Field\n              </AddButton>\n              <SaveButton size="sm"`);
  console.log('Fixed Add Field button');
}

// 5. Ensure ActionButtons import
if (!content.includes('import { SaveButton, AddButton } from')) {
  content = content.replace("import { SaveButton } from '../../../components/ui/ActionButtons';", "import { SaveButton, AddButton } from '../../../components/ui/ActionButtons';");
}

fs.writeFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', content, 'utf8');
