import { whatsappLink } from "@/lib/whatsapp";

/** Floating WhatsApp click-to-chat button, shown site-wide. */
export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink(
        "Hello AfroSamboza, I'd like to make an enquiry."
      )}
      target="_blank"
      rel="noopener"
      className="wa-fab"
      aria-label="Chat with AfroSamboza on WhatsApp"
    >
      <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" aria-hidden="true">
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-1.6c1.7.9 3.6 1.4 5.5 1.4h.3c6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.7 0-3.4-.5-4.9-1.3l-.3-.2-4.9 1 1-4.7-.2-.3c-.9-1.5-1.4-3.2-1.4-5C5.4 9.2 10.2 4.4 16 4.4S26.6 9.2 26.6 15 21.8 24.8 16 24.8zm5.8-7.3c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3-.2-.3 0-.5.1-.7.1-.1.3-.3.4-.5.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.9-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.2-.6-.4z" />
      </svg>
      <span className="wa-fab-label">Chat with us</span>
    </a>
  );
}
