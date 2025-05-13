import TicketGenerator from '../models/ticket_generatore.model';
import moment from 'moment';
import { generateReferenceNo } from '../utils/helper.utils';

/**
 * Generate a random transaction number
 */
function generateTransactionNo(): string {
  const utcDate = moment().tz('UTC').format('YYYYMMDD'); // Get correct UTC date
  const randomPart = Math.floor(
    10000000000 + Math.random() * 900000000000
  ).toString();
  return `${utcDate}${randomPart}F007SK`;
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
    vehicle_type: 'MOBIL',
    reference_no: generateReferenceNo(24),
    grace_period: 5, // Default 15 minutes
    inTime: moment().toDate(), // Current date-time
    status: 'UNPAID',
    ticket_close: false
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
  const gracePeriodMinutes = ticket.grace_period || 5;

  // Calculate minutes since inTime
  const minutesElapsed = now.diff(inTime, 'minutes');
  const gracePeriodsPassed = Math.floor(minutesElapsed / gracePeriodMinutes);
  const expectedTarif = 5000 * gracePeriodsPassed;

  // If paid, pause tarif increase for 30 minutes
  if (ticket.status === 'PAID' && ticket.paid_at) {
    const paidAt = moment(ticket.paid_at);
    const resumeTime = paidAt.clone().add(30, 'minutes');

    if (now.isBefore(resumeTime)) {
      // Still in 30-minute freeze window — return without updating
      return ticket;
    }
  }

  if (expectedTarif > ticket.tarif) {
    ticket.tarif = expectedTarif;
    await ticket.save();
  }

  return ticket;
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(transactionNo: string) {
  try {
    const ticket = await TicketGenerator.findOne({ where: { transactionNo } });

    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Set status to "PAID" and update outTime
    const updateData = {
      tarif: 0,
      status: 'PAID' as const, // Explicitly define the type
      outTime: new Date(),
      paid_at: new Date()
    };

    await ticket.update(updateData);
    return ticket;
  } catch (error: any) {
    console.error('Error updating ticket status:', error);
    throw new Error(error.message || 'Failed to update ticket status');
  }
}

export async function close_ticket_update(transactionNo: string) {
  const ticket = await TicketGenerator.findOne({ where: { transactionNo } });
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  ticket.ticket_close = true;
  await ticket.save();
  return ticket;
}
