import crypto from "crypto";

const SECRET = process.env.MQTT_SECRET;

export function signMQTTData(data) {
    const payload = JSON.stringify(data);

    const auth_key = crypto
        .createHmac("sha256", SECRET)
        .update(payload)
        .digest("hex");

    return {
        data,
        auth_key,
    };
}