import { format, formatDistanceToNow } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale/fa-IR";

// ============================================
// Digit Conversion
// ============================================

const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

// ============================================
// Number Formatting
// ============================================

export function formatPersianNumber(num: number): string {
  return toPersianDigits(num.toLocaleString("en-US"));
}

// ============================================
// Date Formatting (Jalali)
// ============================================

export function formatPersianDate(date: Date | number): string {
  return toPersianDigits(format(date, "d MMMM yyyy", { locale: faIR }));
}

export function formatPersianDateTime(date: Date | number): string {
  return toPersianDigits(
    format(date, "d MMMM yyyy، ساعت HH:mm", { locale: faIR })
  );
}

export function formatRelativeTime(date: Date | number): string {
  return toPersianDigits(
    formatDistanceToNow(date, { addSuffix: true, locale: faIR })
  );
}

// ============================================
// Phone Number
// ============================================

const IRANIAN_MOBILE_REGEX = /^(\+98|0098|98|0)?9\d{9}$/;

export function validateIranianMobile(phone: string): boolean {
  const cleaned = toEnglishDigits(phone).replace(/[\s\-()]/g, "");
  return IRANIAN_MOBILE_REGEX.test(cleaned);
}

export function formatIranianMobile(phone: string): string {
  const cleaned = toEnglishDigits(phone).replace(/[\s\-()]/g, "");
  const match = cleaned.match(/^(?:\+98|0098|98|0)?(9\d{9})$/);
  if (!match) return phone;
  const digits = match[1];
  return toPersianDigits(
    `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  );
}

// ============================================
// Bank Card Number
// ============================================

export function validateBankCard(card: string): boolean {
  const cleaned = toEnglishDigits(card).replace(/[\s-]/g, "");
  if (!/^\d{16}$/.test(cleaned)) return false;

  // Luhn algorithm
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let digit = parseInt(cleaned[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function formatBankCard(card: string): string {
  const cleaned = toEnglishDigits(card).replace(/[\s-]/g, "");
  const groups = cleaned.match(/.{1,4}/g);
  if (!groups) return card;
  return toPersianDigits(groups.join(" "));
}
