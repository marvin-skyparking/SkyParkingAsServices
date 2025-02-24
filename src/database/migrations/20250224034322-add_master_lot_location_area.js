'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('location_area', 'total_lot', {
      type: Sequelize.INTEGER,
      allowNull: true, // Optional field
      defaultValue: 0, // Default value set to 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('location_area', 'total_lot');
  }
};
