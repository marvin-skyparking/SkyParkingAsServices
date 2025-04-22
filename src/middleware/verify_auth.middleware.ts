import { Request, Response, NextFunction } from 'express';
import { getSecretKeyByClientId } from '../services/partner.service'; // adjust path
import { verifyAsymmetricSignature } from '../services/signature.service'; // adjust path

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
      responseStatus: 'FAILED',
      responseCode: '401400',
      responseMessage: 'Unauthorized, Missing credentials'
    });
  }

  const secret_key = await getSecretKeyByClientId(clientkey);
  if (!secret_key) {
    return res.status(200).json({
      responseStatus: 'FAILED',
      responseCode: '401401',
      responseMessage: 'Unauthorized, Invalid clientkey'
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
      responseStatus: 'FAILED',
      responseCode: '401401',
      responseMessage: 'Unauthorized, Invalid Signature'
    });
  }

  // You can attach the validated key or info to req if needed
  req.headers['validated-clientkey'] = clientkey;
  next(); // All good, continue
}
