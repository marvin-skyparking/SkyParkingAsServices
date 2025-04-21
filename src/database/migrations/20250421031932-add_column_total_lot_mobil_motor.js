'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('location_area', 'total_lot_mobil', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('location_area', 'total_lot_motor', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('location_area', 'total_lot_mobil');
    await queryInterface.removeColumn('location_area', 'total_lot_motor');
  }
};
