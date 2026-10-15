import { expect, test, type Page } from "@playwright/test";

const experiments = [
  { id: "physics-motion", title: "拋物線實驗室", sliders: 3 },
  { id: "physics-wave", title: "波的疊加", sliders: 3 },
  { id: "physics-circuit", title: "歐姆定律", sliders: 2 },
  { id: "chemistry-gas", title: "理想氣體", sliders: 3 },
  { id: "chemistry-equilibrium", title: "可逆反應平衡", sliders: 4 },
  { id: "chemistry-ph", title: "酸鹼與稀釋", sliders: 2 },
  { id: "biology-genetics", title: "孟德爾交配棋盤", sliders: 3 },
  { id: "biology-population", title: "族群成長", sliders: 4 },
  { id: "biology-enzyme", title: "酵素的工作條件", sliders: 3 },
  { id: "earth-orbit", title: "地球與四季", sliders: 3 },
  { id: "earth-seismic", title: "P・S 波定位", sliders: 4 },
  { id: "earth-climate", title: "行星能量收支", sliders: 3 },
] as const;

async function openLab(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "開始探索實驗室" }).click();
  await expect(
    page.getByRole("region", { name: "互動科學實驗室" }),
  ).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(
    overflow,
    "The page should fit the viewport without horizontal scrolling.",
  ).toBeLessThanOrEqual(1);
  const bounds = await page.locator(".sim-lab").boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(-1);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(
    page.viewportSize()!.width + 1,
  );
}

test.describe("390px interactive science laboratory", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const experiment of experiments) {
    test(`${experiment.id}: select, calculate, reset, and fit a phone`, async ({
      page,
    }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      await openLab(page);
      const lab = page.getByRole("region", { name: "互動科學實驗室" });
      await lab
        .locator(".sim-module-select select")
        .selectOption(experiment.id);
      await expect(lab.locator(".sim-lab-heading h3")).toHaveText(
        experiment.title,
      );
      await expect(lab.getByRole("slider")).toHaveCount(experiment.sliders);
      await expect(lab.getByRole("img")).toBeVisible();
      await expect(lab.locator(".sim-metric")).toHaveCount(3);
      await expect(lab.locator(".sim-formula")).not.toBeEmpty();
      await expect(lab.locator(".sim-explanation p")).not.toBeEmpty();

      // Freeze animated illustrations so that a changing readout can only come
      // from the input being tested, rather than the animation clock.
      const pauseButton = lab.getByRole("button", { name: /暫停/ });
      if (await pauseButton.isVisible()) await pauseButton.click();
      const slider = lab.getByRole("slider").first();
      const initialValue = await slider.inputValue();
      const firstReading = lab.locator(".sim-metric strong").first();
      const initialReading = await firstReading.textContent();
      const output = lab.locator(".sim-control output").first();
      const initialOutput = await output.textContent();

      // End is the browser's native range-input interaction. It dispatches
      // real input/change events instead of calling React handlers directly.
      await slider.focus();
      await slider.press("End");
      await expect(slider).toHaveValue((await slider.getAttribute("max"))!);
      await expect(output).not.toHaveText(initialOutput!);
      await expect(firstReading).not.toHaveText(initialReading!);

      const invalidCoordinates = await lab.getByRole("img").evaluate((svg) =>
        Array.from(svg.querySelectorAll("*")).flatMap((element) =>
          Array.from(element.attributes)
            .filter((attribute) => /(?:NaN|Infinity)/.test(attribute.value))
            .map(
              (attribute) =>
                `${element.tagName}.${attribute.name}=${attribute.value}`,
            ),
        ),
      );
      expect(
        invalidCoordinates,
        "Every plotted coordinate should remain finite after input.",
      ).toEqual([]);
      await expectNoHorizontalOverflow(page);

      await lab.getByRole("button", { name: "↺ 重設", exact: true }).click();
      await expect(slider).toHaveValue(initialValue);
      await expect(output).toHaveText(initialOutput!);
      await expect(firstReading).toHaveText(initialReading!);
      await expectNoHorizontalOverflow(page);
      expect(
        pageErrors,
        "Rendering and slider interaction should not throw browser errors.",
      ).toEqual([]);
    });
  }

  test("pause freezes the projectile and play advances it again", async ({
    page,
  }) => {
    await openLab(page);
    const lab = page.getByRole("region", { name: "互動科學實驗室" });
    const pause = lab.getByRole("button", { name: /暫停/ });
    const play = lab.getByRole("button", { name: /播放/ });
    if (await pause.isVisible()) await pause.click();
    await expect(play).toHaveAttribute("aria-pressed", "true");
    await lab.getByRole("button", { name: "↺ 重設", exact: true }).click();
    const projectile = lab.locator("circle.sim-particle");
    const frozenPosition = await projectile.getAttribute("cx");
    expect(Number(frozenPosition)).toBeCloseTo(38);
    // A short observation window verifies the paused requestAnimationFrame
    // loop does not keep updating the actual SVG, even when the tab is active.
    await page.waitForTimeout(150);
    await expect(projectile).toHaveAttribute("cx", frozenPosition!);
    await play.click();
    await expect(pause).toHaveAttribute("aria-pressed", "false");
    await expect(projectile).not.toHaveAttribute("cx", frozenPosition!);
  });

  test("strong acid and strong base give opposite pH changes under dilution", async ({
    page,
  }) => {
    await openLab(page);
    const lab = page.getByRole("region", { name: "互動科學實驗室" });
    await lab.locator(".sim-module-select select").selectOption("chemistry-ph");
    const readings = lab.locator(".sim-metric strong");
    const acidBefore = Number(await readings.nth(0).textContent());
    const acidAfter = Number(await readings.nth(1).textContent());
    expect(acidAfter).toBeGreaterThan(acidBefore);
    expect(acidAfter).toBeLessThan(7);
    await lab.getByRole("button", { name: "強鹼", exact: true }).click();
    const baseBefore = Number(await readings.nth(0).textContent());
    const baseAfter = Number(await readings.nth(1).textContent());
    expect(baseAfter).toBeLessThan(baseBefore);
    expect(baseAfter).toBeGreaterThan(7);
    expect(acidAfter + baseAfter).toBeCloseTo(14, 2);
  });
});

test("all twelve modules switch and fit a desktop viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openLab(page);
  const lab = page.getByRole("region", { name: "互動科學實驗室" });
  const selector = lab.locator(".sim-module-select select");
  await expect(selector.locator("option")).toHaveCount(12);
  for (const experiment of experiments) {
    await selector.selectOption(experiment.id);
    await expect(lab.locator(".sim-lab-heading h3")).toHaveText(
      experiment.title,
    );
    await expect(lab.getByRole("img")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});
