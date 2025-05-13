'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ticket_generator', 'paid_at', {
      type: Sequelize.DATE,
      allowNull: true,
      after: 'status' // adjust this if you want to place it after a specific column
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ticket_generator', 'paid_at');
  }
};
