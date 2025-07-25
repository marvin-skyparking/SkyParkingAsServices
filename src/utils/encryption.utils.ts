// encryption/Encryption.ts
import { Worker } from 'worker_threads';
import crypto from 'crypto';
import path from 'path';

const runWorker = (
  action: 'encrypt' | 'decrypt',
  payload: any,
  secret: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'encryptionWorker.js'), {
      workerData: {
        action,
        payload: action === 'encrypt' ? payload : payload,
        secret
      }
    });

    worker.on('message', ({ result, error }) => {
      if (error) reject(error instanceof Error ? error : new Error(error));
      else resolve(result);
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};

export const Encryption = async <T>(
  data: T,
  secret: string
): Promise<string> => {
  try {
    return await runWorker('encrypt', data, secret);
  } catch (error: any) {
    console.log('error', `Encryption failed: ${error.message}`);
    return '';
  }
};

export const Decryption = async <T>(
  cipher: string,
  secret: string
): Promise<T> => {
  try {
    const result = await runWorker('decrypt', cipher, secret);
    return JSON.parse(result) as T;
  } catch (error: any) {
    console.log('error', `Decryption failed: ${error.message}`);
    throw new Error(error?.message);
  }
};

export function md5(value: string): string {
  return crypto
    .createHash('md5')
    .update(value, 'utf8')
    .digest('hex')
    .toUpperCase();
}

export function encodeBase64(value: string): string {
  return Buffer.from(value, 'utf-8').toString('base64');
}

export function decodeBase64(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

export const getTodayDate = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
};

export const secretKey = `${getTodayDate()}PARTNER_KEY`;
