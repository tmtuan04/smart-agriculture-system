import {
    Text,
    StyleSheet,
    View,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getDeviceByUser } from "@/api/device";

/* ================== TYPE ================== */
type Device = {
    _id: string;
    deviceId: string;
    name: string;
    type: string;
    status?: string;
};

/* ============ ICON MAP BY TYPE ============ */
const getDeviceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
        case "esp32":
        case "esp8266":
            return { name: "cpu-32-bit", color: "#4CAF50" };

        case "sensor":
            return { name: "access-point", color: "#2196F3" };

        case "pump":
        case "relay":
            return { name: "water-pump", color: "#03A9F4" };

        case "camera":
            return { name: "cctv", color: "#9C27B0" };

        default:
            return { name: "devices", color: "#607D8B" };
    }
};

export default function DevicesScreen() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchDevices = async () => {
            try {
                const ownerID = await SecureStore.getItemAsync("userId");
                if (!ownerID) return;

                const res = await getDeviceByUser(ownerID);
                if (isMounted &&res.ok) setDevices(res.data);
            } catch (err) {
                console.log("Fetch devices error:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDevices();
        return () => {
            isMounted = false;
        };
    }, []);

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

    const renderItem = ({ item }: { item: Device }) => {
        const online = item.status === "online";
        const icon = getDeviceIcon(item.type);

        return (
            <View style={styles.card}>
                {/* Icon */}
                <View
                    style={[
                        styles.iconBox,
                        { backgroundColor: icon.color + "22" },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={icon.name as any}
                        size={26}
                        color={icon.color}
                    />
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.subText}>ID: {item.deviceId}</Text>
                    <Text style={styles.subText}>Type: {item.type}</Text>
                </View>

                {/* Status */}
                <View
                    style={[
                        styles.status,
                        { backgroundColor: online ? "#E8F5E9" : "#FDECEA" },
                    ]}
                >
                    <Text
                        style={{
                            color: online ? "#2E7D32" : "#C62828",
                            fontWeight: "600",
                        }}
                    >
                        {online ? "ONLINE" : "OFFLINE"}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>My Devices</Text>

            <FlatList
                data={devices}
                keyExtractor={(item) => item._id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

/* ================== STYLES ================== */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#F4F6FA",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        padding: 14,
        borderRadius: 14,
        backgroundColor: "#fff",
        marginBottom: 12,
        elevation: 3,
    },
    iconBox: {
        width: 46,
        height: 46,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: "700",
        marginBottom: 2,
    },
    subText: {
        fontSize: 13,
        color: "#666",
    },
    status: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F4F6FA",
    },

    loadingText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: "500",
        color: "#2c3e50",
    },

});
