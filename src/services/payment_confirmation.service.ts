import PaymentConfirmation from '../models/payment_transaction'; // Import the Sequelize model

interface CreatePaymentDTO {
  NMID?: string;
  StoreCode: string;
  transactionNo: string;
  referenceNo: string;
  amount: number;
  paymentStatus: string;
  paymentReferenceNo: string;
  paymentDate: string;
  partnerID: string;
  retrievalReferenceNo: string;
  approvalCode: string;
  referenceTransactionNo?: string;
  DataReceived?: string;
  DataSend?: string;
  DataResponse?: string;
  DataDetailResponse?: string;
  CreatedBy: string;
  UpdatedOn?: Date;
  UpdatedBy?: string;
  MerchantDataRequest?: string;
  MerchantDataResponse?: string;
  POSTDataRequest?: string;
  POSTDataResponse?: string;
}

export const createPaymentTransaction = async (data: CreatePaymentDTO) => {
  try {
    const payment = await PaymentConfirmation.create({
      ...data,
      CreatedOn: new Date()
    });
    return payment;
  } catch (error) {
    console.error('Error creating payment transaction:', error);
    throw new Error('Database query failed');
  }
};

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
