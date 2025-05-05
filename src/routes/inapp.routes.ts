import express from 'express';
import timeout from 'connect-timeout';
import {
  Inquiry_Transaction,
  // InquiryTransactionSnap,
  Payment_Confirmation,
  processInquiryTransaction,
  processPaymentTransaction,
  processPaymentTransactionPOST
} from '../controllers/transaction.controller';
import {
  createTicketHandler,
  getPaymentSignature,
  sigantureKey
} from '../controllers/ticket_generator.controller';
import { haltOnTimeout } from '../middleware/timeout.middleware';
import { verifyClientAuth } from '../middleware/verify_auth.middleware';

const innAppRoute = express.Router();

//Real IN APP
innAppRoute.post(
  '/Partner/InquiryTariffREG',
  haltOnTimeout,
  Inquiry_Transaction
);
innAppRoute.post(
  '/Partner/PaymentConfrimationREG',
  haltOnTimeout,
  Payment_Confirmation
);

//Simulator
innAppRoute.post('/Signature-Inquiry', sigantureKey);
innAppRoute.post('/Signature-Payment', getPaymentSignature);
innAppRoute.post('/GenerateTicket', createTicketHandler);
innAppRoute.post(
  '/POST/Simulator/InquiryTariffREG/',
  processInquiryTransaction
);
innAppRoute.post(
  '/Partner/Simulator/InquiryTariffREG/',
  processInquiryTransaction
);
innAppRoute.post(
  '/Partner/Simulator/PaymentConfrimationREG/',
  processPaymentTransaction
);
innAppRoute.post(
  '/POST/Simulator/PaymentConfrimationREG/',
  processPaymentTransactionPOST
);

//Version 2
// innAppRoute.post('/Partner/ticket/InquiryTariffREG',verifyClientAuth, InquiryTransactionSnap);
// innAppRoute.post('/Partner/PaymentConfrimationREG', processPaymentTransaction);

export default innAppRoute;
