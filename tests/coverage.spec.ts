import { expect, test } from "@playwright/test";
import { addedLessons, lessons } from "../src/data/curriculum";
import { lessonDetails } from "../src/data/lesson-details";

test("new full units and inquiry units can be discovered and practised", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/library");
  await page
    .getByRole("button", {
      name: `本次補寫 ${addedLessons.length}`,
      exact: true,
    })
    .click();
  await expect(page.locator(".lesson-card")).toHaveCount(addedLessons.length);
  await expect(page.locator(".lesson-added")).toHaveCount(addedLessons.length);
  await page.getByRole("button", { name: "探究與實作", exact: true }).click();
  await expect(page.locator(".lesson-card")).toHaveCount(
    lessons.filter((l) => l.chapter === "探究與實作").length,
  );
  const inquiry = addedLessons.find(
    (l) => l.id === "inquiry-question-discovery",
  )!;
  await page
    .locator(".lesson-open")
    .filter({
      has: page.getByRole("heading", { name: inquiry.title, exact: true }),
    })
    .click();
  const reader = page.locator(".lr-reader");
  await expect(reader.locator(".lr-question")).toHaveCount(3);
  await expect(reader.locator(".lr-explanation")).toHaveCount(4);
  const id = page.url().split("/").at(-1)!;
  const question = reader.locator(".lr-question").first();
  await question
    .getByRole("radio")
    .nth(lessonDetails[id].practice[0].answer)
    .check();
  await expect(question.getByRole("status")).toContainText("答對了");
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

test("official scope search opens the missing chemistry-history lesson and survives a deep link", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#/coverage");
  await expect(page.locator(".cm-row")).toHaveCount(177);
  await page.getByLabel("搜尋課綱代碼或觀念", { exact: true }).fill("CMb-Vc-1");
  await expect(page.locator(".cm-row")).toHaveCount(1);
  const extra = addedLessons.find((l) => l.tags.includes("CMb-Vc-1"))!;
  await page
    .locator(".cm-links")
    .getByRole("button", { name: new RegExp(extra.title) })
    .click();
  await expect(page.locator(".lr-reader h2")).toHaveText(extra.title);
  await page.reload();
  await expect(page.locator(".lr-reader h2")).toHaveText(extra.title);
  await expect(page.locator(".lr-question")).toHaveCount(3);
  await page.getByRole("button", { name: "關閉視窗" }).click();
  await page.getByLabel("搜尋課綱代碼或觀念", { exact: true }).fill("");
  await page.getByRole("checkbox", { name: "僅看尚未連結項目" }).check();
  await expect(page.locator(".cm-row")).toHaveCount(0);
  await expect(page.locator(".cm-map")).toContainText(
    "目前篩選範圍沒有尚未連結的條目",
  );
  expect(errors).toEqual([]);
});

test("core overview connects to newly expanded teaching", async ({ page }) => {
  await page.goto("/#/library/chemistry-sustainability");
  const links = page.locator(".lr-related-grid button");
  await expect(links.first()).toBeVisible();
  await expect(links.first()).toContainText("新增詳解");
  await links.first().click();
  await expect(page.locator(".lr-question")).toHaveCount(3);
});
