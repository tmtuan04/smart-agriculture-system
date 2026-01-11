import { useEffect, useState } from "react";
import { FlatList, StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReportCard } from "./components/ReportCard";
import { ReportDetailModal } from "./components/ReportDetailModal";

import { getReportsApi, getReportDetailApi } from "@/api/reports";
import type { Report } from "./components/ReportCard";


export default function ReportsScreen() {
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);


    useEffect(() => {
        const fetchReports = async () => {
            const res = await getReportsApi();

            if (res.ok) {
                setReports(res.data.data);
            }
        };

        fetchReports();
    }, []);

    const openReportDetail = async (reportId: string) => {
        try {
            setLoadingDetail(true);

            const res = await getReportDetailApi(reportId);

            if (res.ok) {
                setSelectedReport(res.data);
                setModalVisible(true);
            }
        } finally {
            setLoadingDetail(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Báo cáo</Text>
            </View>
            <FlatList
                data={reports}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <ReportCard
                        report={item}
                        onPress={() => openReportDetail(item._id)}
                    />
                )}
            />
            <ReportDetailModal
                visible={modalVisible}
                report={selectedReport}
                onClose={() => {
                    setModalVisible(false);
                    setSelectedReport(null);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f6fa",
        padding: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#2c3e50",
    },
});
