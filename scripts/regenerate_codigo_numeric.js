const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'racas-data.js');
const backupPath = filePath + '.codigo-numeric.bak';

let content = fs.readFileSync(filePath, 'utf8');
// Backup
fs.writeFileSync(backupPath, content, 'utf8');

// Match all codigo: "..." occurrences
const regex = /codigo:\s*"([^\"]+)"/g;
let match;
const positions = [];
while ((match = regex.exec(content)) !== null) {
  positions.push({ index: match.index, len: match[0].length });
}

if (positions.length === 0) {
  console.log('Nenhum campo codigo encontrado para substituir.');
  process.exit(0);
}

// Replace sequentially
let counter = 1;
content = content.replace(regex, () => {
  const num = String(counter).padStart(4, '0');
  const repl = `codigo: "${num}"`;
  counter += 1;
  return repl;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Substituídos ${counter-1} códigos. Backup em: ${backupPath}`);
