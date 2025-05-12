import { Request, Response } from 'express';
import InquiryTransactionMapping from '../models/partner_mapping.model';
import {
  decryptPayload,
  DecryptTotPOST,
  EncryptResponse,
  EncryptTotPOST,
  generatePaymentSignature,
  generateSignature,
  RealdecryptPayload,
  RealencryptPayload
} from '../utils/encrypt.utils';
import {
  findInquiryTransactionMappingByNMID,
  findInquiryTransactionMappingPartner
} from '../services/inquiry_transaction_mapping.service';
import {
  findTicket,
  updateTarifIfExpired,
  updateTicketStatus
} from '../services/ticket_generator.service';
import { createPaymentTransaction } from '../services/payment_confirmation.service';
import moment from 'moment-timezone';
import {
  getRoleById,
  getRolesByPartnerId
} from '../services/partner_mapping.service';
import PartnerMapping from '../models/partner_mapping.model';
import { createInquiryTransaction } from '../services/inquiry_transaction.service';
import { ERROR_MESSAGES } from '../constant/INAPP.errormessage';
import {
  defaultTransactionData,
  defaultTransactionDataPaid,
  TransactionData
} from '../models/inquiry_transaction';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import Sentry from '../utils/sentry.utils';
import { ACCESS_ERROR_MESSAGES } from '../constant/ACCESS.errormessage';

/**
 * Process Inquiry Transaction
 */

axiosRetry(axios, {
  retries: 3, // Number of retries
  retryDelay: (retryCount) => retryCount * 1000, // Exponential backoff (1s, 2s, 3s)
  retryCondition: (error: any) => {
    // Retry only on network errors or 5xx server errors
    return error.response?.status >= 500 || error.code === 'ECONNABORTED';
  }
});

//Inquiry Partner - NOBU
export async function Inquiry_Transaction(
  req: Request,
  res: Response
): Promise<any> {
  if ((req as any).timedout) return;

  const encryptAndRespond = async (
    payload: any,
    key: string,
    transactionNo?: string
  ) => {
    if (!payload.data) payload.data = defaultTransactionData(transactionNo);
    const encrypted = await EncryptTotPOST(payload, key);
    return res.status(200).json({ data: encrypted });
  };

  try {
    const { data } = req.body;
    if (!data) {
      Sentry.captureException(new Error('Missing encrypted data'), {
        extra: { requestBody: data, headers: req.headers, ip: req.ip }
      });
      return encryptAndRespond(
        ERROR_MESSAGES.MISSING_ENCRYPTED_DATA,
        '',
        undefined
      );
    }

    const decryptedObject = RealdecryptPayload(data);
    if (!decryptedObject) {
      Sentry.captureException(new Error('INVALID ENCRYPTION DATA'), {
        extra: { requestBody: data, headers: req.headers, ip: req.ip }
      });
      return encryptAndRespond(
        ERROR_MESSAGES.INVALID_DATA_ENCRYPTION,
        'PARTNER_KEY'
      );
    }

    const { login, password, storeID, transactionNo, signature } =
      decryptedObject;
    if (![login, password, storeID, transactionNo, signature].every(Boolean)) {
      return encryptAndRespond(
        ERROR_MESSAGES.MISSING_FIELDS,
        '',
        transactionNo
      );
    }

    const credential = await findInquiryTransactionMappingPartner(
      login,
      password
    );
    if (!credential) {
      return encryptAndRespond(
        ERROR_MESSAGES.INVALID_CREDENTIAL,
        '',
        transactionNo
      );
    }

    const expectedSig = generateSignature(
      login,
      password,
      storeID,
      transactionNo,
      credential.SecretKey ?? ''
    );
    if (signature.toLowerCase() !== expectedSig.toLowerCase()) {
      return encryptAndRespond(
        ERROR_MESSAGES.INVALID_SIGNATURE,
        credential.GibberishKey ?? '',
        transactionNo
      );
    }

    const location = await findInquiryTransactionMappingByNMID(storeID);
    if (!location) {
      return encryptAndRespond(
        ERROR_MESSAGES.INVALID_LOCATION,
        credential.GibberishKey ?? '',
        transactionNo
      );
    }

    const roles = await getRolesByPartnerId(credential.Id);
    const hasInquiryAccess = roles.some(
      (role) => role.access_type === 'INQUIRY'
    );
    if (!hasInquiryAccess) {
      return encryptAndRespond(
        ACCESS_ERROR_MESSAGES.ACCESS_DENIED,
        credential.GibberishKey ?? '',
        transactionNo
      );
    }

    const locationRoles = await getRolesByPartnerId(location.Id);
    const postRole = locationRoles.find(
      (role) => role.role_name === 'POST' && role.access_type === 'INQUIRY'
    );
    if (!postRole || !postRole.url_access) {
      return encryptAndRespond(
        ERROR_MESSAGES.INVALID_LOCATION,
        credential.GibberishKey ?? '',
        transactionNo
      );
    }

    const signatureData = {
      login: location.Login ?? '',
      password: location.Password ?? '',
      storeID: location.NMID ?? '',
      transactionNo
    };

    const remoteSignature = generateSignature(
      signatureData.login,
      signatureData.password,
      signatureData.storeID,
      transactionNo,
      location.SecretKey ?? ''
    );

    const requestPayload = {
      ...signatureData,
      signature: remoteSignature
    };

    const encryptedRequest = await EncryptTotPOST(
      requestPayload,
      location.GibberishKey ?? ''
    );
    const apiResponse = await axios.post(postRole.url_access, {
      data: encryptedRequest
    });

    const cleanString = apiResponse.data.replace(
      /[\u0000-\u001F\u007F-\u009F]/g,
      ''
    );
    const parsedData = JSON.parse(cleanString);
    const finalData = await DecryptTotPOST(
      parsedData.data,
      location.GibberishKey ?? ''
    );

    await createInquiryTransaction({
      CompanyName: location.CompanyName ?? '',
      NMID: location.NMID ?? '',
      StoreCode: transactionNo.toString().slice(-5),
      TransactionNo: transactionNo,
      ReferenceNo: '',
      ProjectCategoryId: 14,
      ProjectCategoryName: 'Parking',
      DataSend: JSON.stringify(requestPayload),
      DataResponse: JSON.stringify(finalData),
      DataDetailResponse: JSON.stringify(finalData?.data),
      CreatedOn: new Date(),
      UpdatedOn: new Date(),
      CreatedBy: location.CompanyName ?? '',
      UpdatedBy: location.CompanyName ?? ''
    });

    const responsePayload = {
      responseStatus: finalData?.responseStatus,
      responseCode:
        finalData?.responseStatus === 'Failed' ? '211001' : '211000',
      responseDescription: finalData?.responseDescription,
      messageDetail:
        finalData?.tariff === 0
          ? 'Ticket is valid, Parking is still free.'
          : 'Ticket is valid, please continue for payment',
      data: finalData?.data
    };

    return encryptAndRespond(
      responsePayload,
      credential.GibberishKey ?? '',
      transactionNo
    );
  } catch (error: any) {
    console.error('Error processing inquiry:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

//Partrner Pay Confirmation
export async function Payment_Confirmation(
  req: Request,
  res: Response
): Promise<any> {
  if ((req as any).timedout) return;

  const encryptAndRespond = async (
    payload: any,
    key: string,
    transactionNo?: string
  ) => {
    if (!payload.data) payload.data = defaultTransactionData(transactionNo);
    const encrypted = await EncryptTotPOST(payload, key);
    return res.status(200).json({ data: encrypted });
  };

  try {
    const { data } = req.body;

    if (!data) {
      return encryptAndRespond(ERROR_MESSAGES.MISSING_ENCRYPTED_DATA, '', '');
    }

    const decryptedObject = RealdecryptPayload(data);

    if (!decryptedObject) {
      return encryptAndRespond(ERROR_MESSAGES.INVALID_DATA_ENCRYPTION, '', '');
    }

    const {
      login,
      password,
      storeID,
      transactionNo,
      referenceNo,
      amount,
      paymentStatus,
      paymentReferenceNo,
      paymentDate,
      issuerID,
      retrievalReferenceNo,
      approvalCode,
      signature
    } = decryptedObject;

    if (
      ![
        login,
        password,
        storeID,
        transactionNo,
        referenceNo,
        amount,
        paymentStatus,
        paymentReferenceNo,
        paymentDate,
        issuerID,
        retrievalReferenceNo,
        approvalCode,
        signature
      ].every(Boolean)
    ) {
      return encryptAndRespond(
        ERROR_MESSAGES.MISSING_FIELDS,
        '',
        transactionNo
      );
    }

    const validate_credential = await findInquiryTransactionMappingPartner(
      login,
      password
    );
    if (!validate_credential) {
      return encryptAndRespond(
        ERROR_MESSAGES.INVALID_CREDENTIAL,
        '',
        transactionNo
      );
    }

    const expectedSignature = generatePaymentSignature(
      login,
      password,
      storeID,
      transactionNo,
      referenceNo,
      amount,
      paymentStatus,
      paymentReferenceNo,
      paymentDate,
      issuerID,
      retrievalReferenceNo,
      approvalCode,
      validate_credential.SecretKey ?? ''
    );

    if (signature.toLowerCase() !== expectedSignature.toLowerCase()) {
      return encryptAndRespond(
        ERROR_MESSAGES.INVALID_SIGNATURE,
        validate_credential.GibberishKey ?? '',
        transactionNo
      );
    }

    const find_location = await findInquiryTransactionMappingByNMID(
      decryptedObject.storeID
    );
    if (!find_location) {
      return encryptAndRespond(
        ERROR_MESSAGES.INVALID_LOCATION,
        validate_credential.GibberishKey ?? '',
        transactionNo
      );
    }

    const hasAccess = (await getRolesByPartnerId(validate_credential.Id)).some(
      (role) => role.access_type === 'PAYMENT'
    );
    if (!hasAccess) {
      return encryptAndRespond(
        {
          responseCode: '401401',
          responseMessage: 'Access Denied'
        },
        validate_credential.GibberishKey ?? '',
        transactionNo
      );
    }

    const create_signature = generatePaymentSignature(
      find_location.Login ?? '',
      find_location.Password ?? '',
      find_location.NMID ?? '',
      decryptedObject.transactionNo ?? '',
      decryptedObject.referenceNo ?? '',
      decryptedObject.amount ?? '',
      decryptedObject.paymentStatus ?? '',
      decryptedObject.paymentReferenceNo ?? '',
      decryptedObject.paymentDate ?? '',
      decryptedObject.issuerID ?? '',
      decryptedObject.retrievalReferenceNo ?? '',
      decryptedObject.approvalCode ?? '',
      find_location.SecretKey ?? ''
    );

    const create_signature_inquiry = await generateSignature(
      find_location.Login ?? '',
      find_location.Password ?? '',
      find_location.NMID ?? '',
      decryptedObject.transactionNo ?? '',
      find_location.SecretKey ?? ''
    );

    const data_send_recheck = {
      login: find_location.Login ?? '',
      password: find_location.Password ?? '',
      storeID: find_location.NMID ?? '',
      transactionNo: decryptedObject.transactionNo ?? '',
      signature: create_signature_inquiry
    };

    const access_post = await getRolesByPartnerId(find_location.Id);
    const inquiryAccess = access_post.find(
      (role) => role.role_name === 'POST' && role.access_type === 'INQUIRY'
    );
    const hasInquiryAccess = access_post.some(
      (role) => role.access_type === 'INQUIRY'
    );
    if (!hasInquiryAccess) {
      return encryptAndRespond(
        {
          responseCode: '401401',
          responseMessage: 'Access Denied'
        },
        find_location.GibberishKey ?? '',
        transactionNo
      );
    }

    const encrypted_data = await EncryptTotPOST(
      data_send_recheck,
      find_location.GibberishKey ?? ''
    );

    if (!inquiryAccess?.url_access) {
      return encryptAndRespond(
        ERROR_MESSAGES.INVALID_LOCATION,
        find_location.GibberishKey ?? '',
        transactionNo
      );
    }

    const response = await axios.post(inquiryAccess.url_access, {
      data: encrypted_data
    });
    const parsedData = JSON.parse(
      response.data.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    );
    const data_inquiry = await DecryptTotPOST(
      parsedData.data,
      find_location.GibberishKey ?? ''
    );

    if (data_inquiry?.data.paymentStatus === 'PAID') {
      return encryptAndRespond(
        {
          responseStatus: data_inquiry?.responseStatus,
          responseCode:
            data_inquiry?.responseStatus === 'Failed' ? '211001' : '211000',
          responseMessage: data_inquiry?.responseMessage,
          responseDescription: data_inquiry?.responseDescription,
          messageDetail: data_inquiry?.messageDetail,
          data: data_inquiry.data
        },
        find_location.GibberishKey ?? '',
        transactionNo
      );
    }

    if (Number(data_inquiry?.data.tariff) !== Number(decryptedObject.amount)) {
      return encryptAndRespond(
        ERROR_MESSAGES.INVALID_AMOUNT,
        find_location.GibberishKey ?? '',
        transactionNo
      );
    }

    const data_send = {
      login: find_location.Login ?? '',
      password: find_location.Password ?? '',
      storeID: find_location.NMID ?? '',
      transactionNo: decryptedObject.transactionNo ?? '',
      referenceNo: decryptedObject.referenceNo ?? '',
      amount: decryptedObject.amount ?? '',
      paymentStatus: decryptedObject.paymentStatus ?? '',
      paymentReferenceNo: decryptedObject.paymentReferenceNo ?? '',
      paymentDate: decryptedObject.paymentDate ?? '',
      issuerID: decryptedObject.issuerID ?? '',
      retrievalReferenceNo: decryptedObject.retrievalReferenceNo ?? '',
      approvalCode: decryptedObject.approvalCode ?? '',
      signature: create_signature
    };

    const encrypted_data_pay = await EncryptTotPOST(
      data_send,
      find_location.GibberishKey ?? ''
    );
    const paymentAccess = access_post.find(
      (role) => role.role_name === 'POST' && role.access_type === 'PAYMENT'
    );
    if (!paymentAccess) {
      return encryptAndRespond(
        {
          responseCode: '401401',
          responseMessage: 'Access Denied'
        },
        find_location.GibberishKey ?? '',
        transactionNo
      );
    }

    const response_confirm_pay = await axios.post(paymentAccess.url_access, {
      data: encrypted_data_pay
    });

    const parsedDataPay = JSON.parse(
      response_confirm_pay.data.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    );
    const data_payment = await DecryptTotPOST(
      parsedDataPay.data,
      find_location.GibberishKey ?? ''
    );

    const exitLimitDate = new Date(
      data_payment?.paymentDate.getTime() + 30 * 60 * 1000
    );

    const res_final = {
      responseStatus: data_payment?.responseStatus,
      responseCode:
        data_payment?.responseStatus === 'Failed' ? '211001' : '211000',
      responseDescription: data_payment?.responseDescription,
      messageDetail:
        data_payment?.tarif === 0
          ? 'Parking fee is still free, please continue to scan ticket at exit gate"'
          : `Ticket paid successfully. To avoid additional costs, please make sure you exit before ${exitLimitDate} Not valid for flat rates.`,
      data: data_payment?.data
    };

    const insert_data = {
      NMID: transactionNo.toString().slice(-5),
      StoreCode: transactionNo.toString().slice(-5),
      referenceNo: decryptedObject.referenceNo ?? '',
      transactionNo: decryptedObject.transactionNo ?? '',
      RefernceNo: decryptedObject.referenceNo ?? '',
      amount: decryptedObject.amount ?? '',
      paymentStatus: decryptedObject.paymentStatus ?? '',
      paymentReferenceNo: decryptedObject.paymentReferenceNo ?? '',
      paymentDate: decryptedObject.paymentDate ?? '',
      partnerID: decryptedObject.issuerID ?? '',
      retrievalReferenceNo: decryptedObject.retrievalReferenceNo ?? '',
      referenceTransactionNo: data_payment?.data.referenceTransactionNo ?? '',
      approvalCode: decryptedObject.approvalCode ?? '',
      ProjectCategoryId: 14,
      ProjectCategoryName: 'Parking',
      DataSend: JSON.stringify(data_send),
      DataResponse: JSON.stringify(data_payment),
      DataDetailResponse: JSON.stringify(data_payment?.data),
      DataReceived: JSON.stringify(decryptedObject),
      MerchantDataRequest: JSON.stringify(decryptedObject),
      MerchantDataResponse: JSON.stringify(res_final),
      POSTDataRequest: JSON.stringify(data_send),
      POSTDataResponse: JSON.stringify(data_payment),
      CreatedOn: new Date(),
      UpdatedOn: new Date(),
      CreatedBy: find_location.Login ?? '',
      UpdatedBy: find_location.Login ?? ''
    };

    await createPaymentTransaction(insert_data);

    return encryptAndRespond(
      res_final,
      find_location.GibberishKey ?? '',
      transactionNo
    );
  } catch (error: any) {
    console.error('Error processing transaction:', error);
    return encryptAndRespond(
      {
        responseCode: '500500',
        responseMessage: 'General Server Error'
      },
      '',
      ''
    );
  }
}

// For simulator purpose
export async function processInquiryTransaction(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { data } = req.body;
    if (!data)
      return res.status(200).json({
        ...ERROR_MESSAGES.MISSING_ENCRYPTED_DATA,
        data: defaultTransactionData()
      });

    const decryptedObject = RealdecryptPayload(data);
    if (!decryptedObject)
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_DATA_ENCRYPTION,
        data: defaultTransactionData()
      });

    const { login, password, storeID, transactionNo, signature } =
      decryptedObject;
    if (![login, password, storeID, transactionNo, signature].every(Boolean))
      return res.status(200).json({ error: 'Invalid data format' });

    const validate_credential = await findInquiryTransactionMappingPartner(
      login,
      password
    );
    if (!validate_credential)
      return res.status(200).json({
        responseCode: '401402',
        responseMessage: 'Invalid Credential - Partner'
      });

    const expectedSignature = generateSignature(
      login,
      password,
      storeID,
      transactionNo,
      validate_credential.SecretKey || ''
    );
    if (signature.toLowerCase() !== expectedSignature.toLowerCase())
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_SIGNATURE,
        data: defaultTransactionData(transactionNo)
      });

    const hasAccess = (await getRolesByPartnerId(validate_credential.Id)).some(
      (role) => role.access_type === 'INQUIRY'
    );
    if (!hasAccess)
      return res
        .status(401)
        .json({ responseCode: '401401', responseMessage: 'Access Denied' });

    const data_ticket = await findTicket(transactionNo);
    if (!data_ticket)
      return res.status(200).json({
        responseStatus: 'Failed',
        responseCode: '211001',
        responseDescription: 'Invalid Transaction',
        messageDetail: 'The ticket is invalid',
        data: {
          transactionNo: transactionNo,
          transactionStatus: 'INVALID',
          inTime: '',
          duration: 0,
          tariff: 0,
          vehicleType: '',
          outTime: '',
          gracePeriod: 0,
          location: '',
          paymentStatus: 'UNPAID'
        }
      });

    if (data_ticket.status === 'PAID')
      return res.status(200).json({
        responseStatus: 'Success',
        responseCode: '211000',
        responseDescription: 'Transaction Success',
        messageDetail: 'Ticket is valid and has been paid',
        data: {
          transactionNo: data_ticket.transactionNo,
          transactionStatus: 'VALID',
          inTime: data_ticket.inTime,
          duration:
            data_ticket.inTime && data_ticket.outTime
              ? Math.floor(
                  (new Date(data_ticket.outTime).getTime() -
                    new Date(data_ticket.inTime).getTime()) /
                    60000
                )
              : null,
          tariff: data_ticket.tarif,
          vehicleType: data_ticket.vehicle_type,
          outTime: data_ticket.outTime,
          gracePeriod: data_ticket.grace_period,
          location: 'LIPPO MALL PURI',
          paymentStatus: 'PAID'
        }
      });

    const inTime = moment(data_ticket.inTime);
    const formattedInTime = inTime.format('YYYY-MM-DD HH:mm:ss');
    const gracePeriodEnd = inTime
      .clone()
      .add(data_ticket.grace_period || 5, 'minutes');

    let responsePayload;

    if (moment().isBefore(gracePeriodEnd)) {
      responsePayload = {
        responseStatus: 'Success',
        responseCode: '211000',
        responseDescription: 'Transaction Success',
        messageDetail: 'Ticket is valid, Parking is still free.',
        data: {
          transactionNo: data_ticket.transactionNo,
          inTime: formattedInTime,
          duration: 0,
          tariff: data_ticket.tarif,
          vehicleType: data_ticket.vehicle_type,
          outTime: data_ticket.outTime
            ? moment(data_ticket.outTime).format('YYYY-MM-DD HH:mm:ss')
            : '',
          gracePeriod: data_ticket.grace_period,
          location: 'SKY PLUIT VILLAGE',
          paymentStatus: 'FREE'
        }
      };
    } else {
      const update_tarif = await updateTarifIfExpired(transactionNo);
      responsePayload = {
        responseStatus: 'Success',
        responseCode: '211000',
        responseDescription: 'Transaction Success',
        messageDetail: 'Please proceed with payment.',
        data: {
          transactionNo: update_tarif.transactionNo,
          inTime: formattedInTime,
          duration: moment().diff(moment(update_tarif.inTime), 'minutes'),
          tariff: update_tarif.tarif,
          vehicleType: update_tarif.vehicle_type,
          outTime: update_tarif.outTime
            ? moment(update_tarif.outTime).format('YYYY-MM-DD HH:mm:ss')
            : '',
          gracePeriod: update_tarif.grace_period,
          location: 'SKY PLUIT VILLAGE',
          paymentStatus: update_tarif.status
        }
      };
    }

    // ✅ Insert InquiryTransaction Record
    await createInquiryTransaction({
      StoreCode: '007SK',
      TransactionNo: transactionNo,
      NMID: '007SK',
      CompanyName: validate_credential.CompanyName || '',
      ProjectCategoryId: 14,
      ProjectCategoryName: 'Parking',
      DataSend: JSON.stringify(decryptedObject), // Store request payload
      DataResponse: JSON.stringify(responsePayload), // Store response payload
      CreatedOn: moment().toDate(),
      CreatedBy: login
    });

    return res.json(responsePayload);
  } catch (error) {
    console.error('Error processing transaction:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function processPaymentTransaction(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { data } = req.body; // Encrypted data from request

    if (!data) {
      return res.status(200).json({
        ...ERROR_MESSAGES.MISSING_ENCRYPTED_DATA,
        data: defaultTransactionData()
      });
    }

    // // Fetch secret key from `inquiry_transaction_mapping`
    // const mapping = await PartnerMapping.findOne();
    // if (!mapping || !mapping.SecretKey) {
    //   return res
    //     .status(404)
    //     .json({ error: 'InquiryTransactionMapping or SecretKey not found' });
    // }

    // const SecretKey = mapping.SecretKey ?? ''; // Ensure SecretKey is a string

    // Decrypt AES data
    const decryptedObject = RealdecryptPayload(data);

    if (!decryptedObject) {
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_DATA_ENCRYPTION,
        data: defaultTransactionData()
      });
    }

    const {
      login,
      password,
      storeID,
      transactionNo,
      referenceNo,
      amount,
      paymentStatus,
      paymentReferenceNo,
      paymentDate,
      issuerID,
      retrievalReferenceNo,
      approvalCode,
      signature
    } = decryptedObject;

    //return res.status(200).json(decryptedObject);
    if (
      ![
        login,
        password,
        storeID,
        transactionNo,
        referenceNo,
        amount,
        paymentStatus,
        paymentReferenceNo,
        paymentDate,
        issuerID,
        retrievalReferenceNo,
        approvalCode,
        signature
      ].every(Boolean)
    ) {
      return res.status(200).json({
        ...ERROR_MESSAGES.MISSING_FIELDS,
        data: defaultTransactionData()
      });
    }

    // Fetch SecretKey from DB
    const secretKeyData = await findInquiryTransactionMappingPartner(
      login,
      password
    );

    if (!secretKeyData || !secretKeyData.SecretKey) {
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_CREDENTIAL,
        data: defaultTransactionData(transactionNo)
      });
    }

    const SecretKeys = secretKeyData.SecretKey;

    const expectedSignature = generatePaymentSignature(
      login,
      password,
      secretKeyData.NMID ?? '',
      transactionNo,
      referenceNo,
      amount,
      paymentStatus,
      paymentReferenceNo,
      paymentDate,
      issuerID,
      retrievalReferenceNo,
      approvalCode,
      SecretKeys
    );

    // Ensure both signatures are lowercase for comparison
    if (signature.toLowerCase() !== expectedSignature.toLowerCase()) {
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_SIGNATURE,
        data: defaultTransactionData(transactionNo)
      });
    }

    const check_role = await getRolesByPartnerId(secretKeyData.Id);

    const hasPaymentAccess = check_role.some(
      (role) => role.access_type === 'PAYMENT'
    );

    if (!hasPaymentAccess) {
      return res.status(200).json({
        responseCode: '401401',
        responseMessage: 'You Not Allowed To Access This Feature'
      });
    }
    const data_ticket = await findTicket(decryptedObject.transactionNo);

    if (!data_ticket) {
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_TRANSACTION,
        data: data_ticket
      });
    }

    if (decryptedObject.amount != data_ticket.dataValues.tarif) {
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_AMOUNT,
        data: data_ticket
      });
    }

    const update_ticket = await updateTicketStatus(transactionNo);

    if (!update_ticket) {
      return res.status(200).json({
        responseCode: '500200',
        responseMessage: 'Failure Update Transaction'
      });
    }

    const succes_payload = {
      responseStatus: 'Success',
      responseCode: '211000',
      responseDescription: 'Transaction Success',
      messageDetail:
        update_ticket.tarif === 0
          ? 'Tiket valid, biaya parkir Anda masih gratis.'
          : 'Payment confirmation has been accepted and verified successfully',
      data: {
        referenceNo: decryptedObject.referenceNo,
        referenceTransactionNo: decryptedObject.referenceTransactionNo,
        amount: update_ticket.tarif,
        paymentReferenceNo: decryptedObject.paymentReferenceNo,
        paymentDate: new Date(),
        issuerID: decryptedObject.issuerID,
        retrievalReferenceNo: decryptedObject.retrievalReferenceNo,
        transactionNo: decryptedObject.transactionNo,
        transactionStatus: 'VALID',
        paymentStatus: update_ticket.tarif === 0 ? 'FREE' : 'PAID'
      }
    };
    return res.json(succes_payload); // Respond with the decrypted object directly
  } catch (error) {
    console.error('Error processing inquiry transaction:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function processPaymentTransactionPOST(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { data } = req.body; // Encrypted data from request

    if (!data) {
      return res.status(200).json({
        ...ERROR_MESSAGES.MISSING_ENCRYPTED_DATA,
        data: defaultTransactionData()
      });
    }

    // // Fetch secret key from `inquiry_transaction_mapping`
    // const mapping = await PartnerMapping.findOne();
    // if (!mapping || !mapping.SecretKey) {
    //   return res
    //     .status(404)
    //     .json({ error: 'InquiryTransactionMapping or SecretKey not found' });
    // }

    // const SecretKey = mapping.SecretKey ?? ''; // Ensure SecretKey is a string

    // Decrypt AES data
    const decryptedObject = RealdecryptPayload(data);

    if (!decryptedObject) {
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_DATA_ENCRYPTION,
        data: defaultTransactionData()
      });
    }

    const {
      login,
      password,
      transactionNo,
      referenceNo,
      amount,
      paymentStatus,
      paymentReferenceNo,
      paymentDate,
      issuerID,
      retrievalReferenceNo,
      approvalCode,
      signature
    } = decryptedObject;

    //return res.status(200).json(decryptedObject);
    if (
      ![
        login,
        password,
        transactionNo,
        referenceNo,
        amount,
        paymentStatus,
        paymentReferenceNo,
        paymentDate,
        issuerID,
        retrievalReferenceNo,
        approvalCode,
        signature
      ].every(Boolean)
    ) {
      return res.status(200).json({
        ...ERROR_MESSAGES.MISSING_FIELDS,
        data: defaultTransactionData()
      });
    }

    // Fetch SecretKey from DB
    const secretKeyData = await findInquiryTransactionMappingPartner(
      login,
      password
    );

    if (!secretKeyData || !secretKeyData.SecretKey) {
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_CREDENTIAL,
        data: defaultTransactionData(transactionNo)
      });
    }

    const SecretKeys = secretKeyData.SecretKey;

    const expectedSignature = generatePaymentSignature(
      login,
      password,
      secretKeyData.NMID ?? '',
      transactionNo,
      referenceNo,
      amount,
      paymentStatus,
      paymentReferenceNo,
      paymentDate,
      issuerID,
      retrievalReferenceNo,
      approvalCode,
      SecretKeys
    );

    // Ensure both signatures are lowercase for comparison
    if (signature.toLowerCase() !== expectedSignature.toLowerCase()) {
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_SIGNATURE,
        data: defaultTransactionData(transactionNo)
      });
    }

    const check_role = await getRolesByPartnerId(secretKeyData.Id);

    const hasPaymentAccess = check_role.some(
      (role) => role.access_type === 'PAYMENT'
    );

    if (!hasPaymentAccess) {
      return res.status(200).json({
        responseCode: '401401',
        responseMessage: 'You Not Allowed To Access This Feature'
      });
    }
    const data_ticket = await findTicket(decryptedObject.transactionNo);

    if (!data_ticket) {
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_TRANSACTION,
        data: data_ticket
      });
    }

    if (decryptedObject.amount != data_ticket.dataValues.tarif) {
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_AMOUNT,
        data: data_ticket
      });
    }

    const update_ticket = await updateTicketStatus(transactionNo);

    if (!update_ticket) {
      return res.status(200).json({
        responseCode: '500200',
        responseMessage: 'Failure Update Transaction'
      });
    }

    const succes_payload = {
      responseStatus: 'Success',
      responseCode: '211000',
      responseDescription: 'Transaction Success',
      messageDetail:
        update_ticket.tarif === 0
          ? 'Tiket valid, biaya parkir Anda masih gratis.'
          : 'Payment confirmation has been accepted and verified successfully',
      data: {
        referenceNo: decryptedObject.referenceNo,
        referenceTransactionNo: decryptedObject.referenceTransactionNo,
        amount: update_ticket.tarif,
        paymentReferenceNo: decryptedObject.paymentReferenceNo,
        paymentDate: new Date(),
        issuerID: decryptedObject.issuerID,
        retrievalReferenceNo: decryptedObject.retrievalReferenceNo,
        transactionNo: decryptedObject.transactionNo,
        transactionStatus: 'VALID',
        paymentStatus: update_ticket.tarif === 0 ? 'FREE' : 'PAID'
      }
    };
    return res.json(succes_payload); // Respond with the decrypted object directly
  } catch (error) {
    console.error('Error processing inquiry transaction:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function processInquiryTransactionEncrypt(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { data } = req.body;
    if (!data) {
      const response = {
        ...ERROR_MESSAGES.MISSING_ENCRYPTED_DATA,
        data: defaultTransactionData()
      };
      return res.status(200).json({ data: RealencryptPayload(response) });
    }

    const decryptedObject = RealdecryptPayload(data);
    if (!decryptedObject) {
      const response = {
        ...ERROR_MESSAGES.INVALID_DATA_ENCRYPTION,
        data: defaultTransactionData()
      };
      return res.status(200).json({ data: RealencryptPayload(response) });
    }

    const { login, password, storeID, transactionNo, signature } =
      decryptedObject;
    if (![login, password, storeID, transactionNo, signature].every(Boolean)) {
      const response = { error: 'Invalid data format' };
      return res.status(200).json({ data: RealencryptPayload(response) });
    }

    const validate_credential = await findInquiryTransactionMappingPartner(
      login,
      password
    );
    if (!validate_credential) {
      const response = {
        responseCode: '401402',
        responseMessage: 'Invalid Credential - Partner'
      };
      return res.status(200).json({ data: RealencryptPayload(response) });
    }

    const expectedSignature = generateSignature(
      login,
      password,
      storeID,
      transactionNo,
      validate_credential.SecretKey || ''
    );
    if (signature.toLowerCase() !== expectedSignature.toLowerCase()) {
      const response = {
        ...ERROR_MESSAGES.INVALID_SIGNATURE,
        data: defaultTransactionData(transactionNo)
      };
      return res.status(200).json({ data: RealencryptPayload(response) });
    }

    const hasAccess = (await getRolesByPartnerId(validate_credential.Id)).some(
      (role) => role.access_type === 'INQUIRY'
    );
    if (!hasAccess) {
      const response = {
        responseCode: '401401',
        responseMessage: 'Access Denied'
      };
      return res.status(401).json({ data: RealencryptPayload(response) });
    }

    const data_ticket = await findTicket(transactionNo);
    if (!data_ticket) {
      const response = {
        responseStatus: 'Failed',
        responseCode: '211001',
        responseDescription: 'Invalid Transaction',
        messageDetail: 'The ticket is invalid',
        data: {
          transactionNo: transactionNo,
          transactionStatus: 'INVALID',
          inTime: '',
          duration: 0,
          tariff: 0,
          vehicleType: '',
          outTime: '',
          gracePeriod: 0,
          location: '',
          paymentStatus: 'UNPAID'
        }
      };
      return res.status(200).json({ data: RealencryptPayload(response) });
    }

    if (data_ticket.status === 'PAID') {
      const response = {
        responseStatus: 'Success',
        responseCode: '211000',
        responseDescription: 'Transaction Success',
        messageDetail: 'Ticket is valid and has been paid',
        data: {
          transactionNo: data_ticket.transactionNo,
          transactionStatus: 'VALID',
          inTime: data_ticket.inTime,
          duration:
            data_ticket.inTime && data_ticket.outTime
              ? Math.floor(
                  (new Date(data_ticket.outTime).getTime() -
                    new Date(data_ticket.inTime).getTime()) /
                    60000
                )
              : null,
          tariff: data_ticket.tarif,
          vehicleType: data_ticket.vehicle_type,
          outTime: data_ticket.outTime,
          gracePeriod: data_ticket.grace_period,
          location: 'LIPPO MALL PURI',
          paymentStatus: 'PAID'
        }
      };
      return res.status(200).json({ data: RealencryptPayload(response) });
    }

    const inTime = moment(data_ticket.inTime);
    const formattedInTime = inTime.format('YYYY-MM-DD HH:mm:ss');
    const gracePeriodEnd = inTime
      .clone()
      .add(data_ticket.grace_period || 5, 'minutes');

    let responsePayload;

    if (moment().isBefore(gracePeriodEnd)) {
      responsePayload = {
        responseStatus: 'Success',
        responseCode: '211000',
        responseDescription: 'Transaction Success',
        messageDetail: 'Ticket is valid, Parking is still free.',
        data: {
          transactionNo: data_ticket.transactionNo,
          inTime: formattedInTime,
          duration: 0,
          tariff: data_ticket.tarif,
          vehicleType: data_ticket.vehicle_type,
          outTime: data_ticket.outTime
            ? moment(data_ticket.outTime).format('YYYY-MM-DD HH:mm:ss')
            : '',
          gracePeriod: data_ticket.grace_period,
          location: 'SKY PLUIT VILLAGE',
          paymentStatus: 'FREE'
        }
      };
    } else {
      const update_tarif = await updateTarifIfExpired(transactionNo);
      responsePayload = {
        responseStatus: 'Success',
        responseCode: '211000',
        responseDescription: 'Transaction Success',
        messageDetail: 'Ticket is valid, please continue for payment',
        data: {
          transactionNo: update_tarif.transactionNo,
          inTime: formattedInTime,
          duration: moment().diff(moment(update_tarif.inTime), 'minutes'),
          tariff: update_tarif.tarif,
          vehicleType: update_tarif.vehicle_type,
          outTime: update_tarif.outTime
            ? moment(update_tarif.outTime).format('YYYY-MM-DD HH:mm:ss')
            : '',
          gracePeriod: update_tarif.grace_period,
          location: 'LIPPO MALL PURI',
          paymentStatus: update_tarif.status
        }
      };
    }

    await createInquiryTransaction({
      StoreCode: '007SK',
      TransactionNo: transactionNo,
      NMID: '007SK',
      CompanyName: validate_credential.CompanyName || '',
      ProjectCategoryId: 14,
      ProjectCategoryName: 'Parking',
      DataSend: JSON.stringify(decryptedObject),
      DataResponse: JSON.stringify(responsePayload),
      CreatedOn: moment().toDate(),
      CreatedBy: login
    });

    return res.json({ data: RealencryptPayload(responsePayload) });
  } catch (error) {
    console.error('Error processing transaction:', error);
    const response = { error: 'Internal Server Error' };
    return res.status(500).json({ data: RealencryptPayload(response) });
  }
}

export async function processPaymentTransactionEncrypt(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(200).json({
        data: RealencryptPayload({
          ...ERROR_MESSAGES.MISSING_ENCRYPTED_DATA,
          data: defaultTransactionData()
        })
      });
    }

    const decryptedObject = RealdecryptPayload(data);

    if (!decryptedObject) {
      return res.status(200).json({
        data: RealencryptPayload({
          ...ERROR_MESSAGES.INVALID_DATA_ENCRYPTION,
          data: defaultTransactionData()
        })
      });
    }

    const {
      login,
      password,
      storeID,
      transactionNo,
      referenceNo,
      amount,
      paymentStatus,
      paymentReferenceNo,
      paymentDate,
      issuerID,
      retrievalReferenceNo,
      approvalCode,
      signature
    } = decryptedObject;

    if (
      [
        login,
        password,
        storeID,
        transactionNo,
        referenceNo,
        amount,
        paymentStatus,
        paymentReferenceNo,
        paymentDate,
        issuerID,
        retrievalReferenceNo,
        approvalCode,
        signature
      ].some((field) => field === null || field === undefined)
    ) {
      return res.status(200).json({
        data: RealencryptPayload({
          ...ERROR_MESSAGES.MISSING_FIELDS,
          data: defaultTransactionData()
        })
      });
    }

    const secretKeyData = await findInquiryTransactionMappingPartner(
      login,
      password
    );

    if (!secretKeyData || !secretKeyData.SecretKey) {
      return res.status(200).json({
        data: RealencryptPayload({
          ...ERROR_MESSAGES.INVALID_CREDENTIAL,
          data: defaultTransactionData(transactionNo)
        })
      });
    }

    const SecretKeys = secretKeyData.SecretKey;

    const expectedSignature = generatePaymentSignature(
      login,
      password,
      storeID,
      transactionNo,
      referenceNo,
      amount,
      paymentStatus,
      paymentReferenceNo,
      paymentDate,
      issuerID,
      retrievalReferenceNo,
      approvalCode,
      SecretKeys
    );

    if (signature.toLowerCase() !== expectedSignature.toLowerCase()) {
      return res.status(200).json({
        data: RealencryptPayload({
          ...ERROR_MESSAGES.INVALID_SIGNATURE,
          data: defaultTransactionData(transactionNo)
        })
      });
    }

    const check_role = await getRolesByPartnerId(secretKeyData.Id);
    const hasPaymentAccess = check_role.some(
      (role) => role.access_type === 'PAYMENT'
    );

    if (!hasPaymentAccess) {
      return res.status(200).json({
        data: RealencryptPayload({
          responseCode: '401401',
          responseMessage: 'You Not Allowed To Access This Feature'
        })
      });
    }

    const data_ticket = await findTicket(transactionNo);

    if (!data_ticket) {
      return res.status(200).json({
        data: RealencryptPayload({
          ...ERROR_MESSAGES.INVALID_TRANSACTION,
          data: data_ticket
        })
      });
    }

    if (decryptedObject.amount != data_ticket.dataValues.tarif) {
      return res.status(200).json({
        data: RealencryptPayload({
          ...ERROR_MESSAGES.INVALID_AMOUNT,
          data: data_ticket
        })
      });
    }

    const update_ticket = await updateTicketStatus(transactionNo);

    if (!update_ticket) {
      return res.status(200).json({
        data: RealencryptPayload({
          responseCode: '500200',
          responseMessage: 'Failure Update Transaction'
        })
      });
    }

    const paymentDates = new Date();
    const exitLimitDate = new Date(paymentDate.getTime() + 30 * 60 * 1000); // add 30 minutes to the current time

    const success_payload = {
      responseStatus: update_ticket.tarif === 0 ? 'Failed' : 'Success',
      responseCode: update_ticket.tarif === 0 ? '211001' : '211000',
      responseDescription: 'Transaction Success',
      messageDetail:
        update_ticket.tarif === 0
          ? 'Parking fee is still free, please continue to scan ticket at exit gate"'
          : `Ticket paid successfully. To avoid additional costs, please make sure you exit before ${exitLimitDate} Not valid for flat rates.`,
      data: {
        referenceNo: decryptedObject.referenceNo,
        referenceTransactionNo: decryptedObject.referenceTransactionNo,
        amount: update_ticket.tarif,
        paymentReferenceNo: decryptedObject.paymentReferenceNo,
        paymentDate: paymentDates,
        issuerID: decryptedObject.issuerID,
        retrievalReferenceNo: decryptedObject.retrievalReferenceNo,
        transactionNo: decryptedObject.transactionNo,
        transactionStatus: 'VALID',
        paymentStatus: update_ticket.tarif === 0 ? 'FREE' : 'PAID'
      }
    };

    return res.status(200).json({
      data: RealencryptPayload(success_payload)
    });
  } catch (error) {
    console.error('Error processing payment transaction:', error);
    return res.status(500).json({
      data: RealencryptPayload({ error: 'Internal Server Error' })
    });
  }
}

export async function close_ticket(req: Request, res: Response): Promise<any> {
  try {
    const { transactionNo } = req.body;
  } catch (error) {
    console.error('Error processing payment transaction:', error);
    return res.status(500).json({
      data: RealencryptPayload({ error: 'Internal Server Error' })
    });
  }
}

// export async function InquiryTransactionSnap(req: Request, res: Response):Promise<any>
// {

//   try {

//     const {storeID, transactionNo}= req.body;

//     // Validate required fields
//     if (!storeID || !transactionNo) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     // Fetch SecretKey from DB
//     const secretKeyData = await findInquiryTransactionMappingPartner(
//       login,
//       password
//     );

//   } catch (error) {

//   }

// }
