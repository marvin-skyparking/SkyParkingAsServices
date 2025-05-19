export const ERROR_MESSAGES_NEW = {
  MISSING_CREDENTIALS: {
    responseCode: '401400',
    responseMessage: 'Unauthorized. Missing credentials'
  },
  INVALID_SIGNATURE: {
    responseCode: '401401',
    responseMessage: 'Unauthorized. Invalid Signature'
  },
  INVALID_CLIENTKEY: {
    responseCode: '401402',
    responseMessage: 'Unauthorized. Invalid clientkey'
  },
  INVALID_REQUEST: {
    responseCode: '400413',
    responseMessage: 'Invalid Request Parameter'
  },
  INVALID_TICKET: {
    responseCode: '404001',
    responseMessage: 'Invalid Ticket'
  },
  INVALID_AMOUNT: {
    responseCode: '404002',
    responseMessage: 'Invalid Amount, Please re-inquiry your bill again'
  },
  INVALID_TICKET_PAID: {
    responseCode: '404003',
    responseMessage: 'Ticket has been paid'
  },
  INVALID_LOCATION: {
    responseCode: '404114',
    responseMessage: 'Invalid Location Parking'
  },
  ACCESS_NOT_PERMITTED: {
    responseCode: '403001',
    responseMessage: 'Access not permitted'
  },
  GENERAL_ERROR: {
    responseCode: '500501',
    responseMessage: 'Internal Server Error'
  },
  INVALID_TIMESTAMP_BACKDATED: {
    responseCode: '401407',
    responseMessage: 'Unauthorized. Timestamp is backdated'
  }
};

export const SUCCESS_MESSAGES_NEW = {
  SUCCESS_TICKET_FREE: {
    responseCode: '200100',
    responseMessage: 'Ticket is valid and parking fee is still free'
  },
  SUCCESS_TICKET_FEE: {
    responseCode: '200101',
    responseMessage: 'Ticket is valid, please pay the parking fee'
  },
  SUCCESS_TICKET_PAID: {
    responseCode: '201101',
    responseMessage:
      'Ticket paid successfully, Ticket paid successfully. To avoid additional costs, please exit in 30 Minutes, Not valid for flat rates'
  },
  SUCCESS_TICKET_ALREADY_PAID: {
    responseCode: '201102',
    responseMessage: 'Ticket has been paid'
  }
};
