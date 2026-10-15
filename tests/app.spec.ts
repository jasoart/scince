import { expect, test } from "@playwright/test";

test("concept search, saved notes and completion persist after reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: "觀念圖書館", exact: true }).click();
  await expect(page.locator(".lesson-card")).toHaveCount(64);
  await page.getByPlaceholder("搜尋觀念、公式或關鍵字…").fill("化學平衡");
  await expect(page.locator(".lesson-card").first()).toBeVisible();
  await page.locator(".lesson-open").first().click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "把觀念連成一條線" }),
  ).toBeVisible();
  await dialog.locator("textarea").first().fill("平衡時正逆反應仍在進行。");
  await dialog
    .getByRole("button", { name: "標記為已掌握", exact: true })
    .click();
  await dialog.getByRole("button", { name: "收藏單元", exact: true }).click();
  await page.keyboard.press("Escape");
  await page.reload();
  await page.getByRole("button", { name: "我的學習筆記", exact: true }).click();
  await expect(page.getByRole("textbox")).toHaveValue(
    "平衡時正逆反應仍在進行。",
  );
  await expect(page.locator(".note-card")).toHaveCount(1);
  await expect(page.locator(".completed")).toContainText("已掌握");
  expect(errors).toEqual([]);
});

test("390px navigation and every page fit the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /讓觀念，\s*真正發生/ }),
  ).toBeVisible();
  for (const name of [
    "觀念圖書館",
    "互動實驗室",
    "公式工作台",
    "學習路徑",
    "我的學習筆記",
    "來源與研究",
    "AI 學習夥伴",
  ]) {
    await page.getByRole("button", { name: "開啟選單" }).click();
    await page
      .locator(".sidebar")
      .getByRole("button", { name: new RegExp("^" + name) })
      .click();
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
  }
  await page.screenshot({ path: "/tmp/scince-ai-mobile.png", fullPage: true });
});

test("PWA precaches lessons and lab, reloads offline without downloading AI", async ({
  page,
  context,
}) => {
  let modelRequests = 0;
  page.on("request", (r) => {
    if (/huggingface|xethub|webllm-|tutor\.worker-/.test(r.url()))
      modelRequests++;
  });
  await page.goto("/");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".connection")).toContainText("離線模式");
  await page.getByRole("button", { name: "觀念圖書館", exact: true }).click();
  await expect(page.locator(".lesson-card")).toHaveCount(64);
  await page.getByRole("button", { name: /互動實驗室/ }).click();
  await expect(page.locator(".sim-svg")).toBeVisible();
  expect(modelRequests).toBe(0);
  await context.setOffline(false);
});

test("warm-up question reveals a real explanation", async ({ page }) => {
  await page.goto("/");
  await page.locator(".quiz-options button").nth(1).click();
  await expect(page.locator(".quiz-result")).toContainText("sin(2θ)");
  await expect(page.locator(".quiz-options .correct")).toContainText("45°");
  await page.getByRole("button", { name: "換一題" }).click();
  await expect(page.locator(".challenge")).toContainText("Aa × Aa");
});
