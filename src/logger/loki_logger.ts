// src/logger/lokiLogger.ts
import winston from 'winston';
import LokiTransport from 'winston-loki';

export const lokiLogger = winston.createLogger({
  transports: [
    new LokiTransport({
      host: 'http://localhost:3100', // Loki container URL
      labels: { app: 'IN-APP' }, // Custom tag
      json: true,
      interval: 5
    })
  ]
});
