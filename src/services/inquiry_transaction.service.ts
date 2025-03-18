import InquiryTransaction from '../models/inquiry_transaction';

/**
 * Create a new InquiryTransaction record.
 */
export async function createInquiryTransaction(
  data: Partial<InquiryTransaction>
) {
  return await InquiryTransaction.create(data);
}

/**
 * Get an InquiryTransaction by ID.
 */
export async function getInquiryTransactionById(id: bigint) {
  return await InquiryTransaction.findByPk(id);
}

/**
 * Get all InquiryTransaction records.
 */
export async function getAllInquiryTransactions() {
  return await InquiryTransaction.findAll();
}

/**
 * Update an InquiryTransaction by ID.
 */
export async function updateInquiryTransaction(
  id: bigint,
  data: Partial<InquiryTransaction>
) {
  const transaction = await InquiryTransaction.findByPk(id);
  if (!transaction) throw new Error('Transaction not found');

  return await transaction.update(data);
}

/**
 * Delete an InquiryTransaction by ID.
 */
export async function deleteInquiryTransaction(id: bigint) {
  const transaction = await InquiryTransaction.findByPk(id);
  if (!transaction) throw new Error('Transaction not found');

  await transaction.destroy();
  return { message: 'Transaction deleted successfully' };
}
