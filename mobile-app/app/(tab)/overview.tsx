import React, { useEffect, useState } from "react";
import { ScrollView, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";

import { getDeviceByUser } from "@/api/device";
import { getLatestSensor } from "@/api/sensor";
import { getCurrentMode } from "@/api/deviceMode";

import { HeaderSection } from "./components/HeaderSection";
import { CurrentStatusCard } from "./components/CurrentStatusCard";
import { ModeCard, ModeType } from "./components/ModeCard";
import { mapBackendModeToUI } from "@/utils";

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
    const [deviceIdDb, setDeviceIdDb] = useState<string>("");
    const [sensor, setSensor] = useState<SensorData | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeMode, setActiveMode] = useState<ModeType | null>(null);
    const [selectedMode, setSelectedMode] = useState<ModeType | null>(null);
    const [modeLoading, setModeLoading] = useState(true);

    /* AUTH */
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

    /*  DEVICE  */
    const loadDeviceId = async (userId: string) => {
        try {
            const res = await getDeviceByUser(userId);

            if (!res?.data?.length) {
                Alert.alert("Thông báo", "Bạn chưa có thiết bị");
                return null;
            }

            const id = res.data[0].deviceId;
            const idDb = res.data[0]._id;

            setDeviceId(id);
            setDeviceIdDb(idDb);
            return id;
        } catch (error) {
            console.error(error);
            Alert.alert("Lỗi", "Không thể lấy thiết bị");
            return null;
        }
    };

    /*  SENSOR  */
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

    const loadCurrentMode = async (deviceId: string) => {
        try {
            setModeLoading(true);

            const res = await getCurrentMode(deviceId);
            if (!res.ok) {
                console.warn("Failed to load mode");
                return;
            }

            const backendMode = mapBackendModeToUI(res.data.mode);

            setActiveMode(backendMode);
            setSelectedMode(backendMode);
        } catch (err) {
            console.error(err);
        } finally {
            setModeLoading(false);
        }
    };

    const handleModeChange = (mode: ModeType) => {
        // setActiveMode(mode);
        setSelectedMode(mode);
    };

    const reloadModeFromServer = async () => {
        if (!deviceIdDb) return;
        await loadCurrentMode(deviceIdDb);
    };

    /* INIT */
    useEffect(() => {
        (async () => {
            const auth = await loadAuthInfo();
            if (!auth) return;

            const id = await loadDeviceId(auth.userId);
            if (!id) return;

            await loadSensorData(id);

            if (!deviceIdDb) return;
            await loadCurrentMode(deviceIdDb);
        })();
    }, [deviceIdDb]);

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
                {modeLoading ? (
                    <ActivityIndicator /> // hoặc ActivityIndicator
                ) : activeMode && selectedMode ? (
                    <ModeCard
                        deviceId={deviceIdDb}
                        activeMode={activeMode}
                        selectedMode={selectedMode}
                        onChange={handleModeChange}
                        onModeChanged={reloadModeFromServer}
                    />
                ) : null}
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
        padding: 16,
    },
});
