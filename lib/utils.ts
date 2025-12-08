import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function decodeHtml(html: string) {
  return html.replace(/&#(\d+);/g, (m, code) =>
    String.fromCharCode(Number(code))
  ).replace(/&quot;/g, '"')
   .replace(/&apos;/g, "'")
   .replace(/&amp;/g, '&')
   .replace(/&lt;/g, '<')
   .replace(/&gt;/g, '>');
}
