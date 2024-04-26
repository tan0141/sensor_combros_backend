'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Log', {
      id:{
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_devices:{
        type:Sequelize.STRING,
        references:{
          model: "device",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      humidity:{
        type: Sequelize.FLOAT,
      },
      temp:{
        type: Sequelize.FLOAT,
      }
    })
  },

  async down (queryInterface, Sequelize) {
      await queryInterface.dropTable( "Logs");
  }
};
