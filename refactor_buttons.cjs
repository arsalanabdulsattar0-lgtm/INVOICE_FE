const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function refactorFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) return;
  
  // Skip ActionButtons.tsx and Button.tsx themselves
  if (filePath.includes('ActionButtons.tsx') || filePath.includes('Button.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We are going to replace `<Button ... icon={Plus} ...> Add </Button>` with `<AddButton ...> Add </AddButton>`
  // And similarly for Save.
  
  // A regex to match a <Button ...> block up to </Button>
  // This uses a non-greedy match to find the closing tag.
  // Warning: This does not support nested <Button> tags, but Button is never nested inside Button.
  const buttonRegex = /<Button\b([^>]*)>([\s\S]*?)<\/Button>/g;
  
  let modified = false;
  let newContent = content.replace(buttonRegex, (match, props, inner) => {
    // Check if it's an Add or Save button
    const isAdd = props.includes('icon={Plus}');
    const isSave = props.includes('icon={Save}');
    
    if (!isAdd && !isSave) return match; // Leave other buttons alone
    
    modified = true;
    
    // Clean up props
    let cleanedProps = props
      .replace(/icon=\{Plus\}/, '')
      .replace(/icon=\{Save\}/, '')
      .replace(/variant=['"]primary['"]/, '')
      .replace(/variant=\{['"]primary['"]\}/, '')
      .replace(/style=\{\{\s*backgroundColor:\s*brand\.primary\s*\}\}/, '');
      
    // Remove empty spaces left behind
    cleanedProps = cleanedProps.replace(/\s{2,}/g, ' ');
    
    if (isAdd) {
      return `<AddButton${cleanedProps}>${inner}</AddButton>`;
    } else {
      return `<SaveButton${cleanedProps}>${inner}</SaveButton>`;
    }
  });

  if (modified) {
    // Now we need to add the imports for AddButton and SaveButton
    // We should see if AddButton or SaveButton are used in newContent, and if they are imported.
    const usesAdd = newContent.includes('<AddButton');
    const usesSave = newContent.includes('<SaveButton');
    
    // We also need to determine the relative path to ActionButtons.tsx
    // src/components/ui/ActionButtons.tsx
    const targetDir = path.resolve(__dirname, 'src/components/ui');
    const fileDir = path.dirname(filePath);
    let relativePath = path.relative(fileDir, targetDir).replace(/\\/g, '/');
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    const importPath = `${relativePath}/ActionButtons`;
    
    let importsToAdd = [];
    if (usesAdd) importsToAdd.push('AddButton');
    if (usesSave) importsToAdd.push('SaveButton');
    
    if (importsToAdd.length > 0) {
      const importStatement = `import { ${importsToAdd.join(', ')} } from '${importPath}';\n`;
      
      // Insert after the last import statement, or at the top
      const lastImportIndex = newContent.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfImport = newContent.indexOf('\n', lastImportIndex);
        newContent = newContent.slice(0, endOfImport + 1) + importStatement + newContent.slice(endOfImport + 1);
      } else {
        newContent = importStatement + newContent;
      }
    }
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Refactored: ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'src'), refactorFile);
