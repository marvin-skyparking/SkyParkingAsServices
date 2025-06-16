import express from 'express';
import timeout from 'connect-timeout';
import {
  // close_ticket,
  // close_ticket_not_encrypt,
  Inquiry_Transaction,
  Inquiry_Transaction_Snap,
  // InquiryTransactionSnap,
  Payment_Confirmation
  // processInquiryTransaction,
  // processInquiryTransactionEncrypt,
  // processPaymentTransaction,
  // processPaymentTransactionEncrypt,
  // processPaymentTransactionPOST
} from '../controllers/transaction.controller';
import {
  createTicketHandler,
  getPaymentSignature,
  sigantureKey
} from '../controllers/ticket_generator.controller';
import { haltOnTimeout } from '../middleware/timeout.middleware';
import {
  verifyClientAuth,
  verifyClientAuthAccess
} from '../middleware/verify_auth.middleware';

const innAppRoute = express.Router();

//Real IN APP
// innAppRoute.post('/Partner/InquiryTariffREG', processInquiryTransactionEncrypt);
// innAppRoute.post(
//   '/Partner/PaymentConfirmationREG',
//   processPaymentTransactionEncrypt
// );

// innAppRoute.post('/Partner/CloseTicket', haltOnTimeout, close_ticket);

// POST TEST
innAppRoute.post(
  '/Partner/InquiryTariffREGS',
  haltOnTimeout,
  Inquiry_Transaction
);
innAppRoute.post(
  '/Partner/PaymentConfirmationREG',
  haltOnTimeout,
  Payment_Confirmation
);

//Simulator
innAppRoute.post('/Signature-Inquiry', sigantureKey);
innAppRoute.post('/Signature-Payment', getPaymentSignature);
// innAppRoute.post('/GenerateTicket', createTicketHandler);
// innAppRoute.post(
//   '/POST/Simulator/InquiryTariffREG/',
//   processInquiryTransaction
// );
// innAppRoute.post(
//   '/Partner/Simulator/InquiryTariffREG/',
//   processInquiryTransaction
// );
// innAppRoute.post(
//   '/Partner/Simulator/PaymentConfrimationREG/',
//   processPaymentTransaction
// );
// innAppRoute.post(
//   '/POST/Simulator/PaymentConfrimationREG/',
//   processPaymentTransactionPOST
// );

// innAppRoute.post('/POST/Simulator/Close-Ticket/', close_ticket_not_encrypt);

//Version 2
innAppRoute.post(
  '/Partner/ticket/InquiryTariffREG',
  verifyClientAuthAccess,
  Inquiry_Transaction_Snap
);
// innAppRoute.post('/Partner/PaymentConfrimationREG', processPaymentTransaction);

export default innAppRoute;
