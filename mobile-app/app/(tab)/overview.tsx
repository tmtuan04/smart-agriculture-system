import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDeviceByUser } from "@/api/device";
import { getLatestSensor } from "@/api/sensor";
import * as SecureStore from "expo-secure-store"
import { router } from "expo-router";

type SensorData = {
    temperature: number;
    soilMoisture: number;
    humidity: number;
};

type ModeType = "MANUAL" | "AUTO" | "AI";

export default function OverviewScreen() {
    const [sensor, setSensor] = useState<SensorData | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<ModeType>("MANUAL");

    // 1. Lấy token + userId từ SecureStore
    const loadAuthInfo = async () => {
        const userId = await SecureStore.getItemAsync("userId");
        const userName = await SecureStore.getItemAsync("userName");
        const token = await SecureStore.getItemAsync("token");

        /*console.log(">>> Stored userId:", userId);
        console.log(">>> Stored userName:", userName);
        console.log(">>> Stored token:", token);
        */

        if (!userId || !token) {
            Alert.alert("Lỗi", "Không tìm thấy thông tin đăng nhập");
            return null;
        }
        setUserName(userName);

        return { userId, token };
    };

    // 2. Lấy deviceId theo userId    
    const loadDeviceId = async (userId: string) => {
        try {
            const deviceRes = await getDeviceByUser(userId);

            if (!deviceRes || !deviceRes?.data.length) {
                Alert.alert("Thông báo", "Bạn chưa có thiết bị");
                return null;
            }

            const id = deviceRes?.data[0]?._id;
            /*console.log(">>> Device ID:", id);*/

            setDeviceId(id);
            return id;
        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi", "Không thể lấy thiết bị");
            return null;
        }
    };

    // 3. Lấy sensor data theo deviceId
    const loadSensorData = async (deviceId: string) => {
        try {
            setLoading(true);

            const res = await getLatestSensor(deviceId);
            if (!res.ok) {
                Alert.alert("Lỗi", "Không lấy được dữ liệu cảm biến");
                return;
            }

            setSensor(res?.data);
        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi mạng", "Không thể kết nối server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            const auth = await loadAuthInfo();
            if (!auth) return;

            const id = await loadDeviceId(auth?.userId);
            if (!id) return;

            await loadSensorData(id);
        })();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.header}>
                    <View>
                        <Text style={styles.greetingText}>Chào mừng trở lại!</Text>
                        <Text style={styles.subGreetingText}>{userName}</Text>
                    </View>
                    <View style={styles.profileIcon}>
                        <Image
                            source={require('@/assets/images/user-icon.png')}
                            style={styles.avatarImage}
                            resizeMode="cover"
                        />
                    </View>
                </View>

                {/* View Trạng thái hiệnt tại */}
                <View style={styles.card}>
                    {/* Header card */}
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Trạng thái hiện tại</Text>

                        <TouchableOpacity
                            style={[
                                styles.refreshInlineBtn,
                                loading && { opacity: 0.7 }
                            ]}
                            onPress={() => deviceId && loadSensorData(deviceId)}
                            disabled={loading}
                        >
                            <View style={styles.loadingRow}>
                                <MaterialCommunityIcons
                                    name="refresh"
                                    size={18}
                                    color="#1976D2"
                                />
                                <Text style={styles.refreshInlineText}>
                                    {loading ? "ĐANG TẢI" : "LÀM MỚI"}
                                </Text>

                                {loading && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#1976D2"
                                        style={{ marginLeft: 6 }}
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Nội dung trạng thái */}
                    <View style={styles.statusRow}>
                        <View style={styles.statusItem}>
                            <MaterialCommunityIcons name="thermometer" size={32} color="#EF5350" />
                            <Text style={styles.valueText}>
                                {sensor ? `${Number(sensor.temperature).toFixed(1)}°C` : "--"}
                            </Text>
                            <Text style={styles.labelText}>Nhiệt độ</Text>
                        </View>

                        <View style={styles.statusItem}>
                            <MaterialCommunityIcons name="grass" size={32} color="#66BB6A" />
                            <Text style={styles.valueText}>
                                {sensor ? `${sensor.soilMoisture}%` : "--"}
                            </Text>
                            <Text style={styles.labelText}>Độ ẩm đất</Text>
                        </View>

                        <View style={styles.statusItem}>
                            <MaterialCommunityIcons name="water-outline" size={32} color="#4FC3F7" />
                            <Text style={styles.valueText}>
                                {sensor ? `${Number(sensor.humidity).toFixed(1)}%` : "--"}
                            </Text>
                            <Text style={styles.labelText}>Độ ẩm KK</Text>
                        </View>
                    </View>
                </View>


                {/* View theo mode */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Chế độ hoạt động</Text>

                    {/* Tabs */}
                    <View style={styles.modeTabRow}>
                        <TouchableOpacity
                            style={[
                                styles.modeTab,
                                mode === "MANUAL" && styles.modeTabActive
                            ]}
                            onPress={() => setMode("MANUAL")}
                        >
                            <Text
                                style={[
                                    styles.modeTabText,
                                    mode === "MANUAL" && styles.modeTabTextActive
                                ]}
                            >
                                Manual
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.modeTab,
                                mode === "AUTO" && styles.modeTabActive
                            ]}
                            onPress={() => setMode("AUTO")}
                        >
                            <Text
                                style={[
                                    styles.modeTabText,
                                    mode === "AUTO" && styles.modeTabTextActive
                                ]}
                            >
                                Auto
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.modeTab,
                                mode === "AI" && styles.modeTabActive
                            ]}
                            onPress={() => setMode("AI")}
                        >
                            <Text
                                style={[
                                    styles.modeTabText,
                                    mode === "AI" && styles.modeTabTextActive
                                ]}
                            >
                                AI Mode
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content theo mode */}
                    <View style={styles.modeContent}>
                        {mode === "MANUAL" && (
                            <Text style={styles.modeText}>
                                Điều khiển thủ công thiết bị (bật/tắt bơm, quạt…)
                            </Text>
                        )}

                        {mode === "AUTO" && (
                            <Text style={styles.modeText}>
                                Hệ thống tự động dựa theo ngưỡng nhiệt độ và độ ẩm
                            </Text>
                        )}

                        {mode === "AI" && (
                            <Text style={styles.modeText}>
                                AI phân tích dữ liệu cảm biến và tối ưu tưới tiêu 🌱
                            </Text>
                        )}
                    </View>
                </View>

                {/* View thao tác nhanh */}
                {/* <View style={styles.card}>
                    <Text style={styles.cardTitle}>Thao tác nhanh</Text>

                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.btnRefresh,
                                loading && { opacity: 0.7 }
                            ]}
                            onPress={() => deviceId && loadSensorData(deviceId)}
                            disabled={loading}
                        >
                            <View style={styles.loadingRow}>
                                <Text style={styles.btnRefreshText}>
                                    {loading ? "ĐANG TẢI" : "LÀM MỚI"}
                                </Text>

                                {loading && (
                                    <ActivityIndicator
                                        size="small"
                                        color="#1976D2"
                                        style={{ marginLeft: 8 }}
                                    />
                                )}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.btnAlert]}
                            onPress={() => router.push('/(tab)/alert')}
                        >
                            <Text style={styles.btnAlertText}>CẢNH BÁO</Text>
                        </TouchableOpacity>
                    </View>
                </View> */}

            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    scrollContent: {
        padding: 20,
    },

    // Header Styles
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    greetingText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#212121',
    },
    subGreetingText: {
        fontSize: 14,
        color: '#757575',
        marginTop: 4,
    },
    profileIcon: {
        width: 45,
        height: 45,
        backgroundColor: '#fff',
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Card Common Styles
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212121',
        marginBottom: 20,
    },

    // Status Section Styles
    statusRow: {
        flexDirection: 'row',
        // space-between sẽ đẩy các phần tử ra xa nhau, 
        // dùng space-around hoặc space-evenly sẽ đẹp hơn khi có 3 cột
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    statusItem: {
        alignItems: 'center',
        width: '30%', // Chia đều không gian để 3 cột không bị dính nhau
    },
    valueText: {
        fontSize: 20, // Giảm nhẹ size chữ để vừa vặn hơn khi có 3 cột
        fontWeight: 'bold',
        color: '#212121',
        marginTop: 8,
    },
    labelText: {
        fontSize: 13,
        color: '#757575',
        marginTop: 4,
        textAlign: 'center', // Canh giữa text
    },

    // Action Section Styles
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnRefresh: {
        backgroundColor: '#E3F2FD',
        borderWidth: 1,
        borderColor: "#1976D2",
    },
    btnRefreshText: {
        color: '#1976D2',
        fontWeight: '600',
        fontSize: 14,
    },
    btnAlert: {
        backgroundColor: "#FFEBEE",
        borderWidth: 1,
        borderColor: "#E53935",
    },
    btnAlertText: {
        color: "#E53935",
        fontWeight: "700",
        fontSize: 14,
    },
    avatarImage: {
        width: '50%',
        height: '50%',
    },
    // Mode styles
    modeTabRow: {
        flexDirection: "row",
        backgroundColor: "#F1F3F5",
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    modeTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    modeTabActive: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    modeTabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#757575",
    },
    modeTabTextActive: {
        color: "#1976D2",
    },
    modeContent: {
        paddingVertical: 8,
    },
    modeText: {
        fontSize: 14,
        color: "#424242",
        lineHeight: 20,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        marginBottom: 16,
    },

    refreshInlineBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: "#E3F2FD",
        borderWidth: 1,
        borderColor: "#1976D2",
    },

    refreshInlineText: {
        marginLeft: 6,
        fontSize: 12,
        fontWeight: "600",
        color: "#1976D2",
    },
});