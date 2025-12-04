import { BASE_URL } from "./config";

export const getLatestSensor= async (deviceId: string) => { 
  const response = await fetch(`${BASE_URL}/sensor/latest/${deviceId}`, {
    method: "GET",
    headers: {"Content-Type": "application/json",},
  });

  return response.json().then((data) => ({ ok: response.ok, data }));
};
