import { BASE_URL } from "./config";

export type ModeType = "manual" | "auto" | "ai";

export const updateDeviceMode = async (deviceId: string, mode: ModeType) => {
    if (!deviceId) {
        throw new Error("deviceId is required");
    }

    const response = await fetch(
        `${BASE_URL}/device/${deviceId}/mode`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                accept: "*/*",
            },
            body: JSON.stringify({ mode }),
        }
    );

    const data = await response.json();
    return {
        ok: response.ok,
        data,
    };
};

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

// Update Auto Mode
type AutoConfigPayload = {
    schedule: {
        hour: number;
        minute: number;
    };
    thresholds: {
        soilMin: number;
        soilMax: number;
    };
    durationMinutes: number;
    enabled: boolean;
};

export const updateAutoMode = async (
    deviceId: string,
    payload: AutoConfigPayload
) => {
    const response = await fetch(
        `${BASE_URL}/device/${deviceId}/auto`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    const data = await response.json();

    console.log(data)

    return {
        ok: response.ok,
        data,
    };
};
