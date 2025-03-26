import PaymentConfirmation from '../models/payment_transaction'; // Import the Sequelize model

export async function createPaymentTransaction(data: {
  storeCode: string;
  transactionNo: string;
  referenceNo: string;
  amount: number;
  paymentStatus: string;
  paymentReferenceNo: string;
  paymentDate: string;
  partnerID: string;
  retrievalReferenceNo: string;
  approvalCode: string;
  createdBy: string;
}) {
  try {
    const payment = await PaymentConfirmation.create({
      ...data,
      createdOn: new Date() // Add createdOn with the current date
    });
    return payment;
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    throw new Error('Database query failed');
  }
}

export async function getPaymentTransactionById(id: number) {
  try {
    const payment = await PaymentConfirmation.findByPk(id);
    return payment;
  } catch (error) {
    console.error('Error fetching payment transaction:', error);
    throw new Error('Database query failed');
  }
}

export async function getAllPayments() {
  try {
    return await PaymentConfirmation.findAll();
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw new Error('Database query failed');
  }
}
