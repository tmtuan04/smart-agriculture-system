import mqtt from "mqtt";
import "dotenv/config";
import { saveSensorFromMQTT } from "../services/sensor.service.js";
import { startHeartbeat } from "../services/mqtt.service.js";

let mqttClient = null;

export const startMQTT = () => {
    const MQTT_URL = `mqtts://${process.env.MQTT_HOST}:${
        process.env.MQTT_PORT || 8883
    }`;

    mqttClient = mqtt.connect(MQTT_URL, {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        clean: true,
        connectTimeout: 10000,
        reconnectPeriod: 1000,
    });

    mqttClient.on("connect", () => {
        console.log("MQTT Connected");
        mqttClient.subscribe(process.env.MQTT_TOPIC_PUB, () => {
            console.log("MQTT Subscribed");
        });
        startHeartbeat();
    });

    mqttClient.on("message", async (_, message) => {
        try {
            const payload = JSON.parse(message.toString());

            console.log(payload)
            await saveSensorFromMQTT(payload);
        } catch {
            console.warn("Invalid MQTT payload:", message.toString());
        }
    });

    mqttClient.on("error", (err) => {
        console.error("MQTT Error:", err.message);
    });
};

export const publishMQTT = (topic, payload) => {
    if (!mqttClient || !mqttClient.connected) {
        console.warn("MQTT not connected");
        return;
    }

    console.log(payload);

    mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 });
};
