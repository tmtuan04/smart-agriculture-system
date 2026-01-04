import mongoose from "mongoose";

const aiDecisionSchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },
    // Quyết định của AI: Bật hoặc Tắt
    action: {
      type: String,
      enum: ["on", "off"],
      required: true,
    },
    // (Tùy chọn) Lưu ngữ cảnh môi trường để biết tại sao AI lại quyết định thế
    context: {
      temperature: Number,
      humidity: Number,
      soilMoisture: Number,
    },
  },
  { timestamps: true }
);

const AiDecision = mongoose.model("AiDecision", aiDecisionSchema);

export default AiDecision;
