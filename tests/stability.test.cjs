const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { create, KEY } = require('../src/save.js');
const html = fs.readFileSync(require('node:path').resolve(__dirname, '../Vampire_Survivors_Jogo.html'), 'utf8');
function storage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), data };
}
function functionSource(name) {
  const start = html.indexOf('function ' + name + '(');
  assert.ok(start >= 0, name);
  const open = html.indexOf('{', start);
  let depth = 1, end = open + 1;
  for (; depth && end < html.length; end++) {
    if (html[end] === '{') depth++;
    if (html[end] === '}') depth--;
  }
  return html.slice(start, end);
}
test('todos os scripts embutidos têm sintaxe válida', () => {
  let count = 0;
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    new vm.Script(match[1], { filename: 'inline-' + count++ });
  }
  assert.equal(count, 14);
});
test('migração preserva os dois saldos e melhorias; reabertura não duplica ouro', () => {
  const db = storage({ vs10: JSON.stringify({ gold: 80, hp: 2, dmg: 3 }), metaProgression: JSON.stringify({ gold: 50, souls: 4, upgrades: { magnet: 2 } }) });
  const first = create(db);
  assert.equal(first.data.gold, 130);
  assert.equal(first.data.hp, 2);
  assert.equal(first.data.upgrades.magnet, 2);
  first.data.gold -= 20;
  assert.equal(first.persist(), true);
  assert.equal(create(db).data.gold, 110);
  assert.ok(db.getItem('vs10'));
});
test('save corrompido recupera backup válido', () => {
  const db = storage({ [KEY]: '{broken', [KEY + '.backup']: JSON.stringify({ version: 1, gold: 300 }) });
  assert.equal(create(db, () => {}).data.gold, 300);
});
test('falha de escrita é informada sem destruir o progresso em memória', () => {
  const db = storage({ vs10: JSON.stringify({ gold: 99 }) });
  db.setItem = () => { throw Error('quota'); };
  const messages = [];
  const save = create(db, text => messages.push(text));
  assert.equal(save.persist(), false);
  assert.equal(save.data.gold, 99);
  assert.equal(save.writable, false);
  assert.ok(messages.length);
});
test('gema concede XP uma única vez, inclusive quando verificada novamente', () => {
  const context = { player: { x: 0, y: 0, r: 22, magnet: 130 }, gems: [{ x: 0, y: 0, r: 6, xp: 12 }], total: 0, Math };
  context.addXp = value => context.total += value;
  vm.createContext(context);
  vm.runInContext(functionSource('collectGems') + ';collectGems(.016);collectGems(.016)', context);
  assert.equal(context.total, 12);
  assert.equal(context.gems[0].dead, true);
});
test('poderes duram dez segundos de simulação e restauram magnetismo base', () => {
  const removed = [];
  const context = { player: { tempMagnetTimer: 10, magnet: 900, baseMagnet: 190, electricShield: true, electricShieldRemaining: 10 }, document: { getElementById: id => ({ remove: () => removed.push(id) }) }, Math };
  vm.createContext(context);
  vm.runInContext(functionSource('updatePowers') + ';updatePowers(4)', context);
  assert.equal(context.player.tempMagnetTimer, 6);
  assert.equal(context.player.electricShieldRemaining, 6);
  vm.runInContext('updatePowers(6)', context);
  assert.equal(context.player.magnet, 190);
  assert.equal(context.player.electricShield, false);
  assert.equal(removed.length, 2);
});
test('loop não atualiza combate durante pausa ou após fim', () => {
  const context = { state: 'play', paused: true, last: 0, updates: 0, draw() {}, requestAnimationFrame() {}, Math };
  context.update = () => context.updates++;
  vm.createContext(context);
  vm.runInContext(functionSource('loop') + ';loop(16)', context);
  assert.equal(context.updates, 0);
  context.paused = false;
  vm.runInContext('loop(32)', context);
  assert.equal(context.updates, 1);
  context.state = 'end';
  vm.runInContext('loop(48)', context);
  assert.equal(context.updates, 1);
});
test('recompensa permanente usa estatísticas reais e não credita ouro duas vezes', () => {
  const match = html.match(/window.gainMetaResources = function\(\)\{([\s\S]*?)\n    \};/);
  assert.ok(match);
  const context = { save: { gold: 70, souls: 0, crystals: 0 }, goldRun: 200, kills: 105, wave: 9, persist() {}, renderMetaHud() {}, console };
  vm.createContext(context);
  vm.runInContext('(function(){' + match[1] + '})()', context);
  assert.equal(context.save.gold, 70);
  assert.equal(context.save.souls, 3);
  assert.equal(context.save.crystals, 3);
});
