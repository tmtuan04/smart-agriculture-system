import mqtt from "mqtt";
import dotenv from "dotenv";

dotenv.config();

const host = process.env.HIVEMQ_CLUSTER_URL;
const port = process.env.HIVEMQ_CLUSTER_PORT;
const username = process.env.HIVEMQ_CLUSTER_USERNAME;
const password = process.env.HIVEMQ_CLUSTER_PASSWORD;
const topic = process.env.MQTT_TOPIC_SENSOR;

const client = mqtt.connect(`mqtts://${host}`, { username, password, port });

client.on("connect", () => {
  console.log("Connected to HiveMQ Cloud");

  setInterval(() => {
    const fakeData = {
      temperature: (20 + Math.random() * 10).toFixed(1),
      humidity: (40 + Math.random() * 20).toFixed(0),
      soilMoisture: Math.floor(300 + Math.random() * 100),
    };

    const payload = JSON.stringify(fakeData);
    client.publish(topic, payload, { qos: 1 }, (err) => {
      if (!err) console.log("Published:", payload);
    });
  }, 2000);
});

client.on("error", (err) => console.error("MQTT Error:", err));
