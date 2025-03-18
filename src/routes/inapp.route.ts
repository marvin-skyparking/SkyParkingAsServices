import express from 'express';
import { processInquiryTransaction } from '../controllers/inqury_transaction.controller';
import {
  createTicketHandler,
  sigantureKey
} from '../controllers/ticket_generator.controller';

const innAppRoute = express.Router();

innAppRoute.post('/Signature', sigantureKey);
innAppRoute.post('/GenerateTicket', createTicketHandler);
innAppRoute.post('/InquiryTariffREG/', processInquiryTransaction);

export default innAppRoute;
