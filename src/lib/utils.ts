import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export {
  getLocalizedText,
  getProfileLocalizedText,
  getLinkLocalizedText,
  normalizeMultilingual,
} from "@/lib/i18n/multilingual";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
