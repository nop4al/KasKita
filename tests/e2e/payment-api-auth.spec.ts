import { expect, test } from "@playwright/test";

const dueId = "00000000-0000-0000-0000-000000000001";

test("payment request and verification APIs reject unauthenticated writes", async ({ request }) => {
  const requestResponse = await request.post(`/api/dues/${dueId}/pay`, {
    data: { paymentMethod: "cash", paymentReference: "e2e-no-write" },
  });
  expect(requestResponse.status()).toBe(401);
  await expect(requestResponse.json()).resolves.toMatchObject({ success: false });

  const verifyResponse = await request.post(`/api/dues/${dueId}/verify`, {
    data: { paymentMethod: "cash", paymentReference: "e2e-no-write" },
  });
  expect(verifyResponse.status()).toBe(401);
  await expect(verifyResponse.json()).resolves.toMatchObject({ success: false });
});
