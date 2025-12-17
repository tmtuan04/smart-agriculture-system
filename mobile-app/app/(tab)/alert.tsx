import { useEffect, useState } from "react";
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
import { MaterialIcons } from "@expo/vector-icons";
import { getAlerts, getAlertById, Alert, markAlertAsRead } from "@/api/alert";

export default function AlertScreen() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        try {
            const data = await getAlerts();
            setAlerts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openAlertDetail = async (id: string) => {
        try {
            const data = await getAlertById(id);
            setSelectedAlert(data);
            setModalVisible(true);
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAsRead = async () => {
        if (!selectedAlert) return;

        try {
            await markAlertAsRead(selectedAlert._id);

            // Update list alerts
            setAlerts(prev =>
                prev.map(alert =>
                    alert._id === selectedAlert._id
                        ? { ...alert, isRead: true }
                        : alert
                )
            );

            // Update alert đang mở
            setSelectedAlert(prev =>
                prev ? { ...prev, isRead: true } : prev
            );
        } catch (error) {
            console.error(error);
        }
    };


    const renderIcon = (type: string) => {
        switch (type) {
            case "temperature":
                return <MaterialIcons name="device-thermostat" size={24} color="#e74c3c" />;
            case "humidity":
                return <MaterialIcons name="water-drop" size={24} color="#3498db" />;
            case "soilMoisture":
                return <MaterialIcons name="grass" size={24} color="#27ae60" />;
            default:
                return <MaterialIcons name="warning" size={24} color="#f39c12" />;
        }
    };

    const renderItem = ({ item }: { item: Alert }) => (
        <TouchableOpacity
            style={[
                styles.alertItem,
                !item.isRead && styles.unreadAlert,
            ]}
            onPress={() => openAlertDetail(item._id)}
        >
            {item.status === "active" && (
                <View style={styles.activeDot} />
            )}
            <View style={styles.iconContainer}>
                {renderIcon(item.type)}
            </View>

            <View style={styles.content}>
                <Text
                    style={[
                        styles.message,
                        !item.isRead && styles.unreadText,
                        item.isRead && { color: "#7f8c8d" },
                    ]}
                >
                    {item.message}
                </Text>

                <Text style={styles.subText}>
                    {item.deviceId.name} • {new Date(item.createdAt).toLocaleString()}
                </Text>
            </View>

            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Alerts</Text>

                <View style={styles.headerRight}>
                    <MaterialIcons name="notifications" size={26} color="#2c3e50" />
                    {alerts.filter(a => !a.isRead).length > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {alerts.filter(a => !a.isRead).length}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
            <FlatList
                data={alerts}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
            />

            {/* Modal chi tiết alert */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedAlert && (
                            <>
                                <Text style={styles.modalTitle}>Alert Detail</Text>

                                <Text style={styles.detailText}>
                                    📟 Device: {selectedAlert.deviceId.name}
                                </Text>
                                <Text style={styles.detailText}>
                                    ⚠ Type: {selectedAlert.type}
                                </Text>
                                <Text style={styles.detailText}>
                                    📊 Value: {selectedAlert.value}
                                </Text>
                                <Text style={styles.detailText}>
                                    🔄 Status: {selectedAlert.status}
                                </Text>
                                <Text style={styles.detailText}>
                                    🕒 Time: {new Date(selectedAlert.createdAt).toLocaleString()}
                                </Text>

                                {/* Nút ĐÃ ĐỌC */}
                                {!selectedAlert.isRead && (
                                    <TouchableOpacity
                                        style={styles.readButton}
                                        onPress={handleMarkAsRead}
                                    >
                                        <Text style={styles.readButtonText}>Đã đọc</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.closeText}>Đóng</Text>
                                </TouchableOpacity>
                            </>
                        )}

                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f6fa",
        padding: 16,
    },
    header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#2c3e50",
    },
    headerRight: {
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: -6,
        right: -6,
        backgroundColor: "#e74c3c",
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: "center",
        alignItems: "center",
    },
    badgeText: {
        color: "#fff",
        fontSize: 10,
        fontWeight: "700",
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    alertItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
    },
    iconContainer: {
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    message: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c3e50",
    },
    subText: {
        fontSize: 12,
        color: "#7f8c8d",
        marginTop: 4,
    },
    activeDot: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#e74c3c", // đỏ cảnh báo
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#3498db",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    detailText: {
        fontSize: 14,
        marginBottom: 8,
    },
    closeButton: {
        marginTop: 16,
        backgroundColor: "#3498db",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    closeText: {
        color: "#fff",
        fontWeight: "600",
    },
    readButton: {
    marginTop: 12,
    backgroundColor: "#27ae60",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    },
    readButtonText: {
        color: "#fff",
        fontWeight: "700",
    },
    unreadAlert: {
    backgroundColor: "#e7f3ff", // xanh nhạt kiểu Facebook
    },
    unreadText: {
        fontWeight: "700",
        color: "#1d3557",
    },
});
