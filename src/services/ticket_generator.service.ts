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
    url_ticket: `https://devapps.skyparking.online/skyparking/Ebilling?p1=007SK&p2=${transactionNo}`,
    tarif: 0,
    vehicle_type: 'MOBIL',
    reference_no: generateReferenceNo(24),
    grace_period: 5, // Default 15 minutes
    inTime: new Date(),
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

  const now = moment().tz('Asia/Jakarta');
  const gracePeriodMinutes = ticket.grace_period || 5;

  // Determine effective start time (inTime or paid_at)
  let effectiveStart = moment(ticket.inTime).tz('Asia/Jakarta');
  if (ticket.status === 'PAID' && ticket.paid_at) {
    effectiveStart = moment(ticket.paid_at).tz('Asia/Jakarta');
  }

  // Calculate minutes elapsed since effective start
  const minutesElapsed = now.diff(effectiveStart, 'minutes');

  // Only count full grace periods after the first 5 minutes
  const fullPeriodsPassed = Math.floor(minutesElapsed / gracePeriodMinutes);

  // Tarif starts at 5000 and increases by 5000 for each full period beyond the first
  const expectedTarif =
    5000 + (fullPeriodsPassed > 0 ? (fullPeriodsPassed - 1) * 5000 : 0);

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
      // outTime: new Date(),
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
  (ticket.outTime = new Date()), await ticket.save();
  return ticket;
}
