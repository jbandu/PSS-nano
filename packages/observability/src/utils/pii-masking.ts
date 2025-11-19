/**
 * PII Masking Utility
 * Masks sensitive personally identifiable information in logs
 */

const PII_PATTERNS = {
  // Email addresses
  email: /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
  // Credit card numbers (various formats)
  creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
  // SSN (xxx-xx-xxxx)
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  // Phone numbers
  phone: /(\+\d{1,3}[- ]?)?\d{3}[- ]?\d{3}[- ]?\d{4}/g,
  // Passport numbers (alphanumeric, 6-9 chars)
  passport: /\b[A-Z]{1,2}\d{6,9}\b/g,
  // IP addresses
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
};

const PII_FIELDS = [
  'password',
  'creditCard',
  'creditCardNumber',
  'cvv',
  'ssn',
  'socialSecurityNumber',
  'passport',
  'passportNumber',
  'dateOfBirth',
  'dob',
  'apiKey',
  'apiSecret',
  'token',
  'accessToken',
  'refreshToken',
  'privateKey',
  'secret'
];

export function maskPII(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return maskString(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => maskPII(item));
  }

  if (typeof data === 'object') {
    const masked: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Check if field name indicates PII
      if (PII_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        masked[key] = '[REDACTED]';
      } else {
        masked[key] = maskPII(value);
      }
    }
    return masked;
  }

  return data;
}

function maskString(str: string): string {
  let masked = str;

  // Mask email addresses (show first 2 chars and domain)
  masked = masked.replace(PII_PATTERNS.email, (match) => {
    const [local, domain] = match.split('@');
    return `${local.substring(0, 2)}***@${domain}`;
  });

  // Mask credit card numbers (show last 4 digits)
  masked = masked.replace(PII_PATTERNS.creditCard, (match) => {
    const digits = match.replace(/\D/g, '');
    if (digits.length >= 13 && digits.length <= 16) {
      return `****-****-****-${digits.slice(-4)}`;
    }
    return match;
  });

  // Mask SSN
  masked = masked.replace(PII_PATTERNS.ssn, '***-**-****');

  // Mask phone numbers (show last 4 digits)
  masked = masked.replace(PII_PATTERNS.phone, (match) => {
    const digits = match.replace(/\D/g, '');
    return `***-***-${digits.slice(-4)}`;
  });

  // Mask passport numbers
  masked = masked.replace(PII_PATTERNS.passport, '***[PASSPORT]***');

  return masked;
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return email;
  }

  const [local, domain] = email.split('@');
  return `${local.substring(0, 2)}***@${domain}`;
}

export function maskCreditCard(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 16) {
    return cardNumber;
  }
  return `****-****-****-${digits.slice(-4)}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) {
    return phone;
  }
  return `***-***-${digits.slice(-4)}`;
}
