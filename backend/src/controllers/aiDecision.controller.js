import AiDecision from "../models/aiDecision.model.js";
import Device from "../models/device.model.js";

// [GET] Lấy lịch sử quyết định (Phân trang)
export const getDecisionHistory = async (req, res) => {
  const { deviceId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  try {
    const decisions = await AiDecision.find({ deviceId })
      .sort({ createdAt: -1 }) // Mới nhất lên đầu
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await AiDecision.countDocuments({ deviceId });

    return res.status(200).json({
      success: true,
      data: decisions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get AI History Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

// [GET] Lấy quyết định mới nhất (Để hiển thị Dashboard)
export const getLatestDecision = async (req, res) => {
  const { deviceId } = req.params;

  try {
    const latest = await AiDecision.findOne({ deviceId }).sort({
      createdAt: -1,
    });

    if (!latest) {
      return res
        .status(404)
        .json({ success: false, message: "No AI decisions found." });
    }

    return res.status(200).json({
      success: true,
      data: latest,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

export const createDecision = async (req, res) => {
  const { deviceId } = req.params;
  const { action, context } = req.body;

  try {
    // 1. Validate Input
    if (!["on", "off"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'on' or 'off'.",
      });
    }

    // 2. Check Device tồn tại
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found.",
      });
    }

    // 3. Tạo record mới
    const newDecision = await AiDecision.create({
      deviceId,
      action,
      context: context || {
        // Giá trị mặc định nếu không gửi context
        temperature: 0,
        humidity: 0,
        soilMoisture: 0,
      },
      timestamps: Date.now(),
    });

    return res.status(201).json({
      success: true,
      message: "AI Decision created successfully.",
      data: newDecision,
    });
  } catch (error) {
    console.error("Create AI Decision Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
