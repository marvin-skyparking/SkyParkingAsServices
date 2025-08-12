exports.config = {
  app_name: ['IN-APP'],
  license_key: '2efbafc35c0c43b5b53b1547a7f583b3FFFFNRAL',
  distributed_tracing: {
    enabled: true
  },

  logging: {
    level: 'info'
  },
  allow_all_headers: true, // allow custom HTTP headers
  attributes: {
    include: [
      'request.parameters.*', // query params
      'request.headers.*',    // all headers
    ],
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  }
};
