import newrelic from 'newrelic';
import { Request, Response } from 'express';
import { EncryptResponse, EncryptTotPOST } from '../encrypt.utils';
import { ERROR_MESSAGES } from '../../constant/INAPP.errormessage';
import { defaultTransactionData } from '../../models/inquiry_transaction';

/**
 * Handle all API errors consistently and log to New Relic
 */
export async function handleApiError(error: any, req: Request, res: Response, txNo:string, request_merchant_encrypt:string, context: string = 'unknown') {


  const encryptPayload = async (
  payload: any,
  key: string,
  transactionNo?: string
) => {
  if (!payload.data) payload.data = defaultTransactionData(transactionNo);
  const encrypted = await EncryptTotPOST(payload, key);
  return encrypted; // just the string
};

  const timestamp = new Date().toISOString();
  console.log(txNo)
  console.error(`[ERROR ${timestamp}] [${context}] ${error.message}`);

  // const nrErrorData: Record<string, any> = {
  //   stage: context,
  //   timestamp,
  //   route: req.originalUrl,
  //   method: req.method,
  //   transactionNo: txNo,
  //   request_merchant_encrypt: request_merchant_encrypt,
  //   response_to_merchant_encrypt: response_to_merchant_encrypt?.data,
  //   userAgent: req.headers['user-agent'],
  // };

  // 🔹 Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
  // First, generate the encrypted response
  const response_to_merchant_encrypt = await encryptPayload(
    ERROR_MESSAGES.CONNECTION_TO_POST_TIMEOUT,
    'SKY_IN-APP_INTEGRATION',
    txNo
  );

  // Then build New Relic error data including the actual response
  const nrErrorData = {
    stage: context,
    timestamp,
    route: req.originalUrl,
    method: req.method,
    transactionNo: txNo,
     ip: req.ip,
    request_merchant_encrypt: request_merchant_encrypt,
    response_to_merchant_encrypt: response_to_merchant_encrypt,
    userAgent: req.headers['user-agent'],
    type: 'TIMEOUT_ERROR',
    details: `Request timeout after configured limit.`,
    message: error.message
  };

  // Send error to New Relic
  newrelic.noticeError(error, nrErrorData);
  newrelic.recordCustomEvent('TIMEOUT_ERROR', nrErrorData);
console.log(response_to_merchant_encrypt)
  // Return the client response
return res.status(200).json({ data: response_to_merchant_encrypt });
}
//   // 🔹 Axios or network errors
//   if (error.isAxiosError) {
//     nrErrorData.type = 'AXIOS_ERROR';
//     nrErrorData.statusCode = error.response?.status || null;
//     nrErrorData.apiUrl = error.config?.url || null;
//     nrErrorData.responseBody = JSON.stringify(error.response?.data || {});
//     newrelic.noticeError(error, nrErrorData);
//     newrelic.recordCustomEvent('AXIOS_ERROR', { ...nrErrorData, message: error.message });
//     return res.status(502).json({ error: 'Upstream API Error' });
//   }

//   // 🔹 Unknown or logic errors
//   nrErrorData.type = 'UNKNOWN_ERROR';
//   nrErrorData.stack = error.stack?.substring(0, 2000);
//   newrelic.noticeError(error, nrErrorData);
//   newrelic.recordCustomEvent('UNKNOWN_ERROR', { ...nrErrorData, message: error.message });

//   return res.status(500).json({ error: 'Internal Server Error' });
}
