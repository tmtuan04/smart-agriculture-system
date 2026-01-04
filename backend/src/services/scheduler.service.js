import DeviceMode from "../models/deviceMode.model.js";
import { runAutoPumpForDevice } from "./autoPump.service.js";

export const startAutoScheduler = () => {
    console.log("[AUTO][SCHEDULER] Started auto scheduler");

    setInterval(async () => {
        const now = new Date();
        const hour = now.getUTCHours();
        const minute = now.getUTCMinutes();

        console.log(
            `[AUTO][SCHEDULER] Tick at ${now.toISOString()} (UTC ${hour}:${minute})`
        );

        try {
            const devices = await DeviceMode.find({
                mode: "auto",
                "autoConfig.enabled": true,
                "autoConfig.schedule.hour": hour,
                "autoConfig.schedule.minute": minute,
            });

            console.log(
                `[AUTO][SCHEDULER] Found ${devices.length} device(s) scheduled`
            );

            for (const deviceMode of devices) {
                await runAutoPumpForDevice(deviceMode);
            }
        } catch (err) {
            console.error("[AUTO][SCHEDULER][ERROR]", err.message);
        }
    }, 60 * 1000);
};
