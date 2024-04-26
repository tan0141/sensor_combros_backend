require("dotenv").config();

module.exports = {
	development: {
		username: process.env.MYSQL_USERNAME,
		password: process.env.MYSQL_PASSWORD,
		database: process.env.MYSQL_DATABASE,
		host: process.env.MYSQL_HOST,
		port: parseInt(process.env.MYSQL_PORT, 10),
		dialect: "mysql",
	},
	test:{
		username: process.env.TEST_USERNAME || "root",
		password: process.env.TEST_PASSWORD || null,
		database: process.env.TEST_DATABASE || "database_test",
		host: process.env.TEST_HOST || "127.0.0.1",
		dialect: "mysql",
	},
	production: {
		username: process.env.PRODUCTION_USERNAME || "root",
		password: process.env.PRODUCTION_PASSWORD || null,
		database: process.env.PRODUCTION_DATABASE || "database_production",
		host: process.env.PRODUCTION_HOST || "127.0.0.1",
		dialect: "mysql",
	},
};