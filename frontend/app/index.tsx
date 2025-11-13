import React, { JSX, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function LoginScreen(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Đăng nhập thành công:", userCredential.user.email);
    router.push("/dashboard");
  } catch (error: any) {
    console.error("❌ Lỗi đăng nhập:", error.code, error.message);
    Alert.alert("Đăng nhập thất bại", "Email hoặc mật khẩu không đúng!");
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Mật khẩu"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Đăng nhập" onPress={handleLogin} />

      <View style={{ marginTop: 20 }}>
        <Button
          title="Đăng nhập bằng Google"
          onPress={() => console.log("Google login")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
  },
});
