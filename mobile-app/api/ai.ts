import { BASE_URL } from "./config";

// --- TYPES ---
// Định nghĩa kiểu dữ liệu trả về để khi code UI nó tự gợi ý (Intellisense)
export interface AiDecision {
  _id: string;
  deviceId: string;
  action: "on" | "off";
  context: {
    temperature: number;
    humidity: number;
    soilMoisture: number;
  };
  createdAt: string;
  updatedAt: string;
}

// --- API FUNCTIONS ---

// 1. Lấy dữ liệu cảm biến mới nhất (Cũ)
export const getLatestSensor = async (deviceId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/sensor/latest/${deviceId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.json().then((data) => ({ ok: response.ok, data }));
  } catch (error) {
    console.error("API Error (getLatestSensor):", error);
    return { ok: false, data: null };
  }
};

// 2. Lấy quyết định AI mới nhất (Dùng cho ModeCard Dashboard)
export const getLatestDecision = async (deviceId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/device/${deviceId}/ai/latest`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return response.json().then((data) => ({ ok: response.ok, data }));
  } catch (error) {
    console.error("API Error (getLatestDecision):", error);
    return { ok: false, data: null };
  }
};

// 3. Lấy lịch sử quyết định AI (Dùng cho màn hình History/Log)
export const getDecisionHistory = async (
  deviceId: string,
  page = 1,
  limit = 20
) => {
  try {
    const response = await fetch(
      `${BASE_URL}/device/${deviceId}/ai/history?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.json().then((data) => ({ ok: response.ok, data }));
  } catch (error) {
    console.error("API Error (getDecisionHistory):", error);
    return { ok: false, data: null };
  }
};
