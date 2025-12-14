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
        timestamp: {
            type: Date,
            default: Date.now,
        },
        // Nhiệt độ
        temperature: {
            type: Number,
            required: true,
        },
        // Độ ẩm
        humidity: {
            type: Number,
            required: true,
        },
        // Độ ẩm đất
        soilMoisture: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

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
```