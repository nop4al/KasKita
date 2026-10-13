import { expect, test } from "@playwright/test";

test("dues and dashboard APIs reject unauthenticated access", async ({ request }) => {
  const duesResponse = await request.get("/api/dues");
  const duesBody = await duesResponse.json();
  expect(duesResponse.status()).toBe(401);
  expect(duesBody).toMatchObject({ success: false });

  const dashboardResponse = await request.get("/api/dashboard/summary");
  const dashboardBody = await dashboardResponse.json();
  expect(dashboardResponse.status()).toBe(401);
  expect(dashboardBody).toMatchObject({ success: false });
});

test("unauthenticated visitors are redirected away from Admin payment verification", async ({ page }) => {
  await page.goto("/dashboard/admin/iuran");

  await expect(page).toHaveURL(/\/login\?/);
  await expect(page.getByRole("heading", { name: "Masuk ke Akun" })).toBeVisible();
});
