const express = require("express");
const { Device, Log } = require("./models"); // Adjust your path as necessary
const cors = require("cors");
require("dotenv").config();
const { Op, where } = require("sequelize");

const app = express();

const port = process.env.PORT || 3002;

// Middleware to parse JSON bodies. This line is crucial.
app.use(express.json());
app.use(cors());



//Devices
app.get("/device/getFields", async (req, res) => {
	try {
		const devices = await Device.findAll({
			attributes: ["interval_time","humidity","temp","status","location"],
			//order: [["createdAt", "DESC"]],
		});
		const interval_times = [...new Set(devices.map((device) => device.interval_time))];
		const humiditys = [...new Set(devices.map((device) => device.humidity))];
		const temps = [...new Set(devices.map((device) => device.temp))];
		const status = [...new Set(devices.map((device) => device.status))];
		const locations = [...new Set(devices.map((device) => device.location.toString()))];

		// Return the arrays in the response
		res.json({ interval_times, humiditys, temps, status,locations });
	} catch (error) {
		console.error("Error fetching devices: ", error);
		res.status(500).send("Server error");
	}
});

app.post("/device", async (req, res) => {
	const { id, interval_time, humidity, temp, status, location } = req.body; // Extracting address from request body
	try {
		const devices = await Device.create({
			id:id,
			interval_time: interval_time,
			humidity: humidity,
			temp: temp,
			status: status,
			location: location
		});

		const log = await Log.create({
            id_devices: devices.id, // Sử dụng ID của thiết bị mới tạo
            humidity: devices.humidity,
            temp: devices.temp,
        });

		res.json(devices);
	} catch (error) {
		console.error("Error fetching data: ", error);
		res.status(500).send("Server error");
	}
});

//update
app.put("/device/:id", async (req, res) => {
	const { id } = req.params; // Extracting id from URL
	const { interval_time, humidity, temp, status, location } = req.body; // Extracting address from request body
	try {
		const deviceToUpdate = await Device.findOne({ where: { id } });
		if (deviceToUpdate) {
			if (interval_time) deviceToUpdate.interval_time = interval_time;
			if (humidity) deviceToUpdate.humidity = humidity; // Updating the address field
			if (temp) deviceToUpdate.by = temp;
			if (status) deviceToUpdate.status = status;
			if (location) deviceToUpdate.location = location;

			const log = await Log.create({
				id_devices: deviceToUpdate.id, // Sử dụng ID của thiết bị mới tạo
				humidity: deviceToUpdate.humidity,
				temp: deviceToUpdate.temp,
			});

			await deviceToUpdate.save(); // Saving the updated record to the database
			res.send({ message: "Device updated successfully", log: deviceToUpdate });
		} else {
			res.status(404).send({ message: "Devices not found" });
		}
	} catch (error) {
		console.error("Error updating device: ", error);
		res.status(500).send("Server error");
	}
});

//getALL Device
app.get("/devices", async (req, res) => {
	try {
		// Extract filtering parameters from query, if provided
		const { interval_time, humidity, temp, status, location } = req.query;
		console.log(interval_time);
		// start =2024-03-10T17:00:00.000Z
		console.log(interval_time);
		// end =2024-03-12T17:00:00.000Z

		// Default values for pagination
		const page = parseInt(req.query.page, 10) || 0; // Page number, default is 0
		const pageSize = parseInt(req.query.pageSize, 10) || 10; // Number of items per page, default is 10

		// Calculate offsetlocation
		const offset = page * pageSize;

		// Build a query object to include filtering if necessary
		let queryOptions = {
			attributes: [
				"id",
				"interval_time",
				"humidity",
				"temp",
				"status",
				"location",
			],
			order: [["status", "DESC"]],
			limit: pageSize,
			offset: offset,
			where: {}, // Start with an empty 'where' object to conditionally add filters
		};

		// Add filters to the query if they are provided
		if (interval_time) queryOptions.where.interval_time = interval_time;
		if (humidity) queryOptions.where.humidity = humidity; // Assuming a LIKE query for address
		if (temp) queryOptions.where.temps = temp;
		if (status) queryOptions.where.status = status;
		if (location) queryOptions.where.location = location;

		const devices = await Device.findAll(queryOptions);

		// Optionally, get the total number of items (considering filters) to calculate the total pages
		const totalItems = await Device.count({ where: queryOptions.where });
		const totalPages = Math.ceil(totalItems / pageSize);

		// Send paginated and optionally filtered response
		res.json({
			data: devices || [],
			pagination: {
				page: page,
				pageSize: pageSize,
				totalItems: totalItems,
				totalPages: totalPages,
			},
		});
	} catch (error) {
		console.error("Error fetching data: ", error);
		res.status(500).send("Server error");
	}
});

//Get devices by id
app.get("/device/:id", async (req, res) => {
    const { id } = req.params;
    const { interval_time, humidity, temp, status, location } = req.query; // Use req.query instead of req.body for GET requests

    try {
        const deviceGetId = await Device.findOne({ where: { id } });

        if (deviceGetId) {
            let queryOptions = {
                attributes: [
                    "id",
                    "interval_time",
                    "humidity",
                    "temp",
                    "status",
                    "location",
                ],
                where: { id }, // Filter by ID
            };

            // Add other conditions if provided
            if (interval_time) queryOptions.where.interval_time = interval_time;
            if (humidity) queryOptions.where.humidity = humidity;
            if (temp) queryOptions.where.temp = temp;
            if (status) queryOptions.where.status = status;
            if (location) queryOptions.where.location = location;

            const result = await Device.findAll(queryOptions);
            res.json(result);
        } else {
            res.status(404).json({ error: "Device not found" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.delete("/device/:id", async (req, res) => {
	const { id } = req.params; // Extracting id from URL
	try {
		const deviceToDelete = await Device.findOne({ where: { id } });
		if (deviceToDelete) {
			await deviceToDelete.destroy();
			res.send({
				message: "Device deleted successfully",
				log: deviceToDelete,
			});
		} else {
			res.status(404).send({ message: "Device not found" });
		}
	} catch (err) {
		console.error("Error updating device: ", err);
		res.status(500).send("Server error");
	}
});



//Logs

app.get("logs/getFields", async (req, res) => {
	try {
		const logs = await Log.findAll({
			attributes: ["id_devices","humidity","temp"],
			//order: [["createdAt", "DESC"]],
		});
		const id_devicess = [...new Set(logs.map((log) => log.id_devices))];
		const humiditys = [...new Set(logs.map((log) => log.humidity))];
		const temps = [...new Set(logs.map((log) => log.temp))];

		// Return the arrays in the response
		res.json({ id_devicess, humiditys, temps });
	} catch (error) {
		console.error("Error fetching devices: ", error);
		res.status(500).send("Server error");
	}
});

//Add log
//app.post("/log", async (req, res) => {
//    const { id_devices, humidity, temp } = req.body; // Trích xuất thông tin từ thân yêu cầu
//    try {
//        // Tạo thiết bị mới
//        const device = await Device.create({ id: id_devices, humidity, temp });

//        // Tạo log mới sử dụng thông tin từ thiết bị
//        const log = await Log.create({
//            id_devices: device.id, // Sử dụng ID của thiết bị mới tạo
//            humidity: device.humidity,
//            temp: device.temp,
//        });

//        // Xác nhận rằng cả thiết bị và log đã được thêm vào thành công
//        if (device && log) {
//            // Trả về phản hồi với thông tin của log mới tạo
//            res.json(log);
//        } else {
//            // Trả về phản hồi lỗi nếu có vấn đề xảy ra
//            res.status(500).send("Lỗi trong quá trình thêm dữ liệu");
//        }
//    } catch (error) {
//        console.error("Lỗi khi thêm dữ liệu: ", error);
//        res.status(500).send("Lỗi máy chủ");
//    }
//});


// get log by id
app.get("/log/:id", async (req, res) => {
    const { id } = req.params;
    const { id_devices, humidity, temp } = req.query; // Use req.query instead of req.body for GET requests

    try {
        const logGetId = await Log.findOne({ where: { id } });

        if (logGetId) {
            let queryOptions = {
                attributes: [
                    "id",
                    "id_devices",
                    "humidity",
                    "temp",
                ],
                where: { id }, // Filter by ID
            };

            // Add other conditions if provided
            if (id_devices) queryOptions.where.id_devices = id_devices;
            if (humidity) queryOptions.where.humidity = humidity;
            if (temp) queryOptions.where.temp = temp;


            const result = await Log.findAll(queryOptions);
            res.json(result);
        } else {
            res.status(404).json({ error: "Log not found" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/logs", async (req, res) => {
	try {
		// Extract filtering parameters from query, if provided
		const { id_devices, humidity, temp} = req.query;
		console.log(id_devices);
		// start =2024-03-10T17:00:00.000Z
		console.log(id_devices);
		// end =2024-03-12T17:00:00.000Z

		// Default values for pagination
		const page = parseInt(req.query.page, 10) || 0; // Page number, default is 0
		const pageSize = parseInt(req.query.pageSize, 10) || 10; // Number of items per page, default is 10

		// Calculate offsetlocation
		const offset = page * pageSize;

		// Build a query object to include filtering if necessary
		let queryOptions = {
			attributes: [
				"id",
				"id_devices",
				"humidity",
				"temp",
			],
			order: [["id_devices", "DESC"]],
			limit: pageSize,
			offset: offset,
			where: {}, // Start with an empty 'where' object to conditionally add filters
		};

		// Add filters to the query if they are provided
		if (id_devices) queryOptions.where.id_devices = id_devices;
		if (humidity) queryOptions.where.humidity = humidity; // Assuming a LIKE query for address
		if (temp) queryOptions.where.temps = temp;

		const logs = await Log.findAll(queryOptions);

		// Optionally, get the total number of items (considering filters) to calculate the total pages
		const totalItems = await Log.count({ where: queryOptions.where });
		const totalPages = Math.ceil(totalItems / pageSize);

		// Send paginated and optionally filtered response
		res.json({
			data: logs || [],
			pagination: {
				page: page,
				pageSize: pageSize,
				totalItems: totalItems,
				totalPages: totalPages,
			},
		});
	} catch (error) {
		console.error("Error fetching data: ", error);
		res.status(500).send("Server error");
	}
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
