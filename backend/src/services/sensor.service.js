import Sensor from "../models/sensor.model.js";
import Device from "../models/device.model.js";

/**
 * Lưu dữ liệu sensor từ MQTT
 * @param {Object} data - payload đã parse JSON
 */
export const saveSensorFromMQTT = async (data) => {
    try {
        // Validate tối thiểu
        if (
            !data.device_id ||
            typeof data.temp !== "number" ||
            typeof data.hum !== "number" ||
            typeof data.soil !== "number"
        ) {
            console.warn("Invalid sensor payload:", data);
            return;
        }

        // Tìm device
        const device = await Device.findOne({ deviceId: data.device_id });
        if (!device) {
            console.warn("Device not found:", data.device_id);
            return;
        }

        // Map & save sensor
        await Sensor.create({
            deviceId: device._id,
            temperature: data.temp,
            humidity: data.hum,
            soilMoisture: data.soil,
            battery: data.bat ?? null,
            water: data.water ?? null,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
        });

        // Update device status
        device.status = "online";
        device.lastActive = new Date();
        await device.save();

        console.log("Sensor data saved:", data.device_id);
    } catch (err) {
        console.error("Save sensor error:", err.message);
    }
};
