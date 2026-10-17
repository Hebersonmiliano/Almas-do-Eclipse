(function (root) {
  'use strict';
  const KEY = 'survivor.save.v1';
  const number = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0;
  function normalize(value = {}) {
    const result = { version: 1, upgrades: {} };
    for (const key of ['gold', 'souls', 'crystals', 'hp', 'dmg', 'speed', 'luck', 'xp']) result[key] = number(value[key]);
    for (const key of ['damage', 'magnet', 'speed', 'hp', 'crit']) result.upgrades[key] = number(value.upgrades?.[key]);
    return result;
  }
  function create(storage, warn = console.warn) {
    let writable = true;
    function read(key) {
      try {
        const raw = storage.getItem(key);
        if (!raw) return null;
        const value = JSON.parse(raw);
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Formato inválido');
        if (key.startsWith(KEY) && value.version !== 1) throw new Error('Versão não suportada');
        return value;
      } catch (error) {
        warn('Não foi possível ler o progresso: ' + key, error);
        return null;
      }
    }
    const current = read(KEY);
    let initial = current || read(KEY + '.backup');
    if (!initial) {
      const classic = read('vs10');
      const progression = read('metaProgression');
      let oldGold = 0;
      try { oldGold = storage.getItem('gold'); } catch (_) {}
      initial = { ...classic, ...progression, ...Object.fromEntries(['hp','dmg','speed','luck','xp'].map(key => [key, classic?.[key]])),
        gold: classic || progression ? number(classic?.gold) + number(progression?.gold) : number(oldGold) };
    }
    const data = normalize(initial);
    function persist() {
      try {
        const old = storage.getItem(KEY);
        if (old && read(KEY)) storage.setItem(KEY + '.backup', old);
        storage.setItem(KEY, JSON.stringify(data));
        writable = true;
        return true;
      } catch (error) {
        writable = false;
        warn('Não foi possível salvar. Exporte ou preserve esta sessão antes de fechar.', error);
        return false;
      }
    }
    if (!current) persist();
    return { data, persist, get writable() { return writable; } };
  }
  const api = { create, normalize, KEY };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GameSave = api;
})(globalThis);
