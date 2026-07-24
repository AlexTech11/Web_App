import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How AfroSamboza collects, uses and protects your personal data, in line with the Nigeria Data Protection Act.",
};

export default function PrivacyPage() {
  return (
    <div className="section">
      <div className="section-header">
        <div className="section-label">Legal</div>
        <h2 className="section-title">Privacy Policy</h2>
        <p className="section-sub">Last updated: 24 July 2026</p>
      </div>

      <div className="prose">
        <p>
          AfroSamboza (&quot;we&quot;, &quot;us&quot;) is committed to protecting
          your privacy. This policy explains what personal data we collect, why
          we collect it, and your rights, in line with the Nigeria Data
          Protection Act (NDPA) 2023.
        </p>

        <h3>1. Information We Collect</h3>
        <ul>
          <li><strong>Contact details</strong> — name, phone number and email address.</li>
          <li><strong>Registration details</strong> — vehicle make, model, year, plate number and platform choice (Bolt, Uber, inDrive).</li>
          <li><strong>Documents</strong> — driver&apos;s licence, vehicle licence, NIN slip, insurance, and vehicle/driver photos you upload for verification.</li>
          <li><strong>Listing details</strong> — information about cars or property you list to sell or rent.</li>
          <li><strong>Account data</strong> — your email and authentication information if you create an account.</li>
        </ul>

        <h3>2. How We Use Your Data</h3>
        <ul>
          <li>To process ride-hailing registrations and verify your documents.</li>
          <li>To publish and manage your listings and connect you with interested buyers, renters or drivers.</li>
          <li>To respond to your enquiries and bookings.</li>
          <li>To contact you about the status of your submissions.</li>
        </ul>

        <h3>3. How We Store &amp; Protect Data</h3>
        <p>
          Your data is stored securely with our infrastructure providers.
          Uploaded documents are kept in private storage accessible only to
          authorised AfroSamboza staff, and access to records is controlled by
          row-level security. We do not sell your personal data.
        </p>

        <h3>4. Sharing</h3>
        <p>
          We share only what is necessary to deliver the service — for example,
          your contact details with a verified buyer when you both agree to
          proceed, or relevant details submitted to a ride-hailing platform on
          your behalf. We never share your documents publicly.
        </p>

        <h3>5. Your Rights</h3>
        <p>
          You may request access to, correction of, or deletion of your personal
          data at any time. Contact us at{" "}
          <a href="mailto:hello@afrosamboza.com.ng">hello@afrosamboza.com.ng</a>{" "}
          or 0706 385 7328.
        </p>

        <h3>6. Contact</h3>
        <p>
          AfroSamboza — Suite D27, Efab Shopping Mall, Area 11, Abuja, FCT.
          Email: hello@afrosamboza.com.ng · Phone: 0706 385 7328.
        </p>
      </div>
    </div>
  );
}
