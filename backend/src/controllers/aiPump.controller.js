import Device from "../models/device.model.js";
import DeviceMode from "../models/deviceMode.model.js";
import { runAIAutoPumpForDevice } from "../services/aiPump.service.js";
import { startAILoop, stopAILoop } from "../services/aiPump.service.js";

export const activateAIMode = async (req, res) => {
  const { id } = req.params;
  console.log(`[API] Request to activate AI Mode for device ${id}`);

  try {
    // TÌM THIẾT BỊ
    const device = await Device.findById(id);
    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found.",
      });
    }

    // CẬP NHẬT CẤU HÌNH MODE
    await DeviceMode.findOneAndUpdate(
      { deviceId: id },
      { mode: "ai" }, // Set mode thành 'ai'
      { upsert: true, new: true }
    );

    device.currentMode = "ai";
    await device.save();

    console.log(`[API] Device ${id} switched to AI MODE.`);

    // CHẠY LUẬT KIỂM TRA AI ĐỊNH KỲ
    stopAILoop({ deviceId: id }); // Dừng nếu có vòng lặp cũ
    startAILoop({ deviceId: id }); // Bắt đầu vòng lặp mới

    return res.status(200).json({
      success: true,
      message:
        "Device switched to AI Mode. AI analysis is running in background.",
      currentMode: "ai",
    });
  } catch (error) {
    console.error("[API] Activate AI Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
