const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src/app/api', (filePath) => {
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix params.id
    content = content.replace(/const\s+\{\s*([a-zA-Z0-9_, ]+)\s*\}\s*=\s*params;/g, 'const { $1 } = await params;');
    
    // Fix params.[something] directly without destructuring, if any
    content = content.replace(/params\.id/g, '(await params).id');
    content = content.replace(/params\.token/g, '(await params).token');

    // Fix mongoose new: true
    content = content.replace(/\{\s*new\s*:\s*true\s*([,}])/g, "{ returnDocument: 'after'$1");
    content = content.replace(/\{\s*new\s*:\s*true\s*$/gm, "{ returnDocument: 'after'");

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
