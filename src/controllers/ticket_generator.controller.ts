import { Request, Response } from 'express';
import {
  createTicket,
  findTicket,
  updateTicketStatus
} from '../services/ticket_generator.service';
import {
  encryptPayload,
  generatePaymentSignature,
  generateSignature
} from '../utils/encrypt.utils';
import {
  findInquiryTransactionMapping,
  findInquiryTransactionMappingPartner
} from '../services/inquiry_transaction_mapping.service';

/**
 * Create a new ticket
 */
export async function createTicketHandler(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const ticket = await createTicket();

    const response = {
      responseStatus: 'Success',
      responseCode: '211000',
      responseDescription: 'Transaction Success',
      messageDetail: 'The ticket was generated successfully.',
      transactionNo: ticket.transactionNo,
      referenceNo: ticket.reference_no,
      tarif: ticket.tarif,
      status: ticket.status,
      grace_period: ticket.grace_period,
      url_ticket: ticket.url_ticket,
      storeID: 'ID2023262331937',
      locationCode: '007SK',
      subLocationCode: '007SK-1',
      gateInCode: '007SK-1-PM-GATE1A',
      vehicleType: 'MOBIL',
      productName: 'MOBIL REGULAR',
      inTime: ticket.inTime
    };
    return res.json({ success: true, data: response });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get a ticket by transaction number
 */
export async function getTicketHandler(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { transactionNo } = req.params;
    const ticket = await findTicket(transactionNo);

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, error: 'Ticket not found' });
    }

    return res.json({ success: true, data: ticket });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Update ticket status
 */
export async function updateTicketStatusHandler(
  req: Request,
  res: Response
): Promise<any> {
  try {
    const { transactionNo } = req.params;
    const { status } = req.body;

    if (!['PAID', 'UNPAID'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const updatedTicket = await updateTicketStatus(transactionNo);
    return res.json({ success: true, data: updatedTicket });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function sigantureKey(req: Request, res: Response): Promise<any> {
  const { login, password, storeID, transactionNo } = req.body;

  const secretKey = await findInquiryTransactionMappingPartner(login, password);

  if (!secretKey || !secretKey.SecretKey) {
    return res.status(401).json({
      responseCode: '401402',
      responseMessage: 'Invalid Credential'
    });
  }

  // Ensure SecretKey is always a string
  const signature = generateSignature(
    login,
    password,
    storeID,
    transactionNo,
    secretKey.SecretKey || ''
  );

  const GibberishKey = secretKey.GibberishKey ?? '';

  const data = {
    login,
    password,
    storeID,
    transactionNo,
    signature
  };

  const encrypted_data = encryptPayload(data);

  return res.json({
    responseCode: '200200',
    responseMessage: 'Success',
    signature: signature,
    data: encrypted_data
  });
}

export async function getPaymentSignature(
  req: Request,
  res: Response
): Promise<Response> {
  try {
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
      approvalCode
    } = req.body;

    const requiredFields = [
      'login',
      'password',
      'storeID',
      'transactionNo',
      'referenceNo',
      'amount',
      'paymentStatus',
      'paymentReferenceNo',
      'paymentDate',
      'issuerID',
      'retrievalReferenceNo',
      'approvalCode'
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length) {
      return res.status(400).json({
        responseCode: '400400',
        responseMessage: `Missing fields: ${missingFields.join(', ')}`
      });
    }

    const secretKeyData = await findInquiryTransactionMappingPartner(
      login,
      password
    );
    if (!secretKeyData || !secretKeyData.SecretKey) {
      return res.status(401).json({
        responseCode: '401402',
        responseMessage: 'Invalid Credential'
      });
    }

    const secretKey = secretKeyData.SecretKey;

    // Generate the signature
    const signature = generatePaymentSignature(
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
      secretKey
    );

    // Encrypt entire request body + signature
    const payload = { ...req.body, signature };
    const encryptedData = encryptPayload(payload);

    return res.status(200).json({
      responseCode: '200200',
      responseMessage: 'Success',
      signature: signature,
      data: encryptedData
    });
  } catch (error) {
    console.error('Error generating payment signature:', error);
    return res
      .status(500)
      .json({ responseCode: '500500', responseMessage: 'Server error' });
  }
}
