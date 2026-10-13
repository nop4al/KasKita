import { randomBytes, randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import type { Database } from "../../src/lib/supabase/database.types";

const liveTestEnabled = process.env.RUN_LIVE_SUPABASE_E2E === "1";
test.skip(!liveTestEnabled, "Set RUN_LIVE_SUPABASE_E2E=1 to create and clean temporary Supabase test data.");
test.setTimeout(120_000);

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Alamat Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Masuk", exact: true }).click();
}

test("resident payment is verified once and persisted to the ledger", async ({ page }) => {
  loadEnvConfig(process.cwd());

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Live BE2 test requires Supabase URL and service-role key in the local environment.");
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const testId = randomUUID();
  const residentName = `BE2 E2E ${testId.slice(0, 8)}`;
  const residentEmail = `be2-e2e-warga-${testId}@example.invalid`;
  const adminEmail = `be2-e2e-admin-${testId}@example.invalid`;
  const residentPassword = randomBytes(32).toString("base64url");
  const adminPassword = randomBytes(32).toString("base64url");
  const currentDate = new Date();
  const period = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-01`;
  const dueDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-28`;
  const paymentReference = `BE2-E2E-${testId}`;
  const createdUserIds: string[] = [];
  let dueId: string | null = null;

  async function cleanUp() {
    const errors: string[] = [];
    await page.context().clearCookies();

    if (dueId) {
      const { data: transactions, error: readTransactionsError } = await supabase
        .from("ledger_transactions")
        .select("id")
        .eq("due_id", dueId);
      if (readTransactionsError) {
        errors.push(`Could not find test ledger transactions: ${readTransactionsError.message}`);
      } else if (transactions.length > 0) {
        const { error } = await supabase
          .from("ledger_transactions")
          .delete()
          .in("id", transactions.map((transaction) => transaction.id));
        if (error) errors.push(`Could not delete test ledger transactions: ${error.message}`);
      }

      const { error: deleteDueError } = await supabase
        .from("dues")
        .delete()
        .eq("id", dueId);
      if (deleteDueError) errors.push(`Could not delete test due: ${deleteDueError.message}`);
    }

    for (const userId of createdUserIds.reverse()) {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) errors.push(`Could not delete test user: ${error.message}`);
    }

    if (errors.length > 0) throw new Error(errors.join("\n"));
  }

  try {
    const residentResult = await supabase.auth.admin.createUser({
      email: residentEmail,
      password: residentPassword,
      email_confirm: true,
      app_metadata: { role: "warga", status: "active" },
      user_metadata: { nama: residentName, noRumah: "E2E", blok: "BE2" },
    });
    if (residentResult.error || !residentResult.data.user) {
      throw residentResult.error ?? new Error("Could not create test resident.");
    }
    createdUserIds.push(residentResult.data.user.id);

    const adminResult = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      app_metadata: { role: "admin", status: "active" },
      user_metadata: { nama: "BE2 E2E Admin" },
    });
    if (adminResult.error || !adminResult.data.user) {
      throw adminResult.error ?? new Error("Could not create test admin.");
    }
    createdUserIds.push(adminResult.data.user.id);

    const { error: activateResidentError } = await supabase
      .from("profiles")
      .update({ role: "warga", status: "active" })
      .eq("id", residentResult.data.user.id);
    if (activateResidentError) throw activateResidentError;

    const { error: activateAdminError } = await supabase
      .from("profiles")
      .update({ role: "admin", status: "active" })
      .eq("id", adminResult.data.user.id);
    if (activateAdminError) throw activateAdminError;

    const { data: due, error: createDueError } = await supabase
      .from("dues")
      .insert({
        user_id: residentResult.data.user.id,
        period,
        due_date: dueDate,
        amount: 1_000,
        cleaning_fee: 0,
        security_fee: 0,
        status: "pending",
        idempotency_key: `be2-e2e-${testId}`,
      })
      .select("id")
      .single();
    if (createDueError) throw createDueError;
    dueId = due.id;

    await signIn(page, residentEmail, residentPassword);
    await expect(page).toHaveURL(/\/dashboard\/warga$/);
    await page.getByPlaceholder("Contoh: nomor bukti transfer").fill(paymentReference);
    await page.getByRole("button", { name: "Ajukan Pembayaran" }).click();
    await expect(page.getByRole("heading", { name: "MENUNGGU VERIFIKASI" })).toBeVisible();

    const { data: submittedDue, error: submittedDueError } = await supabase
      .from("dues")
      .select("status, payment_reference")
      .eq("id", dueId)
      .single();
    if (submittedDueError) throw submittedDueError;
    expect(submittedDue).toMatchObject({
      status: "awaiting_verification",
      payment_reference: paymentReference,
    });

    await page.context().clearCookies();
    await signIn(page, adminEmail, adminPassword);
    await expect(page).toHaveURL(/\/dashboard\/admin$/);
    await page.goto("/dashboard/admin/iuran");
    const requestCard = page.locator("div.rounded-xl.border.p-4").filter({
      hasText: residentName,
    });
    await expect(requestCard).toBeVisible();
    await requestCard.getByRole("button", { name: "Verifikasi" }).click();
    await expect(requestCard).toHaveCount(0);

    const { data: paidDue, error: paidDueError } = await supabase
      .from("dues")
      .select("status, source_transaction_id")
      .eq("id", dueId)
      .single();
    if (paidDueError) throw paidDueError;
    expect(paidDue.status).toBe("paid");
    expect(paidDue.source_transaction_id).toBeTruthy();

    const retryResponse = await page.request.post(`/api/dues/${dueId}/verify`, {
      data: { paymentMethod: "cash", paymentReference },
    });
    expect(retryResponse.status()).toBe(200);
    const retryResult = await retryResponse.json();
    expect(retryResult.data.transaction_id).toBe(paidDue.source_transaction_id);

    const { data: transactions, error: transactionsError } = await supabase
      .from("ledger_transactions")
      .select("id, amount, due_id")
      .eq("due_id", dueId);
    if (transactionsError) throw transactionsError;
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({ amount: 1_000, due_id: dueId });

    await page.context().clearCookies();
    await signIn(page, residentEmail, residentPassword);
    await expect(page).toHaveURL(/\/dashboard\/warga$/);
    await expect(page.getByRole("heading", { name: "SUDAH LUNAS", exact: true })).toBeVisible();
  } finally {
    await cleanUp();
  }
});
