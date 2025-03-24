import express from 'express';
import {
  processInquiryTransaction,
  processPaymentTransaction
} from '../controllers/transaction.controller';
import {
  createTicketHandler,
  getPaymentSignature,
  sigantureKey
} from '../controllers/ticket_generator.controller';

const innAppRoute = express.Router();

innAppRoute.post('/Signature-Inquiry', sigantureKey);
innAppRoute.post('/Signature-Payment', getPaymentSignature);
innAppRoute.post('/GenerateTicket', createTicketHandler);

innAppRoute.post('/InquiryTariffREG/', processInquiryTransaction);
innAppRoute.post('/PaymentConfrimationREG/', processPaymentTransaction);

export default innAppRoute;
