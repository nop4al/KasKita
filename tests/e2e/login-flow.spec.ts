import { expect, test } from "@playwright/test";

test("login form presents authentication errors without creating a session", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        error: "Email atau password salah.",
      }),
    });
  });

  await page.goto("/login");
  await page.getByLabel("Alamat Email").fill("e2e-invalid@example.invalid");
  await page.getByLabel("Password").fill("not-a-real-password");
  await page.getByRole("button", { name: "Masuk", exact: true }).click();

  await expect(page.getByText("Email atau password salah.")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});
