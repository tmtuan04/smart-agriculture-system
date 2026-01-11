import Alert from "../models/alert.model.js";
import Device from "../models/device.model.js";

// 5 phút mới lưu vào db

export const saveAlertFromMQTT = async (data) => {
    try {
        if (!data.device_id || !data.alert?.type || !data.alert?.message) {
            console.warn("Invalid alert payload:", data);
            return;
        }

        const device = await Device.findOne({ deviceId: data.device_id });
        if (!device) {
            console.warn("Device not found for alert:", data.device_id);
            return;
        }

        const { type, message, currentValue } = data.alert;

        // Map MQTT alert type → schema type
        let alertType;
        let source;

        switch (type) {
            case "water":
                alertType = "system";
                source = "system";
                break;

            case "pumpTimeout":
                alertType = "pump";
                source = "pump";
                break;

            case "soilMoisture":
                alertType = "soilMoisture";
                source = "sensor";
                break;

            default:
                console.warn("Unknown alert type:", type);
                return;
        }

        await Alert.create({
            deviceId: device._id,
            type: alertType,
            message,
            value: typeof currentValue === "number" ? currentValue : null,
            source,
            status: "active",
            isRead: false,
            createdAt: data.epoch
                ? new Date(data.epoch * 1000)
                : new Date(),
        });

        console.log("Alert saved:", type, "-", device.deviceId);
    } catch (err) {
        console.error("Save alert error:", err.message);
    }
};
