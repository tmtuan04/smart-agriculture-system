Model hiện tại

```js
// 1
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePic: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

// 2
const deviceSchema = new mongoose.Schema(
    {
        deviceId: {
            type: String,
            required: true,
            unique: true,
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
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
    },
    { timestamps: true }
);

const Device = mongoose.model("Device", deviceSchema);

// 3
const sensorSchema = new mongoose.Schema(
    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true,
        },
        // Thời điểm sensor gửi dữ liệu
        timestamp: {
            type: Date,
            default: Date.now,
            required: true,
        },
        // Nhiệt độ (°C)
        temperature: {
            type: Number,
            required: true,
        },
        // Độ ẩm (%)
        humidity: {
            type: Number,
            required: true,
        },
        // Độ ẩm đất (%)
        soilMoisture: {
            type: Number,
            required: true,
        },
        // Mức pin của thiết bị (%)
        battery: {
            type: Number,
            required: false, // Có thể optional nếu thiết bị chưa gửi
            default: null,
        },
        // Mức nước (m)
        water: {
            type: Number,
            required: false,
            default: null,
        },
    },
    { timestamps: true }
);

sensorSchema.index({ deviceId: 1, timestamp: 1 });

const Sensor = mongoose.model("Sensor", sensorSchema);

// 4
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

        // Trạng thái kỹ thuật (hệ thống)
        status: {
            type: String,
            enum: ["active", "resolved"],
            default: "active",
        },

        // Trạng thái người dùng
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Alert", alertSchema);

// 5
const reportSchema = new mongoose.Schema(
    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true,
            index: true,
        },
        reportDate: {
            type: Date,
            required: true,
            index: true,
        },
        timezone: {
            type: String,
            default: "UTC", // ví dụ: Asia/Ho_Chi_Minh
        },
        period: {
            startAt: Date,
            endAt: Date,
        },
        stats: {
            temperature: {
                avg: Number,
                min: Number,
                max: Number,
            },
            humidity: {
                avg: Number,
                min: Number,
                max: Number,
            },
            soilMoisture: {
                avg: Number,
                min: Number,
                max: Number,
            },
        },
        sampleCount: {
            type: Number, // số bản ghi sensor dùng để tính
            default: 0,
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
        },
        errorMessage: {
            type: String,
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Mỗi device chỉ có 1 report / ngày
reportSchema.index(
    { deviceId: 1, reportDate: 1 },
    { unique: true }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;

// 6
const deviceModeConfigSchema = new mongoose.Schema({
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",
        required: true,
        unique: true, // 1 device chỉ có 1 config active (cần xem lại cái này)
    },
    mode: {
        type: String,
        enum: ["manual", "auto", "ai"],
        required: true,
        default: "manual",
    },

    // Mode 1: Manual
    manualConfig: {
        isPumpOn: {
            type: Boolean,
            default: false,
        },
        startedAt: {
            type: Date,
            default: null,
        },
        stoppedAt: {
            type: Date,
            default: null,
        },
        // Vẫn cho phép set ngưỡng (để cảnh báo) -> Cảnh báo người dùng nếu quên tắt bơm
        // Bộ đếm: now - startedAt
        thresholds: {
            soilMin: Number,
            soilMax: Number,
        },
    },

    // Mode 2: Auto
    autoConfig: {
        schedule: {
            hour: Number, // mấy giờ trong ngày
            minute: Number,
        },
        duration: {
            type: Number, // phút
        },

        thresholds: {
            soilMin: Number,
            soilMax: Number,
        },

        enabled: {
            type: Boolean,
            default: true,
        },
    },

    // Mode 3: AI (không nên lưu vào đây -> tạo collection riêng)
    aiConfig: {
        enabled: {
            type: Boolean,
            default: false,
        },
        lastDecision: {
            type: String,
            enum: ["water", "skip"],
        },
        confidence: {
            type: Number, // %
        },
    },
})

const DeviceMode = mongoose.model("DeviceMode", deviceModeConfigSchema);

export default DeviceMode;
```