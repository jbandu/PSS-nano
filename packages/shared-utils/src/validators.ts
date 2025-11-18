import { ValidationError } from './errors';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const validatePNR = (pnr: string): boolean => {
  // PNR is typically 6 alphanumeric characters
  const pnrRegex = /^[A-Z0-9]{6}$/;
  return pnrRegex.test(pnr);
};

export const validateFlightNumber = (flightNumber: string): boolean => {
  // Flight number: 2-letter airline code + 1-4 digit number
  const flightRegex = /^[A-Z]{2}\d{1,4}$/;
  return flightRegex.test(flightNumber);
};

export const validateAirportCode = (code: string): boolean => {
  // IATA airport code: 3 letters
  const codeRegex = /^[A-Z]{3}$/;
  return codeRegex.test(code);
};

export const validateRequired = (value: any, fieldName: string): void => {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`);
  }
};

export const validateLength = (
  value: string,
  fieldName: string,
  min?: number,
  max?: number
): void => {
  if (min !== undefined && value.length < min) {
    throw new ValidationError(`${fieldName} must be at least ${min} characters`);
  }
  if (max !== undefined && value.length > max) {
    throw new ValidationError(`${fieldName} must be at most ${max} characters`);
  }
};

export const validateRange = (
  value: number,
  fieldName: string,
  min?: number,
  max?: number
): void => {
  if (min !== undefined && value < min) {
    throw new ValidationError(`${fieldName} must be at least ${min}`);
  }
  if (max !== undefined && value > max) {
    throw new ValidationError(`${fieldName} must be at most ${max}`);
  }
};

export const validateDate = (dateString: string, fieldName: string): void => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName} must be a valid date`);
  }
};

export const validateFutureDate = (dateString: string, fieldName: string): void => {
  validateDate(dateString, fieldName);
  const date = new Date(dateString);
  if (date <= new Date()) {
    throw new ValidationError(`${fieldName} must be a future date`);
  }
};
