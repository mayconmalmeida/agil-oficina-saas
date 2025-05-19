
// Format a CPF string to the standard format: 000.000.000-00
export const formatCPF = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 11 digits
  const limitedDigits = digits.substring(0, 11);
  
  // Apply formatting
  if (limitedDigits.length <= 3) {
    return limitedDigits;
  } else if (limitedDigits.length <= 6) {
    return `${limitedDigits.substring(0, 3)}.${limitedDigits.substring(3)}`;
  } else if (limitedDigits.length <= 9) {
    return `${limitedDigits.substring(0, 3)}.${limitedDigits.substring(3, 6)}.${limitedDigits.substring(6)}`;
  } else {
    return `${limitedDigits.substring(0, 3)}.${limitedDigits.substring(3, 6)}.${limitedDigits.substring(6, 9)}-${limitedDigits.substring(9)}`;
  }
};

// Format a CEP string to the standard format: 00000-000
export const formatCEP = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 8 digits
  const limitedDigits = digits.substring(0, 8);
  
  // Apply formatting
  if (limitedDigits.length <= 5) {
    return limitedDigits;
  } else {
    return `${limitedDigits.substring(0, 5)}-${limitedDigits.substring(5)}`;
  }
};

// Format a license plate string to standard format (ABC-1234 or ABC1D23)
export const formatLicensePlate = (value: string): string => {
  // Remove spaces and convert to uppercase
  const plate = value.replace(/\s/g, '').toUpperCase();
  
  // Check if it's the new Mercosul format (ABC1D23)
  if (/^[A-Z]{3}\d[A-Z]\d{2}$/.test(plate)) {
    return plate;
  }
  
  // For the traditional format (ABC-1234) or partial input
  const letters = plate.replace(/[^A-Z]/g, '').substring(0, 3);
  const numbers = plate.replace(/[^0-9]/g, '').substring(0, 4);
  
  if (letters.length === 0) {
    return '';
  } else if (letters.length < 3) {
    return letters;
  } else if (numbers.length === 0) {
    return letters;
  } else {
    return `${letters}-${numbers}`;
  }
};

// Format phone number to (XX) XXXXX-XXXX or (XX) XXXX-XXXX
export const formatPhone = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 11 digits (with area code)
  const limitedDigits = digits.substring(0, 11);
  
  // Apply formatting based on length
  if (limitedDigits.length <= 2) {
    return limitedDigits.length ? `(${limitedDigits}` : '';
  } else if (limitedDigits.length <= 6) {
    return `(${limitedDigits.substring(0, 2)}) ${limitedDigits.substring(2)}`;
  } else if (limitedDigits.length <= 10) {
    // Format as (XX) XXXX-XXXX for 8-digit numbers
    return `(${limitedDigits.substring(0, 2)}) ${limitedDigits.substring(2, 6)}-${limitedDigits.substring(6)}`;
  } else {
    // Format as (XX) XXXXX-XXXX for 9-digit numbers
    return `(${limitedDigits.substring(0, 2)}) ${limitedDigits.substring(2, 7)}-${limitedDigits.substring(7)}`;
  }
};
