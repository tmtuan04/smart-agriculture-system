import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { manualPump } from "@/api/pump";

export type ModeType = "MANUAL" | "AUTO" | "AI";

type Props = {
    deviceId: string;
    activeMode: ModeType;
    selectedMode: ModeType;
    onChange: (mode: ModeType) => void;
};

export const ModeCard = ({
    deviceId,
    activeMode,
    selectedMode,
    onChange,
}: Props) => {
    const [isWatering, setIsWatering] = useState(false);
    const [elapsedMs, setElapsedMs] = useState(0);

    useEffect(() => {
        let interval: number | null = null;

        if (isWatering && activeMode === "MANUAL") {
            const start = Date.now() - elapsedMs;
            interval = setInterval(() => {
                setElapsedMs(Date.now() - start);
            }, 50);
        }

        return () => interval && clearInterval(interval);
    }, [isWatering, activeMode, elapsedMs]);

    const formatTime = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        const ms2 = Math.floor((ms % 1000) / 10);

        return `${String(m).padStart(2, "0")}:${String(s).padStart(
            2,
            "0"
        )}.${String(ms2).padStart(2, "0")}`;
    };

    const handleTogglePump = async () => {
        if (activeMode !== "MANUAL") return;

        const action = isWatering ? "off" : "on";

        const res = await manualPump(deviceId, action);

        console.log(res)

        if (!res.ok) {
            alert("Không thể điều khiển bơm");
            return;
        }

        if (action === "on") {
            setIsWatering(true);
        } else {
            setIsWatering(false);
            alert("Dừng tưới thành công");
        }
    };

    const handleReset = async () => {
        if (activeMode !== "MANUAL") return;

        const res = await manualPump(deviceId, "off");

        if (res.ok) {
            setIsWatering(false);
            setElapsedMs(0);
            alert("Reset và dừng tưới thành công");
        } else {
            alert("Không thể dừng bơm");
        }
    };

    return (
        <View style={styles.card}>
            {/* ===== HEADER ===== */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>Chế độ hoạt động</Text>

                {/* Badge lấy từ API – KHÔNG đổi theo tab */}
                <View style={styles.modeBadge}>
                    <View
                        style={[
                            styles.modeDot,
                            { backgroundColor: "#43A047" },
                        ]}
                    />
                    <Text style={styles.modeBadgeText}>
                        {activeMode}
                    </Text>
                </View>
            </View>

            <View style={styles.tabs}>
                {(["MANUAL", "AUTO", "AI"] as ModeType[]).map((m) => (
                    <TouchableOpacity
                        key={m}
                        style={[
                            styles.tab,
                            selectedMode === m && styles.activeTab,
                        ]}
                        onPress={() => onChange(m)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                selectedMode === m && styles.activeText,
                            ]}
                        >
                            {m}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* ===== CONTENT ===== */}
            <View style={styles.content}>
                {selectedMode === "MANUAL" && activeMode !== "MANUAL" && (
                    <Text style={styles.modeText}>
                        Chỉ có thể điều khiển khi hệ thống đang ở chế độ MANUAL
                    </Text>
                )}
                {selectedMode === "MANUAL" && (
                    <View style={styles.manualWrapper}>
                        {/* Status */}
                        <View style={styles.statusBadge}>
                            <View
                                style={[
                                    styles.dot,
                                    {
                                        backgroundColor: isWatering
                                            ? "#43A047"
                                            : "#BDBDBD",
                                    },
                                ]}
                            />
                            <Text style={styles.statusText}>
                                {isWatering ? "Đang tưới" : "Đang dừng"}
                            </Text>
                        </View>

                        {/* Timer */}
                        <Text style={styles.timer}>
                            {formatTime(elapsedMs)}
                        </Text>

                        {/* Controls */}
                        <View style={styles.controlRow}>
                            <View style={styles.controlItem}>
                                <TouchableOpacity
                                    style={[
                                        styles.circleBtn,
                                        isWatering && styles.activeCircle,
                                    ]}
                                    onPress={handleTogglePump}
                                >
                                    <Text style={styles.circleIcon}>
                                        {isWatering ? "| |" : "▶"}
                                    </Text>
                                </TouchableOpacity>

                                <Text style={styles.controlLabel}>
                                    {isWatering ? "Tạm dừng" : "Tưới"}
                                </Text>
                            </View>

                            <View style={styles.controlItem}>
                                <TouchableOpacity
                                    style={styles.circleBtn}
                                    onPress={handleReset}
                                >
                                    <Text style={styles.circleIcon}>■</Text>
                                </TouchableOpacity>

                                <Text style={styles.controlLabel}>
                                    Reset
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {selectedMode === "AUTO" && (
                    <Text style={styles.modeText}>
                        Hệ thống tự động theo ngưỡng nhiệt độ & độ ẩm
                    </Text>
                )}

                {selectedMode === "AI" && (
                    <Text style={styles.modeText}>
                        AI phân tích dữ liệu và tối ưu tưới tiêu 🌱
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    title: {
        fontSize: 16,
        fontWeight: "bold",
    },

    modeBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F7FA",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },

    modeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },

    modeBadgeText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#616161",
    },

    tabs: {
        flexDirection: "row",
        backgroundColor: "#F1F3F5",
        borderRadius: 12,
        padding: 4,
        marginBottom: 8,
    },

    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: "center",
        borderRadius: 10,
    },

    activeTab: {
        backgroundColor: "#fff",
    },

    tabText: {
        color: "#757575",
        fontWeight: "600",
    },

    activeText: {
        color: "#1976D2",
    },

    content: {
        paddingTop: 8,
    },

    modeText: {
        fontSize: 14,
        color: "#424242",
    },

    manualWrapper: {
        alignItems: "center",
        paddingTop: 36,
    },

    statusBadge: {
        position: "absolute",
        top: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F7FA",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },

    statusText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#616161",
    },

    timer: {
        fontSize: 32,
        fontWeight: "700",
        color: "#1976D2",
        letterSpacing: 1,
        marginBottom: 16,
    },

    controlRow: {
        flexDirection: "row",
        gap: 32,
    },

    circleBtn: {
        width: 48,
        height: 48,
        borderRadius: 36,
        backgroundColor: "#F1F3F5",
        alignItems: "center",
        justifyContent: "center",
    },

    activeCircle: {
        backgroundColor: "#E3F2FD",
    },

    circleIcon: {
        fontSize: 24,
        fontWeight: "700",
        color: "#1976D2",
    },

    controlItem: {
        alignItems: "center",
    },

    controlLabel: {
        marginTop: 6,
        fontSize: 13,
        color: "#616161",
        fontWeight: "500",
    },
});
