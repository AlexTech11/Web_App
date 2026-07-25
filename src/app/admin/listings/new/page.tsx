import Link from "next/link";
import AdminListingForm from "@/components/AdminListingForm";

export const dynamic = "force-dynamic";

export default function AdminNewListingPage() {
  return (
    <div className="dash-content" style={{ display: "block", padding: "0 32px 40px" }}>
      <p style={{ margin: "8px 0 20px" }}>
        <Link href="/admin/listings" style={{ color: "#7fc9a6" }}>
          ← Back to listings
        </Link>
      </p>
      <AdminListingForm />
    </div>
  );
}
