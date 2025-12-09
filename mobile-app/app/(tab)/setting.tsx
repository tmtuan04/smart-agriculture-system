import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function SettingScreen() {
    
    const handleLogout = async () => {
        Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đăng xuất",
                style: "destructive",
                onPress: async () => {
                    try {
                        // 1. Xóa token + user id và name
                        await SecureStore.deleteItemAsync("token");
                        await SecureStore.deleteItemAsync("userId");
                        await SecureStore.deleteItemAsync("userName");
                        
                        // 2. Quay về index.tsx (auth guard xử lý redirect)
                        router.replace("/");
                    } catch (error) {
                        console.log("Logout error:", error);
                    }
                },
            },
        ]);
    };

    const [userName, setUserName] = useState<string | null>(null);
    useEffect(() => {
        const fetchUserName = async () => {
            const name = await SecureStore.getItemAsync("userName");
            if (name) setUserName(name);
        };

        fetchUserName();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* ===== HEADER ===== */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Image
                        source={require("@/assets/images/user-icon.png")}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={styles.hello}>Hello</Text>
                        <Text style={styles.name}>{userName}</Text>
                    </View>
                </View>
            </View> 

            {/* DIVIDER */}
            <View style={styles.divider} />

            {/* ===== MENU ===== */}
            <View style={styles.menu}>
                <MenuItem
                    icon="account-circle"
                    text="Profile"
                    onPress={() => router.push("/profile")}
                />

                <MenuItem
                    icon="history"
                    text="Histories"
                    onPress={() => router.push("/histories")}
                />

                <MenuItem
                    icon="settings"
                    text="Setting"
                    onPress={() => {}}
                />
            </View>

            {/* ===== LOGOUT ===== */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <MaterialIcons name="logout" size={20} color="#fff" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

function MenuItem({
    icon,
    text,
    onPress,
}: {
    icon: any;
    text: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            <MaterialIcons name={icon} size={40} color="#667" />
            <Text style={styles.itemText}>{text}</Text>
        </TouchableOpacity>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 20,
        paddingHorizontal: 20,
    },

    /* HEADER */
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
    },
    hello: {
        fontSize: 14,
        color: "#888",
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111",
    },
    /* DIVIDER */
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginBottom: 24,
    },

    /* MENU */
    menu: {
        gap: 18,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 12,
        paddingLeft: 30,
    },
    itemText: {
        fontSize: 16,
        color: "#334",
    },

    /* LOGOUT */
    logoutBtn: {
        position: "absolute",
        left: 20,
        right: 20,
        bottom: 30,
        backgroundColor: "#7A8899",
        paddingVertical: 14,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
    logoutText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
});
