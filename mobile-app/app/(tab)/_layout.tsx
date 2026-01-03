import { Tabs } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialIcons } from "@expo/vector-icons";

const ICON_SIZE = 22;

export default function TabsLayout() {
    const colorScheme = useColorScheme() ?? "light";

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
            }}
            tabBar={(props) => <CustomTabBar {...props} colorScheme={colorScheme} />}
        >
            <Tabs.Screen name="overview" options={{ title: "Overview" }} />
            <Tabs.Screen name="devices" options={{ title: "Devices" }} />
            <Tabs.Screen name="alert" options={{ title: "Alert" }} />
            <Tabs.Screen name="reports" options={{ title: "Reports" }} />
            <Tabs.Screen name="setting" options={{ title: "Setting" }} />
        </Tabs>
    );
}

/*  CUSTOM TAB BAR  */

function CustomTabBar({ state, descriptors, navigation, colorScheme }: any) {
    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                {state.routes.map((route: any, index: number) => {
                    const { options } = descriptors[route.key];
                    const label = options.title ?? route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const color = isFocused ? "#2F80ED" : "#757575";

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={onPress}
                            style={[
                                styles.tab,
                                isFocused && styles.tabActive,
                            ]}
                        >
                            <MaterialIcons
                                name={getIconName(route.name)}
                                size={ICON_SIZE}
                                color={color}
                            />
                            <Text
                                style={[
                                    styles.label,
                                    { color },
                                ]}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

/*  ICON MAP  */

function getIconName(routeName: string) {
    switch (routeName) {
        case "overview":
            return "home";
        case "devices":
            return "devices";
        case "alert":
            return "notifications";
        case "reports":
            return "assessment";
        case "setting":
            return "settings";
        default:
            return "circle";
    }
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "#F5F7FA",
        paddingBottom: 10,
        marginBottom: 8,    
    },
    container: {
        flexDirection: "row",
        marginHorizontal: 16,
        padding: 6,
        borderRadius: 20,
        backgroundColor: "#F1F3F5",
    },
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 8,
        borderRadius: 14,
    },
    tabActive: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 4,
    },
    label: {
        fontSize: 11,
        fontWeight: "600",
        marginTop: 2,
    },
});
