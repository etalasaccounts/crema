import * as z from "zod";

// Login Schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Sign Up Schema
export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(64, "Password must be less than 64 characters"),
});

// Reset Password Schema
export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Google OAuth User Schema
export const googleUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  verified_email: z.boolean(),
  name: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  picture: z.string().url(),
  locale: z.string(),
});

// OAuth State Schema
export const oauthStateSchema = z.object({
  state: z.string().uuid(),
  provider: z.enum(["google"]),
  redirect_url: z.string().url().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type GoogleUser = z.infer<typeof googleUserSchema>;
export type OAuthState = z.infer<typeof oauthStateSchema>;
