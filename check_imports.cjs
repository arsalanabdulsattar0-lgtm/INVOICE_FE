const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function checkFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('import {\r\nimport {') || content.includes('import {\nimport {')) {
    console.log(`Bad import found in: ${filePath}`);
    // Fix it
    content = content.replace(/import \{\r?\nimport \{ (AddButton|SaveButton|AddButton,\s*SaveButton|SaveButton,\s*AddButton) \} from '([^']+)';\r?\n/g, "import { $1 } from '$2';\nimport {\n");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`-> Fixed: ${filePath}`);
  }
  
  // also fix .//
  if (content.includes('.//ActionButtons')) {
     content = content.replace(/\.\/\/ActionButtons/g, './ActionButtons');
     fs.writeFileSync(filePath, content, 'utf8');
     console.log(`-> Fixed .// in: ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'src'), checkFile);
