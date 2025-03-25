import { Request, Response } from 'express';
import InquiryTransactionMapping from '../models/partner_mapping.model';
import {
  decryptPayload,
  generatePaymentSignature,
  generateSignature
} from '../utils/encrypt.utils';
import { findInquiryTransactionMapping } from '../services/inquiry_transaction_mapping.service';
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

/**
 * Process Inquiry Transaction
 */
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

    // Fetch secret key from `inquiry_transaction_mapping`
    const mapping = await PartnerMapping.findOne();
    if (!mapping || !mapping.SecretKey) {
      return res
        .status(404)
        .json({ error: 'InquiryTransactionMapping or SecretKey not found' });
    }

    const SecretKey = mapping.SecretKey ?? ''; // Ensure SecretKey is a string

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
    const secretKeyData = await findInquiryTransactionMapping(
      login,
      password,
      storeID
    );

    if (!secretKeyData || !secretKeyData.SecretKey) {
      return res.status(401).json({
        responseCode: '401402',
        responseMessage: 'Invalid Credential'
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

    const validate_credential = await findInquiryTransactionMapping(
      decryptedObject.login,
      decryptedObject.password,
      decryptedObject.storeID
    );

    if (!validate_credential) {
      return res.status(401).json({
        responseCode: '401402',
        responseMessage: 'Invalid Credential'
      });
    }

    const check_role = await getRolesByPartnerId(validate_credential.Id);

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
