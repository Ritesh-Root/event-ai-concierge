const fs = require('fs');
const path = require('path');

const targetDirs = ['src', 'tests', 'public'];
const rootFiles = ['server.js'];

// Regexes to strip comments
// We use simple regex but try to avoid stripping URLs in strings "http://..."
// For JS & CSS
const jsCssCommentRegex = /\/\*[\s\S]*?\*\/|(?<!:)\/\/.*?(?=\r?\n|$)/g;

// For HTML
const htmlCommentRegex = /<!--[\s\S]*?-->/g;

// For empty lines
const emptyLineRegex = /^\s*[\r\n]/gm;

function cleanFile(filePath) {
  let ext = path.extname(filePath);
  if (!['.js', '.css', '.html'].includes(ext)) {
    return;
  }
  
  let code = fs.readFileSync(filePath, 'utf8');
  let originalCode = code;

  // Remove comments
  if (['.js', '.css'].includes(ext)) {
    code = code.replace(jsCssCommentRegex, '');
  } else if (ext === '.html') {
    code = code.replace(htmlCommentRegex, '');
  }

  // Remove consecutive empty lines and truly empty lines
  code = code.replace(emptyLineRegex, '');

  if (code !== originalCode) {
    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`Cleaned: ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    let fullPath = path.join(dir, file);
    let stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      walkDir(fullPath);
    } else {
      cleanFile(fullPath);
    }
  });
}

// Clean directories
targetDirs.forEach((dir) => {
  walkDir(path.join(__dirname, dir));
});

// Clean root files
rootFiles.forEach((file) => {
  cleanFile(path.join(__dirname, file));
});

console.log("Cleanup complete!");
