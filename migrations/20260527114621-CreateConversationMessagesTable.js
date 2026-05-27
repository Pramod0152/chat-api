'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      conversation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'conversations',
          key: 'id',
        },
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },

      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      is_updated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Text',
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
  },
};
