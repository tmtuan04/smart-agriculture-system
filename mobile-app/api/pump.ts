import { BASE_URL } from "./config";

// https://smart-agriculture-system-f2wg.onrender.com/api/device/6935513b52ef8c9bda001fcc/manual/pump

export const manualPump = async (
    deviceId: string,
    action: "on" | "off"
) => {
    const response = await fetch(
        `${BASE_URL}/device/${deviceId}/manual/pump`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action }),
        }
    );

    return response.json().then((data) => ({
        ok: response.ok,
        data,
    }));
};