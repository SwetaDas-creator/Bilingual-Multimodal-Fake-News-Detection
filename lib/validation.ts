import type { Language } from "@/types/detection";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_MB = 5;
export const MIN_TEXT_LENGTH = 20;
export const MAX_TEXT_LENGTH = 5000;

const BENGALI_CHAR = /[ঀ-৿]/g;
const LATIN_CHAR = /[A-Za-z]/g;

/** Returns an error message, or null if the text is valid. */
export function validateText(
  text: string,
  language: Exclude<Language, "Not applicable">
): string | null {
  const trimmed = text.trim();

  if (!trimmed) return "Please enter some text to analyse.";
  if (trimmed.length < MIN_TEXT_LENGTH)
    return `Text is too short. Please enter at least ${MIN_TEXT_LENGTH} characters.`;
  if (trimmed.length > MAX_TEXT_LENGTH)
    return `Text is too long. Maximum is ${MAX_TEXT_LENGTH} characters.`;

  // Light script check so Bengali text isn't sent to the English model & vice versa
  const bn = (trimmed.match(BENGALI_CHAR) ?? []).length;
  const en = (trimmed.match(LATIN_CHAR) ?? []).length;
  const letters = bn + en;
  if (letters === 0)
    return "The text must contain letters (Bengali or English), not just numbers or symbols.";

  const bnRatio = bn / letters;
  if (language === "Bengali" && bnRatio < 0.3)
    return "This doesn't look like Bengali text. Switch to English mode or enter Bengali text.";
  if (language === "English" && bnRatio > 0.3)
    return "This looks like Bengali text. Switch to Bengali mode or enter English text.";

  return null;
}

/** Returns an error message, or null if the image is valid. */
export function validateImage(file: File | null): string | null {
  if (!file) return "Please upload an image.";
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    return "Unsupported file format. Please upload a JPG, PNG or WebP image.";
  if (file.size > MAX_IMAGE_MB * 1024 * 1024)
    return `Image is too large. Maximum size is ${MAX_IMAGE_MB} MB.`;
  if (file.size === 0) return "This file appears to be empty.";
  return null;
}
