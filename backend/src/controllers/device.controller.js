import Device from "../models/device.model.js"

export const getUserDevices = async (req, res) => {
    try {
        const devices = await Device.find({ ownerId: req.params.ownerId });
        res.json(devices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getDeviceById = async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (!device) return res.status(404).json({ message: "Device not found" });
        res.json(device);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateDevice = async (req, res) => {
    try {
        const device = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(device);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};