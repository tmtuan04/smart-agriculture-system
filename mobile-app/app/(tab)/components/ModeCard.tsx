import React, { useEffect, useState } from "react";
// Thêm dòng này ở đầu file ModeCard.tsx
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { manualPump } from "@/api/pump";
import dayjs from "dayjs";
import {
  getCurrentMode,
  updateAutoMode,
  updateDeviceMode,
} from "@/api/deviceMode";
import { getLatestDecision, AiDecision, getDecisionHistory } from "@/api/ai";

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
  onModeChanged,
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

  const [aiDecision, setAiDecision] = useState<AiDecision | null>(null);
  const [aiDecisions, setAiDecisions] = useState<AiDecision[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  const MINUTE_STEP = 5;

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
          `${String(hours).padStart(2, "0")}:${String(mins).padStart(
            2,
            "0"
          )}:${String(secs).padStart(2, "0")}`
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

  // Mode AI: Lấy quyết định AI mới nhất
  useEffect(() => {
    if (selectedMode === "AI") {
      const fetchAI = async () => {
        setLoadingAi(true);
        try {
          // Gọi API lấy lịch sử, page 1, limit 5
          const res = await getDecisionHistory(deviceId, 1, 5);

          if (res.ok && res.data && Array.isArray(res.data.data)) {
            setAiDecisions(res.data.data);
          }
        } catch (e) {
          console.error("AI Fetch Error", e);
        } finally {
          setLoadingAi(false);
        }
      };

      fetchAI();
      const interval = setInterval(fetchAI, 2000); // Refresh mỗi 2s
      return () => clearInterval(interval);
    }
  }, [selectedMode, deviceId]);

  useEffect(() => {
    if (activeMode !== "MANUAL") return;
    if (!isWatering) return;

    const start = Date.now();

    const interval = setInterval(() => {
      setElapsedMs((prev) => prev + 100);
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

      const res = await updateDeviceMode(deviceId, mapUIToApiMode(mode));

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

        <TouchableOpacity
          style={styles.modeBadge}
          onPress={() => setShowModeModal(true)}
        >
          <View style={[styles.modeDot, { backgroundColor: "#43A047" }]} />
          <Text style={styles.modeBadgeText}>{activeMode}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(["MANUAL", "AUTO", "AI"] as ModeType[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.tab, selectedMode === m && styles.activeTab]}
            onPress={() => onChange(m)}
          >
            <Text
              style={[styles.tabText, selectedMode === m && styles.activeText]}
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
                    backgroundColor: isWatering ? "#43A047" : "#BDBDBD",
                  },
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
              <View style={styles.controlItem}>
                <TouchableOpacity
                  style={[styles.circleBtn, isWatering && styles.activeCircle]}
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

                <Text style={styles.controlLabel}>Reset</Text>
              </View>
            </View>
          </View>
        )}

        {selectedMode === "AUTO" && (
          <View>
            <View style={styles.statusBadge}>
              <View style={[styles.dot, { backgroundColor: "#1976D2" }]} />
              <Text style={styles.statusText}>Tự động sau: {countdown}</Text>
            </View>
            {/* --- Ngưỡng độ ẩm --- */}
            <Text style={styles.sectionTitle}>Ngưỡng độ ẩm đất (%)</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Tối thiểu (Min)</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepClick}
                  onPress={() => setAutoSoilMin((v) => Math.max(0, v - 5))}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{autoSoilMin}</Text>
                <TouchableOpacity
                  style={styles.stepClick}
                  onPress={() => setAutoSoilMin((v) => v + 5)}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Tối đa (Max)</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepClick}
                  onPress={() =>
                    setAutoSoilMax((v) => Math.max(autoSoilMin + 5, v - 5))
                  }
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{autoSoilMax}</Text>
                <TouchableOpacity
                  style={styles.stepClick}
                  onPress={() => setAutoSoilMax((v) => v + 5)}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* --- Thời gian --- */}
            <Text style={styles.sectionTitle}>Lịch tưới định kỳ</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Giờ</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepClick}
                  onPress={() => setScheduleHour((h) => (h + 23) % 24)}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.stepperValue}>
                  {String(scheduleHour).padStart(2, "0")}
                </Text>

                <TouchableOpacity
                  style={styles.stepClick}
                  onPress={() => setScheduleHour((h) => (h + 1) % 24)}
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ===== PHÚT ===== */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Phút</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepClick}
                  onPress={() =>
                    setScheduleMinute((m) =>
                      m - MINUTE_STEP < 0 ? 60 - MINUTE_STEP : m - MINUTE_STEP
                    )
                  }
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.stepperValue}>
                  {String(scheduleMinute).padStart(2, "0")}
                </Text>

                <TouchableOpacity
                  style={styles.stepClick}
                  onPress={() =>
                    setScheduleMinute((m) => (m + MINUTE_STEP) % 60)
                  }
                >
                  <Text style={styles.stepBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Thời lượng tưới</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepClick}
                  onPress={() => setDuration((d) => Math.max(1, d - 1))}
                >
                  <Text style={styles.stepBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue}>{duration} phút</Text>
                <TouchableOpacity
                  style={styles.stepClick}
                  onPress={() => setDuration((d) => d + 1)}
                >
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
          <View style={styles.aiContainer}>
            {loadingAi && aiDecisions.length === 0 ? (
              <ActivityIndicator
                size="small"
                color="#7B1FA2"
                style={{ marginTop: 20 }}
              />
            ) : aiDecisions.length > 0 ? (
              <View>
                {/* --- PHẦN 1: QUYẾT ĐỊNH MỚI NHẤT (Thẻ To) --- */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                    marginTop: 8,
                  }}
                >
                  <MaterialCommunityIcons
                    name="robot-outline"
                    size={20}
                    color="#7B1FA2"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.sectionHeader}>Phân tích mới nhất</Text>
                </View>

                {(() => {
                  const latest = aiDecisions[0];
                  const isOn = latest.action === "on";
                  return (
                    <View style={styles.aiCard}>
                      {/* Header Mới Nhất */}
                      <View style={styles.aiHeader}>
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <MaterialCommunityIcons
                            name="clock-time-four-outline"
                            size={14}
                            color="#9E9E9E"
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.aiTime}>
                            {dayjs(latest.createdAt).format("HH:mm DD/MM")}
                          </Text>
                          <View
                            style={{
                              backgroundColor: "#E1F5FE",
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 4,
                              marginLeft: 8,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                color: "#0288D1",
                                fontWeight: "700",
                              }}
                            >
                              MỚI
                            </Text>
                          </View>
                        </View>

                        <View
                          style={[
                            styles.aiBadge,
                            {
                              backgroundColor: isOn ? "#E8F5E9" : "#FFEBEE",
                              flexDirection: "row",
                              alignItems: "center",
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={isOn ? "water" : "leaf-off"}
                            size={16}
                            color={isOn ? "#2E7D32" : "#C62828"}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.aiBadgeText,
                              {
                                color: isOn ? "#2E7D32" : "#C62828",
                                fontSize: 13,
                              },
                            ]}
                          >
                            {isOn ? "TƯỚI" : "TẮT"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.aiDivider} />

                      {/* Thông số chi tiết */}
                      <View style={styles.aiGrid}>
                        <View style={styles.aiGridItem}>
                          <MaterialCommunityIcons
                            name="water-percent"
                            size={24}
                            color="#795548"
                            style={{ marginBottom: 4 }}
                          />
                          <Text style={styles.aiValue}>
                            {latest.context.soilMoisture.toFixed(2)}%
                          </Text>
                          <Text style={styles.aiLabel}>Độ ẩm đất</Text>
                        </View>
                        <View style={styles.aiGridItem}>
                          <MaterialCommunityIcons
                            name="thermometer"
                            size={24}
                            color="#FF5722"
                            style={{ marginBottom: 4 }}
                          />
                          <Text style={styles.aiValue}>
                            {latest.context.temperature.toFixed(2)}°C
                          </Text>
                          <Text style={styles.aiLabel}>Nhiệt độ</Text>
                        </View>
                        <View style={styles.aiGridItem}>
                          <MaterialCommunityIcons
                            name="weather-cloudy"
                            size={24}
                            color="#03A9F4"
                            style={{ marginBottom: 4 }}
                          />
                          <Text style={styles.aiValue}>
                            {latest.context.humidity.toFixed(2)}%
                          </Text>
                          <Text style={styles.aiLabel}>Độ ẩm KK</Text>
                        </View>
                      </View>

                      <Text style={styles.aiFooterText}>
                        {isOn
                          ? "Đất khô, điều kiện môi trường phù hợp để tưới 💧"
                          : "Đất đủ ẩm hoặc nhiệt độ cao, chưa cần tưới 🌿"}
                      </Text>
                    </View>
                  );
                })()}

                {/* --- KHOẢNG CÁCH TÁCH BIỆT --- */}
                <View style={{ height: 24 }} />

                {/* --- PHẦN 2: DANH SÁCH LỊCH SỬ (Các thẻ nhỏ) --- */}
                {aiDecisions.length > 1 && (
                  <View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="history"
                        size={18}
                        color="#9E9E9E"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.sectionHeader}>
                        Lịch sử hoạt động
                      </Text>
                    </View>

                    {aiDecisions.slice(1).map((decision) => {
                      const isOn = decision.action === "on";
                      return (
                        <View
                          key={decision._id}
                          style={[styles.aiCard, styles.aiCardSmall]}
                        >
                          <View style={styles.aiHeader}>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <Text style={styles.aiTimeSmall}>
                                {dayjs(decision.createdAt).format(
                                  "HH:mm DD/MM"
                                )}
                              </Text>
                            </View>

                            {/* Mini Badge */}
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: "600",
                                  color: isOn ? "#2E7D32" : "#C62828",
                                  marginRight: 8,
                                }}
                              >
                                {isOn ? "TƯỚI" : "TẮT"}
                              </Text>
                              <MaterialCommunityIcons
                                name={isOn ? "water" : "leaf-off"}
                                size={14}
                                color={isOn ? "#2E7D32" : "#C62828"}
                              />
                            </View>
                          </View>

                          {/* Mini Context (Dòng thông số nhỏ) */}
                          <View
                            style={{
                              flexDirection: "row",
                              marginTop: 6,
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <MaterialCommunityIcons
                                name="water-percent"
                                size={14}
                                color="#757575"
                                style={{ marginRight: 2 }}
                              />
                              <Text style={styles.miniContext}>
                                Đất: {decision.context.soilMoisture.toFixed(2)}%
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <MaterialCommunityIcons
                                name="thermometer"
                                size={14}
                                color="#757575"
                                style={{ marginRight: 2 }}
                              />
                              <Text style={styles.miniContext}>
                                Nhiệt: {decision.context.temperature.toFixed(2)}
                                °C
                              </Text>
                            </View>
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <MaterialCommunityIcons
                                name="cloud-outline"
                                size={14}
                                color="#757575"
                                style={{ marginRight: 2 }}
                              />
                              <Text style={styles.miniContext}>
                                Ẩm KK: {decision.context.humidity.toFixed(2)}%
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptyAi}>
                <MaterialCommunityIcons
                  name="robot-confused-outline"
                  size={48}
                  color="#BDBDBD"
                  style={{ marginBottom: 10 }}
                />
                <Text style={styles.emptyAiText}>
                  Chưa có dữ liệu phân tích nào.
                </Text>
              </View>
            )}
          </View>
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

  // --- AI STYLES (MỚI) ---
  aiContainer: {
    paddingTop: 10,
  },
  aiCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 16,
    // Shadow nhẹ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  aiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  aiTime: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  aiBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  aiReasonLabel: {
    fontSize: 13,
    color: "#616161",
    marginBottom: 8,
    fontWeight: "600",
  },
  aiGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  aiGridItem: {
    alignItems: "center",
    flex: 1,
  },
  aiValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 2,
  },
  aiLabel: {
    fontSize: 11,
    color: "#9E9E9E",
  },
  aiDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#EEEEEE",
  },
  //   aiFooterText: {
  //     textAlign: "center",
  //     fontSize: 11,
  //     color: "#90A4AE",
  //     fontStyle: "italic",
  //     marginTop: 4,
  //   },
  emptyAi: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyAiText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
  },
  emptyAiSub: {
    fontSize: 12,
    color: "#BDBDBD",
    marginTop: 4,
  },

  historyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9E9E9E",
    textTransform: "uppercase",
    // marginBottom: 12, <--- Xóa dòng này
    // marginTop: 8,     <--- Xóa dòng này
  },
  //   aiCard: {
  //     backgroundColor: "#FFF",
  //     borderRadius: 12,
  //     borderWidth: 1,
  //     borderColor: "#E0E0E0",
  //     padding: 16,
  //     marginBottom: 12, // Khoảng cách giữa các thẻ
  //     // Shadow
  //     shadowColor: "#000",
  //     shadowOffset: { width: 0, height: 1 },
  //     shadowOpacity: 0.05,
  //     shadowRadius: 2,
  //     elevation: 2,
  //   },
  //   aiCardSmall: {
  //     padding: 12, // Thẻ cũ thì padding nhỏ hơn chút
  //     backgroundColor: "#FAFAFA", // Màu nền hơi xám để phân biệt với thẻ mới nhất
  //   },
  //   aiHeader: {
  //     flexDirection: "row",
  //     justifyContent: "space-between",
  //     alignItems: "center",
  //   },
  //   aiTime: {
  //     fontSize: 13,
  //     color: "#616161",
  //     fontWeight: "500",
  //   },
  //   aiBadge: {
  //     paddingHorizontal: 10,
  //     paddingVertical: 4,
  //     borderRadius: 8,
  //   },
  //   aiBadgeText: {
  //     fontSize: 11,
  //     fontWeight: "700",
  //   },
  //   aiDivider: {
  //     height: 1,
  //     backgroundColor: "#EEEEEE",
  //     marginVertical: 12,
  //   },
  //   aiGrid: {
  //     flexDirection: "row",
  //     justifyContent: "space-around",
  //   },
  //   aiGridItem: {
  //     alignItems: "center",
  //   },
  //   aiValue: {
  //     fontSize: 16,
  //     fontWeight: "700",
  //     color: "#212121",
  //   },
  //   aiLabel: {
  //     fontSize: 11,
  //     color: "#9E9E9E",
  //     marginTop: 2,
  //   },
  miniContext: {
    // marginTop: 8, <--- Xóa dòng này
    fontSize: 12,
    color: "#757575",
  },
  //   emptyAi: {
  //     alignItems: "center",
  //     paddingVertical: 20,
  //   },
  //   emptyAiText: {
  //     color: "#BDBDBD",
  //   },

  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: "#616161",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  aiCardSmall: {
    padding: 12,
    backgroundColor: "#F5F5F5", // Màu nền xám nhẹ cho thẻ lịch sử
    marginBottom: 10,
    borderWidth: 0, // Bỏ viền cho thẻ nhỏ để đỡ rối
  },
  aiTimeSmall: {
    fontSize: 13,
    color: "#424242",
    fontWeight: "500",
  },
  aiFooterText: {
    marginTop: 12,
    fontSize: 12,
    color: "#78909C",
    fontStyle: "italic",
    textAlign: "center",
  },
});
