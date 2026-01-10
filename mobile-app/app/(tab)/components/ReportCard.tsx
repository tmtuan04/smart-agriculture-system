import { View, Text, StyleSheet, Pressable } from "react-native";
import dayjs from "dayjs";

export type Report = {
    _id: string;
    reportDate: string;
    status: "completed" | "pending" | string;
    deviceId: {
        name: string;
        deviceId: string;
    };
    watering?: {
        totalDurationMinutes: number;
        totalSessions: number;
    };
    stats?: {
        temperature?: {
            avg: number;
            min: number;
            max: number;
        };
        humidity?: {
            avg: number;
            min: number;
            max: number;
        };
        soilMoisture?: {
            avg: number;
            min: number;
            max: number;
        };
    };
};

type Props = {
    report: Report;
    onPress?: () => void;
};

export const ReportCard = ({ report, onPress }: Props) => {
    const isCompleted = report.status === "completed";

    return (
        <Pressable onPress={onPress} style={styles.card}>
            {/* HÀNG ĐẦU TIÊN: CHỈ CHỨA NGÀY VÀ BADGE */}
            <View style={styles.topRow}>
                <Text style={styles.date}>
                    {dayjs(report.reportDate).format("DD/MM/YYYY")}
                </Text>

                <View
                    style={[
                        styles.statusBadge,
                        isCompleted ? styles.statusCompleted : styles.statusPending,
                    ]}
                >
                    <View
                        style={[
                            styles.statusDot,
                            { backgroundColor: isCompleted ? "#2E7D32" : "#EF6C00" },
                        ]}
                    />
                    <Text
                        style={[
                            styles.statusText,
                            { color: isCompleted ? "#2E7D32" : "#EF6C00" },
                        ]}
                    >
                        {report.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            {/* DÒNG THỨ 2: TÊN THIẾT BỊ (Nằm dưới ngày tháng) */}
            <Text style={styles.device}>
                {report.deviceId.name}
            </Text>

            {/* DÒNG CUỐI: THÔNG TIN WATERING */}
            <Text style={styles.row}>
                Watering: {report.watering?.totalSessions ?? 0} sessions ·{" "}
                {report.watering?.totalDurationMinutes ?? 0} min
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    // View bọc Ngày và Badge
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    date: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    device: {
        fontSize: 14,
        color: "#555",
        marginBottom: 12,
    },
    row: {
        fontSize: 14,
        color: "#333",
    },

    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusCompleted: {
        backgroundColor: "#E8F5E9",
    },
    statusPending: {
        backgroundColor: "#FFF3E0",
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "700",
    },
});