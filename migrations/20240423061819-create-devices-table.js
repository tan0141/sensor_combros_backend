'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("Device",{
      id:{
        allowNull: false,
        primaryKey:true,
        type: Sequelize.STRING,
      },
      interval_time:{
        type: Sequelize.INTEGER,
      },
      humidity:{
        type: Sequelize.FLOAT,
      },
      temp: {
        type: Sequelize.FLOAT,
      },
      status:{
        type: Sequelize.INTEGER,
      },
      location:{
        type: Sequelize.STRING,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable( "Devices");
  },
};
