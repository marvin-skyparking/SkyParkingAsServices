'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('location_lot', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      location_code: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'location_area', // Ensure 'location_area' table exists
          key: 'location_code'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      location_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lot_name:{
        type: Sequelize.STRING,
        allowNull: false
      },
      vehicle_type: {
        type: Sequelize.ENUM('MOBIL', 'MOTOR'),
        allowNull: false
      },
      max_lot: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      used_lot: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      available_lot: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('location_lot');
  }
};
