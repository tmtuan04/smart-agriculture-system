import Sensor from "../models/sensor.model.js";
import Device from "../models/device.model.js";

// Không cần cái này
export const insertSensorData = async (req, res) => {
    try {
        const {
            deviceId,
            temperature,
            humidity,
            soilMoisture,
            battery,
            water,
            timestamp,
        } = req.body;

        // Validate cơ bản
        if (
            !deviceId ||
            temperature == null ||
            humidity == null ||
            soilMoisture == null
        ) {
            return res.status(400).json({
                message: "Missing required sensor fields",
            });
        }

        const device = await Device.findOne({ deviceId });
        if (!device) {
            return res.status(404).json({
                message: "Device not found",
            });
        }

        const sensor = await Sensor.create({
            deviceId: device._id,
            temperature,
            humidity,
            soilMoisture,
            battery: battery ?? null,
            water: water ?? null,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
        });

        device.status = "online";
        device.lastActive = new Date();
        await device.save();

        res.status(201).json(sensor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getLatestSensor = async (req, res) => {
    try {
        const { deviceId } = req.params;

        // Tìm device
        const device = await Device.findOne({ deviceId });
        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }

        // Lấy sensor mới nhất
        const sensor = await Sensor.findOne({ deviceId: device._id }).sort({
            timestamp: -1,
        });

        if (!sensor) {
            return res.status(404).json({ message: "No sensor data" });
        }

        res.json(sensor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
