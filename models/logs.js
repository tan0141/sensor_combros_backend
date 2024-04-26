const { DataTypes } = require('sequelize');
const Device = require('./devices');

module.exports = (sequelize, DataTypes) => {
	const Log = sequelize.define(
		"Log",
		{
			id:{
				type:DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			id_devices:{
				type:DataTypes.STRING,
				allowNull: false,
				references: {
					model: Device,
					key: "id"
				}
			},
			humidity: DataTypes.FLOAT,
			temp: DataTypes.FLOAT,
		},
		{
			timestamps: false,
			tableName: "log"
		}
	);

	return Log;
};