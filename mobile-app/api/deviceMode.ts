import { BASE_URL } from "./config";

// https://smart-agriculture-system-f2wg.onrender.com/api/device/6935513b52ef8c9bda001fcc/mode-config

// Lấy mode, config hiện tại
export const getCurrentMode = async (deviceId: string) => {
    const response = await fetch(
        `${BASE_URL}/device/${deviceId}/mode-config`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );

    const data = await response.json();
    return {
        ok: response.ok,
        data,
    };
};

// Update mode
// Update config theo mode
