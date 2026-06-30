const fs = require('fs');

let content = fs.readFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', 'utf8');

// 1. Remove || tab === 'inventory' from handleTabSwitch
const badReturnMatch = /if \(tab === 'sales' \|\| tab === 'purchases' \|\| tab === 'inventory'\) return; \/\/ these tabs use direct layouts/;
if (badReturnMatch.test(content)) {
  content = content.replace(badReturnMatch, "if (tab === 'sales' || tab === 'purchases') return; // these tabs use direct layouts");
  console.log('Fixed handleTabSwitch for inventory');
} else {
  console.log('Could not find bad return match in handleTabSwitch');
}

fs.writeFileSync('src/pages/Settings/components/CodeSettingsModule.tsx', content, 'utf8');
