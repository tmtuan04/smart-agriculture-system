import { manualPumpControl } from "../services/manualPump.service.js";

export const controlManualPump = async (req, res) => {
    try {
        const { action } = req.body; // on | off
        const { id } = req.params;

        const result = await manualPumpControl({
            deviceId: id,
            action,
        });

        res.json({
            message: `Pump turned ${action}`,
            ...result,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
