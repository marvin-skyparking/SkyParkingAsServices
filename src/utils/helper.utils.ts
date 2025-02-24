import moment from 'moment-timezone';

export function generateRandomNumber(length: number): string {
  const digits = '0123456789';
  let randomNumber = '';

  // Ensure the length is positive
  if (length <= 0) {
    throw new Error('Length must be a positive integer.');
  }

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    randomNumber += digits[randomIndex];
  }

  return randomNumber;
}

function getEndOfMonth(): Date {
  const today = new Date();
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return endOfMonth;
}

export const isNotExpired = (expirationDate: string): boolean => {
  const now = moment().tz('Asia/Jakarta');
  const expDate = moment(expirationDate, 'YYYY-MM-DD HH:mm:ss').tz(
    'Asia/Jakarta'
  );
  return now.isBefore(expDate);
};

export function removeCountryCode(phoneNumber: any): string {
  // Ensure phoneNumber is a string
  if (typeof phoneNumber !== 'string') {
    throw new Error('Invalid phone number format');
  }

  // Define the country code to remove, e.g., +62 for Indonesia
  const countryCode = '+62';

  // Check if the phone number starts with the country code
  if (phoneNumber.startsWith(countryCode)) {
    // Remove the country code
    return phoneNumber.slice(countryCode.length);
  }

  // Return the phone number as is if it doesn't start with the country code
  return phoneNumber;
}

export function extractNumbers(licensePlate: string): string {
  // Use a regular expression to match all digits
  return licensePlate.replace(/\D/g, '');
}

export const getCurrentTimestamp = (): string => {
  return moment().tz('Asia/Jakarta').format('YYYY-MM-DDTHH:mm:ssZ');
};

export const convertToDecimal = (priceProductString: string): number => {
  const decimalValue = parseFloat(priceProductString);
  if (isNaN(decimalValue)) {
    throw new Error('Invalid number format');
  }
  return decimalValue;
};

export const getEndOfMonthString = (): string => {
  const endOfMonth = moment().endOf('month'); // Get the end of the current month
  return endOfMonth.format('YYYY-MM-DDTHH:mm:ssZ'); // Format as YYYY-MM-DDTHH:mm:ssZ
};

export const customLengthTrxId = generateRandomNumber(8);
export const endMonth = getEndOfMonth();

export function generateRandomFiveDigit() {
  return Math.floor(10000 + Math.random() * 90000).toString(); // Ensure it is a string
}

export function generateRandomNumberFromPlate(plateNumber: string): string {
  // Extract numeric part from the plate number
  const numericPart = plateNumber.replace(/\D/g, ''); // Remove non-digit characters
  const maxLength = 11;

  // Calculate remaining length for random digits
  const remainingLength = maxLength - numericPart.length;

  if (remainingLength <= 0) {
    throw new Error('Plate number exceeds maximum length of 11 digits');
  }

  // Generate a random number of the required length
  const randomPart = Math.floor(Math.random() * Math.pow(10, remainingLength))
    .toString()
    .padStart(remainingLength, '0');

  // Combine numeric part and random part
  return numericPart + randomPart;
}
