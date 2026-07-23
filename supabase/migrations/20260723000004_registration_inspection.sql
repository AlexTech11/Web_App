-- Phase 4: driver must agree to bring the vehicle for physical inspection.
-- Documents (vehicle licence, car photos, driver photo, driver licence,
-- NIN slip, insurance) continue to live in the driver_registrations.documents
-- jsonb array and the private 'documents' storage bucket — no schema change
-- needed for those beyond the existing column.

alter table public.driver_registrations
  add column inspection_agreed boolean not null default false;
