import moment from 'moment-timezone';
import {
  apiService,
  EncryptedPayload,
  ResponseData,
  ServiceResponse
} from '../interfaces/general.interface';
import {
  GenerateInquirySignature,
  InquiryResponse,
  InquiryTarifResponse
} from '../models/inquiry_transaction';
import CircuitBreaker from '../utils/circuit-breaker';
import {
  Decryption,
  Encryption,
  getTodayDate,
  md5,
  secretKey
} from '../utils/encryption.utils';
import {
  CreateVoucherRedemptionDto,
  RedemptionStatus,
  VoucherRedemption,
  VoucherRedemptionMerchantRequest,
  VoucherRedemptionMerchantResponse,
  VoucherRedemptionPOSTResponse,
  VoucherRedemptionPOSTRequest,
  VoucherType
} from '../models/redemption.model';
import PartnerMapping from '../models/partner_mapping.model';
import { getRolesByPartnerId } from './partner_mapping.service';
import Joi from 'joi';
import {
  MerchantUsageRequest,
  MerchantUsageResponse,
  POSTUsageRequest,
  VoucherUsage,
  VoucherUsageAttributes
} from '../models/voucher-usage.model';
import { VoucherUsageMapping } from '../models/voucher-usage-mapping.model';
import { Op } from 'sequelize';

export interface IVoucherService {
  inquiryTicket(params: EncryptedPayload): Promise<ServiceResponse>;
  VoucherRedemption(params: EncryptedPayload): Promise<ServiceResponse>;
  UpdateTarifPOST(
    params: VoucherRedemptionPOSTRequest,
    gibberishKey: string,
    endpoint: string
  ): Promise<UpdatePOST<VoucherRedemptionPOSTResponse | null>>;
  VoucherUsageNotification(params: EncryptedPayload): Promise<ServiceResponse>;
  VoucherRedemptionEncrypt(
    params: VoucherRedemptionMerchantRequest
  ): Promise<EncryptedPayload>;
  VoucherUsageEncrypt(params: POSTUsageRequest): Promise<EncryptedPayload>;
}

const cb = new CircuitBreaker({
  failureThreshold: 3,
  coolDownPeriod: 15,
  requestTimeout: 10
});

interface UpdatePOST<T> {
  status: string;
  data: T;
}

export const voucherRedemptionSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().required(),
  merchantID: Joi.string().required(),
  tenantID: Joi.string().required(),
  locationCode: Joi.string().required(),
  transactionNo: Joi.string().required(),
  transactionReferenceNo: Joi.string().required(),
  transactionReceiptNo: Joi.string().required(),
  transactionReceiptAmount: Joi.string().required(),
  voucherType: Joi.string()
    .valid(...Object.values(VoucherType))
    .required(),
  voucherValue: Joi.string().required(),
  voucherExpiryDate: Joi.string().isoDate().required(),
  customerVehicleType: Joi.string().optional().allow(''),
  customerVehiclePlateNo: Joi.string().optional().allow(''),
  customerMobileNo: Joi.string().optional().allow(''),
  customerEmail: Joi.string().optional().allow(''),
  signature: Joi.string().required()
});

export const voucherUsageSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string().required(),
  locationCode: Joi.string().required(),
  transactionNo: Joi.string().required(),
  licensePlateNo: Joi.string().required(),
  inTime: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': `"inTime" must be in format YYYY-MM-DD HH:mm:ss`
    }),
  gateInCode: Joi.string().required(),
  vehicleType: Joi.string().valid('MOBIL', 'MOTOR').required(),
  totalTariff: Joi.number().min(0).required(),
  outTime: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': `"outTime" must be in format YYYY-MM-DD HH:mm:ss`
    }),
  gateOutCode: Joi.string().required(),
  signature: Joi.string().required()
});

export interface MerchantInquiryRequest {
  login: string;
  password: string;
  merchantID: string;
  tenantID: string;
  locationCode: string;
  transactionNo: string;
  signature: string;
}

export interface MerchantInquiryResponse {
  transactionNo: string;
  transactionStatus: string;
  inTime: string;
  gateInCode: string;
  duration: number;
  tariff: number;
  vehicleType: string;
  vehiclePlateNo: string;
  outTime: string;
  gateOutCode: string;
  gracePeriod: number | null;
  location: string;
  paymentStatus: string;
}

export interface POSTInquiryRequest {
  login: string;
  password: string;
  locationCode: string;
  transactionNo: string;
  signature: string;
}

export interface POSTInquiryResponse {
  transactionNo: string;
  transactionStatus: string;
  inTime: string;
  gateInCode: string;
  duration: number;
  tariff: number;
  vehicleType: string;
  vehiclePlateNo: string;
  outTime: string;
  gateOutCode: string;
  gracePeriod: number | null;
  location: string;
  paymentStatus: string;
}

interface MerchantResponse<T> {
  data: T;
}

export class VoucherService implements IVoucherService {
  async inquiryTicket(params: EncryptedPayload): Promise<ServiceResponse> {
    try {
      const secret = secretKey;
      const decryptedPayload = await Decryption<MerchantInquiryRequest>(
        params.data,
        secret
      );

      if (!decryptedPayload) {
        return {
          data: await this.encryptedErrorResponse(secret),
          statusCode: 400,
          message: '[Inquiry Error] Invalid request payload'
        };
      }

      // Checking Partner
      const partner = await PartnerMapping.findOne({
        where: {
          MPAN: decryptedPayload.merchantID
        }
      });

      if (!partner) {
        return {
          data: await this.encryptedErrorResponse(secret),
          statusCode: 400,
          message: '[Redemption Error] Partner not found'
        };
      }

      const locationRoles = await getRolesByPartnerId(partner.Id);
      const postRole = locationRoles.find(
        (role) => role.role_name === 'POST' && role.access_type === 'INQUIRY'
      );

      if (!postRole || !postRole.url_access) {
        return {
          data: await this.encryptedErrorResponse(secret),
          statusCode: 400,
          message: '[Redemption Error] Access Denied'
        };
      }

      const postSignature = md5(`
        ${partner.Login}
        ${partner.Password}
        ${decryptedPayload.locationCode}
        ${decryptedPayload.transactionNo}
        ${partner.SecretKey}`);

      const postInquiryRequest: POSTInquiryRequest = {
        login: partner.Login ?? '',
        password: partner.Password ?? '',
        locationCode: decryptedPayload.locationCode,
        transactionNo: decryptedPayload.transactionNo,
        signature: postSignature
      };

      const encryptedInquiryPayload = await Encryption(
        JSON.stringify(postInquiryRequest),
        secret
      );

      const result = await cb.fire<EncryptedPayload>({
        method: 'POST',
        url: apiService.inquiryTicket,
        headers: {
          client_id: '5739692d-a785-43d2-84f8-7e37f8158873',
          signature: postSignature,
          timestamp: moment.tz('Asia/Jakarta').format(),
          secret_key: partner.SecretKey
        },
        data: { data: encryptedInquiryPayload }
      });

      if (result === false) {
        throw new Error('Service inquiry ticket bussy!');
      }

      const decryptedInquiry = Decryption<ResponseData<POSTInquiryResponse>>(
        result?.data,
        secret
      );

      if (!decryptedInquiry) {
        throw new Error('Invalid payload data');
      }

      return {
        data: '',
        statusCode: 400,
        message: '[Redemption Error] Access Denied'
      };
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async UpdateTarifPOST(
    params: VoucherRedemptionPOSTRequest,
    gibberishKey: string,
    endpoint: string
  ): Promise<UpdatePOST<VoucherRedemptionPOSTResponse | null>> {
    try {
      console.log('post payload raw: ', params);

      const encryptedPayload = await Encryption(
        JSON.stringify(params),
        gibberishKey
      );

      console.log('sending post payload: ', encryptedPayload);

      const result = await cb.fire<any>({
        method: 'POST',
        url: endpoint,
        data: { data: encryptedPayload }
      });

      if (result === false) {
        return {
          status: 'ISSUED',
          data: null
        };
      }

      console.log('result: ', result);

      let sanitizeResult: EncryptedPayload;
      if (typeof result === 'string') {
        sanitizeResult = JSON.parse(result);
      } else {
        sanitizeResult = result;
      }

      const decrypted = await Decryption<string>(
        sanitizeResult?.data,
        gibberishKey
      );

      const decryptedResponse: ResponseData<VoucherRedemptionPOSTResponse> =
        JSON.parse(decrypted);

      if (decryptedResponse.responseCode !== '211000') {
        return {
          status: 'ISSUED',
          data: decryptedResponse.data
        };
      }

      console.log('decrypted result: ', decryptedResponse);

      return {
        status: 'REDEEMED',
        data: {
          transactionNo: decryptedResponse.data.transactionNo,
          transactionReferenceNo: decryptedResponse.data.transactionReferenceNo,
          voucherType: decryptedResponse.data.voucherType as VoucherType,
          voucherValue: decryptedResponse.data.voucherValue,
          voucherStatus: decryptedResponse.data
            .voucherStatus as RedemptionStatus,
          gateInCode: decryptedResponse.data.gateInCode,
          inTime: decryptedResponse.data.inTime,
          duration: decryptedResponse.data.duration,
          tariff: decryptedResponse.data.tariff
        }
      };
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  async VoucherRedemptionEncrypt(
    params: VoucherRedemptionMerchantRequest
  ): Promise<EncryptedPayload> {
    try {
      const { error } = voucherRedemptionSchema.validate(params);
      const secret = secretKey;

      if (error) {
        const errResponse = await this.encryptedErrorResponse(secret);
        return { data: errResponse };
      }

      const encryptedPayload = await Encryption(JSON.stringify(params), secret);

      return { data: encryptedPayload };
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  async VoucherRedemption(params: EncryptedPayload): Promise<ServiceResponse> {
    try {
      // Decrypt Payload
      const secret = secretKey;
      const decrypted = await Decryption<string>(params.data, secret);

      if (!decrypted) {
        return {
          data: await this.encryptedErrorResponse(secret),
          statusCode: 400,
          message: '[Redemption Error] Invalid request payload'
        };
      }

      const decryptedPayload: VoucherRedemptionMerchantRequest =
        JSON.parse(decrypted);

      const { error } = voucherRedemptionSchema.validate(decryptedPayload);

      if (error) {
        return {
          data: await this.encryptedErrorResponse(secret),
          statusCode: 400,
          message: '[Redemption Error] Invalid payload'
        };
      }

      decryptedPayload.voucherValue = Number(decryptedPayload.voucherValue);

      // Checking Partner
      const partner = await PartnerMapping.findOne({
        where: {
          StoreCode: decryptedPayload.locationCode
        }
      });

      if (!partner) {
        return {
          data: await this.encryptedErrorResponse(secret),
          statusCode: 400,
          message: '[Redemption Error] Partner not founsd'
        };
      }

      // Checking Transaction Refrence No
      const existingTransactions = await VoucherRedemption.findAll({
        where: {
          [Op.or]: [
            { TransactionReferenceNo: decryptedPayload.transactionReferenceNo },
            { TransactionReceiptNo: decryptedPayload.transactionReceiptNo }
          ]
        },
        attributes: [
          'TransactionReferenceNo',
          'TransactionReceiptNo',
          'POSTDataResponse'
        ]
      });

      if (existingTransactions.length > 0) {
        return {
          data: await this.encryptedErrorResponse(secret),
          statusCode: 400,
          message: `[Redemption Error] Voucher already used`
        };
      }

      // Check if any existing transaction is already redeemed
      // for (const transaction of existingTransactions) {
      //   try {
      //     const postResponse: ResponseData<VoucherRedemptionPOSTResponse> =
      //       JSON.parse(transaction.POSTDataResponse ?? '{}');

      //     if (postResponse.data?.voucherStatus === RedemptionStatus.REDEEMED) {
      //       const isReferenceMatch = transaction.TransactionReferenceNo === decryptedPayload.transactionReferenceNo;
      //       const errorType = isReferenceMatch ? 'Reference' : 'Receipt';

      //       return {
      //         data: await this.encryptedErrorResponse(secret),
      //         statusCode: 200,
      //         message: `[Redemption Error] Transaction ${errorType} Number already used`
      //       };
      //     }
      //   } catch (error) {
      //     console.error('Error parsing POSTDataResponse:', error);
      //   }
      // }

      // Update Tarif (API)
      const postSignature = md5(
        (partner?.Login ?? '') +
          partner?.Password +
          decryptedPayload.locationCode +
          decryptedPayload.transactionNo +
          decryptedPayload.transactionReferenceNo +
          decryptedPayload.voucherType +
          String(decryptedPayload.voucherValue) +
          decryptedPayload.voucherExpiryDate +
          decryptedPayload.customerVehicleType +
          decryptedPayload.customerVehiclePlateNo +
          partner?.SecretKey
      );

      const postRequest: VoucherRedemptionPOSTRequest = {
        login: partner.Login ?? '',
        password: partner.Password ?? '',
        locationCode: decryptedPayload.locationCode,
        transactionNo: decryptedPayload.transactionNo,
        transactionReferenceNo: decryptedPayload.transactionReferenceNo,
        voucherType: decryptedPayload.voucherType,
        voucherValue: decryptedPayload.voucherValue,
        voucherExpiryDate: decryptedPayload.voucherExpiryDate,
        customerVehicleType: decryptedPayload.customerVehicleType,
        customerVehiclePlateNo: decryptedPayload.customerVehiclePlateNo,
        signature: postSignature
      };

      const locationRoles = await getRolesByPartnerId(partner.Id);
      const postRole = locationRoles.find(
        (role) => role.role_name === 'POST' && role.access_type === 'REDEMPTION'
      );

      if (!postRole || !postRole.url_access) {
        return {
          data: await this.encryptedErrorResponse(secret),
          statusCode: 400,
          message: '[Redemption Error] Access Denied'
        };
      }

      console.log('before sending post: ', postRole);

      const giberishKey = `${getTodayDate()}${partner?.GibberishKey ?? ''}`;

      console.log('giberish key: ', giberishKey);

      const result = await this.UpdateTarifPOST(
        postRequest,
        giberishKey,
        postRole?.url_access ?? ''
      );

      const updatePOST = result?.data;

      console.log('after sending: ', result);

      // Write Redemption Log
      const merchantDataResponse: VoucherRedemptionMerchantResponse = {
        transactionNo: decryptedPayload.transactionNo,
        transactionReferenceNo: decryptedPayload.transactionReferenceNo,
        transactionReceiptNo: decryptedPayload.transactionReceiptNo,
        voucherType: decryptedPayload.voucherType,
        voucherValue: decryptedPayload.voucherValue,
        voucherStatus:
          result?.status === 'REDEEMED'
            ? RedemptionStatus.REDEEMED
            : RedemptionStatus.ISSUED,
        gateInCode: updatePOST?.gateInCode ?? '',
        inTime: updatePOST?.inTime ?? '',
        duration: updatePOST?.duration ?? 0,
        tariff: updatePOST?.tariff ?? 0
      };

      // Parsing dengan timezone Asia/Jakarta
      const expiryDate = moment
        .tz(
          decryptedPayload.voucherExpiryDate,
          'YYYY-MM-DD HH:mm:ss',
          'Asia/Jakarta'
        )
        .toDate();

      const redemptionData: CreateVoucherRedemptionDto = {
        CompanyName: partner.CompanyName,
        MerchantID: decryptedPayload.merchantID,
        TenantID: decryptedPayload.tenantID,
        LocationCode: decryptedPayload.locationCode,
        TransactionNo: decryptedPayload.transactionNo,
        TransactionReferenceNo: decryptedPayload.transactionReferenceNo,
        TransactionReceiptNo: decryptedPayload.transactionReceiptNo,
        TransactionReceiptAmount: decryptedPayload.transactionReceiptAmount,
        VoucherType: decryptedPayload.voucherType,
        VoucherValue: decryptedPayload.voucherValue,
        VoucherExpiryDate: expiryDate,
        CustomerVehicleType: decryptedPayload.customerVehicleType,
        CustomerVehiclePlateNo: decryptedPayload.customerVehiclePlateNo,
        CustomerMobileNo: decryptedPayload.customerMobileNo,
        CustomerEmail: decryptedPayload.customerEmail,
        MerchantDataRequest: JSON.stringify(decryptedPayload),
        MerchantDataResponse: JSON.stringify(merchantDataResponse),
        POSTDataRequest: JSON.stringify(postRequest),
        POSTDataResponse: JSON.stringify(updatePOST),
        CreatedBy: decryptedPayload.login,
        CreatedOn: moment.tz('Asia/Jakarta').toDate(),
        UpdatedBy: decryptedPayload.login,
        UpdatedOn: moment.tz('Asia/Jakarta').toDate()
      };

      await VoucherRedemption.create(redemptionData);

      // Wraping Response
      const response: ResponseData<VoucherRedemptionMerchantResponse> = {
        responseStatus: 'Success',
        responseCode: '211000',
        responseDescription: 'Transaction Success',
        messageDetail: 'Transaction is valid and saved successfully',
        data: merchantDataResponse
      };

      const encryptedResponse = await Encryption(
        JSON.stringify(response),
        secret
      );

      return {
        data: encryptedResponse,
        statusCode: 201,
        message: 'Success'
      };
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async UpdateUsageNotification(
    params: MerchantUsageRequest,
    gibberishKey: string,
    endpoint: string
  ): Promise<MerchantUsageResponse> {
    try {
      const encryptedPayload = await Encryption(
        JSON.stringify(params),
        gibberishKey
      );

      const result = await cb.fire<EncryptedPayload>({
        method: 'POST',
        url: endpoint,
        data: { data: encryptedPayload }
      });

      if (result === false) {
        throw new Error('Service inquiry ticket bussy!');
      }

      console.log('response from merchant usage: ', result);

      const decryptedResponse = await Decryption<
        MerchantResponse<ResponseData<MerchantUsageResponse>>
      >(result?.data, gibberishKey);

      console.log('berhasil decrypt: ', decryptedResponse);

      return decryptedResponse.data;
    } catch (error: any) {
      console.log('error ketika send ke merchant: ', error?.message);
      throw new Error(error?.message);
    }
  }

  async VoucherUsageEncrypt(
    params: POSTUsageRequest
  ): Promise<EncryptedPayload> {
    try {
      const secret = secretKey;
      const { error } = voucherUsageSchema.validate(params);

      console.log(error);

      if (error) {
        const errResponse = await this.encryptedErrorResponse(secret);
        return { data: errResponse };
      }

      const encryptedPayload = await Encryption(JSON.stringify(params), secret);

      console.log('secret key usage encrypt: ', secret);
      console.log('usage encrypt: ', encryptedPayload);

      return { data: encryptedPayload };
    } catch (error: any) {
      throw new Error(error?.message);
    }
  }

  async VoucherUsageNotification(
    params: EncryptedPayload
  ): Promise<ServiceResponse> {
    try {
      console.log('incoming payload: ', params);

      const secret = secretKey;
      const decrypted = await Decryption<string>(params.data, secret);

      if (!decrypted) {
        console.log('[Usage Notification Error] Invalid request payload');

        return {
          data: await this.encryptedErrorResponse(secret),
          statusCode: 400,
          message: '[Usage Notification Error] Invalid request payload'
        };
      }

      const decryptedPayload: POSTUsageRequest = JSON.parse(decrypted);

      console.log('usage payload from post: ', decryptedPayload);

      const { error } = voucherUsageSchema.validate(decryptedPayload);

      if (error) {
        console.log('[Usage Notification Error] Invalid payload', error);

        return {
          data: await this.encryptedErrorResponse(secret),
          statusCode: 400,
          message: '[Usage Notification Error] Invalid payload'
        };
      }

      // Find Redemption
      const redemption = await VoucherRedemption.findOne({
        where: {
          TransactionNo: decryptedPayload.transactionNo
        }
      });

      if (!redemption) {
        console.log('[Usage Notification Error] Invalid transaction');

        return {
          data: await this.encryptedErrorResponse(secret),
          statusCode: 400,
          message: '[Usage Notification Error] Invalid transaction'
        };
      }

      // Find Merchant
      const partner = await PartnerMapping.findOne({
        where: {
          MPAN: redemption.MerchantID
        }
      });

      if (!partner) {
        console.log('[Redemption Error] Partner not found');

        return {
          data: await this.encryptedErrorResponse(secret),
          statusCode: 400,
          message: '[Redemption Error] Partner not found'
        };
      }

      const merchantSignature = md5(
        (partner?.Login ?? '') +
          (partner?.Password ?? '') +
          partner?.MPAN +
          decryptedPayload.locationCode +
          decryptedPayload.transactionNo +
          decryptedPayload.licensePlateNo +
          decryptedPayload.inTime +
          decryptedPayload.gateInCode +
          decryptedPayload.vehicleType +
          String(decryptedPayload.totalTariff) +
          decryptedPayload.outTime +
          decryptedPayload.gateOutCode +
          partner?.SecretKey
      );

      const merchantDataRequest: MerchantUsageRequest = {
        login: partner.Login ?? '',
        password: partner.Password ?? '',
        merchantID: partner.MPAN ?? '',
        locationCode: decryptedPayload.locationCode,
        transactionNo: decryptedPayload.transactionNo,
        licensePlateNo: decryptedPayload.licensePlateNo,
        inTime: decryptedPayload.inTime,
        gateInCode: decryptedPayload.gateInCode,
        vehicleType: decryptedPayload.vehicleType,
        totalTariff: decryptedPayload.totalTariff,
        outTime: decryptedPayload.outTime,
        gateOutCode: decryptedPayload.gateInCode,
        signature: merchantSignature
      };

      const voucherUsageData: VoucherUsageAttributes = {
        CompanyName: partner.CompanyName,
        MerchantID: partner.MPAN,
        LocationCode: partner.StoreCode,
        TransactionNo: decryptedPayload.transactionNo,
        LicensePlateNo: decryptedPayload.licensePlateNo,
        InTime: moment
          .tz(decryptedPayload.inTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Jakarta')
          .toDate(),
        GateInCode: decryptedPayload.gateInCode,
        VehicleType: decryptedPayload.vehicleType,
        TotalTariff: decryptedPayload.totalTariff,
        OutTime: moment
          .tz(decryptedPayload.outTime, 'YYYY-MM-DD HH:mm:ss', 'Asia/Jakarta')
          .toDate(),
        GateOutCode: decryptedPayload.gateOutCode,
        MerchantDataRequest: JSON.stringify(merchantDataRequest),
        MerchantDataResponse: '',
        POSTDataRequest: JSON.stringify(decryptedPayload),
        POSTDataResponse: '',
        CreatedBy: partner.Login,
        CreatedOn: moment.tz('Asia/Jakarta').toDate(),
        UpdatedBy: partner.Login,
        UpdatedOn: moment.tz('Asia/Jakarta').toDate()
      };

      const locationRoles = await getRolesByPartnerId(partner.Id);
      const postRole = locationRoles.find(
        (role) =>
          role.role_name === 'MERCHANT PARTNER' && role.access_type === 'USAGE'
      );

      if (!postRole || !postRole.url_access) {
        console.log('[Usage Notification Error] Access Denied');

        return {
          data: await this.encryptedErrorResponse(secret),
          statusCode: 400,
          message: '[Usage Notification Error] Access Denied'
        };
      }

      await this.UpdateUsageNotification(
        merchantDataRequest,
        secret,
        postRole.url_access
      );

      await VoucherUsage.create(voucherUsageData);

      const response: ResponseData<MerchantUsageResponse> = {
        responseStatus: 'Success',
        responseCode: '211000',
        responseDescription: 'Transaction Success',
        messageDetail: 'Transaction is valid and saved successfully',
        data: {
          transactionNo: decryptedPayload.transactionNo,
          licensePlateNo: decryptedPayload.licensePlateNo,
          transactionStatus: 'VALID'
        }
      };

      const encryptedResponse = await Encryption(
        JSON.stringify(response),
        secret
      );

      console.log('secret key that used to encrypt payload: ', secret);
      console.log('encrypted payload: ', encryptedResponse);

      return {
        data: encryptedResponse,
        statusCode: 200,
        message: 'Success'
      };
    } catch (error: any) {
      throw new Error(error);
    }
  }

  async encryptedErrorResponse(secret: string) {
    const response: ResponseData<string> = {
      responseStatus: 'Failed',
      responseCode: '211001',
      responseDescription: 'Transaction Failed',
      messageDetail: 'Transaction invalid and saved successfully',
      data: 'Invalid Transaction'
    };

    const encryptedResponse = await Encryption(
      JSON.stringify(response),
      secret
    );

    return encryptedResponse;
  }
}
