const { test, expect } = require('@playwright/test');
test('abre, inicia, coleta XP, pausa poderes, encerra e recupera save', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1800);
  await page.evaluate(() => startSelectedGame());
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
