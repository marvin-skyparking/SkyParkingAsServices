'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PartnerRoleMapping', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED, // ✅ Ensure it matches the referenced column
        autoIncrement: true,
        primaryKey: true
      },
      id_partner: {
        type: Sequelize.INTEGER.UNSIGNED, // ✅ Must match PartnerMapping.Id
        allowNull: false,
        references: {
          model: 'PartnerMapping', // ✅ Ensure this matches the actual table name
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role_name: {
        type: Sequelize.ENUM('POST', 'PAYMENT PARTNER'),
        allowNull: false
      },
      access_type: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      url_access: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('PartnerRoleMapping');
  }
};
