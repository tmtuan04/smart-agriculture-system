import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type Props = {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    value: string;
    label: string;
};

export const StatusItem = ({ icon, color, value, label }: Props) => {
    return (
        <View style={styles.container}>
            <MaterialCommunityIcons name={icon} size={28} color={color} />
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '30%',
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
        color: '#212121',
    },
    label: {
        fontSize: 13,
        color: '#757575',
        marginTop: 4,
        textAlign: 'center',
    },
});
