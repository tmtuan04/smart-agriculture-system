import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { getMeApi } from "@/api/auth";
import ImageViewing from "react-native-image-viewing";

type User = {
    _id: string;
    email: string;
    fullName: string;
    profilePic?: string;
};

type Props = {
    userName: string | null;
};

export const HeaderSection = ({ userName }: Props) => {
    const [user, setUser] = useState<User | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const fetchMe = async () => {
            const res = await getMeApi();

            if (res.ok) {
                setUser(res.data);
            }
        };

        fetchMe();
    }, []);
    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.greetingText}>Chào mừng trở lại!</Text>
                <Text style={styles.subGreetingText}>{user?.fullName ?? "—"}</Text>
            </View>

            <Pressable onPress={() => setVisible(true)}>
                <View style={styles.profileIcon}>
                    <Image
                        source={
                            user?.profilePic
                                ? { uri: user.profilePic }
                                : require("@/assets/images/user-icon.png")
                        }
                        style={styles.avatarImage}
                    />
                </View>
            </Pressable>

            <ImageViewing
                images={[
                    {
                        uri:
                            user?.profilePic ??
                            Image.resolveAssetSource(
                                require("@/assets/images/user-icon.png")
                            ).uri,
                    },
                ]}
                imageIndex={0}
                visible={visible}
                onRequestClose={() => setVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    greetingText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#212121',
    },
    subGreetingText: {
        fontSize: 14,
        color: '#757575',
        marginTop: 4,
    },
    profileIcon: {
        width: 45,
        height: 45,
        backgroundColor: '#fff',
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 22.5,
    },
});
