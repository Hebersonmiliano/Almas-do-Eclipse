const fs = require('node:fs');
const path = require('node:path');
const out = path.resolve(__dirname, '../dist');
fs.mkdirSync(path.join(out, 'src'), { recursive: true });
fs.copyFileSync(path.resolve(__dirname, '../Almas_do_Eclipse.html'), path.join(out, 'index.html'));
fs.copyFileSync(path.resolve(__dirname, '../src/save.js'), path.join(out, 'src/save.js'));
fs.copyFileSync(path.resolve(__dirname, '../src/input.js'), path.join(out, 'src/input.js'));
console.log('Build de teste criado em dist/');
