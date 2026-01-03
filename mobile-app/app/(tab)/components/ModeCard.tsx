import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export type ModeType = "MANUAL" | "AUTO" | "AI";

type Props = {
    mode: ModeType;
    onChange: (mode: ModeType) => void;
};

export const ModeCard = ({ mode, onChange }: Props) => {
    const [isWatering, setIsWatering] = useState(false);
    const [elapsedMs, setElapsedMs] = useState(0);

    useEffect(() => {
        let interval: number | null = null;

        if (isWatering) {
            const start = Date.now() - elapsedMs;
            interval = setInterval(() => {
                setElapsedMs(Date.now() - start);
            }, 50);
        }

        return () => interval && clearInterval(interval);
    }, [isWatering]);

    const formatTime = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        const ms2 = Math.floor((ms % 1000) / 10);

        return `${String(m).padStart(2, "0")}:${String(s).padStart(
            2,
            "0"
        )}.${String(ms2).padStart(2, "0")}`;
    };

    return (
        <View style={styles.card}>
            <Text style={styles.title}>Chế độ hoạt động</Text>

            {/* Tabs */}
            <View style={styles.tabs}>
                {["MANUAL", "AUTO", "AI"].map((m) => (
                    <TouchableOpacity
                        key={m}
                        style={[styles.tab, mode === m && styles.activeTab]}
                        onPress={() => onChange(m as ModeType)}
                    >
                        <Text style={[styles.tabText, mode === m && styles.activeText]}>
                            {m}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.content}>
                {mode === "MANUAL" && (
                    <View style={styles.manualWrapper}>
                        {/* Status */}
                        <View style={styles.statusBadge}>
                            <View
                                style={[
                                    styles.dot,
                                    { backgroundColor: isWatering ? "#43A047" : "#BDBDBD" },
                                ]}
                            />
                            <Text style={styles.statusText}>
                                {isWatering ? "Đang tưới" : "Đang dừng"}
                            </Text>
                        </View>

                        {/* Timer */}
                        <Text style={styles.timer}>{formatTime(elapsedMs)}</Text>

                        {/* Controls */}
                        <View style={styles.controlRow}>
                            {/* Play / Pause */}
                            <View style={styles.controlItem}>
                                <TouchableOpacity
                                    style={[
                                        styles.circleBtn,
                                        isWatering && styles.activeCircle,
                                    ]}
                                    onPress={() => setIsWatering(!isWatering)}
                                >
                                    <Text style={styles.circleIcon}>
                                        {isWatering ? "| |" : "▶"}
                                    </Text>
                                </TouchableOpacity>

                                <Text style={styles.controlLabel}>
                                    {isWatering ? "Tạm dừng" : "Tưới"}
                                </Text>
                            </View>

                            {/* Reset */}
                            <View style={styles.controlItem}>
                                <TouchableOpacity
                                    style={styles.circleBtn}
                                    onPress={() => {
                                        setIsWatering(false);
                                        setElapsedMs(0);
                                    }}
                                >
                                    <Text style={styles.circleIcon}>■</Text>
                                </TouchableOpacity>

                                <Text style={styles.controlLabel}>Reset</Text>
                            </View>
                        </View>
                    </View>
                )}

                {mode === "AUTO" && (
                    <Text style={styles.modeText}>
                        Hệ thống tự động theo ngưỡng nhiệt độ & độ ẩm
                    </Text>
                )}

                {mode === "AI" && (
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

    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 16,
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

    /* ===== MANUAL ===== */
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
