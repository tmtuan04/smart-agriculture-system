import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import dayjs from "dayjs";
import { Report } from "./ReportCard";

type Props = {
    visible: boolean;
    report: Report | null;
    onClose: () => void;
};

export const ReportDetailModal = ({ visible, report, onClose }: Props) => {
    if (!report) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {dayjs(report.reportDate).format("DD/MM/YYYY")}
                        </Text>
                        <Pressable onPress={onClose}>
                            <Text style={styles.close}>✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView>
                        <Text style={styles.device}>{report.deviceId.name}</Text>

                        {/* Watering */}
                        <Section title="Watering">
                            <Text style={styles.value}>
                                {report.watering?.totalSessions ?? 0} sessions ·{" "}
                                {report.watering?.totalDurationMinutes ?? 0} min
                            </Text>
                        </Section>

                        {/* Stats */}
                        {report.stats && (
                            <Section title="Stats">
                                <Stat label="Temperature" data={report.stats.temperature} unit="°C" />
                                <Stat label="Humidity" data={report.stats.humidity} unit="%" />
                                <Stat label="Soil Moisture" data={report.stats.soilMoisture} unit="%" />
                            </Section>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

/* ===== Sub Components ===== */

const Section = ({ title, children }: any) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const Stat = ({ label, data, unit }: any) => {
    if (!data) return null;
    return (
        <Text style={styles.value}>
            {label}: avg {data.avg.toFixed(1)}
            {unit} · min {data.min}
            {unit} · max {data.max}
            {unit}
        </Text>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: "#fff",
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "85%",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    close: {
        fontSize: 20,
        color: "#757575",
    },
    device: {
        fontSize: 14,
        color: "#757575",
        marginBottom: 16,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        marginBottom: 6,
    },
    value: {
        fontSize: 14,
        color: "#333",
        marginBottom: 4,
    },
});

