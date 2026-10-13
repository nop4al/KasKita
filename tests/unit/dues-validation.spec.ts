import { expect, test } from "@playwright/test";
import {
  isValidDueId,
  isValidPaymentMethod,
  isValidPaymentReference,
  normalizePeriod,
} from "../../src/lib/dues-validation";

test("normalizes valid monthly periods and preserves valid dates", () => {
  expect(normalizePeriod("2026-10")).toBe("2026-10-01");
  expect(normalizePeriod("2026-10-13")).toBe("2026-10-13");
  expect(normalizePeriod("2100-02-28")).toBe("2100-02-28");
});

test("rejects invalid month and calendar dates", () => {
  expect(normalizePeriod("2026-13")).toBeNull();
  expect(normalizePeriod("2026-02-29")).toBeNull();
  expect(normalizePeriod("2024-02-29")).toBe("2024-02-29");
  expect(normalizePeriod("2026-04-31")).toBeNull();
  expect(normalizePeriod("2026-1")).toBeNull();
});

test("validates due identifiers and supported payment methods", () => {
  expect(isValidDueId("32e3cce5-3032-4910-985b-3de4668e6b17")).toBe(true);
  expect(isValidDueId("not-a-uuid")).toBe(false);
  expect(isValidPaymentMethod("cash")).toBe(true);
  expect(isValidPaymentMethod("bank_transfer")).toBe(true);
  expect(isValidPaymentMethod("qris")).toBe(true);
  expect(isValidPaymentMethod("credit_card")).toBe(false);
});

test("allows optional payment references up to 120 characters", () => {
  expect(isValidPaymentReference(null)).toBe(true);
  expect(isValidPaymentReference("  ")).toBe(true);
  expect(isValidPaymentReference("R".repeat(120))).toBe(true);
  expect(isValidPaymentReference("R".repeat(121))).toBe(false);
  expect(isValidPaymentReference(123)).toBe(false);
});
