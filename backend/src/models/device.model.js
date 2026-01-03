import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
    {
        deviceId: {
            type: String,
            required: true,
            unique: true,
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId, // userId
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            require: true,
        },
        status: {
            type: String,
            enum: ["online", "offline"],
            default: "offline",
        },
        lastActive: {
            type: Date,
            default: null,
        },
        firmwareVersion: String,
        timezone: {
            type: String,
            default: "Asia/Ho_Chi_Minh",
        },
        location: {
            lat: Number,
            lng: Number,
        },
    },
    { timestamps: true }
);

const Device = mongoose.model("Device", deviceSchema);

export default Device;
