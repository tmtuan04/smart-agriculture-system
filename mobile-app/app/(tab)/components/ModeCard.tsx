import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { manualPump } from "@/api/pump";
import dayjs from "dayjs";
import { getCurrentMode, updateAutoMode, updateDeviceMode } from "@/api/deviceMode";

// UI
export type ModeType = "MANUAL" | "AUTO" | "AI";

// Backend
type ApiModeType = "manual" | "auto" | "ai";

const mapUIToApiMode = (mode: ModeType): ApiModeType =>
    mode.toLowerCase() as ApiModeType;

const mapApiToUIMode = (mode: ApiModeType): ModeType =>
    mode.toUpperCase() as ModeType;

type Props = {
    deviceId: string;
    activeMode: ModeType;
    selectedMode: ModeType;
    onChange: (mode: ModeType) => void;
    onModeChanged: () => Promise<void>;
};

export const ModeCard = ({
    deviceId,
    activeMode,
    selectedMode,
    onChange,
    onModeChanged
}: Props) => {
    const [isWatering, setIsWatering] = useState(false);
    const [elapsedMs, setElapsedMs] = useState(0);
    const [autoSoilMin, setAutoSoilMin] = useState(40);
    const [autoSoilMax, setAutoSoilMax] = useState(80);

    const [scheduleHour, setScheduleHour] = useState(7);
    const [scheduleMinute, setScheduleMinute] = useState(30);
    const [countdown, setCountdown] = useState("");

    const [duration, setDuration] = useState(15);
    const [saving, setSaving] = useState(false);

    const [showModeModal, setShowModeModal] = useState(false);
    const [changingMode, setChangingMode] = useState(false);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;

        if (selectedMode === "AUTO") {
            const updateCountdown = () => {
                const now = dayjs();

                let target = dayjs()
                    .hour(scheduleHour)
                    .minute(scheduleMinute)
                    .second(0);

                if (target.isBefore(now)) {
                    target = target.add(1, "day");
                }

                const diff = target.diff(now);

                const hours = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);

                setCountdown(
                    `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
                );
            };

            updateCountdown();
            interval = setInterval(updateCountdown, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [selectedMode, scheduleHour, scheduleMinute]);

    useEffect(() => {
        const fetchModeConfig = async () => {
            try {
                const res = await getCurrentMode(deviceId);

                if (!res.ok) return;

                const cfg = res.data;

                // ===== AUTO =====
                if (cfg.autoConfig) {
                    setAutoSoilMin(cfg.autoConfig.thresholds.soilMin);
                    setAutoSoilMax(cfg.autoConfig.thresholds.soilMax);

                    // UTC -> VN (GMT+7)
                    let localHour = cfg.autoConfig.schedule.hour + 7;
                    if (localHour >= 24) localHour -= 24;

                    setScheduleHour(localHour);
                    setScheduleMinute(cfg.autoConfig.schedule.minute);

                    setDuration(cfg.autoConfig.durationMinutes ?? 1);
                }
            } catch (err) {
                console.log("Load mode config error:", err);
            }
        };

        fetchModeConfig();
    }, [deviceId]);

    useEffect(() => {
        if (activeMode !== "MANUAL") return;
        if (!isWatering) return;

        const start = Date.now();

        const interval = setInterval(() => {
            setElapsedMs(prev => prev + 100);
        }, 100);

        return () => clearInterval(interval);
    }, [isWatering, activeMode]);

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

    const handleSaveAutoConfig = async () => {
        try {
            setSaving(true);

            const payload = {
                schedule: {
                    hour: scheduleHour,
                    minute: scheduleMinute,
                },
                thresholds: {
                    soilMin: autoSoilMin,
                    soilMax: autoSoilMax,
                },
                durationMinutes: duration,
                enabled: true,
            };

            console.log("SAVE AUTO CONFIG:", payload);

            const res = await updateAutoMode(deviceId, payload);

            if (!res.ok) {
                alert("Lưu cấu hình AUTO thất bại");
                return;
            }

            alert("Lưu cấu hình AUTO thành công");
        } catch (err) {
            console.log("Save auto config error:", err);
            alert("Có lỗi xảy ra khi lưu cấu hình");
        } finally {
            setSaving(false);
        }
    };

    const handleChangeMode = async (mode: ModeType) => {
        if (mode === activeMode) {
            setShowModeModal(false);
            return;
        }

        try {
            setChangingMode(true);

            const res = await updateDeviceMode(
                deviceId,
                mapUIToApiMode(mode)
            );

            if (!res.ok) {
                alert("Đổi chế độ thất bại");
                return;
            }

            await onModeChanged();
            onChange(mode); // để tab sync theo mode mới
            setShowModeModal(false);
        } catch (err) {
            console.log("Change mode error:", err);
            alert("Có lỗi xảy ra khi đổi chế độ");
        } finally {
            setChangingMode(false);
        }
    };


    return (
        <View style={styles.card}>
            {/* ===== HEADER ===== */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>Chế độ hoạt động</Text>

                <TouchableOpacity style={styles.modeBadge} onPress={() => setShowModeModal(true)}>
                    <View
                        style={[
                            styles.modeDot,
                            { backgroundColor: "#43A047" },
                        ]}
                    />
                    <Text style={styles.modeBadgeText}>
                        {activeMode}
                    </Text>
                </TouchableOpacity>
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
                    <View>
                        <View style={styles.statusBadge}>
                            <View style={[styles.dot, { backgroundColor: "#1976D2" }]} />
                            <Text style={styles.statusText}>
                                Tự động sau: {countdown}
                            </Text>
                        </View>
                        {/* --- Ngưỡng độ ẩm --- */}
                        <Text style={styles.sectionTitle}>Ngưỡng độ ẩm đất (%)</Text>

                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>Tối thiểu (Min)</Text>
                            <View style={styles.stepperContainer}>
                                <TouchableOpacity style={styles.stepClick} onPress={() => setAutoSoilMin(v => Math.max(0, v - 5))}>
                                    <Text style={styles.stepBtnText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.stepperValue}>{autoSoilMin}</Text>
                                <TouchableOpacity style={styles.stepClick} onPress={() => setAutoSoilMin(v => v + 5)}>
                                    <Text style={styles.stepBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>Tối đa (Max)</Text>
                            <View style={styles.stepperContainer}>
                                <TouchableOpacity style={styles.stepClick} onPress={() => setAutoSoilMax(v => Math.max(autoSoilMin + 5, v - 5))}>
                                    <Text style={styles.stepBtnText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.stepperValue}>{autoSoilMax}</Text>
                                <TouchableOpacity style={styles.stepClick} onPress={() => setAutoSoilMax(v => v + 5)}>
                                    <Text style={styles.stepBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* --- Thời gian --- */}
                        <Text style={styles.sectionTitle}>Lịch tưới định kỳ</Text>

                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>Giờ bắt đầu</Text>
                            <View style={styles.stepperContainer}>
                                <TouchableOpacity style={styles.stepClick} onPress={() => setScheduleHour(h => (h + 23) % 24)}>
                                    <Text style={styles.stepBtnText}>−</Text>
                                </TouchableOpacity>
                                {/* Format 00:00 */}
                                <Text style={styles.stepperValue}>
                                    {String(scheduleHour).padStart(2, '0')}:{String(scheduleMinute).padStart(2, '0')}
                                </Text>
                                <TouchableOpacity style={styles.stepClick} onPress={() => setScheduleHour(h => (h + 1) % 24)}>
                                    <Text style={styles.stepBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>Thời lượng tưới</Text>
                            <View style={styles.stepperContainer}>
                                <TouchableOpacity style={styles.stepClick} onPress={() => setDuration(d => Math.max(1, d - 1))}>
                                    <Text style={styles.stepBtnText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.stepperValue}>{duration} phút</Text>
                                <TouchableOpacity style={styles.stepClick} onPress={() => setDuration(d => d + 1)}>
                                    <Text style={styles.stepBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.saveBtn}
                            onPress={handleSaveAutoConfig}
                            disabled={saving}
                        >
                            <Text style={styles.saveText}>
                                {saving ? "Đang lưu..." : "Lưu cấu hình"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {selectedMode === "AI" && (
                    <Text style={styles.modeText}>
                        AI phân tích dữ liệu và tối ưu tưới tiêu 🌱
                    </Text>
                )}
            </View>
            <Modal
                transparent
                animationType="fade"
                visible={showModeModal}
                onRequestClose={() => setShowModeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Chọn chế độ hoạt động</Text>

                        {(["MANUAL", "AUTO", "AI"] as ModeType[]).map((m) => (
                            <TouchableOpacity
                                key={m}
                                style={[
                                    styles.modeOption,
                                    activeMode === m && styles.activeModeOption,
                                ]}
                                onPress={() => handleChangeMode(m)}
                                disabled={changingMode}
                            >
                                <Text
                                    style={[
                                        styles.modeOptionText,
                                        activeMode === m && styles.activeModeText,
                                    ]}
                                >
                                    {m}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => setShowModeModal(false)}
                        >
                            <Text style={styles.cancelText}>Huỷ</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#9E9E9E",
        textTransform: "uppercase",
        marginTop: 32,
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    settingRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    settingLabel: {
        fontSize: 15,
        color: "#424242",
        fontWeight: "500",
    },
    stepperContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F7FA",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        overflow: "hidden",
    },
    stepClick: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#E3F2FD",
    },
    stepBtnText: {
        fontSize: 18,
        color: "#1976D2",
        fontWeight: "bold",
    },
    stepperValue: {
        minWidth: 60, // Đảm bảo không bị nhảy layout khi số thay đổi
        textAlign: "center",
        fontWeight: "700",
        color: "#212121",
        fontSize: 14,
    },
    saveBtn: {
        marginTop: 20,
        backgroundColor: "#1976D2",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        // Thêm chút shadow cho nổi bật
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    saveText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalBox: {
        width: "80%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
    },

    modalTitle: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 16,
        textAlign: "center",
    },

    modeOption: {
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 10,
        backgroundColor: "#F5F7FA",
    },

    activeModeOption: {
        backgroundColor: "#E3F2FD",
    },

    modeOptionText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#424242",
    },

    activeModeText: {
        color: "#1976D2",
    },

    cancelBtn: {
        marginTop: 10,
        alignItems: "center",
    },

    cancelText: {
        color: "#757575",
        fontWeight: "600",
    },

});
