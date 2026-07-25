import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Result",
  robots: { index: false },
};

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const ok = status === "success";

  return (
    <div className="section" style={{ textAlign: "center" }}>
      <div className="section-header">
        <div className="section-label">Payment</div>
        <h2 className="section-title">{ok ? "Payment Successful" : "Payment Not Completed"}</h2>
      </div>
      <div className="form-container" style={{ maxWidth: 460, textAlign: "center" }}>
        {ok ? (
          <div className="success-msg" style={{ marginTop: 0 }}>
            ✅ Thank you! Your payment was received and your request has been
            updated. Our team will be in touch shortly.
          </div>
        ) : (
          <div className="error-msg" style={{ marginTop: 0 }}>
            ⚠️ We couldn&apos;t confirm this payment. If money left your account,
            contact us on 0706 385 7328 and we&apos;ll sort it out.
          </div>
        )}
        <div className="hero-ctas" style={{ marginTop: 20 }}>
          <Link href="/dashboard" className="btn btn-gold">My Dashboard</Link>
          <Link href="/listings" className="btn btn-outline">Browse Listings</Link>
        </div>
      </div>
    </div>
  );
}
