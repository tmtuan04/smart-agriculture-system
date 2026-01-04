import 'dotenv/config'

export const startHeartbeat = () => {
    setInterval(() => {
        publishMQTT(process.env.MQTT_TOPIC_HEARTBEAT, {
            server_id: "FARM_CONTROL_CENTER",
            status: "ping",
            timestamp: new Date().toISOString(),
        });
    }, 30000); // 30s
};