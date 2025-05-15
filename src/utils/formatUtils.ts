
/**
 * Format phone number while user types
 * @param value Raw phone number input
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (value: string): string => {
  if (!value) return value;
  
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length <= 2) {
    return `(${digits}`;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  } else if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  } else {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
};

/**
 * Format vehicle plate according to Brazilian format
 * @param value Raw plate input
 * @returns Formatted plate string
 */
export const formatVehiclePlate = (value: string): string => {
  if (!value) return value;
  
  // Remove any spaces or special characters
  const cleanValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  // Apply the correct format based on the plate standard
  if (cleanValue.length <= 3) {
    return cleanValue;
  } else if (cleanValue.length <= 7) {
    // Old format: AAA1234
    return cleanValue;
  } else {
    // Mercosul format: AAA1A23
    return cleanValue.slice(0, 8);
  }
};
