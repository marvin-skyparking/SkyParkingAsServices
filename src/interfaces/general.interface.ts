import EnvConfig from '../configs/env.config';

export interface ResponseData<T> {
  responseStatus: string;
  responseCode: string;
  responseDescription: string;
  messageDetail: string;
  data: T;
}

export interface EncryptedPayload {
  data: string;
}

export interface ServiceResponse {
  data: string | null;
  statusCode: number;
  message: string;
}

export const apiService = {
  signatureInquiry: `${EnvConfig}/v1/parking/Signature-Inquiry`,
  inquiryTicket: `${EnvConfig}/v1/parking/Partner/InquiryTariffREG`,
  redemption: `${EnvConfig}/v1/parking/redemption`
};
