import { expect, test } from "@playwright/test";

test("settings API requires authentication for reads and writes", async ({ request }) => {
  const readResponse = await request.get("/api/settings");
  expect(readResponse.status()).toBe(401);
  expect(await readResponse.json()).toMatchObject({
    success: false,
    error: "Silakan login terlebih dahulu.",
  });

  const updateResponse = await request.patch("/api/settings", {
    data: { monthlyDues: 50_000 },
  });
  expect(updateResponse.status()).toBe(401);
  expect(await updateResponse.json()).toMatchObject({
    success: false,
    error: "Silakan login terlebih dahulu.",
  });
});
