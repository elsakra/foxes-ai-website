/** US-centric: strip non-digits, add +1 for 10-digit numbers */
export function normalizeUsPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  if (raw.startsWith("+") && raw.length >= 11) return raw.replace(/\s/g, "");
  if (raw.startsWith("+")) return raw.trim();
  return `+${d}`;
}

/** True when the number is a valid US mobile-style E.164 (+1 NXX NXX XXXX, N 2–9). */
export function isValidUsMobileE164(e164: string): boolean {
  return /^\+1[2-9]\d{9}$/.test(e164.replace(/\s/g, ""));
}
