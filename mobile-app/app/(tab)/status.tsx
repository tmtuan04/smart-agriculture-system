import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDeviceByUser } from "@/api/device";
import { getLatestSensor } from "@/api/sensor";
import { useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store"

type SensorData = {
    temperature: number;
    soilMoisture: number;
    humidity: number;
};

export default function StatusScreen() {
    const [sensor, setSensor] = useState<SensorData | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    
    // 1. Lấy token + userId từ SecureStore
    const loadAuthInfo = async () => {
        const userId = await SecureStore.getItemAsync("userId");
        const token = await SecureStore.getItemAsync("token");

        console.log(">>> Stored userId:", userId);
        console.log(">>> Stored token:", token);

        if (!userId || !token) {
            Alert.alert("Lỗi", "Không tìm thấy thông tin đăng nhập");
            return null;
        }

        return { userId, token };
    }

    // 2. Lấy deviceId theo userId    
    const loadDeviceId = async (userId: string) => {
        try {
            const deviceRes = await getDeviceByUser(userId);

            if (!deviceRes || !deviceRes?.data.length) {
                Alert.alert("Thông báo", "Bạn chưa có thiết bị");
                return null;
            }

            const id = deviceRes?.data[0]?._id;
            console.log(">>> Device ID:", id);

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
                        <Text style={styles.subGreetingText}>Từ Minh Tuân</Text>
                    </View>
                    <View style={styles.profileIcon}>
                        <Image 
                            source={require('@/assets/images/user-icon.png')}
                            style={styles.avatarImage}
                            resizeMode="cover"
                        />
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Trạng thái hiện tại</Text>
                    
                    <View style={styles.statusRow}>
                        {/* Cột 1: Nhiệt độ */}
                        <View style={styles.statusItem}>
                            <MaterialCommunityIcons name="thermometer" size={32} color="#EF5350" /> 
                            <Text style={styles.valueText}>
                                {sensor ? `${Number(sensor?.temperature).toFixed(1)}°C` : "--"}
                            </Text>
                            <Text style={styles.labelText}>Nhiệt độ</Text>
                        </View>

                        {/* Cột 2: Độ ẩm đất */}
                        <View style={styles.statusItem}>
                            {/* Dùng icon 'grass' hoặc 'sprout' cho đất */}
                            <MaterialCommunityIcons name="grass" size={32} color="#66BB6A" />
                            <Text style={styles.valueText}>
                                {sensor ? `${sensor.soilMoisture}%` : "--"}
                            </Text>
                            <Text style={styles.labelText}>Độ ẩm đất</Text>
                        </View>

                        {/* Cột 3: Độ ẩm không khí */}
                        <View style={styles.statusItem}>
                            <MaterialCommunityIcons name="water-outline" size={32} color="#4FC3F7" />
                            <Text style={styles.valueText}>
                                {sensor ? `${Number(sensor?.humidity).toFixed(1)}%` : "--"}
                            </Text>
                            <Text style={styles.labelText}>Độ ẩm KK</Text>
                        </View>
                    </View>
                </View>
                
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Thao tác nhanh</Text>
                    
                    <View style={styles.actionRow}>
                        {/* Nút Làm mới */}
                        <TouchableOpacity
                            style={[styles.button, styles.btnRefresh]}
                            onPress={() => deviceId && loadSensorData(deviceId)}
                            disabled={loading}
                        >
                            <Text style={styles.btnRefreshText}>
                            {loading ? "ĐANG TẢI" : "LÀM MỚI"}
                            </Text>
                        </TouchableOpacity>

                        {/* Nút Cảnh báo */}
                        <TouchableOpacity style={[styles.button, styles.btnAlert]}>
                            <Text style={styles.btnAlertText}>CẢNH BÁO</Text>
                        </TouchableOpacity>
                    </View>
                </View>

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
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnRefresh: {
        backgroundColor: '#E3F2FD',
    },
    btnRefreshText: {
        color: '#1976D2',
        fontWeight: '600',
        fontSize: 14,
    },
    btnAlert: {
        backgroundColor: '#FFF8E1',
    },
    btnAlertText: {
        color: '#FBC02D',
        fontWeight: '600',
        fontSize: 14,
    },
    avatarImage: {
        width: '50%',
        height: '50%',
    },
});