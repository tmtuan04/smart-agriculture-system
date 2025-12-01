import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AIModeScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.text}>AI Mode View</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16, // khoảng cách bên trong
        backgroundColor: "#fff", // nền trắng
    },
    text: {
        fontSize: 18,
        color: "#000",
    },
});