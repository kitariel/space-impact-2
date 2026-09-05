import { test, expect, type Locator, type Page } from '@playwright/test';

async function withinViewport(page: Page, target: Locator) {
  const box = await target.boundingBox();
  expect(box).not.toBeNull();
  const viewport = page.viewportSize()!;
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.y).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height + 1);
}

test.describe('touch flight', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });

  test('portrait offers a choice, rotation pauses a live run, and returning preserves it', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/play');
    await expect(page.getByRole('heading', { name: 'A WIDER VIEW. A BETTER FLIGHT.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'LAUNCH MISSION' })).toHaveCount(0);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.getByRole('button', { name: 'LAUNCH MISSION' }).click();
    await expect(page.locator('.game-console')).toHaveAttribute('data-game-status', 'playing');
    await withinViewport(page, page.locator('canvas'));
    await withinViewport(page, page.getByRole('button', { name: 'Move down', exact: true }));
    await withinViewport(page, page.getByRole('button', { name: 'Fire plasma', exact: true }));
    await withinViewport(page, page.getByRole('group', { name: 'LCD display mode' }));

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.game-console')).toHaveAttribute('data-game-status', 'paused');
    await expect(page.getByText('FLIGHT PAUSED · YOUR RUN IS SAFE')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.game-console')).toHaveAttribute('data-game-status', 'paused');
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(page.getByRole('button', { name: 'RESUME FLIGHT' })).toBeVisible();
    await page.getByRole('button', { name: 'RESUME FLIGHT' }).click();
    await expect(page.locator('.game-console')).toHaveAttribute('data-game-status', 'playing');
    expect(errors).toEqual([]);
  });

  test('portrait play keeps menus, controls and settings usable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/play');
    await page.getByRole('button', { name: 'PLAY IN PORTRAIT', exact: true }).click();
    await withinViewport(page, page.getByRole('button', { name: 'LAUNCH MISSION' }));
    await page.getByRole('button', { name: 'LAUNCH MISSION' }).click();
    for (const name of ['Move up', 'Move down', 'Move left', 'Move right', 'Fire plasma', 'Activate EMP']) {
      const button = page.getByRole('button', { name, exact: true });
      await expect(button).toBeEnabled();
      await withinViewport(page, button);
      const box = await button.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByRole('button', { name: 'Pause game', exact: true }).click();
    await expect(page.getByRole('button', { name: 'RESUME FLIGHT' })).toBeVisible();
    await page.getByRole('button', { name: 'DARK TERMINAL', exact: true }).click();
    await expect(page.locator('.game-console')).toHaveClass(/display-terminal/);
    await page.getByRole('button', { name: 'RESUME FLIGHT' }).click();
    await expect(page.locator('.game-console')).toHaveAttribute('data-game-status', 'playing');
  });

  test('landscape controls fit short phones and tablets', async ({ page }) => {
    for (const [width, height] of [[568, 320], [667, 375], [740, 360], [932, 430], [1024, 768]]) {
      await page.setViewportSize({ width, height });
      await page.goto('/play');
      const launch = page.getByRole('button', { name: 'LAUNCH MISSION' });
      await expect(launch).toBeVisible();
      await withinViewport(page, launch);
      await launch.click();
      await withinViewport(page, page.locator('canvas'));
      await withinViewport(page, page.getByRole('button', { name: 'Move down', exact: true }));
      await withinViewport(page, page.getByRole('button', { name: 'Fire plasma', exact: true }));
      await withinViewport(page, page.getByRole('group', { name: 'LCD display mode' }));
      expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBeTruthy();
    }
  });

  test('two fingers can move and fire together; cancellation releases both', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Raw multi-touch injection uses the Chromium DevTools protocol.');
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/play');
    await page.getByRole('button', { name: 'LAUNCH MISSION' }).click();
    const right = page.getByRole('button', { name: 'Move right', exact: true });
    const fire = page.getByRole('button', { name: 'Fire plasma', exact: true });
    const rightBox = (await right.boundingBox())!;
    const fireBox = (await fire.boundingBox())!;
    const client = await context.newCDPSession(page);
    // The intro has no enemies: the player's body is the largest dark component here.
    const shipX = () => page.locator('canvas').evaluate(canvas => {
      const context = (canvas as HTMLCanvasElement).getContext('2d')!;
      const pixels = context.getImageData(0, 98, 190, 22).data;
      let total = 0, count = 0;
      for (let y = 0; y < 22; y++) for (let x = 0; x < 190; x++) {
        const index = (y * 190 + x) * 4;
        if (pixels[index] === 23 && pixels[index + 1] === 40 && pixels[index + 2] === 29) { total += x; count++; }
      }
      return total / Math.max(1, count);
    });
    const before = await shipX();
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [
      { id: 1, x: rightBox.x + rightBox.width / 2, y: rightBox.y + rightBox.height / 2 },
      { id: 2, x: fireBox.x + fireBox.width / 2, y: fireBox.y + fireBox.height / 2 },
    ] });
    await expect(right).toHaveAttribute('data-held', 'true');
    await expect(fire).toHaveAttribute('data-held', 'true');
    await expect.poll(shipX).toBeGreaterThan(before + 10);
    await client.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    await expect(right).not.toHaveAttribute('data-held');
    await expect(fire).not.toHaveAttribute('data-held');
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });

  test('landing remains in portrait and the hero pilot action opens the flight terminal', async ({ page }) => {
    for (const width of [375, 390, 430, 768, 1024]) {
      await page.setViewportSize({ width, height: width > 430 ? 1024 : 844 });
      await page.goto('/');
      await expect(page.locator('.quick-play')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
      const title = (await page.locator('.hero-title-block').boundingBox())!;
      const device = (await page.locator('.device-entrance').boundingBox())!;
      const cta = (await page.locator('.hero-bottom-copy').boundingBox())!;
      if (width <= 900) {
        expect(title.y + title.height).toBeLessThan(device.y);
        expect(device.y + device.height).toBeLessThan(cta.y);
      }
      await expect(page.locator('.orientation-prompt')).toHaveCount(0);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.quick-play').click();
    await expect(page).toHaveURL(/\/play$/);
    await expect(page.locator('.orientation-prompt')).toBeVisible();
  });
});

test('mouse users keep keyboard gameplay without a rotation prompt', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/play');
  await expect(page.getByRole('button', { name: 'LAUNCH MISSION' })).toBeVisible();
  await expect(page.locator('.orientation-prompt')).toHaveCount(0);
  await expect(page.locator('.touch-controls')).toBeHidden();
  await page.getByRole('button', { name: 'LAUNCH MISSION' }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.game-console')).toHaveAttribute('data-game-status', 'paused');
});
