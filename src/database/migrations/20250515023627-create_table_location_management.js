'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('location_management', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      NMID: {
        type: Sequelize.STRING,
        allowNull: false
      },
      location_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      location_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      login: {
        type: Sequelize.STRING,
        allowNull: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true
      },
      secret_key: {
        type: Sequelize.STRING,
        allowNull: true
      },
      partner_key: {
        type: Sequelize.STRING,
        allowNull: true
      },
      url_inquiry: {
        type: Sequelize.STRING,
        allowNull: true
      },
      url_payment: {
        type: Sequelize.STRING,
        allowNull: true
      },
      vendor_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('location_management');
  }
};
