'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert("Device",[
      {
        id: "abc1",
        humidity: 30.5,
        temp: 20.5,
        status: 1,
        location: "abc"
      }
    ])
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Device",null,{})
  }
};
