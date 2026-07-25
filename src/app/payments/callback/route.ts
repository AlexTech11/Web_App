import { type NextRequest, NextResponse } from "next/server";
import { paystackVerify } from "@/lib/paystack";
import { fulfillPayment } from "@/lib/payments-fulfill";

// Paystack redirects the payer back here after checkout.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(new URL("/payments/result?status=failed", request.url));
  }

  const { paid } = await paystackVerify(reference);
  if (paid) await fulfillPayment(reference);

  return NextResponse.redirect(
    new URL(`/payments/result?status=${paid ? "success" : "failed"}`, request.url)
  );
}
