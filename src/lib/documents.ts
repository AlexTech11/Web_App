/**
 * Canonical list of driver-registration documents, shared by the registration
 * form, the user dashboard, and the admin queue so they never drift apart.
 *
 * `core` documents are required up-front to submit a registration.
 * The rest can be uploaded later from the user's dashboard.
 */
export interface DocSpec {
  /** form input name */
  name: string;
  /** stable type stored in the documents jsonb */
  type: string;
  label: string;
  core: boolean;
}

export const REGISTRATION_DOCS: DocSpec[] = [
  { name: "doc_drivers_licence", type: "drivers_licence", label: "Driver's Licence", core: true },
  { name: "doc_vehicle_licence", type: "vehicle_licence", label: "Vehicle Licence", core: true },
  { name: "doc_driver_photo", type: "driver_photo", label: "Driver's Profile Picture", core: true },
  { name: "doc_car_exterior", type: "car_exterior", label: "Car Photo — Exterior", core: false },
  { name: "doc_car_interior", type: "car_interior", label: "Car Photo — Interior", core: false },
  { name: "doc_nin_slip", type: "nin_slip", label: "NIN Slip", core: false },
  { name: "doc_insurance", type: "insurance", label: "Insurance Certificate", core: false },
];

export const CORE_DOCS = REGISTRATION_DOCS.filter((d) => d.core);
export const LATER_DOCS = REGISTRATION_DOCS.filter((d) => !d.core);

export const DOC_LABELS: Record<string, string> = Object.fromEntries(
  REGISTRATION_DOCS.map((d) => [d.type, d.label])
);
// Legacy type from the earlier build, kept so old rows still render a label.
DOC_LABELS.vehicle_document = "Vehicle Doc";

export const ACCEPTED_MIME = "image/jpeg,image/png,image/webp,application/pdf";
export const MAX_DOC_BYTES = 5 * 1024 * 1024;

export function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

export interface DocRef {
  type: string;
  path: string;
}
