export const INAPP_ERROR_MESSAGES = {
  Invalid_Signature: {
    responseCode: '4002501',
    responseMessage: 'Unauthorized Signature'
  },
  Invalid_Format_Content_Type: {
    responseCode: '4002501',
    responseMessage: 'Invalid Field Format Content-Type Should application/json'
  },
  Invalid_Format_XSTAMP: {
    responseCode: '4002501',
    responseMessage: 'Invalid Field Format X-TIMESTAMP'
  },
  Invalid_Client_Key: {
    responseCode: '4002500',
    responseMessage: 'Unauthorized Client Key'
  },
  Null_Format_XSTAMP: {
    responseCode: '4002502',
    responseMessage: 'Invalid Mandatory Field X-TIMESTAMP'
  },
  BillNotFound: {
    responseCode: '4042512',
    responseMessage: 'Bill Not Found'
  },
  InvalidAmount: {
    responseCode: '4042513',
    responseMessage: 'Invalid Amount'
  },
  MissingPartnerId: {
    responseCode: '4002502',
    responseMessage: 'Missing Mandatory Field partnerServiceId'
  },
  InvalidBill: {
    responseCode: '4042512',
    responseMessage: 'Bill Not Found'
  },
  BillAlreadyPay: {
    responseCode: '4042414',
    responseMessage: 'Paid Bill'
  },
  OPEN_BANK_INVALID_TOKEN: {
    responseCode: '4011401',
    responseMessage: 'Access Token Invalid'
  },
  NO_GRANT_TYPE: {
    responseCode: '4007302',
    responseMessage: 'Bad Request. The grantType field is required'
  },
  GRANT_TYPE_NOT_VALID: {
    responseCode: '4007302',
    responseMessage: 'Bad Request. The grantType must client_credentials'
  },
  EXTRENAL_ID_IS_SAME: {
    responseCode: '4092400',
    responseMessage: 'Conflict'
  },
  EXPIRED_BILL: {
    responseCode: '4042519',
    responseMessage: 'Bill has expired'
  },
  INVALID_AND_EXPIRED_TOKEN: {
    responseCode: '4012501',
    responseMessage: 'Invalid or Expired Token'
  },
  INVALID_VIRTUAL_ACCOUNT: {
    responseCode: '4042511',
    responseMessage: 'Invalid Virtual Account'
  }
};
