const fs = require('fs');

let content = fs.readFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', 'utf8');

// 1. Fix TAB_MODULES.inventory
const badInventoryMatch = /\binventory:\s*\[\s*\{\s*id:\s*'inventory',\s*label:\s*'Inventory'\s*\}\s*\]/;
if (badInventoryMatch.test(content)) {
  content = content.replace(badInventoryMatch, `inventory: [\n    { id: 'product', label: 'Product' },\n    { id: 'warehouse', label: 'Warehouse' },\n    { id: 'stock_adjustment', label: 'Adjustment Type' }\n  ]`);
  console.log('Fixed TAB_MODULES.inventory');
} else {
  console.log('Could not find bad inventory match');
}

// 2. Fix Business Partner ONLY CUSTOM FIELD
const documentMatch = "        ) : activeTab === 'document' ? (";
if (content.includes(documentMatch) && !content.includes("activeTab === 'customer' ?")) {
  const replacement = `        ) : activeTab === 'customer' ? (\n          <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 min-h-0">\n            <DocumentSettingsModule brand={brand} activeTab="Customer" hideTabs={false} />\n          </div>\n` + documentMatch;
  content = content.replace(documentMatch, replacement);
  console.log('Fixed Business Partner tab rendering');
}

fs.writeFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', content, 'utf8');
