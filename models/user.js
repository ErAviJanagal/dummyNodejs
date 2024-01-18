const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Make sure to configure your database connection

const User = sequelize.define('users', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true 
  },
  name: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING, 
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
});

module.exports = User;
