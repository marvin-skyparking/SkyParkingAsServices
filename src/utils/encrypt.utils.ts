import crypto from 'crypto';
import CryptoJS from 'crypto-js';

/**
 * Decrypt AES Encrypted Data
 * @param encryptedData - AES encrypted string
 * @param secretKey - Secret key used for decryption
 * @returns Decrypted object
 */
export const encryptPayload = (
  data: Record<string, any>,
  secretKey: string
): string => {
  try {
    const jsonString = JSON.stringify(data);

    // Ensure secretKey is properly encoded
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(jsonString),
      secretKey
    ).toString();

    return encrypted;
  } catch (error: any) {
    console.error('Encryption Error:', error.message);
    throw new Error('Encryption failed');
  }
};

export const decryptPayload = (
  encryptedData: string,
  secretKey: string
): Record<string, any> | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
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
  amount: string,
  paymentStatus: string,
  paymentReferenceNo: string,
  paymentDate: string,
  partnerID: string,
  retrievalReferenceNo: string,
  approvalCode: string,
  SECRET_KEY: string
): string {
  // Concatenating all parameters into a single string
  const dataString =
    login +
    password +
    storeID +
    transactionNo +
    referenceNo +
    amount +
    paymentStatus +
    paymentReferenceNo +
    paymentDate +
    partnerID +
    retrievalReferenceNo +
    approvalCode +
    SECRET_KEY;

  // Generating MD5 hash
  return crypto.createHash('md5').update(dataString).digest('hex');
}
