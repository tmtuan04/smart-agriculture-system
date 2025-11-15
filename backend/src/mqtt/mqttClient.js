import mqtt from "mqtt";
import dotenv from "dotenv";

dotenv.config();

const host = process.env.HIVEMQ_CLUSTER_URL;
const port = process.env.HIVEMQ_CLUSTER_PORT;
const username = process.env.HIVEMQ_CLUSTER_USERNAME;
const password = process.env.HIVEMQ_CLUSTER_PASSWORD;
const topic = process.env.MQTT_TOPIC_SENSOR;

const options = {
  username,
  password,
  protocol: "mqtts",
  port: port,
};

const client = mqtt.connect(`mqtts://${host}`, options);

client.on("connect", () => {
  console.log("Connected to HiveMQ Cloud");
  client.subscribe(topic, (err) => {
    if (!err) console.log(`Subscribed to topic: ${topic}`);
  });
});

client.on("message", (topic, message) => {
  console.log(`Received from ${topic}: ${message.toString()}`);
});

export default client;
// import mqttClient from "./backend/src/mqtt/mqttClient.js";
// app.locals.mqttClient = mqttClient;
