export function maskPhoneBR(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 11);
  const len = digits.length;
  if (len === 0) return "";
  if (len < 3) return `(${digits}`;
  if (len < 8) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isValidPhoneBR(input: string): boolean {
  return input.replace(/\D/g, "").length === 11;
}
