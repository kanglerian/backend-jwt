'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hashedPassword1 = await bcrypt.hash('lerian123', 10);
    await queryInterface.bulkInsert('Users', [{
      identity: '3278012602980005',
      name: 'Lerian Febriana',
      phone: '6281286501015',
      email: 'kanglerian@gmail.com',
      password: hashedPassword1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
