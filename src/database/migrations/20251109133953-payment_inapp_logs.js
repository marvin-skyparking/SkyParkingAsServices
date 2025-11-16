'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PAYMENT_INAPP_LOGS', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      // Required ENUMs
      status: {
        type: Sequelize.ENUM('FAILED', 'SUCCESS'),
        allowNull: false,
      },
      module: {
        type: Sequelize.ENUM('INQUIRY', 'PAYMENT'),
        allowNull: false,
      },
      paymentStatus: {
        type: Sequelize.ENUM('UNPAID', 'PAID'),
        allowNull: false,
      },

      // Optional fields
      transactionNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      referenceNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      paymentReferenceNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      inquiryDate: {
        type: 'DATETIME(3)', // includes milliseconds
        allowNull: true,
      },
      paymentDate: {
        type: 'DATETIME(3)',
        allowNull: true,
      },
      issuerID: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      retrivalReferenceNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      approvalCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      referenceTransactionNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      ClientRequest: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      ClientResponse: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      PostRequest: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },
      PostResponse: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
      },

      createdAt: {
        type: 'DATETIME(3)', // milliseconds precision
        allowNull: true,
      },
      updatedAt: {
        type: 'DATETIME(3)',
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PAYMENT_INAPP_LOGS');
  },
};
