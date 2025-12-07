import Alert from "../models/alert.model.js";
import Device from "../models/device.model.js";

export const getAlerts = async (req, res) => {
    try {
        const { deviceId, type, status, isRead } = req.query;
        
        const filter = {};

        if (deviceId) filter.deviceId = deviceId;
        if (type) filter.type = type;
        if (status) filter.status = status;
        if (isRead !== undefined) filter.isRead = isRead === "true";

        const alerts = await Alert.find(filter)
            .sort({ createdAt: -1 })
            .populate("deviceId", "name deviceId");

        res.status(200).json({
            success: true,
            count: alerts.length,
            data: alerts,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAlertById = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id)
            .populate("deviceId", "name deviceId");

        if (!alert) {
            return res.status(404).json({ success: false, message: "Alert not found" });
        }

        res.status(200).json({ success: true, data: alert });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAlertAsRead = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ success: false, message: "Alert not found" });
        }

        alert.isRead = true;
        await alert.save();

        res.status(200).json({
            success: true,
            message: "Alert marked as read",
            data: alert,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAlertAsResolved = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ success: false, message: "Alert not found" });
        }

        alert.status = "resolved";
        await alert.save();

        res.status(200).json({
            success: true,
            message: "Alert marked as resolved",
            data: alert,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
