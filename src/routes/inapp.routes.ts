import express from 'express';
import timeout from 'connect-timeout';
import {
  Inquiry_Transaction,
  Payment_Confirmation,
  processInquiryTransaction,
  processPaymentTransaction
} from '../controllers/transaction.controller';
import {
  createTicketHandler,
  getPaymentSignature,
  sigantureKey
} from '../controllers/ticket_generator.controller';
import { haltOnTimeout } from '../middleware/timeout.middleware';

const innAppRoute = express.Router();

//Real IN APP
innAppRoute.post(
  '/Partner/InquiryTransaction',
  haltOnTimeout,
  Inquiry_Transaction
);
innAppRoute.post(
  '/Partner/PaymentConfirmation',
  haltOnTimeout,
  Payment_Confirmation
);

//Simulator
innAppRoute.post('/Signature-Inquiry', sigantureKey);
innAppRoute.post('/Signature-Payment', getPaymentSignature);
innAppRoute.post('/GenerateTicket', createTicketHandler);
innAppRoute.post('/InquiryTariffREG/', processInquiryTransaction);
innAppRoute.post('/PaymentConfrimationREG/', processPaymentTransaction);

export default innAppRoute;
