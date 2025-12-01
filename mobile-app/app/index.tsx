import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import SplashScreen from "./SplashScreen";
import { getItemAsync } from "expo-secure-store";

export default function Index() {
    const [ready, setReady] = useState(false);
    const [logged, setLogged] = useState<boolean>(false);

    useEffect(() => {
        const init = async () => {
            const token = await getItemAsync("token");
            setLogged(!!token);

            setTimeout(() => setReady(true), 1500);
        };

        init();
    }, []);

    if (!ready) return <SplashScreen />;

    if (logged) return <Redirect href="/(tab)/manual" />;

    return <Redirect href="/(auth)/login" />;
}
