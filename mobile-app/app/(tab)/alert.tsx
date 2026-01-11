import { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    getAlerts,
    getAlertById,
    markAlertAsRead,
    markAlertAsResolved,
    Alert,
} from "@/api/alert";
import { MaterialIcons } from "@expo/vector-icons";

const toVNDate = (date: string | Date) => {
    const d = new Date(date);
    return new Date(d.getTime() - 7 * 60 * 60 * 1000);
};

const formatDate = (date: string) =>
    toVNDate(date).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

const formatTime = (date: string) =>
    toVNDate(date).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });

const TYPE_LABEL: Record<string, string> = {
    temperature: "Nhiệt độ",
    humidity: "Độ ẩm không khí",
    soilMoisture: "Độ ẩm đất",
    pump: "Hệ thống bơm",
    system: "Hệ thống",
};

const getTypeLabel = (type: string) =>
    TYPE_LABEL[type] ?? "Cảnh báo";

const formatValue = (type: string, value?: number) => {
    if (value == null) return "—";

    switch (type) {
        case "temperature":
            return `${value} °C`;
        case "humidity":
        case "soilMoisture":
            return `${value} %`;
        case "pump":
            return `${value} s`;
        default:
            return value.toString();
    }
};

const getIcon = (type: string) => {
    switch (type) {
        case "soilMoisture":
            return "water-drop";
        case "pump":
            return "build";
        case "system":
            return "warning";
        default:
            return "notifications";
    }
};

/* =======================
   Screen
======================= */

export default function AlertScreen() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Alert | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const data = await getAlerts();
            setAlerts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const openDetail = async (id: string) => {
        try {
            const data = await getAlertById(id);
            setSelected(data);
            setModalVisible(true);
        } catch (err) {
            console.error(err);
        }
    };

    const markRead = async () => {
        if (!selected) return;

        await markAlertAsRead(selected._id);

        setAlerts(prev =>
            prev.map(a =>
                a._id === selected._id ? { ...a, isRead: true } : a
            )
        );
        setSelected(prev => prev && { ...prev, isRead: true });
    };

    const resolveAlert = async () => {
        if (!selected) return;

        await markAlertAsResolved(selected._id);

        setAlerts(prev =>
            prev.map(a =>
                a._id === selected._id ? { ...a, status: "resolved" } : a
            )
        );
        setSelected(prev => prev && { ...prev, status: "resolved" });
    };

    /* =======================
       Group by date
    ======================= */

    const groupedData = useMemo(() => {
        const map: Record<string, Alert[]> = {};
        alerts.forEach(alert => {
            const key = formatDate(alert.createdAt);
            if (!map[key]) map[key] = [];
            map[key].push(alert);
        });

        return Object.entries(map).map(([date, data]) => ({
            date,
            data,
        }));
    }, [alerts]);

    /* =======================
       Render
    ======================= */

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Đang tải cảnh báo...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Cảnh báo</Text>

            <FlatList
                data={groupedData}
                keyExtractor={(item) => item.date}
                contentContainerStyle={{ paddingBottom: 24 }}
                renderItem={({ item }) => (
                    <View>
                        <Text style={styles.date}>{item.date}</Text>

                        {item.data.map(alert => (
                            <AlertItem
                                key={alert._id}
                                alert={alert}
                                onPress={() => openDetail(alert._id)}
                            />
                        ))}
                    </View>
                )}
            />

            {/* Detail Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <TouchableOpacity
                            style={styles.close}
                            onPress={() => setModalVisible(false)}
                        >
                            <MaterialIcons name="close" size={22} />
                        </TouchableOpacity>

                        {selected && (
                            <>
                                <Text style={styles.modalTitle}>
                                    {getTypeLabel(selected.type)}
                                </Text>

                                <Info label="Thiết bị" value={selected.deviceId.name} />
                                <Info label="Giá trị" value={formatValue(selected.type, selected.value)} />
                                {/* <Info label="Trạng thái" value={selected.status} /> */}
                                <Info label="Thời gian" value={toVNDate(selected.createdAt).toLocaleString("vi-VN")} />

                                {!selected.isRead && (
                                    <PrimaryButton
                                        label="Đã đọc"
                                        color="#22c55e"
                                        onPress={markRead}
                                    />
                                )}

                                {selected.isRead && selected.status === "active" && (
                                    <PrimaryButton
                                        label="Đã xử lý"
                                        color="#6366f1"
                                        onPress={resolveAlert}
                                    />
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

/* =======================
   Components
======================= */

const AlertItem = ({ alert, onPress }: { alert: Alert; onPress: () => void }) => (
    <TouchableOpacity
        style={[
            styles.card,
            !alert.isRead && styles.unread,
        ]}
        onPress={onPress}
    >
        <MaterialIcons
            name={getIcon(alert.type)}
            size={22}
            color={alert.status === "active" ? "#ef4444" : "#9ca3af"}
        />

        <View style={{ flex: 1 }}>
            <Text style={[styles.time, !alert.isRead && styles.bold]}>
                {formatTime(alert.createdAt)}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
                {alert.message}
            </Text>
        </View>

        {!alert.isRead && <View style={styles.dot} />}
    </TouchableOpacity>
);

const Info = ({ label, value }: { label: string; value: string }) => (
    <Text style={styles.info}>
        <Text style={styles.infoLabel}>{label}:</Text> {value}
    </Text>
);

const PrimaryButton = ({
    label,
    color,
    onPress,
}: {
    label: string;
    color: string;
    onPress: () => void;
}) => (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }]} onPress={onPress}>
        <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
);

/* =======================
   Styles
======================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        padding: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 12,
        color: "#0f172a",
    },
    date: {
        fontWeight: "700",
        marginVertical: 8,
        color: "#334155",
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
        gap: 12,
    },
    unread: {
        backgroundColor: "#e0f2fe",
    },
    time: {
        fontSize: 16,
        color: "#1e293b",
    },
    bold: {
        fontWeight: "700",
    },
    message: {
        color: "#475569",
        fontSize: 14,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#3b82f6",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
    },
    close: {
        position: "absolute",
        top: 12,
        right: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 16,
        textAlign: "center",
    },
    info: {
        marginBottom: 10,
        fontSize: 14,
    },
    infoLabel: {
        fontWeight: "700",
    },
    button: {
        marginTop: 12,
        padding: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
    },
});
