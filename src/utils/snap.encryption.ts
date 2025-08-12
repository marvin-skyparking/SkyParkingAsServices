import crypto from 'crypto';

export interface Headers {
  'Content-type': string;
  'X-TIMESTAMP': string;
  'X-SIGNATURE': string;
  'X-PARTNER-ID': string;
  'X-EXTERNAL-ID': string;
  'CHANNEL-ID': string;
  'X-IP-ADDRESS': string;
}

// Utility function to generate SHA-256 hash of a string
export function hashSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export async function generateStringToSignInquiry(
  httpMethod: string,
  relativePath: string,
  accessToken: string,
  requestBody: object | null,
  timestamp: string
): Promise<string> {
  // // Validate inputs
  if (!httpMethod || !relativePath || !accessToken || !timestamp) {
    throw new Error("All arguments except 'requestBody' are required.");
  }

  const minifiedRequestBody = JSON.stringify(requestBody).replace(/\s+/g, '');

  // Hash the request body using SHA-256
  const hashedRequestBody = hashSHA256(minifiedRequestBody);

  // Convert the hash to lowercase
  const lowercaseHashBody = hashedRequestBody.toLowerCase();

  // Return the constructed string to sign
  return `${httpMethod}:${relativePath}:${accessToken}:${lowercaseHashBody}:${timestamp}`;
}

export function generateStringToSign(
  clientKey: string,
  timestamp: string
): string {
  return `${clientKey}|${timestamp}`;
}

// Function to sign the string using SHA256withRSA (RSA-SHA256)
export function signWithRSA(stringToSign: string, SECRET_KEY: string): string {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(stringToSign);
  sign.end();
  return sign.sign(SECRET_KEY, 'base64'); // Generate RSA signature and encode in base64
}

export function signAsymmetricSignatures(
  stringToSign: string,
  secret_key: string
): string {
  return crypto
    .createHmac('sha256', secret_key)
    .update(stringToSign)
    .digest('base64');
}

export function verifysymmetricSignatures(
  signature: string,
  stringToSign: string,
  secretKey: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(stringToSign)
    .digest('base64');

  return signature === expectedSignature;
}

export function generateHMACSignatures(
  stringToSign: string,
  secretKey: string
): string {
  const hmac = crypto.createHmac('sha512', secretKey);
  hmac.update(stringToSign);
  const signature = hmac.digest('base64');
  console.log('Generated Signature:', signature); // Debugging
  return signature;
}
