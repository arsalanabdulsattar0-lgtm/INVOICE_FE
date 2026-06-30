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
  
  // Look for our specific bad injection:
  // import {
  // import { SaveButton } from './/ActionButtons';
  // It could also be AddButton.
  
  let modified = false;
  
  // A regex to find import { ... followed immediately by import { AddButton...
  // Actually, let's just find the import { AddButton line and see if it's inside another import.
  // We can just use a simple string replace for the specific syntax error.
  
  const badImportRegex = /import \{\nimport \{ (AddButton|SaveButton|AddButton, SaveButton|SaveButton, AddButton) \} from '([^']+)';\n/g;
  
  if (badImportRegex.test(content)) {
    content = content.replace(badImportRegex, (match, p1, p2) => {
      modified = true;
      return import {  } from '';\nimport {\n;
    });
  }

  // Also fix the .// in the path, it should be ./
  if (content.includes('.//ActionButtons')) {
     content = content.replace(/\.\/\/ActionButtons/g, './ActionButtons');
     modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(Fixed imports in: );
  }
}

walkDir(path.join(__dirname, 'src'), fixFile);
