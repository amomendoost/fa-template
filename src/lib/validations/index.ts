import { z } from "zod";
import { validateIranianMobile, validateBankCard } from "@/lib/persian";

// ============================================
// Field Schemas
// ============================================

export const emailSchema = z.email("ایمیل معتبر وارد کنید");

export const persianMobileSchema = z
  .string()
  .min(1, "شماره موبایل الزامی است")
  .refine(validateIranianMobile, "شماره موبایل معتبر نیست");

export const bankCardSchema = z
  .string()
  .min(1, "شماره کارت الزامی است")
  .refine(validateBankCard, "شماره کارت معتبر نیست");

export const passwordSchema = z
  .string()
  .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
  .max(100, "رمز عبور بیش از حد طولانی است");

export const nameSchema = z
  .string()
  .min(2, "نام باید حداقل ۲ کاراکتر باشد")
  .max(50, "نام بیش از حد طولانی است");

// ============================================
// Form Schemas
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "تکرار رمز عبور الزامی است"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });
export type SignupFormData = z.infer<typeof signupSchema>;

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z
    .string()
    .min(3, "موضوع باید حداقل ۳ کاراکتر باشد")
    .max(100, "موضوع بیش از حد طولانی است"),
  message: z
    .string()
    .min(10, "پیام باید حداقل ۱۰ کاراکتر باشد")
    .max(1000, "پیام بیش از حد طولانی است"),
});
export type ContactFormData = z.infer<typeof contactSchema>;
