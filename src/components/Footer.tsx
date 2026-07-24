import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo">
            <div className="logo-icon">AS</div>
            <div className="logo-text">
              Afro<span>Samboza</span>
            </div>
          </div>
          <p>
            Nigeria&apos;s premier platform for ride-hailing car registration,
            vehicle sales, rentals and property listings. Trusted by hundreds
            across Abuja and beyond.
          </p>
          <div className="footer-contact">
            <a href="tel:07063857328">📞 0706 385 7328</a>
            <a href="tel:09125078090">📞 0912 507 8090</a>
            <a href="mailto:hello@afrosamboza.com.ng">📧 hello@afrosamboza.com.ng</a>
            <Link href="/contact">📍 Suite D27, Efab Shopping Mall, Area 11, Abuja, FCT</Link>
          </div>
        </div>
        <div className="footer-col">
          <h4>Services</h4>
          <Link href="/ride-hailing">Bolt Registration</Link>
          <Link href="/ride-hailing">Uber Registration</Link>
          <Link href="/ride-hailing">inDrive Registration</Link>
          <Link href="/listings?tab=cars-sale">Cars for Sale</Link>
          <Link href="/listings?tab=cars-rent">Car Rentals</Link>
        </div>
        <div className="footer-col">
          <h4>Properties</h4>
          <Link href="/listings?tab=properties">Houses for Sale</Link>
          <Link href="/listings?tab=properties">Houses for Rent</Link>
          <Link href="/listings?tab=properties">Landed Properties</Link>
          <Link href="/sell">List Your Property</Link>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <Link href="/about">About Us</Link>
          <Link href="/about#leadership">Leadership</Link>
          <Link href="/contact">Contact Us</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} <span>AfroSamboza</span>. All rights
          reserved. | afrosamboza.com.ng
        </p>
        <p>
          Built for Nigeria 🇳🇬 | CEO: <span>Alex Ukpong</span>
        </p>
      </div>
    </footer>
  );
}
