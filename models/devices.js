const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	const Device = sequelize.define(
		"Device",
		{
			id:{
				type: DataTypes.STRING,
				primaryKey: true,
			},
			interval_time: DataTypes.INTEGER,
			humidity: DataTypes.FLOAT,
			temp: DataTypes.FLOAT,
			status: DataTypes.INTEGER,
			location:DataTypes.STRING,
		},
		{
			timestamps: false,
			tableName: "device",
		}
	);

	return Device;
};