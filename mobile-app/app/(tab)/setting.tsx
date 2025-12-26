import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function SettingScreen() {
    
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<"profile" | "histories" | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const openModal = async (type: "profile" | "histories") => {
        setModalType(type);

        if (type === "profile") {
            const name = await SecureStore.getItemAsync("userName");
            const email = await SecureStore.getItemAsync("userEmail");
            setUserName(name);
            setUserEmail(email);
        }

        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setModalType(null);
    };

    const handleLogout = async () => {
        Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đăng xuất",
                style: "destructive",
                onPress: async () => {
                    try {
                        // Xóa token + user id và name
                        await SecureStore.deleteItemAsync("token");
                        await SecureStore.deleteItemAsync("userId");
                        await SecureStore.deleteItemAsync("userName");
                        await SecureStore.deleteItemAsync("userEmail");
                        
                        router.replace("/");
                    } catch (error) {
                        console.log("Logout error:", error);
                    }
                },
            },
        ]);
    };

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
                    onPress={() => openModal("profile")}
                />

                <MenuItem
                    icon="history"
                    text="Histories"
                    onPress={() => openModal("histories")}
                />

                <MenuItem
                    icon="settings"
                    text="Setting"
                    onPress={() => {}}
                />
            </View>
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>

                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {modalType === "profile" ? "Profile" : "Histories"}
                            </Text>

                            <TouchableOpacity onPress={closeModal}>
                                <MaterialIcons name="close" size={22} color="#555" />
                            </TouchableOpacity>
                        </View>

                        {modalType === "profile" && (
                            <View style={styles.profileBox}>
                                
                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>User Name</Text>
                                    <Text style={styles.value}>
                                        {userName ?? "N/A"}
                                    </Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.label}>User Email</Text>
                                    <Text style={styles.value}>
                                        {userEmail ?? "N/A"}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {modalType === "histories" && (
                            <View style={styles.historyBox}>
                                <MaterialIcons name="history" size={36} color="#777" />
                                <Text style={styles.historyText}>history</Text>
                            </View>
                        )}

                    </View>
                </View>
            </Modal>

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
    },
    itemText: {
        fontSize: 16,
        color: "#334",
    },
    /* MODAL */
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        minHeight: 240,
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
    },

    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111",
    },

    /* PROFILE */
    profileBox: {
        backgroundColor: "#F8F9FB",
        borderRadius: 12,
        padding: 16,
    },

    infoRow: {
        marginBottom: 12,
    },

    label: {
        fontSize: 13,
        color: "#777",
        marginBottom: 4,
    },

    value: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111",
    },

    /* HISTORIES */
    historyBox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    historyText: {
        marginTop: 12,
        fontSize: 16,
        color: "#444",
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
