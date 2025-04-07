import { Request, Response } from 'express';
import InquiryTransactionMapping from '../models/partner_mapping.model';
import {
  decryptPayload,
  DecryptTotPOST,
  EncryptTotPOST,
  generatePaymentSignature,
  generateSignature,
  RealdecryptPayload
} from '../utils/encrypt.utils';
import {
  findInquiryTransactionMapping,
  findInquiryTransactionMappingByNMID,
  findInquiryTransactionMappingPartner
} from '../services/inquiry_transaction_mapping.service';
import {
  findTicket,
  updateTarifIfExpired,
  updateTicketStatus
} from '../services/ticket_generator.service';
import {
  createPaymentTransaction,
  getPaymentTransactionById,
  getAllPayments
} from '../services/payment_confirmation.service';
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
  TransactionData
} from '../models/inquiry_transaction';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import Sentry from '../utils/sentry.utils';

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
  try {
    //Get Value Data
    const { data } = req.body;

    // Check if data is provided
    if (!data) {
      const missing_encrypted_data = 'Missing encrypted data';
      // Capture the error in Sentry with request details
      Sentry.captureException(new Error(missing_encrypted_data), {
        extra: {
          requestBody: data, // Include full request body
          headers: req.headers, // Include request headers
          ip: req.ip // Capture client IP
        }
      });

      return res.status(200).json({
        ...ERROR_MESSAGES.MISSING_ENCRYPTED_DATA,
        data: defaultTransactionData()
      });
    }

    const decryptedObject = RealdecryptPayload(data);

    if (!decryptedObject) {
      const INVALID_ENCRYPTION = 'INVALID ENCRYPATION DATA';
      // Capture the error in Sentry with request details
      Sentry.captureException(new Error(INVALID_ENCRYPTION), {
        extra: {
          requestBody: data, // Include full request body
          headers: req.headers, // Include request headers
          ip: req.ip // Capture client IP
        }
      });

      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_DATA_ENCRYPTION,
        data: defaultTransactionData()
      });
    }

    const { login, password, storeID, transactionNo, signature } =
      decryptedObject;

    //return res.status(200).json(decryptedObject);
    if (![login, password, storeID, transactionNo, signature].every(Boolean)) {
      return res.status(200).json({
        ...ERROR_MESSAGES.MISSING_FIELDS,
        data: defaultTransactionData()
      });
    }

    const validate_credential = await findInquiryTransactionMappingPartner(
      login,
      password
    );

    if (!validate_credential)
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_CREDENTIAL,
        data: defaultTransactionData(transactionNo)
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

    const find_location = await findInquiryTransactionMappingByNMID(
      decryptedObject.storeID
    );

    if (!find_location)
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_LOCATION,
        data: defaultTransactionData(transactionNo)
      });

    const hasAccess = (await getRolesByPartnerId(validate_credential.Id)).some(
      (role) => role.access_type === 'INQUIRY'
    );
    if (!hasAccess)
      return res
        .status(200)
        .json({ responseCode: '401401', responseMessage: 'Access Denied' });

    const access_post = await getRolesByPartnerId(find_location.Id);

    // Filter the result based on role_name and access_type
    const inquiryAccess = access_post.find(
      (role) => role.role_name === 'POST' && role.access_type === 'INQUIRY'
    );
    const postAccess = (await getRolesByPartnerId(find_location.Id)).some(
      (role) => role.access_type === 'INQUIRY'
    );
    if (!postAccess)
      return res
        .status(200)
        .json({ responseCode: '401401', responseMessage: 'Access Denied' });

    const data_signature = {
      login: find_location.Login ?? '',
      password: find_location.Password ?? '',
      storeID: find_location.NMID ?? '',
      transactionNo: decryptedObject.transactionNo ?? ''
    };

    //Signature
    const create_signature = await generateSignature(
      data_signature.login,
      data_signature.password,
      data_signature.storeID,
      data_signature.transactionNo,
      find_location.SecretKey ?? ''
    );

    const data_send = {
      login: find_location.Login ?? '',
      password: find_location.Password ?? '',
      storeID: find_location.NMID ?? '',
      transactionNo: decryptedObject.transactionNo ?? '',
      signature: create_signature
    };

    const encrypted_data = await EncryptTotPOST(
      data_send,
      find_location.GibberishKey ?? ''
    );

    if (!inquiryAccess?.url_access) {
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_LOCATION,
        data: defaultTransactionData(transactionNo)
      });
    }

    const response = await axios.post(inquiryAccess.url_access, {
      data: encrypted_data
    });

    const cleanJsonString = response.data.replace(
      /[\u0000-\u001F\u007F-\u009F]/g,
      ''
    );
    const parsedData = JSON.parse(cleanJsonString);

    const data_final = await DecryptTotPOST(
      parsedData.data,
      find_location.GibberishKey ?? ''
    );

    const insert_data = {
      CompanyName: find_location.CompanyName ?? '',
      NMID: find_location.NMID ?? '',
      StoreCode: transactionNo.toString().slice(-5), // Ensure string type
      TransactionNo: transactionNo ?? '',
      RefernceNo: null,
      ProjectCategoryId: 14,
      ProjectCategoryName: 'Parking',
      DataSend: JSON.stringify(data_send), // Convert to string
      DataResponse: JSON.stringify(data_final), // Convert to string if needed
      DataDetailResponse: JSON.stringify(data_final?.data), // Convert to string if needed
      CreatedOn: new Date(), // Use Date object
      UpdatedOn: new Date(), // Use Date object
      CreatedBy: find_location.CompanyName ?? '',
      UpdatedBy: find_location.CompanyName ?? ''
    };

    //Harus Dipantaui
    const data_inquiry_insert = await createInquiryTransaction(insert_data);

    return res.status(200).json(data_final);
  } catch (error: any) {
    console.error('Error processing transaction:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

//Partrner Pay Confirmation
export async function Payment_Confirmation(
  req: Request,
  res: Response
): Promise<any> {
  try {
    //Get Value Data
    const { data } = req.body;

    // Check if data is provided
    if (!data) {
      return res.status(200).json({
        ...ERROR_MESSAGES.MISSING_ENCRYPTED_DATA,
        data: defaultTransactionData()
      });
    }

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
      partnerID,
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
        partnerID,
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

    // Credential Payment Partner
    const validate_credential = await findInquiryTransactionMappingPartner(
      login,
      password
    );

    if (!validate_credential)
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_CREDENTIAL,
        data: defaultTransactionData(transactionNo)
      });

    //Payment Signature
    const expectedSignature = generatePaymentSignature(
      login,
      password,
      validate_credential.NMID || '',
      transactionNo,
      referenceNo,
      amount,
      paymentStatus,
      paymentReferenceNo,
      paymentDate,
      partnerID,
      retrievalReferenceNo,
      approvalCode,
      validate_credential.SecretKey || ''
    );

    if (signature.toLowerCase() !== expectedSignature.toLowerCase())
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_SIGNATURE,
        data: defaultTransactionData(transactionNo)
      });

    const find_location = await findInquiryTransactionMappingByNMID(
      decryptedObject.storeID
    );

    if (!find_location)
      return res.status(200).json({
        ...ERROR_MESSAGES.INVALID_LOCATION,
        data: defaultTransactionData(transactionNo)
      });

    const hasAccess = (await getRolesByPartnerId(validate_credential.Id)).some(
      (role) => role.access_type === 'PAYMENT'
    );
    if (!hasAccess)
      return res
        .status(200)
        .json({ responseCode: '401401', responseMessage: 'Access Denied' });

    // const access_post = await getRolesByPartnerId(find_location.Id);
    // // Filter the result based on role_name and access_type
    // // const paymentAccess = access_post.find(
    // //   (role) => role.role_name === 'POST' && role.access_type === 'PAYMENT'
    // // );

    const paymentAccess = (await getRolesByPartnerId(find_location.Id)).some(
      (role) => role.access_type === 'PAYMENT'
    );

    if (!paymentAccess)
      return res
        .status(200)
        .json({ responseCode: '401401', responseMessage: 'Access Denied' });

    const data_signature = {
      login: find_location.Login ?? '',
      password: find_location.Password ?? '',
      storeID: find_location.NMID ?? '',
      transactionNo: decryptedObject.transactionNo ?? ''
    };

    //Signature
    const create_signature = await generatePaymentSignature(
      data_signature.login,
      data_signature.password,
      data_signature.storeID,
      data_signature.transactionNo,
      decryptedObject.referenceNo ?? '',
      decryptedObject.amount ?? '',
      decryptedObject.paymentStatus ?? '',
      decryptedObject.paymentReferenceNo ?? '',
      decryptedObject.paymentDate ?? '',
      decryptedObject.partnerID ?? '',
      decryptedObject.retrievalReferenceNo ?? '',
      decryptedObject.approvalCode ?? '',
      find_location.SecretKey ?? ''
    );

    // Data yang akan dikirim ke post untuk konfirmasi pembayaran
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
      partnerID: decryptedObject.partnerID ?? '',
      retrievalReferenceNo: decryptedObject.retrievalReferenceNo ?? '',
      approvalCode: decryptedObject.approvalCode ?? '',
      signature: create_signature
    };

    // Harus ditest Realtest
    return res.status(200).json({
      responseCode: '000000',
      responseMessage: 'Success',
      data: data_send
    });
  } catch (error: any) {
    console.error('Error processing transaction:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const processInquiryTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const { data } = req.body;
    if (!data)
      return res.status(200).json({ error: 'Encrypted data is required' });

    const decryptedObject = decryptPayload(data);
    if (!decryptedObject)
      return res.status(200).json({ error: 'Failed to decrypt data' });

    const { login, password, storeID, transactionNo, signature } =
      decryptedObject;
    if (![login, password, storeID, transactionNo, signature].every(Boolean))
      return res.status(200).json({ error: 'Invalid data format' });

    const validate_credential = await findInquiryTransactionMapping(
      login,
      password,
      storeID
    );
    if (!validate_credential)
      return res.status(200).json({
        responseCode: '401402',
        responseMessage: 'Invalid Credential'
      });

    const expectedSignature = generateSignature(
      login,
      password,
      storeID,
      transactionNo,
      validate_credential.SecretKey || ''
    );
    if (signature.toLowerCase() !== expectedSignature.toLowerCase())
      return res
        .status(200)
        .json({ responseCode: '401400', responseMessage: 'Invalid Signature' });

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
        responseCode: '404401',
        responseMessage: 'Invalid Transaction'
      });

    if (data_ticket.status === 'PAID')
      return res.status(200).json({
        responseCode: '400400',
        responseMessage: 'Ticket already paid'
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
};

export const processPaymentTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const { data } = req.body; // Encrypted data from request

    if (!data) {
      return res.status(400).json({ error: 'Encrypted data is required' });
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
    const decryptedObject = decryptPayload(data);

    if (!decryptedObject) {
      return res.status(400).json({ error: 'Failed to decrypt data' });
    }

    const {
      login,
      password,
      storeID,
      transactionNo,
      signature,
      referenceNo,
      amount,
      paymentStatus,
      paymentReferenceNo,
      paymentDate,
      partnerID,
      retrievalReferenceNo,
      approvalCode
    } = decryptedObject;

    if (
      !login ||
      !password ||
      !storeID ||
      !transactionNo ||
      !signature ||
      !referenceNo ||
      !amount ||
      !paymentStatus ||
      !paymentReferenceNo ||
      !paymentDate ||
      !partnerID ||
      !retrievalReferenceNo ||
      !approvalCode
    ) {
      return res.status(400).json({ error: 'Invalid decrypted data format' });
    }

    // Fetch SecretKey from DB
    const secretKeyData = await findInquiryTransactionMappingPartner(
      login,
      password
    );

    if (!secretKeyData || !secretKeyData.SecretKey) {
      return res.status(200).json({
        responseCode: '401402',
        responseMessage: 'Invalids Credential'
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
      partnerID,
      retrievalReferenceNo,
      approvalCode,
      SecretKeys
    );

    // Ensure both signatures are lowercase for comparison
    if (signature.toLowerCase() !== expectedSignature.toLowerCase()) {
      return res.status(401).json({
        responseCode: '401400',
        responseMessage: 'Invalid Signature'
      });
    }

    const check_role = await getRolesByPartnerId(secretKeyData.Id);

    const hasPaymentAccess = check_role.some(
      (role) => role.access_type === 'PAYMENT'
    );

    if (!hasPaymentAccess) {
      return res.status(401).json({
        responseCode: '401401',
        responseMessage: 'You Not Allowed To Access This Feature'
      });
    }
    const data_ticket = await findTicket(decryptedObject.transactionNo);

    if (!data_ticket) {
      return res.status(404).json({
        responseCode: '404401',
        responseMessage: 'Invalid Transaction'
      });
    }

    if (decryptedObject.amount != data_ticket.dataValues.tarif) {
      return res.status(400).json({
        responseCode: '400401',
        responseMessage: 'Tarif Invalid'
      });
    }

    const update_ticket = await updateTicketStatus(transactionNo);

    if (!update_ticket) {
      return res.status(400).json({
        responseCode: '404401',
        responseMessage: 'Failure Update Transaction'
      });
    }

    const succes_payload = {
      responseStatus: 'Success',
      responseCode: '211000',
      responseDescription: 'Transaction Success',
      messageDetail: 'Tiket valid, biaya parkir Anda masih gratis.',
      data: {
        transactionNo: update_ticket.transactionNo,
        transactionStatus: 'VALID',
        inTime: update_ticket.inTime,
        duration: 0,
        tariff: update_ticket.tarif,
        vehicleType: 'MOTOR',
        outTime: update_ticket.outTime,
        gracePeriod: update_ticket.grace_period,
        location: 'SKY PLUIT VILLAGE',
        paymentStatus: update_ticket.status
      }
    };
    return res.json(succes_payload); // Respond with the decrypted object directly
  } catch (error) {
    console.error('Error processing inquiry transaction:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
