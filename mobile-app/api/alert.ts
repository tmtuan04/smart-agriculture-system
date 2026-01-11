import { BASE_URL } from "./config";

export type AlertType =
    | "temperature"
    | "humidity"
    | "soilMoisture"
    | "pump"
    | "system";

export type AlertSource =
    | "sensor"
    | "pump"
    | "system";

export interface DeviceInfo {
    _id: string;
    deviceId: string;
    name: string;
}

export interface Alert {
    _id: string;
    deviceId: DeviceInfo;
    type: AlertType;
    message: string;
    value?: number;
    source: AlertSource;
    status: "active" | "resolved";
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export const getAlerts = async (): Promise<Alert[]> => {
    const response = await fetch(`${BASE_URL}/alerts`);
    const json = await response.json();

    if (!json.success) {
        throw new Error("Failed to fetch alerts");
    }

    return json.data;
};

export const getAlertById = async (id: string): Promise<Alert> => {
    const response = await fetch(`${BASE_URL}/alerts/${id}`);
    const json = await response.json();

    if (!json.success) {
        throw new Error("Failed to fetch alert detail");
    }

    return json.data;
};

export const markAlertAsRead = async (id: string) => {
    const response = await fetch(`${BASE_URL}/alerts/${id}/read`, {
        method: "PATCH",
    });

    const json = await response.json();

    if (!json.success) {
        throw new Error("Failed to mark alert as read");
    }

    return json.data;
};

export const markAlertAsResolved = async (id: string) => {
    const response = await fetch(`${BASE_URL}/alerts/${id}/resolve`, {
        method: "PATCH",
    });

    const json = await response.json();

    if (!json.success) {
        throw new Error("Failed to mark alert as resolved");
    }

    return json.data;
};
