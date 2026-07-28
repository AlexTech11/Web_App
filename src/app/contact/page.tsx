import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import Socials from "@/components/Socials";
import { whatsappLink, WHATSAPP_DISPLAY } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with AfroSamboza — call, WhatsApp, email or visit our office in Area 11, Abuja.",
};

export default function ContactPage() {
  return (
    <div className="section">
      <div className="section-header">
        <div className="section-label">Contact Us</div>
        <h2 className="section-title">We&apos;d Love to Hear From You</h2>
        <p className="section-sub">
          Questions about registration, listings or a booking? Reach out — we
          reply within 24 hours.
        </p>
      </div>

      <div className="contact-layout">
        <div className="contact-info">
          <a
            className="contact-row"
            href={whatsappLink("Hello AfroSamboza, I have a question.")}
            target="_blank"
            rel="noopener"
          >
            <span className="contact-ic">💬</span>
            <span>
              <strong>WhatsApp</strong>
              <br />
              {WHATSAPP_DISPLAY} — tap to chat
            </span>
          </a>
          <a className="contact-row" href="tel:07063857328">
            <span className="contact-ic">📞</span>
            <span>
              <strong>Call</strong>
              <br />
              0706 385 7328 · 0912 507 8090
            </span>
          </a>
          <a className="contact-row" href="mailto:afrosambozasupercars@gmail.com">
            <span className="contact-ic">📧</span>
            <span>
              <strong>Email</strong>
              <br />
              afrosambozasupercars@gmail.com
            </span>
          </a>
          <div className="contact-row">
            <span className="contact-ic">📍</span>
            <span>
              <strong>Visit</strong>
              <br />
              Suite D27, Efab Shopping Mall, Area 11, Abuja, FCT
            </span>
          </div>
          <div className="contact-row">
            <span className="contact-ic">🕐</span>
            <span>
              <strong>Hours</strong>
              <br />
              Mon–Sat, 9:00am – 6:00pm
            </span>
          </div>
          <div className="contact-row" style={{ display: "block" }}>
            <strong>Follow us</strong>
            <Socials />
          </div>
        </div>

        <div className="form-container" style={{ margin: 0 }}>
          <div className="form-title">Send us a message</div>
          <div className="form-subtitle">
            Fill in the form and our team will get back to you shortly.
          </div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
