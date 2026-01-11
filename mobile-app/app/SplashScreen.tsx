import { View, Animated } from "react-native";
import { useEffect, useRef } from "react";

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start(() => {
            onFinish?.(); // optionnal
        });
    }, []);

    return (
        <View style={{ 
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",    
        }}>
            <Animated.Image
                source={require("@/assets/images/splash-icon.png")}
                style={{ width: 100, height: 100, opacity }}
            />
        </View>
    );
}
