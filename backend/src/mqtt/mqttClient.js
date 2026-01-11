import mqtt from "mqtt";
import "dotenv/config";
import { saveSensorFromMQTT } from "../services/sensor.service.js";
import { startHeartbeat } from "../services/mqtt.service.js";
import { saveAlertFromMQTT } from "../services/alert.service.js";
import { signMQTTData } from "../lib/mqttAuth.js";

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
        mqttClient.subscribe([process.env.MQTT_TOPIC_PUB, process.env.MQTT_TOPIC_ALERT], () => {
            console.log("MQTT Subscribed");
        });
        startHeartbeat();
    });

    mqttClient.on("message", async (topic, message) => {
        try {
            const payload = JSON.parse(message.toString());

            console.log("MQTT:", topic, payload);

            // Sensor data
            if (topic == process.env.MQTT_TOPIC_PUB) {
                await saveSensorFromMQTT(payload);
            }

            // Alert
            if (topic == process.env.MQTT_TOPIC_ALERT) {
                await saveAlertFromMQTT(payload);
            }
        } catch {
            console.warn("Invalid MQTT payload:", message.toString());
        }
    });

    mqttClient.on("error", (err) => {
        console.error("MQTT Error:", err.message);
    });
};

export const publishMQTT = (topic, rawData) => {
    if (!mqttClient || !mqttClient.connected) {
        console.warn("MQTT not connected");
        return;
    }

    const signedPayload = signMQTTData(rawData);

    mqttClient.publish(
        topic,
        JSON.stringify(signedPayload),
        { qos: 1 }
    );
};
