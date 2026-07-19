const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'racas-data.js');
const backupPath = filePath + '.bak';
const tmpModule = path.join(__dirname, 'tmp_racas_array.js');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'tipo';
}

function pad(n, width = 4) {
  return String(n).padStart(width, '0');
}

let content = fs.readFileSync(filePath, 'utf8');
const startIdx = content.indexOf('const RACAS_DATABASE = [');
if (startIdx === -1) {
  console.error('Não encontrei a declaração de RACAS_DATABASE');
  process.exit(1);
}
const arrayStart = content.indexOf('[', startIdx);
// encontrar o fechamento correspondente de array (assume "]\n" seguido por funções)
let arrayEnd = content.indexOf('\n];', arrayStart);
if (arrayEnd === -1) {
  arrayEnd = content.indexOf('];', arrayStart);
}
if (arrayEnd === -1) {
  console.error('Não encontrei o fechamento do array RACAS_DATABASE');
  process.exit(1);
}
const arrayText = content.slice(arrayStart, arrayEnd + 2); // include ]

// criar módulo temporário para requerer o array
fs.writeFileSync(tmpModule, 'module.exports = ' + arrayText + ';', 'utf8');
let arr;
try {
  arr = require(tmpModule);
} catch (err) {
  console.error('Erro ao requerer módulo temporário:', err);
  fs.unlinkSync(tmpModule);
  process.exit(1);
}

// gerar códigos por tipo
const counters = {};
for (let i = 0; i < arr.length; i++) {
  const r = arr[i];
  const tipo = r.tipo || 'tipo';
  const key = slugify(tipo);
  counters[key] = (counters[key] || 0) + 1;
  const codigo = `${key}-${pad(counters[key])}`;
  r.codigo = r.codigo || codigo;
}

// serializar de volta para JS com chaves sem aspas onde possível
let newArrayText = JSON.stringify(arr, null, 2);
// remover aspas de chaves simples
newArrayText = newArrayText.replace(/"([a-zA-Z0-9_]+)":/g, '$1:');
// ajustar aspas duplas em strings para simples? Keep double quotes for URLs etc.

// reconstrói o arquivo
const newContent = content.slice(0, arrayStart) + newArrayText + content.slice(arrayEnd + 2);

// backup
fs.copyFileSync(filePath, backupPath);
fs.writeFileSync(filePath, newContent, 'utf8');

// cleanup
fs.unlinkSync(tmpModule);
console.log('Códigos inseridos e arquivo atualizado. Backup criado em', backupPath);
