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
import { getAlerts, getAlertById, Alert, markAlertAsRead, markAlertAsResolved } from "@/api/alert";
import { MaterialIcons } from "@expo/vector-icons";

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
    });

const typeLabelMap: Record<string, string> = {
    temperature: "Nhiệt độ",
    humidity: "Độ ẩm không khí",
    soilMoisture: "Độ ẩm đất",
};

const getTypeLabel = (type: string) =>
    typeLabelMap[type] || type;

const formatValueWithUnit = (type: string, value: number | string) => {
    switch (type) {
        case "temperature":
            return `${value} °C`;
        case "humidity":
        case "soilMoisture":
            return `${value} %`;
        default:
            return value;
    }
};

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

    const handleResolveAlert = async () => {
        if (!selectedAlert) return;

        try {
            await markAlertAsResolved(selectedAlert._id);

            // update list
            setAlerts(prev =>
                prev.map(alert =>
                    alert._id === selectedAlert._id
                        ? { ...alert, status: "resolved" }
                        : alert
                )
            );

            // update detail
            setSelectedAlert(prev =>
                prev ? { ...prev, status: "resolved" } : prev
            );
        } catch (err) {
            console.error(err);
        }
    };

    const groupedAlerts = alerts.reduce((acc: any, alert) => {
        const dateKey = formatDate(alert.createdAt);
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(alert);
        return acc;
    }, {});

    const groupedData = Object.keys(groupedAlerts).map(date => ({
        date,
        data: groupedAlerts[date],
    }));



    const renderAlertItem = ({ item }: { item: Alert }) => (
        <TouchableOpacity
            style={[
                styles.alertItem,
                !item.isRead && styles.unreadAlert,
            ]}
            onPress={() => openAlertDetail(item._id)}
        >
            {item.status === "active" && <View style={styles.activeDot} />}

            <View style={styles.content}>
                <Text
                    style={[
                        styles.timeText,
                        !item.isRead && styles.unreadText,
                    ]}
                >
                    {formatTime(item.createdAt)}
                </Text>

                <Text
                    style={[
                        styles.message,
                        item.isRead && { color: "#7f8c8d" },
                    ]}
                    numberOfLines={2}
                >
                    {item.message}
                </Text>
            </View>

            {!item.isRead && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={styles.loadingText}>
                    Getting things ready ...
                </Text>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Alerts</Text>
            </View>
            <FlatList
                data={groupedData}
                keyExtractor={(item) => item.date}
                renderItem={({ item }) => (
                    <View>
                        {/* DATE TITLE */}
                        <Text style={styles.dateTitle}>{item.date}</Text>

                        {item.data.map(alert => (
                            <View key={alert._id}>
                                {renderAlertItem({ item: alert })}
                            </View>
                        ))}
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />

            {/* Modal chi tiết alert */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>

                        {/* CLOSE BUTTON */}
                        <TouchableOpacity
                            style={styles.closeIcon}
                            onPress={() => setModalVisible(false)}
                        >
                            <MaterialIcons name="close" size={22} color="#2c3e50" />
                        </TouchableOpacity>

                        {selectedAlert && (
                            <>
                                <Text style={styles.modalTitle}>Alert Detail</Text>

                                <Text style={styles.detailText}>
                                    <Text style={styles.label}>Device:</Text>{" "}
                                    {selectedAlert.deviceId.name}
                                </Text>

                                <Text style={styles.detailText}>
                                    <Text style={styles.label}>Type:</Text>{" "}
                                    {getTypeLabel(selectedAlert.type)}
                                </Text>

                                <Text style={styles.detailText}>
                                    <Text style={styles.label}>Value:</Text>{" "}
                                    {formatValueWithUnit(
                                        selectedAlert.type,
                                        selectedAlert.value
                                    )}
                                </Text>

                                <Text style={styles.detailText}>
                                    <Text style={styles.label}>Status:</Text>{" "}
                                    {selectedAlert.status}
                                </Text>

                                <Text style={styles.detailText}>
                                    <Text style={styles.label}>Time:</Text>{" "}
                                    {new Date(selectedAlert.createdAt).toLocaleString()}
                                </Text>

                                {/* ĐÃ ĐỌC */}
                                {!selectedAlert.isRead && (
                                    <TouchableOpacity
                                        style={styles.readButton}
                                        onPress={handleMarkAsRead}
                                    >
                                        <Text style={styles.readButtonText}>Đã đọc</Text>
                                    </TouchableOpacity>
                                )}

                                {/* ĐÃ XỬ LÝ */}
                                {selectedAlert.isRead && selectedAlert.status === "active" && (
                                    <TouchableOpacity
                                        style={styles.resolveButton}
                                        onPress={handleResolveAlert}
                                    >
                                        <Text style={styles.resolveButtonText}>Đã xử lý</Text>
                                    </TouchableOpacity>
                                )}
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
        fontSize: 14,
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
        marginBottom: 16,
        textAlign: "center",
    },
    detailText: {
        fontSize: 14,
        marginBottom: 10,
        color: "#34495e",
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
        backgroundColor: "#c2ddff", 
    },
    unreadText: {
        fontWeight: "700",
        color: "#1d3557",
    },
    dateTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#34495e",
        marginBottom: 8,
        marginTop: 16,
    },

    timeText: {
        fontSize: 18,        
        fontWeight: "700",
        color: "#2c3e50",
        marginBottom: 4,
    },
    label: {
        fontWeight: "700",
        color: "#2c3e50",
    },
    closeIcon: {
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },

    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: "500",
        color: "#2c3e50",
    },
    resolveButton: {
        marginTop: 12,
        backgroundColor: "#6366f1", // tím xanh (professional)
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },

    resolveButtonText: {
        color: "#fff",
        fontWeight: "700",
    },
});
