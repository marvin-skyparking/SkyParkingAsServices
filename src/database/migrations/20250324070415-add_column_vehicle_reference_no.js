'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('ticket_generator', 'vehicle_type', {
      type: Sequelize.ENUM('MOTOR', 'MOBIL'),
      allowNull: false,
    });

    await queryInterface.addColumn('ticket_generator', 'reference_no', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ticket_generator', 'vehicle_type');
    await queryInterface.removeColumn('ticket_generator', 'reference_no');

    // Drop ENUM type to avoid conflicts if rolling back
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ticket_generator_vehicle_type";');
  },
};
