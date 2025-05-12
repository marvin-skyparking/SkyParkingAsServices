'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add 'ticket_close' column to 'ticket' table
    await queryInterface.addColumn('ticket_generator', 'ticket_close', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove 'ticket_close' column from 'ticket' table
    await queryInterface.removeColumn('ticket_generator', 'ticket_close');
  }
};
