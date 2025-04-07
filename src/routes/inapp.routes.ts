import express from 'express';
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

const innAppRoute = express.Router();

//Real IN APP
innAppRoute.post('/Partner/InquiryTransaction', Inquiry_Transaction);
innAppRoute.post('/Partner/PaymentConfirmation', Payment_Confirmation);

//Simulator
innAppRoute.post('/Signature-Inquiry', sigantureKey);
innAppRoute.post('/Signature-Payment', getPaymentSignature);
innAppRoute.post('/GenerateTicket', createTicketHandler);

innAppRoute.post('/InquiryTariffREG/', processInquiryTransaction);
innAppRoute.post('/PaymentConfrimationREG/', processPaymentTransaction);

export default innAppRoute;
