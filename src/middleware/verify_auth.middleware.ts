import { Request, Response, NextFunction } from 'express';
import { getSecretKeyByClientId } from '../services/partner.service'; // adjust path
import { verifyAsymmetricSignature } from '../services/signature.service'; // adjust path
import { ERROR_MESSAGES_NEW } from '../constant/inapp-message';

export async function verifyClientAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { clientkey, signature, timestamp } = req.headers as {
    clientkey?: string;
    signature?: string;
    timestamp?: string;
  };

  if (!clientkey || !signature || !timestamp) {
    return res.status(200).json({
      ...ERROR_MESSAGES_NEW.MISSING_CREDENTIALS
    });
  }

  const secret_key = await getSecretKeyByClientId(clientkey);
  if (!secret_key) {
    return res.status(200).json({
      ...ERROR_MESSAGES_NEW.INVALID_CLIENTKEY
    });
  }

  const stringToSign = `${clientkey}|${timestamp}`;
  const isValidSignature = await verifyAsymmetricSignature(
    clientkey,
    signature,
    stringToSign
  );

  if (!isValidSignature) {
    return res.status(200).json({
      ...ERROR_MESSAGES_NEW.INVALID_SIGNATURE
    });
  }

  // You can attach the validated key or info to req if needed
  req.headers['validated-clientkey'] = clientkey;
  next(); // All good, continue
}

export async function verifyClientAuthAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { clientkey, signature, timestamp } = req.headers as {
    clientkey?: string;
    signature?: string;
    timestamp?: string;
  };

  if (!clientkey || !signature || !timestamp) {
    return res.status(200).json({
      ...ERROR_MESSAGES_NEW.MISSING_CREDENTIALS
    });
  }

  // ✅ Parse timestamp and validate time difference
  const requestTime = new Date(timestamp);
  const now = new Date();
  const timeDiff = Math.abs(now.getTime() - requestTime.getTime());
  const ALLOWED_WINDOW_MS = 20 * 60 * 1000; // 5 minutes

  if (isNaN(requestTime.getTime()) || timeDiff > ALLOWED_WINDOW_MS) {
    return res.status(200).json({
      ...ERROR_MESSAGES_NEW.INVALID_TIMESTAMP_BACKDATED // <- Add this message in your constants
    });
  }

  const secret_key = await getSecretKeyByClientId(clientkey);
  if (!secret_key) {
    return res.status(200).json({
      ...ERROR_MESSAGES_NEW.INVALID_CLIENTKEY
    });
  }

  const stringToSign = `${clientkey}|${timestamp}`;
  const isValidSignature = await verifyAsymmetricSignature(
    clientkey,
    signature,
    stringToSign
  );

  if (!isValidSignature) {
    return res.status(200).json({
      ...ERROR_MESSAGES_NEW.INVALID_SIGNATURE
    });
  }

  req.headers['validated-clientkey'] = clientkey;
  next();
}
