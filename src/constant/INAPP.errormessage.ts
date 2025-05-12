export const ERROR_MESSAGES = {
  MISSING_ENCRYPTED_DATA: {
    responseStatus: 'Failed',
    responseCode: '211001',
    responseDescription: 'Invalid Transaction',
    messageDetail: 'Please provide the encrypted data.'
  },
  INVALID_DATA_ENCRYPTION: {
    responseStatus: 'Failed',
    responseCode: '211001',
    responseDescription: 'Invalid Transaction',
    messageDetail: 'Invalid Data Encryption'
  },
  INVALID_SIGNATURE: {
    responseStatus: 'Failed',
    responseCode: '211080',
    responseDescription: 'Invalid Signature',
    messageDetail: 'The provided signature is invalid.'
  },
  MISSING_FIELDS: {
    responseStatus: 'Failed',
    responseCode: '211080',
    responseDescription: 'All fields are required',
    messageDetail: 'Please fill in all required fields.'
  },
  INVALID_CREDENTIAL: {
    responseStatus: 'Failed',
    responseCode: '911006',
    responseDescription: 'Invalid Partner',
    messageDetail: 'Partner, Not Found'
  },
  INVALID_LOCATION: {
    responseStatus: 'Failed',
    responseCode: '211080',
    responseDescription: 'All fields are required',
    messageDetail: 'Invalid Location Parking'
  },

  SUCCESS_INQUIRY: {
    responseStatus: 'Success',
    responseCode: '211000',
    responseDescription: 'Transaction Success',
    messageDetail: 'Ticket is valid and parking fee is still free'
  },
  BILL_AREADY_PAID: {
    responseStatus: 'Failed',
    responseCode: '211001',
    responseDescription: 'Invalid Transaction',
    messageDetail: 'Bill already paid'
  },
  INVALID_AMOUNT: {
    responseStatus: 'Failed',
    responseCode: '211001',
    responseDescription: 'Invalid Transaction',
    messageDetail: 'Invalid Amount, Please Inquiry your bill again'
  },
  INVALID_TRANSACTION: {
    responseStatus: 'Failed',
    responseCode: '211001',
    responseDescription: 'Invalid Transaction',
    messageDetail: 'The ticket is invalid'
  }
};
