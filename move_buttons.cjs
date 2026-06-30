const fs = require('fs');

let content = fs.readFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', 'utf8');

// Move buttons from footer to header for Document tab
const docFooterMatch = /\s*footer=\{\s*\/\* Footer Bar \*\/[\s\S]*?\}\s*>/;
if (docFooterMatch.test(content)) {
  content = content.replace(docFooterMatch, "          >");
  console.log('Removed document footer');
}

const docRowMatch = /<div className="flex flex-wrap items-center gap-x-8 gap-y-4 shrink-0">/;
if (content.includes('<div className="flex flex-wrap items-center gap-x-8 gap-y-4 shrink-0">')) {
  content = content.replace(
    '<div className="flex flex-wrap items-center gap-x-8 gap-y-4 shrink-0">',
    '<div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 shrink-0 w-full">\n            <div className="flex items-center gap-x-8 gap-y-4">'
  );
  // Close the inner div, then add the buttons
  content = content.replace(
    /<div className="w-52">\s*<Input\s*type="date"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
    `<div className="w-52">\n                <Input\n                  type="date"\n                  variant="compact"\n                  value={effectiveDate}\n                  onChange={(e) => setEffectiveDate(e.target.value)}\n                />\n              </div>\n            </div>\n            </div>\n\n            <div className="flex items-center gap-3">\n              {savedMessage && (\n                <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 font-sans px-2 py-1 rounded bg-emerald-50">\n                  <Check className="w-3.5 h-3.5" /> Saved\n                </div>\n              )}\n              <AddButton\n                size="sm"\n                onClick={() => {\n                  const newId = \`row-\${Date.now()}-\${Math.random()}\`;\n                  setGrid(prev => [\n                    ...prev,\n                    { id: newId, type: 'Custom Text', value: 'TEXT', separator: '\\\\' }\n                  ]);\n                  setEditingRowId(newId);\n                  setEditingRowData({ type: 'Custom Text', value: 'TEXT', separator: '\\\\' });\n                }}\n              >\n                Add Field\n              </AddButton>\n              <SaveButton size="sm" onClick={handleSaveSettings}>\n                Save\n              </SaveButton>\n            </div>\n          </div>`
  );
  console.log('Moved document buttons to top right');
}

// Move buttons from footer to header for Setup/other tabs
const setupFooterMatch = /\s*footer=\{\s*\/\* Standard footer bar \*\/[\s\S]*?\}\s*>/;
if (setupFooterMatch.test(content)) {
  content = content.replace(setupFooterMatch, `            headerRight={
              <div className="flex items-center gap-3">
                {savedMessage && (
                  <div className="text-[11px] font-bold text-emerald-200 flex items-center gap-1.5 font-sans px-2 py-1 rounded bg-emerald-900/30">
                    <Check className="w-3.5 h-3.5" /> Saved
                  </div>
                )}
                <SaveButton variant="white" size="md" onClick={handleSaveSettings}>
                  Save
                </SaveButton>
              </div>
            }
          >`);
  console.log('Moved setup buttons to top right');
}

fs.writeFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', content, 'utf8');
