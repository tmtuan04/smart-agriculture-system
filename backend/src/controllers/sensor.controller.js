import Sensor from "../models/sensor.model.js"

export const insertSensorData = async (req, res) => {
    try {
        const data = await Sensor.create(req.body);
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getLatestSensor = async (req, res) => {
    try {
        const sensor = await Sensor.findOne({ deviceId: req.params.deviceId })
            .sort({ timestamp: -1 });

        if (!sensor) return res.status(404).json({ message: "No sensor data" });

        res.json(sensor);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};