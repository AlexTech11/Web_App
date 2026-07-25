import { type NextRequest, NextResponse } from "next/server";
import { verifyPaystackSignature } from "@/lib/paystack";
import { fulfillPayment } from "@/lib/payments-fulfill";

// Paystack posts events here. Configure this URL in Paystack → Settings →
// Webhooks: https://afrosamboza.com.ng/api/paystack/webhook
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(raw, signature)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  try {
    const event = JSON.parse(raw);
    if (event.event === "charge.success" && event.data?.reference) {
      await fulfillPayment(event.data.reference);
    }
  } catch (err) {
    console.error("paystack webhook error:", err);
    return new NextResponse("error", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
