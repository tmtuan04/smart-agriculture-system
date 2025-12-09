import { BASE_URL } from "./config";

export const getDeviceByUser = async (ownerID: string) => {
    const response = await fetch(`${BASE_URL}/device/user/${ownerID}`, {
            method: "GET",
            headers: {"Content-Type": "application/json",},
        }
    );

    return response.json().then((data) => ({ ok: response.ok, data }));
};

