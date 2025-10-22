exports.config = {
  app_name: ['IN-APP'],
  license_key: '2efbafc35c0c43b5b53b1547a7f583b3FFFFNRAL',

  apdex_t: 0.5, // 0.5 seconds = 500 ms threshold for “Satisfied”
                 // → Tolerating range = 0.5s–2.0s (Frustrated > 2s)

  distributed_tracing: {
    enabled: true
  },

  transaction_tracer: {
    enabled: true,
    record_sql: 'obfuscated', // traces slow DB queries
    stack_trace_threshold: 0.5 // capture stack traces for transactions > 500ms
  },

  logging: {
    level: 'info' // change to 'debug' for troubleshooting
  },

  allow_all_headers: true, // allow custom HTTP headers

  attributes: {
    include: [
      'request.parameters.*', // include query params
      'request.headers.*',    // include all request headers
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
