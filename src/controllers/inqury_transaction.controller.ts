import { Request, Response } from 'express';
import InquiryTransactionMapping from '../models/partner_mapping.model';
import { decryptPayload, generateSignature } from '../utils/encrypt.utils';
import { findInquiryTransactionMapping } from '../services/inquiry_transaction_mapping.service';
import {
  findTicket,
  updateTarifIfExpired
} from '../services/ticket_generator.service';
import moment from 'moment-timezone';

/**
 * Process Inquiry Transaction
 */
export const processInquiryTransaction = async (
  req: Request,
  res: Response
) => {
  try {
    const { data } = req.body; // Encrypted data from request

    if (!data) {
      return res.status(400).json({ error: 'Encrypted data is required' });
    }

    // Fetch secret key from `inquiry_transaction_mapping`
    const mapping = await InquiryTransactionMapping.findOne();
    if (!mapping || !mapping.SecretKey) {
      return res
        .status(404)
        .json({ error: 'InquiryTransactionMapping or SecretKey not found' });
    }

    const SecretKey = mapping.SecretKey ?? ''; // Ensure SecretKey is a string

    // Decrypt AES data
    const decryptedObject = decryptPayload(data, SecretKey);

    if (!decryptedObject) {
      return res.status(400).json({ error: 'Failed to decrypt data' });
    }

    const { login, password, storeID, transactionNo, signature } =
      decryptedObject;

    if (!login || !password || !storeID || !transactionNo || !signature) {
      return res.status(400).json({ error: 'Invalid decrypted data format' });
    }

    // Generate signature
    const expectedSignature = generateSignature(
      login,
      password,
      storeID,
      transactionNo,
      SecretKey
    );

    console.log(expectedSignature);

    // Ensure both signatures are lowercase for comparison
    if (signature.toLowerCase() !== expectedSignature.toLowerCase()) {
      return res.status(401).json({
        responseCode: '401400',
        responseMessage: 'Invalid Signature'
      });
    }

    console.log(
      decryptedObject.login,
      decryptedObject.password,
      decryptedObject.storeID
    );

    const validate_credential = await findInquiryTransactionMapping(
      decryptedObject.login,
      decryptedObject.password,
      decryptedObject.storeID
    );

    console.log(validate_credential);

    if (!validate_credential) {
      return res.status(401).json({
        responseCode: '401402',
        responseMessage: 'Invalid Credential'
      });
    }

    const data_ticket = await findTicket(decryptedObject.transactionNo);

    if (!data_ticket) {
      return res.status(404).json({
        responseCode: '404401',
        responseMessage: 'Invalid Transaction'
      });
    }

    if (data_ticket.inTime) {
      const inTime = moment(data_ticket.inTime);
      const gracePeriodEnd = inTime.add(
        data_ticket.grace_period || 5,
        'minutes'
      ); // Default 5 minutes if undefined

      if (moment().isBefore(gracePeriodEnd)) {
        return res.json({
          responseStatus: 'Success',
          responseCode: '211000',
          responseDescription: 'Transaction Success',
          messageDetail: 'Tiket valid, biaya parkir Anda masih gratis.',
          data: {
            transactionNo: data_ticket.transactionNo,
            transactionStatus: 'VALID',
            inTime: data_ticket.inTime,
            duration: 0,
            tariff: data_ticket.tarif,
            vehicleType: 'MOTOR',
            outTime: data_ticket.outTime,
            gracePeriod: data_ticket.grace_period,
            location: 'SKY PLUIT VILLAGE',
            paymentStatus: 'FREE'
          }
        });
      } else if (moment().isAfter(gracePeriodEnd)) {
        const update_tarif = await updateTarifIfExpired(
          data_ticket.transactionNo
        );
        const succes_payload = {
          responseStatus: 'Success',
          responseCode: '211000',
          responseDescription: 'Transaction Success',
          messageDetail: 'Tiket valid, biaya parkir Anda masih gratis.',
          data: {
            transactionNo: update_tarif.transactionNo,
            transactionStatus: 'VALID',
            inTime: update_tarif.inTime,
            duration: 0,
            tariff: update_tarif.tarif,
            vehicleType: 'MOTOR',
            outTime: update_tarif.outTime,
            gracePeriod: update_tarif.grace_period,
            location: 'SKY PLUIT VILLAGE',
            paymentStatus: update_tarif.status
          }
        };
        return res.json(succes_payload); // Respond with the decrypted object directly
      }
    }
  } catch (error) {
    console.error('Error processing inquiry transaction:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
