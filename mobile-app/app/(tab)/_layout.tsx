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
                name="manual"
                options={{
                    title: "Manual",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="handyman" color={color} size={ICON_SIZE} />
                    ),
                }}
            />
            <Tabs.Screen
                name="auto"
                options={{
                    title: "Auto",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="directions-car" color={color} size={ICON_SIZE} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ai-mode"
                options={{
                    title: "AI Mode",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="smart-toy" color={color} size={ICON_SIZE} />
                    ),
                }}
            />
        </Tabs>
    );
}
