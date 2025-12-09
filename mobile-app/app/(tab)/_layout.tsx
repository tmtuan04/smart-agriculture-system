import { Tabs } from "expo-router";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

const ICON_SIZE = 22;

export default function TabsLayout() {
    const colorScheme = useColorScheme() ?? "light";
    
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme].tint,
                tabBarInactiveTintColor: Colors[colorScheme].text,
                tabBarStyle: {
                    backgroundColor: Colors[colorScheme].background,
                    height: 70,
                    paddingBottom: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="overview"
                options={{
                    title: "Overview",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="home" color={color} size={ICON_SIZE} />
                    ),
                }}
            />
            
            <Tabs.Screen
                name="devices"
                options={{
                    title: "Devices",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="devices" color={color} size={ICON_SIZE} />
                    ),
                }}
            />
            <Tabs.Screen
                name="alert"
                options={{
                    title: "Alert",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="notifications" color={color} size={ICON_SIZE} />
                    ),
                }}
            />
            <Tabs.Screen
                name="reports"
                options={{
                    title: "Reports",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="assessment" color={color} size={ICON_SIZE} />
                    ),
                }}
            />
            <Tabs.Screen
                name="setting"
                options={{
                    title: "Setting",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="settings" color={color} size={ICON_SIZE} />
                    ),
                }}
            />
        </Tabs>
    );
}
