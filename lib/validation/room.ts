import { z } from "zod";

export const roomFormSchema = z.object({
  number: z.string().min(1, "Room number is required"),
  type: z.enum(["Standard", "Deluxe", "Suite"], {
    required_error: "Please select a room type",
  }),
  floor: z.string().min(1, "Floor number is required"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  capacity: z.object({
    adults: z.number().min(1, "At least 1 adult is required"),
    children: z.number().min(0, "Children cannot be negative"),
  }),
  bedType: z.enum(["Single", "Twin", "Queen", "King"], {
    required_error: "Please select a bed type",
  }),
  features: z.object({
    cityView: z.boolean(),
    oceanView: z.boolean(),
    balcony: z.boolean(),
    bathtub: z.boolean(),
    shower: z.boolean(),
    wifi: z.boolean(),
    tv: z.boolean(),
    minibar: z.boolean(),
    aircon: z.boolean(),
  }),
  image: z.any().optional(), // For file upload
});

export type RoomFormData = z.infer<typeof roomFormSchema>; 