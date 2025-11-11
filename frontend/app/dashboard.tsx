import React, { JSX } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Dashboard(): JSX.Element {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chào mừng đến Dashboard!</Text>

      <Button
        title="Đăng xuất"
        onPress={() => {
          router.replace("/"); // Quay lại trang Login
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, marginBottom: 20 },
});
