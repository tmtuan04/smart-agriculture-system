import "dotenv/config";
import { publishMQTT } from "../mqtt/mqttClient.js";

export const startHeartbeat = () => {
    setInterval(() => {
        publishMQTT(
            process.env.MQTT_TOPIC_HEARTBEAT,
            {
                server_id: "FARM_CONTROL_CENTER",
                status: "ping",
                timestamp: new Date().toISOString(),
            },
            { sign: false }
        );
    }, 100000); // 1p
};
