// AfroSamboza WhatsApp contact.
// Local line 0706 385 7328 → international format for wa.me links.
export const WHATSAPP_NUMBER = "2347063857328";
export const WHATSAPP_DISPLAY = "0706 385 7328";

/** Build a click-to-chat wa.me link with an optional pre-filled message. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
