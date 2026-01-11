import Sensor from "../models/sensor.model.js";
import Device from "../models/device.model.js";

const ONE_MINUTE = 60 * 1000;

export const saveSensorFromMQTT = async (data) => {
    try {
        // Validate
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

        // Lấy record sensor mới nhất
        const lastSensor = await Sensor.findOne(
            { deviceId: device._id },
            {},
            { sort: { timestamp: -1 } }
        );

        const now = new Date();
        if (lastSensor) {
            const diff = now - lastSensor.timestamp;
            if (diff < ONE_MINUTE) {
                // Chưa đủ 1 phút -> chỉ update status
                device.status = "online";
                device.lastActive = now;
                await device.save();
                return;
            }
        }

        // Insert khi đủ 1 phút
        await Sensor.create({
            deviceId: device._id,
            temperature: data.temp,
            humidity: data.hum,
            soilMoisture: data.soil,
            battery: data.bat ?? null,
            water: data.water ?? null,
            timestamp: data.timestamp ? new Date(data.timestamp) : now,
        });

        // Update device
        device.status = "online";
        device.lastActive = now;
        await device.save();
    } catch (err) {
        console.error("Save sensor error:", err.message);
    }
};
