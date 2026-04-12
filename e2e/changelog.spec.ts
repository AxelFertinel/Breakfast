import { expect, test } from "@playwright/test";

test.describe("changelog", () => {
  test("changelog page displays timeline with items", async ({ page }) => {
    await page.goto("/changelog");

    await expect(
      page.getByRole("heading", { name: "Changelog", exact: true }),
    ).toBeVisible();

    const changelogItems = page.locator("[data-changelog-item]");
    await expect(changelogItems.first()).toBeVisible();

    const count = await changelogItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test("clicking changelog item navigates to detail page", async ({ page }) => {
    await page.goto("/changelog");

    const firstItem = page.locator("[data-changelog-item]").first();
    await firstItem.click();

    await page.waitForURL(/\/changelog\/.+/);

    // Content should be visible (either in modal or full page)
    await expect(page.locator(".prose")).toBeVisible();
  });

  test("changelog detail page is accessible via direct URL", async ({
    page,
  }) => {
    await page.goto("/changelog");
    const firstItem = page.locator("[data-changelog-item]").first();
    const href = await firstItem.getAttribute("href");

    expect(href).toBeTruthy();
    await page.goto(href ?? "/changelog");

    await expect(page.locator(".prose")).toBeVisible();
  });
});
