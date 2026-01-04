import express from "express";
import cors from "cors";
import "dotenv/config";
import swaggerUI from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";
import { devLogger } from "./middlewares/morganLogger.js";
import { connectDB } from "./lib/db.js";
import { startMQTT } from "./mqtt/mqttClient.js";

import authRoutes from "./routes/auth.route.js";
import deviceRoutes from "./routes/device.route.js";
import sensorRoutes from "./routes/sensor.route.js";
import alertRoutes from "./routes/alert.route.js";
import deviceModeRoutes from "./routes/deviceMode.route.js";
import reportRoutes from "./routes/report.route.js";
import manualPumpRoutes from "./routes/manualPump.route.js";
import { startAutoScheduler } from "./services/scheduler.service.js";
import aiPumpRoutes from "./routes/aiPump.route.js";
import aiDecisionRoutes from "./routes/aiDecision.route.js";

const app = express();

// Middlewares
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(devLogger);
}
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.CLIENT_URL // mobile/web deploy
        : "http://localhost:8081", // local web dev
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/device", deviceRoutes);
app.use("/api/device", deviceModeRoutes);

app.use("/api/sensor", sensorRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/reports", reportRoutes);

app.use("/api/device", manualPumpRoutes);

app.use("/api/device", aiPumpRoutes);

app.use("/api/device", aiDecisionRoutes);

// Swagger UI
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

const port = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();
  startMQTT();
  startAutoScheduler();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
