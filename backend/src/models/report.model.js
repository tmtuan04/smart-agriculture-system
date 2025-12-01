import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true,
        },
        date: {
            type: String, // format: YYYY-MM-DD
            required: true,
        },
        // Cần check lại cái này
        avgTem: Number,
        avgHum: Number,
        maxTem: Number,
        minTem: Number,
    },
    { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;