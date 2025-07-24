import crypto from 'crypto';
import CryptoJS from 'crypto-js';

/**
 * Decrypt AES Encrypted Data
 * @param encryptedData - AES encrypted string
 * @param secretKey - Secret key used for decryption
 * @returns Decrypted object
 */
export const encryptPayload = (data: Record<string, any>): string => {
  try {
    const jsonString = JSON.stringify(data);

    const utcDate = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format

    // Append UTC date to the PARTNER_KEY
    const encryptionKey = utcDate + '87e5df62d35aae739dc3b68ccb47383a';

    // Ensure secretKey is properly encoded
    // Encrypt the data using the encryption key with UTC date
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(jsonString),
      encryptionKey
    ).toString();

    return encrypted;
  } catch (error: any) {
    console.error('Encryption Error:', error.message);
    throw new Error('Encryption failed');
  }
};

export const RealencryptPayload = (data: Record<string, any>): string => {
  try {
    const jsonString = JSON.stringify(data);

    // Get the current UTC date in YYYYMMDD format
    const utcDate = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format

    // Append UTC date to the PARTNER_KEY
    const encryptionKey = utcDate + '87e5df62d35aae739dc3b68ccb47383a';

    // Encrypt the data using the encryption key with UTC date
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(jsonString),
      encryptionKey
    ).toString();

    return encrypted;
  } catch (error: any) {
    console.error('Encryption Error:', error.message);
    throw new Error('Encryption failed');
  }
};

export const RealencryptPayloadAutoEntry = (
  data: Record<string, any>
): string => {
  try {
    const jsonString = JSON.stringify(data);

    // Get the current UTC date in YYYYMMDD format
    const utcDate = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format

    // Append UTC date to the PARTNER_KEY
    const encryptionKey = utcDate + 'PARTNER_KEY';

    // Encrypt the data using the encryption key with UTC date
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(jsonString),
      encryptionKey
    ).toString();

    return encrypted;
  } catch (error: any) {
    console.error('Encryption Error:', error.message);
    throw new Error('Encryption failed');
  }
};

export const EncryptTotPOST = (
  data: Record<string, any>,
  partner_key: string
): string => {
  try {
    const jsonString = JSON.stringify(data);

    // Get the current UTC date in YYYYMMDD format
    const utcDate = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format

    // Append UTC date to the PARTNER_KEY
    const encryptionKey = utcDate + partner_key;

    // Encrypt the data using the encryption key with UTC date
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(jsonString),
      encryptionKey
    ).toString();

    return encrypted;
  } catch (error: any) {
    console.error('Encryption Error:', error.message);
    throw new Error('Encryption failed');
  }
};

export const EncryptResponse = (
  data: Record<string, any>,
  partner_key: string
): string => {
  try {
    const jsonString = JSON.stringify(data);

    // Get the current UTC date in YYYYMMDD format
    const utcDate = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format

    // Append UTC date to the PARTNER_KEY
    const encryptionKey = utcDate + partner_key;

    // Encrypt the data using the encryption key with UTC date
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(jsonString),
      encryptionKey
    ).toString();

    return encrypted;
  } catch (error: any) {
    console.error('Encryption Error:', error.message);
    throw new Error('Encryption failed');
  }
};

export const DecryptTotPOST = (
  encryptedData: string,
  partner_key: string
): Record<string, any> | null => {
  try {
    // Get the current UTC date in YYYYMMDD format
    const utcDate = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format

    // Generate the same encryption key used for encryption
    const decryptionKey = utcDate + partner_key;

    // Decrypt the data using AES
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, decryptionKey);
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

    // Check if decryption was successful
    if (!decryptedText) {
      throw new Error('Decryption failed: Invalid key or data');
    }

    // Parse JSON back into an object
    return JSON.parse(decryptedText);
  } catch (error: any) {
    console.error('Decryption Error:', error.message);
    return null; // Return null if decryption fails
  }
};

export const RealdecryptPayload = (
  encryptedData: string
): Record<string, any> | null => {
  try {
    // Get the current UTC date in YYYYMMDD format
    const utcDate = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format

    // Append UTC date to the PARTNER_KEY
    const decryptionKey = utcDate + '87e5df62d35aae739dc3b68ccb47383a';

    // Proceed with AES decryption using the decryption key with UTC date
    const bytes = CryptoJS.AES.decrypt(encryptedData, decryptionKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    // If decryption fails (empty result), throw an error
    if (!decrypted) throw new Error('Decryption failed: Empty result');

    // Parse the decrypted string into a JSON object
    return JSON.parse(decrypted);
  } catch (error: any) {
    // Log and return null if an error occurs
    console.error('Decryption Error:', error.message);
    return null;
  }
};

export const decryptPayload = (
  encryptedData: string
): Record<string, any> | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, 'PARTNER_KEY');
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) throw new Error('Decryption failed: Empty result');

    return JSON.parse(decrypted);
  } catch (error: any) {
    console.error('Decryption Error:', error.message);
    return null;
  }
};
/**
 * Generate MD5 Signature
 * @param login - User login
 * @param password - User password
 * @param storeID - Store ID
 * @param transactionNo - Transaction number
 * @param secretKey - Secret key
 * @returns MD5 hash signature
 */
export const generateSignature = (
  login: string,
  password: string,
  storeID: string,
  transactionNo: string,
  secretKey: string
): string => {
  const rawString = `${login}${password}${storeID}${transactionNo}${secretKey}`;
  return crypto.createHash('md5').update(rawString).digest('hex');
};

export function generatePaymentSignature(
  login: string,
  password: string,
  storeID: string,
  transactionNo: string,
  referenceNo: string,
  amount: number,
  paymentStatus: string,
  paymentReferenceNo: string,
  paymentDate: string,
  issuerID: string,
  retrievalReferenceNo: string,
  approvalCode: string,
  SECRET_KEY: string
): string {
  const dataString = `${login}${password}${storeID}${transactionNo}${referenceNo}${amount}${paymentStatus}${paymentReferenceNo}${paymentDate}${issuerID}${retrievalReferenceNo}${approvalCode}${SECRET_KEY}`;
  // Concatenating all parameters into a single string
  // const dataString =
  //   login +
  //   password +
  //   storeID +
  //   transactionNo +
  //   referenceNo +
  //   amount +
  //   paymentStatus +
  //   paymentReferenceNo +
  //   paymentDate +
  //   issuerID +
  //   retrievalReferenceNo +
  //   approvalCode +
  //   SECRET_KEY;

  // Generating MD5 hash
  return crypto.createHash('md5').update(dataString).digest('hex');
}

export function generateAutoEntrySignature(
  login: string,
  password: string,
  transactionNo: string,
  licensePlateNo: string,
  locationCode: string,
  SECRET_KEY: string
): string {
  const dataString = `${login}${password}${transactionNo}${licensePlateNo}${locationCode}${SECRET_KEY}`;
  // Concatenating all parameters into a single string
  // const dataString =
  //   login +
  //   password +
  //   storeID +
  //   transactionNo +
  //   referenceNo +
  //   amount +
  //   paymentStatus +
  //   paymentReferenceNo +
  //   paymentDate +
  //   issuerID +
  //   retrievalReferenceNo +
  //   approvalCode +
  //   SECRET_KEY;

  // Generating MD5 hash
  return crypto.createHash('md5').update(dataString).digest('hex');
}

export function generatePaymentPOSTSignature(
  login: string,
  password: string,
  transactionNo: string,
  referenceNo: string,
  amount: number,
  paymentStatus: string,
  paymentReferenceNo: string,
  paymentDate: string,
  issuerID: string,
  retrievalReferenceNo: string,
  SECRET_KEY: string
): string {
  const dataString = `${login}${password}${transactionNo}${referenceNo}${amount}${paymentStatus}${paymentReferenceNo}${paymentDate}${issuerID}${retrievalReferenceNo}${SECRET_KEY}`;
  console.log(dataString);
  // Concatenating all parameters into a single string
  // const dataString =
  //   login +
  //   password +
  //   storeID +
  //   transactionNo +
  //   referenceNo +
  //   amount +
  //   paymentStatus +
  //   paymentReferenceNo +
  //   paymentDate +
  //   issuerID +
  //   retrievalReferenceNo +
  //   approvalCode +
  //   SECRET_KEY;

  // Generating MD5 hash
  return crypto.createHash('md5').update(dataString).digest('hex');
}

export function generatePaymentPOSTQRISSignature(
  login: string,
  password: string,
  storeID: string,
  transactionNo: string,
  referenceNo: string,
  amount: number,
  paymentStatus: string,
  paymentType: string,
  paymentReferenceNo: string,
  paymentDate: string,
  issuerID: string,
  retrievalReferenceNo: string,
  SECRET_KEY: string
): string {
  const dataString = `${login}${password}${storeID}${transactionNo}${referenceNo}${amount}${paymentStatus}${paymentType}${paymentReferenceNo}${paymentDate}${issuerID}${retrievalReferenceNo}${SECRET_KEY}`;
  console.log(dataString);
  // Concatenating all parameters into a single string
  // const dataString =
  //   login +
  //   password +
  //   storeID +
  //   transactionNo +
  //   referenceNo +
  //   amount +
  //   paymentStatus +
  //   paymentReferenceNo +
  //   paymentDate +
  //   issuerID +
  //   retrievalReferenceNo +
  //   approvalCode +
  //   SECRET_KEY;

  // Generating MD5 hash
  return crypto.createHash('md5').update(dataString).digest('hex');
}
