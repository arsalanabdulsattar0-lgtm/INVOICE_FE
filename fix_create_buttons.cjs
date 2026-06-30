const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function fixFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Fix 1: <Button ... icon={Plus} ... className="bg-emerald-500..."> Create ... </Button>
  const buttonRegex = /<Button\b([^>]*)>([\s\S]*?)<\/Button>/g;
  content = content.replace(buttonRegex, (match, props, inner) => {
    if (props.includes('icon={Plus}') && props.includes('bg-emerald')) {
      let cleanedProps = props
        .replace(/icon=\{Plus\}/, '')
        .replace(/variant=['"]primary['"]/, '')
        .replace(/className=['"][^'"]*bg-emerald-500[^'"]*['"]/, ''); // strip the whole className if it has emerald
        
      return `<AddButton${cleanedProps}>${inner}</AddButton>`;
    }
    return match;
  });

  // Fix 2: <AddButton ... className="bg-emerald-500...">
  const addButtonRegex = /<AddButton\b([^>]*)>/g;
  content = content.replace(addButtonRegex, (match, props) => {
    if (props.includes('bg-emerald')) {
      let cleanedProps = props.replace(/className=['"][^'"]*bg-emerald-500[^'"]*['"]/, '');
      return `<AddButton${cleanedProps}>`;
    }
    return match;
  });

  if (content !== original) {
    // Check if AddButton needs importing
    if (!original.includes('<AddButton') && content.includes('<AddButton')) {
      const targetDir = path.resolve(__dirname, 'src/components/ui');
      const fileDir = path.dirname(filePath);
      let relativePath = path.relative(fileDir, targetDir).replace(/\\/g, '/');
      if (!relativePath.startsWith('.')) relativePath = './' + relativePath;
      const importPath = `${relativePath}/ActionButtons`;
      
      const importStatement = `import { AddButton } from '${importPath}';\n`;
      // Put it after the last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfImport = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfImport + 1) + importStatement + content.slice(endOfImport + 1);
      } else {
        content = importStatement + content;
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'src'), fixFile);
