import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true,
        },
        type: {
            type: String,
            enum: ["temperature", "humidity", "soilMoisture"],
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        value: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["unread", "read", "resolved"],
            default: "unread",
        },
    },
    { timestamps: true }
);

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;