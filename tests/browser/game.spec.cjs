const { test, expect } = require('@playwright/test');
async function installGamepad(page) {
  await page.addInitScript(() => {
    const buttons = Array.from({ length: 17 }, () => ({ pressed: false, value: 0 }));
    window.__testGamepad = { connected: true, id: 'Xbox Wireless Controller', mapping: 'standard', axes: [0, 0, 0, 0], buttons };
    Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [window.__testGamepad] });
  });
}
async function pressPad(page, index) {
  await page.evaluate(i => { window.__testGamepad.buttons[i] = { pressed: true, value: 1 }; }, index);
  await page.waitForTimeout(80);
  await page.evaluate(i => { window.__testGamepad.buttons[i] = { pressed: false, value: 0 }; }, index);
  await page.waitForTimeout(80);
}
test('abre, inicia, coleta XP, pausa poderes, encerra e recupera save', async ({ page }) => {
  await installGamepad(page);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1800);
  await page.evaluate(() => startSelectedGame());
  await page.evaluate(() => { player.maxHp = 100000; player.hp = player.maxHp; });
  await expect.poll(() => page.evaluate(() => state)).toBe('play');
  await page.waitForTimeout(800);
  const xp = await page.evaluate(() => {
    paused = true;
    const before = player.xp;
    gems.push({ x: player.x, y: player.y, r: 6, xp: 2 });
    collectGems(.016);
    collectGems(.016);
    return player.xp - before;
  });
  expect(xp).toBe(2);
  const power = await page.evaluate(() => { activateMagnetism10s(); return player.tempMagnetTimer; });
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => player.tempMagnetTimer)).toBe(power);
  await page.evaluate(() => { paused = false; });
  await page.waitForTimeout(350);
  expect(await page.evaluate(() => player.tempMagnetTimer)).toBeLessThan(power);
  const shield = await page.evaluate(() => {
    paused = true;
    activateElectricShield(10000);
    return player.electricShieldRemaining;
  });
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => player.electricShieldRemaining)).toBe(shield);
  await page.evaluate(() => {
    const boss = { x: player.x + 100, y: player.y, hp: 1, maxHp: 1, boss: true, invuln: 0, kind: 'test', r: 20, xp: 10, gold: 1, color: '#fff' };
    enemies.push(boss);
    hit(boss, 1000, true);
  });
  expect(await page.evaluate(() => player.tempMagnetTimer)).toBe(10);
  const result = await page.evaluate(() => {
    goldRun = 100; kills = 105; wave = 9;
    const before = meta.gold;
    end(true);
    end(true);
    return { gold: meta.gold, delta: meta.gold - before, souls: meta.souls, crystals: meta.crystals };
  });
  expect(result.delta).toBe(100);
  expect(result.souls).toBe(3);
  expect(result.crystals).toBe(3);
  await page.reload();
  expect(await page.evaluate(() => meta.gold)).toBe(result.gold);
  expect(errors).toEqual([]);
});
test('teclado e controle Xbox movem, ativam habilidades e controlam pausa', async ({ page }) => {
  await installGamepad(page);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1800);
  await page.evaluate(() => document.querySelector('.big-play').focus());
  await pressPad(page, 0);
  await expect.poll(() => page.evaluate(() => state)).toBe('play');
  await page.evaluate(() => { player.maxHp = 100000; player.hp = player.maxHp; });
  const start = await page.evaluate(() => ({ x: player.x, y: player.y }));
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(180);
  await page.keyboard.up('KeyD');
  expect(await page.evaluate(() => player.x)).toBeGreaterThan(start.x);
  await page.evaluate(() => { window.__testGamepad.axes[1] = 1; });
  await page.waitForTimeout(180);
  await page.evaluate(() => { window.__testGamepad.axes[1] = 0; });
  expect(await page.evaluate(() => player.y)).toBeGreaterThan(start.y);
  await pressPad(page, 9);
  await expect.poll(() => page.evaluate(() => paused && !buildScreen.classList.contains('hidden'))).toBe(true);
  await pressPad(page, 1);
  await expect.poll(() => page.evaluate(() => !paused && buildScreen.classList.contains('hidden'))).toBe(true);
  await pressPad(page, 0);
  expect(await page.evaluate(() => player.cd.dash)).toBeGreaterThan(0);
  await pressPad(page, 2);
  expect(await page.evaluate(() => player.cd.bomb)).toBeGreaterThan(0);
  await pressPad(page, 1);
  expect(await page.evaluate(() => player.cd.shield)).toBeGreaterThan(0);
  await pressPad(page, 3);
  expect(await page.evaluate(() => player.cd.meteor)).toBeGreaterThan(0);
  await pressPad(page, 5);
  expect(await page.evaluate(() => player.cd.time)).toBeGreaterThan(0);
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => paused)).toBe(true);
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => paused)).toBe(false);
  expect(errors).toEqual([]);
});
test('migra save antigo no navegador e mantém melhorias após recarregar', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('survivor.save.v1')) {
      localStorage.setItem('vs10', JSON.stringify({ gold: 80, hp: 2 }));
      localStorage.setItem('metaProgression', JSON.stringify({ gold: 50, souls: 7, upgrades: { magnet: 2 } }));
    }
  });
  await page.goto('/');
  expect(await page.evaluate(() => meta.gold)).toBe(130);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1800);
  await page.evaluate(() => { startSelectedGame(); paused = true; });
  expect(await page.evaluate(() => player.baseMagnet)).toBe(await page.evaluate(() => player.magnet));
  await page.reload();
  expect(await page.evaluate(() => meta.gold)).toBe(130);
  expect(await page.evaluate(() => meta.upgrades.magnet)).toBe(2);
});
