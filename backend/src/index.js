import express from "express";
import cors from "cors";
import "dotenv/config";
import swaggerUI from "swagger-ui-express";

import { swaggerSpec } from "./docs/swagger.js";
import { devLogger } from "./middlewares/morganLogger.js";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";

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
                ? process.env.CLIENT_URL        // mobile/web deploy
                : "http://localhost:8081",      // local web dev
        credentials: true,
    })
);

// Routes
app.use("/api/auth", authRoutes);

// Swagger UI
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV} on port ${port}`
    );
    console.log(
        `Swagger: ${process.env.NODE_ENV === "production"
            ? `${process.env.BASE_URL}/api-docs`
            : `http://localhost:${port}/api-docs`}`
    );

    connectDB();
});