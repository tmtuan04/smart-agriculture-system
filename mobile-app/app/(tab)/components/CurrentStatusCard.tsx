import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusItem } from "./StatusItem";
import dayjs from "dayjs"

type SensorData = {
    temperature: number;
    soilMoisture: number;
    humidity: number;
    battery: number;
    water: number;
    createdAt: string;
};

type Props = {
    sensor: SensorData | null;
    loading: boolean;
    onRefresh: () => void;
};

export const CurrentStatusCard = ({ sensor, loading, onRefresh }: Props) => {
    return (
        <View style={styles.card}>
            {/* ===== Header ===== */}
            <View style={styles.header}>
                <Text style={styles.title}>Trạng thái hiện tại</Text>

                <TouchableOpacity
                    style={[styles.refreshBtn, loading && { opacity: 0.7 }]}
                    onPress={onRefresh}
                    disabled={loading}
                >
                    <MaterialCommunityIcons name="refresh" size={18} color="#1976D2" />
                    <Text style={styles.refreshText}>
                        {loading ? "ĐANG TẢI" : "LÀM MỚI"}
                    </Text>
                    {loading && <ActivityIndicator size="small" color="#1976D2" />}
                </TouchableOpacity>
            </View>

            <Text style={styles.updatedAtText}>
                Cập nhật lần cuối:{" "}
                {sensor
                    ? dayjs(sensor.createdAt).format("HH:mm:ss DD/MM/YYYY")
                    : "--"}
            </Text>

            {/* ===== Row 1 ===== */}
            <View style={styles.row}>
                <StatusItem
                    icon="thermometer"
                    color="#EF5350"
                    value={sensor ? `${sensor.temperature.toFixed(1)}°C` : "--"}
                    label="Nhiệt độ"
                />

                <StatusItem
                    icon="grass"
                    color="#66BB6A"
                    value={sensor ? `${sensor.soilMoisture}%` : "--"}
                    label="Độ ẩm đất"
                />

                <StatusItem
                    icon="water-outline"
                    color="#4FC3F7"
                    value={sensor ? `${sensor.humidity.toFixed(1)}%` : "--"}
                    label="Độ ẩm KK"
                />
            </View>

            {/* ===== Row 2 (NEW) ===== */}
            <View style={[styles.row, styles.secondRow]}>
                <StatusItem
                    icon="battery"
                    color={
                        sensor && sensor.battery < 20
                            ? "#E53935"
                            : "#43A047"
                    }
                    value={sensor ? `${sensor.battery.toFixed(0)}%` : "--"}
                    label="Pin"
                />

                <StatusItem
                    icon="cup-water"
                    color="#1E88E5"
                    value={sensor ? `${sensor.water.toFixed(1)} cm` : "--"}
                    label="Mức nước"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 8,
    },

    title: {
        fontSize: 16,
        fontWeight: "bold",
    },

    refreshBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: "#E3F2FD",
    },

    refreshText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#1976D2",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    secondRow: {
        marginTop: 20,
        justifyContent: "space-evenly",
    },
    updatedAtText: {
        fontSize: 12,
        color: "#757575",
        marginBottom: 12,
    },
});
