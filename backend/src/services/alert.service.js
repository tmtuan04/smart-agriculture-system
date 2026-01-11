import Alert from "../models/alert.model.js";
import Device from "../models/device.model.js";

const ALERT_COOLDOWN_MS = 10 * 60 * 1000; // 10 phút

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

        const lastAlert = await Alert.findOne({
            deviceId: device._id,
            type: alertType,
        }).sort({ createdAt: -1 });

        const now = Date.now();

        if (lastAlert) {
            const diff = now - lastAlert.createdAt.getTime();

            if (diff < ALERT_COOLDOWN_MS) {
                console.log(
                    `[ALERT SKIP] ${alertType} - ${device.deviceId} (${Math.round(
                        diff / 1000
                    )}s ago)`
                );
                return;
            }
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

        console.log("Alert saved:", alertType, "-", device.deviceId);
    } catch (err) {
        console.error("Save alert error:", err.message);
    }
};
