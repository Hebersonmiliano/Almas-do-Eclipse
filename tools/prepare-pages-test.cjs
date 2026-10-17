const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const site = path.join(root, '_site');
const test = path.join(site, 'teste');

fs.rmSync(site, { recursive: true, force: true });
fs.mkdirSync(path.join(test, 'src'), { recursive: true });
fs.copyFileSync(path.join(root, 'dist', 'index.html'), path.join(test, 'index.html'));
fs.copyFileSync(path.join(root, 'dist', 'src', 'save.js'), path.join(test, 'src', 'save.js'));
fs.copyFileSync(path.join(root, 'dist', 'src', 'input.js'), path.join(test, 'src', 'input.js'));
fs.writeFileSync(path.join(site, 'index.html'), `<!doctype html>
<html lang="pt-BR"><meta charset="utf-8"><title>Almas do Eclipse</title>
<body style="font-family:Arial;background:#090912;color:#fff;text-align:center;padding:12vh 20px">
<h1>Almas do Eclipse</h1><p>A produção ainda não foi publicada.</p>
<p><a style="color:#facc15" href="./teste/">Abrir ambiente de teste</a></p></body></html>`);
fs.writeFileSync(path.join(site, '.nojekyll'), '');
console.log('Site de teste preparado em _site/teste/');
