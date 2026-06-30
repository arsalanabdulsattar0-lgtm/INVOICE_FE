const fs = require('fs');

let content = fs.readFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', 'utf8');

// 2. Fix Business Partner ONLY CUSTOM FIELD
const documentMatch = "        ) : activeTab === 'document' ? (";
if (content.includes(documentMatch) && !content.includes(") : activeTab === 'customer' ?")) {
  const replacement = `        ) : activeTab === 'customer' ? (\n          <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 min-h-0">\n            <DocumentSettingsModule brand={brand} activeTab="Customer" hideTabs={false} />\n          </div>\n` + documentMatch;
  content = content.replace(documentMatch, replacement);
  console.log('Fixed Business Partner tab rendering');
  fs.writeFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', content, 'utf8');
} else {
  console.log('Failed to fix Business Partner tab rendering');
}
