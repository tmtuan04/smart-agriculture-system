import React, { useState } from "react";
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Text,
    View,
    Alert,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GoogleLogo from "@/assets/images/google-icon.png";
import { loginApi, signupApi } from "@/api/auth";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store"

export default function AuthScreen() {
    const [screenType, setScreenType] = useState<"login" | "signup">("login");
    const [fullName, setfullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const router = useRouter();

    const handleSubmit = async () => {
        if (!email || !password || (screenType === "signup" && !fullName)) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
            return;
        }

        try {
            if (screenType === "login") {
                const { ok, data } = await loginApi(email, password);
                const userId = data?._id;
                if (!userId) {
                        Alert.alert("Login lỗi", "Thiếu userId");
                        return;
                }
                if (ok) {
                    // Lưu token
                    await SecureStore.setItemAsync("token", data.token); 
                    // Lưu userId
                    await SecureStore.setItemAsync("userId", data._id);
                    // Lưu tên
                    await SecureStore.setItemAsync("userName", data.fullName);
                    router.replace({
                        pathname: "/overview",
                        params: { 
                            userId: data._id,
                            userName: data.fullName,
                        },
                    });
                } else {
                    Alert.alert("Đăng nhập thất bại", data.message);
                }
            } else {
                const { ok, data } = await signupApi(fullName, email, password);

                if (ok) {
                    if (data?.token) {
                        // Lưu token
                        await SecureStore.setItemAsync("token", data.token);
                        // Lưu userId
                        await SecureStore.setItemAsync("userId", data._id);
                        // Lưu tên
                        await SecureStore.setItemAsync("userName", data.fullName);
                        router.replace({
                            pathname: "/overview",
                            params: { 
                                userId: data._id,
                                userName: data.fullName,
                            },
                        });
                    } else {
                        Alert.alert("Đăng ký thành công", "Bạn có thể đăng nhập ngay bây giờ!");
                        setScreenType("login");
                    }
                } else {
                    Alert.alert("Đăng ký thất bại", data.message);
                }
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Lỗi mạng", "Không thể kết nối tới server.");
        }
    };

    const handleGoogleLogin = () => {
        Alert.alert("Google Login", "TODO: Tích hợp Google Auth");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>
                    {screenType === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản"}
                </Text>

                <Text style={styles.subtitle}>
                    {screenType === "login"
                        ? "Đăng nhập để tiếp tục"
                        : "Hãy tạo tài khoản để sử dụng hệ thống"}
                </Text>

                {/* fullName (chỉ khi đăng ký) */}
                {screenType === "signup" && (
                    <TextInput
                        style={styles.input}
                        placeholder="Họ và Tên"
                        placeholderTextColor="#9ca3af"
                        value={fullName}
                        onChangeText={setfullName}
                    />
                )}

                {/* Email */}
                <TextInput
                    style={styles.input}
                    placeholder="Địa chỉ Email"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                {/* Password */}
                <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                />

                {/* Button submit */}
                <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
                    <Text style={styles.loginButtonText}>
                        {screenType === "login" ? "Đăng nhập" : "Đăng ký"}
                    </Text>
                </TouchableOpacity>

                {/* Switch */}
                <TouchableOpacity
                    onPress={() =>
                        setScreenType(screenType === "login" ? "signup" : "login")
                    }
                    style={{ marginTop: 15 }}
                >
                    <Text style={{ color: "#2563eb" }}>
                        {screenType === "login"
                            ? "Bạn chưa có tài khoản? Đăng ký"
                            : "Bạn đã có tài khoản? Đăng nhập"}
                    </Text>
                </TouchableOpacity>

                {/* Separator */}
                <View style={styles.separatorContainer}>
                    <View style={styles.separatorLine} />
                    <Text style={styles.separatorText}>HOẶC</Text>
                    <View style={styles.separatorLine} />
                </View>

                {/* Google Login */}
                <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                    <Image source={GoogleLogo} style={styles.googleIconImage} />
                    <Text style={styles.googleButtonText}>Đăng nhập bằng Google</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#6b7280",
        marginBottom: 40,
    },
    input: {
        width: "100%",
        height: 50,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        fontSize: 16,
    },
    loginButton: {
        width: "100%",
        height: 50,
        backgroundColor: "#2563eb",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        elevation: 5,
    },
    loginButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
    },
    separatorContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginVertical: 30,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#d1d5db",
    },
    separatorText: {
        width: 50,
        textAlign: "center",
        color: "#6b7280",
        fontSize: 14,
    },
    googleButton: {
        flexDirection: "row",
        width: "100%",
        height: 50,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        elevation: 2,
    },
    googleIconImage: {
        width: 24,
        height: 24,
        marginRight: 10,
        resizeMode: "contain",
    },
    googleButtonText: {
        color: "#1f2937",
        fontSize: 16,
        fontWeight: "600",
    },
});
