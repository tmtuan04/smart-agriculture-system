import swaggerJSDoc from "swagger-jsdoc"

const SERVER_URL = 
    process.env.NODE_ENV === "production"
        ? `${process.env.BASE_URL}/api`
        : "http://localhost:3000/api";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Smart Agriculture System API",
            version: "1.0.0",
            description:
                "API documentation for Smart Agriculture System",
        },
        servers: [
            {
                url: SERVER_URL,
                description:
                    process.env.NODE_ENV === "production"
                        ? "Production server"
                        : "Local server",
            },
        ],
    },
    apis: ["./src/routes/*.js"], // quét comment trong routes
};

export const swaggerSpec = swaggerJSDoc(options);