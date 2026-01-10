import { BASE_URL } from "./config";

export const getReportsApi = async () => {
    try {
        const res = await fetch(`${BASE_URL}/reports`, {
            method: "GET",
            headers: {
                accept: "*/*",
            },
        });

        const data = await res.json();

        return {
            ok: res.ok,
            status: res.status,
            data,
        };
    } catch (error) {
        console.error("getReportsApi error:", error);
        return {
            ok: false,
            status: 500,
            data: null,
        };
    }
};

export const getReportDetailApi = async (reportId: string) => {
    try {
        const res = await fetch(`${BASE_URL}/reports/${reportId}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
        });

        const data = await res.json();

        return {
            ok: res.ok,
            data: data.data, // backend bọc trong { success, data }
        };
    } catch (error) {
        console.error("getReportDetailApi error:", error);
        return {
            ok: false,
            data: null,
        };
    }
};