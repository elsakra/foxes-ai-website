/** US-centric: strip non-digits, add +1 for 10-digit numbers */
export function normalizeUsPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  if (raw.startsWith("+") && raw.length >= 11) return raw.replace(/\s/g, "");
  if (raw.startsWith("+")) return raw.trim();
  return `+${d}`;
}
