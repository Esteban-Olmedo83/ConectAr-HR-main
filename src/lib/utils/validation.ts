/**
 * Utilidades de validación
 * Proporciona funciones para validar datos
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return isValidDate(date) && dateString === date.toISOString().split('T')[0];
}

export function isStrongPassword(password: string): boolean {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/.test(password);
  const isLongEnough = password.length >= 8;

  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
}

export function isValidCurrency(amount: unknown): amount is number {
  return typeof amount === 'number' && !isNaN(amount) && amount >= 0;
}

export function isValidPercentage(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 100;
}

export function isValidHexColor(color: string): boolean {
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexColorRegex.test(color);
}

export function isEmptyObject(obj: unknown): boolean {
  return (
    obj === null ||
    obj === undefined ||
    (typeof obj === 'object' && Object.keys(obj as Record<string, unknown>).length === 0)
  );
}

export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

export function isValidFileSize(sizeInBytes: number, maxSizeInMB: number): boolean {
  return sizeInBytes <= maxSizeInMB * 1024 * 1024;
}

export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

export function isValidNationalId(id: string): boolean {
  return id.length >= 5 && /^[a-zA-Z0-9\-]+$/.test(id);
}

export function isAdult(birthDate: Date): boolean {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age >= 18;
}

export function isDuplicateEmail(email: string, emails: string[]): boolean {
  return emails.some((e) => e.toLowerCase() === email.toLowerCase());
}
