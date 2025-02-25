import crypto from 'crypto';
import Partner from '../models/partner.model';

/**
 * Fetch client secret from the database using client_id
 */
export async function getClientSecret(
  client_id: string
): Promise<string | null> {
  try {
    const partner = await Partner.findOne({ where: { client_id } });
    return partner ? partner.secret_key : null;
  } catch (error) {
    console.error('Error fetching client secret:', error);
    return null;
  }
}

/**
 * Sign a string using HMAC with the provided client_id and secret_key
 */
export function signAsymmetricSignature(
  secret_key: string,
  stringToSign: string
): string {
  try {
    const hmac = crypto.createHmac('sha256', secret_key);
    hmac.update(stringToSign);
    return hmac.digest('base64');
  } catch (error) {
    console.error('Error signing:', error);
    throw error;
  }
}

/**
 * Verify the signature using the stored secret_key
 */
export async function verifyAsymmetricSignature(
  client_id: string,
  signature: string,
  stringToSign: string
): Promise<boolean> {
  try {
    // Fetch the secret key from the database
    const secret_key = await getClientSecret(client_id);
    console.log(secret_key);
    if (!secret_key) {
      console.error('Invalid client_id:', secret_key);
      return false;
    }

    // Generate the expected signature
    const expectedSignature = signAsymmetricSignature(secret_key, stringToSign);

    // Compare the generated signature with the provided one
    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}
