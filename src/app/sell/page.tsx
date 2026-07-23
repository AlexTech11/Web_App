import type { Metadata } from "next";
import SellForm from "@/components/SellForm";

export const metadata: Metadata = {
  title: "Sell or Rent Out Your Car, House or Land",
  description:
    "List your car, house or land with AfroSamboza. Tell us what you want to sell or rent, and our team handles the rest.",
};

export default function SellPage() {
  return (
    <div className="section">
      <div className="section-header">
        <div className="section-label">Indicate Interest</div>
        <h2 className="section-title">List Your Asset with AfroSamboza</h2>
        <p className="section-sub">
          Tell us what you want to sell or rent, and we&apos;ll handle the rest
        </p>
      </div>
      <SellForm />
    </div>
  );
}
