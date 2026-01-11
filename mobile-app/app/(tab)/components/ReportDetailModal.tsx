import { Modal, View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import dayjs from "dayjs";
import { Report } from "./ReportCard";

const format1 = (value?: number) =>
    typeof value === "number" ? value.toFixed(1) : "-";

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
        <View style={styles.sectionBody}>{children}</View>
    </View>
);

const Stat = ({ label, data, unit }: any) => {
    if (!data) return null;

    return (
        <View style={styles.statRow}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>
                <Text style={styles.bold}>Avg</Text> {format1(data.avg)}
                {unit} · <Text style={styles.bold}>Min</Text> {format1(data.min)}
                {unit} · <Text style={styles.bold}>Max</Text> {format1(data.max)}
                {unit}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "flex-end",
    },

    container: {
        backgroundColor: "#fff",
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "85%",
    },

    /* Header */
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: "800",
    },
    close: {
        fontSize: 22,
        color: "#999",
    },
    device: {
        fontSize: 14,
        color: "#666",
        marginBottom: 16,
        fontWeight: "500",
    },

    /* Section */
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 8,
    },
    sectionBody: {
        backgroundColor: "#F7F8FA",
        borderRadius: 12,
        padding: 12,
    },

    /* Text */
    value: {
        fontSize: 14,
        color: "#333",
    },
    bold: {
        fontWeight: "700",
    },

    /* Stats */
    statRow: {
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 13,
        color: "#666",
        marginBottom: 2,
    },
    statValue: {
        fontSize: 14,
        color: "#111",
    },
});