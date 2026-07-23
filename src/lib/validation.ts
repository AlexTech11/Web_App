import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^(\+?234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number (e.g. 08012345678)");

const optionalEmail = z
  .union([z.string().trim().email("Enter a valid email address"), z.literal("")])
  .transform((v) => (v === "" ? null : v));

/** Paths of files already uploaded to the private 'documents' bucket. */
export const documentsSchema = z
  .array(
    z.object({
      type: z.string().max(40),
      path: z.string().regex(/^registrations\/[\w.-]+$/, "Invalid document path"),
    })
  )
  .max(5)
  .default([]);

export const driverRegistrationSchema = z.object({
  documents: documentsSchema,
  platform: z.enum(["bolt", "uber", "indrive"]),
  full_name: z.string().trim().min(3, "Full name is required"),
  phone,
  email: optionalEmail,
  state: z.string().trim().min(2, "State/city is required"),
  vehicle_make: z.string().trim().min(2, "Vehicle make is required"),
  vehicle_model: z.string().trim().min(1, "Vehicle model is required"),
  vehicle_year: z.coerce
    .number()
    .int()
    .min(2005, "Vehicle year must be 2005 or later")
    .max(new Date().getFullYear() + 1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  plate_number: z.string().trim().max(20).optional().transform((v) => v || null),
  vehicle_colour: z.string().trim().max(30).optional().transform((v) => v || null),
  licence_status: z.string().trim().max(100).optional().transform((v) => v || null),
  identity_status: z.string().trim().max(50).optional().transform((v) => v || null),
  service_category: z.string().trim().max(50).optional().transform((v) => v || null),
  notes: z.string().trim().max(2000).optional().transform((v) => v || null),
});

export const listingInterestSchema = z.object({
  type: z.enum(["car_sale", "car_rent", "house_sale", "house_rent", "land"]),
  contact_name: z.string().trim().min(3, "Full name is required"),
  contact_phone: phone,
  title: z.string().trim().min(3, "Give your listing a short title"),
  price: z.coerce.number().positive("Enter a valid asking price / rate"),
  price_period: z.enum(["day", "year"]).optional(),
  location: z.string().trim().min(2, "Location is required"),
  description: z.string().trim().max(3000).optional().transform((v) => v || null),
  attributes: z.record(z.string(), z.unknown()).default({}),
});

export const enquirySchema = z.object({
  listing_id: z.string().uuid().optional(),
  name: z.string().trim().min(3, "Your name is required"),
  phone,
  email: optionalEmail,
  message: z.string().trim().min(5, "Tell us what you're interested in"),
});

export const bookingSchema = z
  .object({
    listing_id: z.string().uuid().optional(),
    name: z.string().trim().min(3, "Your name is required"),
    phone,
    pickup_date: z.string().date("Pick-up date is required"),
    return_date: z.string().date("Return date is required"),
    pickup_location: z.string().trim().max(200).optional().transform((v) => v || null),
  })
  .refine((b) => b.return_date >= b.pickup_date, {
    message: "Return date must be after pick-up date",
    path: ["return_date"],
  });
