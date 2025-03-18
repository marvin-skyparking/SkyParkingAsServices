import TicketGenerator from '../models/ticket_generatore.model';
import moment from 'moment';

/**
 * Generate a random transaction number
 */
function generateTransactionNo(): string {
  const randomPart = Math.floor(
    100000000000 + Math.random() * 900000000000
  ).toString();
  return `${randomPart}F007SK`;
}

/**
 * Create a new TicketGenerator entry
 */
export async function createTicket() {
  const transactionNo = generateTransactionNo();

  const newTicket = await TicketGenerator.create({
    transactionNo,
    url_ticket: `https://devapps.skyparking.online/Ebilling?p1=ID2023262331937&p2=${transactionNo}`,
    tarif: 0,
    grace_period: 5, // Default 15 minutes
    inTime: moment().toDate(), // Current date-time
    status: 'UNPAID'
  });

  return newTicket;
}

/**
 * Find a ticket by transaction number
 */
export async function findTicket(transactionNo: string) {
  return await TicketGenerator.findOne({ where: { transactionNo } });
}

export async function updateTarifIfExpired(transactionNo: string) {
  const ticket = await findTicket(transactionNo);

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  const inTime = moment(ticket.inTime);
  const now = moment();

  // Calculate how many full grace periods have passed since inTime
  const gracePeriodMinutes = ticket.grace_period || 5;
  const minutesElapsed = now.diff(inTime, 'minutes');
  const gracePeriodsPassed = Math.floor(minutesElapsed / gracePeriodMinutes);

  // Expected tarif based on elapsed grace periods
  const expectedTarif = 5000 * gracePeriodsPassed;

  if (expectedTarif > ticket.tarif) {
    ticket.tarif = expectedTarif;
    await ticket.save();
  }

  return ticket;
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  transactionNo: string,
  status: 'PAID' | 'UNPAID'
) {
  const ticket = await TicketGenerator.findOne({ where: { transactionNo } });
  if (!ticket) throw new Error('Ticket not found');

  await ticket.update({ status });
  return ticket;
}
