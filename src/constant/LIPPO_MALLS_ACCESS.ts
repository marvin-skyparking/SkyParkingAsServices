export const ACCESS_CREDENTIAL = {
  grant_type: 'password',
  username: 'autogate',
  password: 'AutoGate!23'
};

export const ERROR_ON_LIPPO_MALLS = {
  FAILED_TO_GET_TOKEN: {
    responseStatus: 'Failed',
    responseCode: '211001',
    responseDescription: 'Error Establish Connection',
    messageDetail: 'Failed to Get Token From Lippo Malls'
  },

  NOT_MEMBER_STYLES: {
    responseStatus: 'Failed',
    responseCode: '211170',
    responseDescription: 'Membership Data Is Not Found',
    messageDetail:
      'The vehicle license plate is not valid Styles membership (data not found)'
  }
};
