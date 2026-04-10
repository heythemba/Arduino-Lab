/**
 * Small helper for combining Tailwind CSS class names.
 *
 * `clsx` merges conditional classes, and `tailwind-merge` resolves
 * Tailwind utility conflicts such as `px-2 px-4` to keep output clean.
 */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
