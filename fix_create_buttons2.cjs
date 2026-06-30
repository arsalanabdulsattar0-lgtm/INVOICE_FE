const fs = require('fs');

let content1 = fs.readFileSync('src/pages/Invoices/InvoiceList.tsx', 'utf8');
content1 = content1.replace(/<AddButton([^>]*)className=[\"']bg-emerald-500[^>]*>/, (match, props) => {
  let cleaned = props.replace(/className=[\"'][^\"']*bg-emerald-500[^\"']*[\"']/, '').replace(/icon=\{Plus\}/, '').replace(/size=[\"']md[\"']/, '');
  return `<AddButton${cleaned}>`;
});
if (!content1.includes('import { AddButton')) {
  let importStatement = "import { AddButton } from '../../components/ui/ActionButtons';\n";
  let idx = content1.lastIndexOf('import ');
  let nextNewline = content1.indexOf('\n', idx);
  content1 = content1.slice(0, nextNewline + 1) + importStatement + content1.slice(nextNewline + 1);
}
fs.writeFileSync('src/pages/Invoices/InvoiceList.tsx', content1, 'utf8');

let content2 = fs.readFileSync('src/pages/Purchases/PurchaseList.tsx', 'utf8');
content2 = content2.replace(/<Button([^>]*)className=[\"']bg-emerald-500[^>]*>/, (match, props) => {
  let cleaned = props.replace(/className=[\"'][^\"']*bg-emerald-500[^\"']*[\"']/, '').replace(/icon=\{Plus\}/, '').replace(/variant=[\"']primary[\"']/, '').replace(/size=[\"']md[\"']/, '');
  return `<AddButton${cleaned}>`;
});
content2 = content2.replace(/Create Purchase\s*<\/Button>/, 'Create Purchase\n            </AddButton>');
if (!content2.includes('import { AddButton')) {
  let importStatement = "import { AddButton } from '../../components/ui/ActionButtons';\n";
  let idx = content2.lastIndexOf('import ');
  let nextNewline = content2.indexOf('\n', idx);
  content2 = content2.slice(0, nextNewline + 1) + importStatement + content2.slice(nextNewline + 1);
}
fs.writeFileSync('src/pages/Purchases/PurchaseList.tsx', content2, 'utf8');

console.log('Fixed InvoiceList and PurchaseList');
