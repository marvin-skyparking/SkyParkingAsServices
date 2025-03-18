import { Request, Response } from 'express';
import {
  createTicket,
  findTicket,
  updateTicketStatus
} from '../services/ticket_generator.service';
import { encryptPayload, generateSignature } from '../utils/encrypt.utils';
import { findInquiryTransactionMapping } from '../services/inquiry_transaction_mapping.service';

/**
 * Create a new ticket
 */
export async function createTicketHandler(req: Request, res: Response) {
  try {
    const ticket = await createTicket();
    return res.json({ success: true, data: ticket });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get a ticket by transaction number
 */
export async function getTicketHandler(req: Request, res: Response) {
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
export async function updateTicketStatusHandler(req: Request, res: Response) {
  try {
    const { transactionNo } = req.params;
    const { status } = req.body;

    if (!['PAID', 'UNPAID'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const updatedTicket = await updateTicketStatus(transactionNo, status);
    return res.json({ success: true, data: updatedTicket });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function sigantureKey(req: Request, res: Response) {
  const { login, password, storeID, transactionNo } = req.body;

  const secretKey = await findInquiryTransactionMapping(
    login,
    password,
    storeID
  );

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

  const data = {
    login,
    password,
    storeID,
    transactionNo,
    signature
  };

  const encrypted_data = encryptPayload(data, secretKey.SecretKey);

  return res.json({
    success: true,
    clear_data: data,
    data: encrypted_data,
    secret: secretKey.SecretKey
  });
}
