import { expect, test } from "@playwright/test";
import { lessonDetails } from "../src/data/lesson-details";

test("complete unit: stepped explanation, original practice feedback, notes and deep links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/library/physics-motion");
  const reader = page.locator(".lr-reader");
  await expect(reader).toBeVisible();
  await expect(
    reader.getByRole("heading", { name: "把運動變成圖像", exact: true }),
  ).toBeVisible();
  await expect(reader.locator(".lr-objectives li")).toHaveCount(3);
  await reader.getByRole("button", { name: "看完整推導" }).click();
  await expect(reader.locator(".lr-example-answer")).toBeVisible();
  const question = reader.locator(".lr-question").first();
  await question.getByRole("radio").first().check();
  await expect(question.getByRole("status")).toBeVisible();
  expect(await question.getByRole("radio").first().isChecked()).toBe(true);
  await page.reload();
  await expect(
    page.locator(".lr-question").first().getByRole("radio").first(),
  ).toBeChecked();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "關閉視窗" }).click();
  await expect(reader).toHaveCount(0);
});

test("no historic questions remain in any visible navigation or deployed public assets", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "歷屆試題", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "來源與研究", exact: true }).click();
  await expect(page.locator("main")).not.toContainText("111–115");
  const response = await request.get("/papers/questions.json");
  expect(response.headers()["content-type"] ?? "").not.toContain(
    "application/json",
  );
  const pdf = await request.get("/papers/exam-115.pdf");
  expect((await pdf.body()).subarray(0, 5).toString()).not.toBe("%PDF-");
});

test("math/chemistry studio renders MathML and detects conservation mistakes", async ({
  page,
}) => {
  await page.goto("/#/studio");
  await expect(page.locator(".studio-canvas math mfrac")).toBeVisible();
  await page.getByRole("button", { name: "化學模式", exact: true }).click();
  await page.getByRole("button", { name: "檢查元素與電荷" }).click();
  await expect(page.locator(".studio-balance-result")).toContainText(
    "元素與電荷均守恆",
  );
  await page.getByLabel("編輯表示式", { exact: false }).fill("H2 + O2 -> H2O");
  await page.getByRole("button", { name: "檢查元素與電荷" }).click();
  await expect(page.locator(".studio-balance-result")).toContainText(
    "尚未守恆",
  );
  await page
    .getByLabel("編輯表示式", { exact: false })
    .fill("Ag^+ + Cl^- -> AgCl");
  await page.getByRole("button", { name: "檢查元素與電荷" }).click();
  await expect(page.locator(".studio-balance-result")).toContainText(
    "元素與電荷均守恆",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
});

test("learning path tracks mistakes and removes a unit after the answer is corrected", async ({
  page,
}) => {
  const answer = lessonDetails["physics-motion"].practice[0].answer;
  await page.goto("/#/library/physics-motion");
  await page
    .locator(".lr-question")
    .first()
    .getByRole("radio")
    .nth((answer + 1) % 4)
    .check();
  await page.getByRole("button", { name: "關閉視窗" }).click();
  await page.getByRole("button", { name: "學習路徑", exact: true }).click();
  await expect(page.locator(".sp-review-priority")).toContainText(
    "把運動變成圖像",
  );
  await page
    .locator(".sp-filters")
    .getByRole("button", { name: /待複習/ })
    .click();
  await page.locator(".sp-review-links button").first().click();
  await page
    .locator(".lr-question")
    .first()
    .getByRole("radio")
    .nth(answer)
    .check();
  await page.getByRole("button", { name: "關閉視窗" }).click();
  await expect(page.locator(".sp-review-priority")).toHaveCount(0);
  await expect(page.locator(".sp-empty")).toBeVisible();
});
