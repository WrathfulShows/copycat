import { z } from "zod";
import { ALLOWED_COUNTRIES } from "./config";

export const checkoutSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  line1: z.string().min(1).max(200),
  city: z.string().min(1).max(120),
  postalCode: z.string().min(1).max(20),
  country: z.string().refine((c) => ALLOWED_COUNTRIES.includes(c), {
    message: "Country not supported",
  }),
  discountCode: z.string().trim().max(32).optional(),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        size: z.string().min(1),
        shadeId: z.string().optional(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(50),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
