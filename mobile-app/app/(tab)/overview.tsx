import React, { useEffect, useState } from "react";
import { ScrollView, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";

import { getDeviceByUser } from "@/api/device";
import { getLatestSensor } from "@/api/sensor";

import { HeaderSection } from "./components/HeaderSection";
import { CurrentStatusCard } from "./components/CurrentStatusCard";
import { ModeCard, ModeType } from "./components/ModeCard";

type SensorData = {
    temperature: number;
    soilMoisture: number;
    humidity: number;
    battery: number;
    water: number;
    createdAt: string;
};

export default function OverviewScreen() {
    const [userName, setUserName] = useState<string | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [sensor, setSensor] = useState<SensorData | null>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<ModeType>("MANUAL");

    /* ===================== AUTH ===================== */
    const loadAuthInfo = async () => {
        const userId = await SecureStore.getItemAsync("userId");
        const name = await SecureStore.getItemAsync("userName");
        const token = await SecureStore.getItemAsync("token");

        if (!userId || !token) {
            Alert.alert("Lỗi", "Không tìm thấy thông tin đăng nhập");
            return null;
        }

        setUserName(name);
        return { userId, token };
    };

    /* ===================== DEVICE ===================== */
    const loadDeviceId = async (userId: string) => {
        try {
            const res = await getDeviceByUser(userId);

            if (!res?.data?.length) {
                Alert.alert("Thông báo", "Bạn chưa có thiết bị");
                return null;
            }

            const id = res.data[0]._id;
            setDeviceId(id);
            return id;
        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Không thể lấy thiết bị");
            return null;
        }
    };

    /* ===================== SENSOR ===================== */
    const loadSensorData = async (deviceId: string) => {
        try {
            setLoading(true);

            const res = await getLatestSensor(deviceId);
            if (!res?.ok) {
                Alert.alert("Lỗi", "Không lấy được dữ liệu cảm biến");
                return;
            }

            setSensor(res.data);
        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi mạng", "Không thể kết nối server");
        } finally {
            setLoading(false);
        }
    };

    /* ===================== INIT ===================== */
    useEffect(() => {
        (async () => {
            const auth = await loadAuthInfo();
            if (!auth) return;

            const id = await loadDeviceId(auth.userId);
            if (!id) return;

            await loadSensorData(id);
        })();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <HeaderSection userName={userName} />

                {/* Current Status */}
                <CurrentStatusCard
                    sensor={sensor}
                    loading={loading}
                    onRefresh={() => deviceId && loadSensorData(deviceId)}
                />

                {/* Mode */}
                <ModeCard
                    mode={mode}
                    onChange={setMode}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    scrollContent: {
        padding: 16,
    },
});
