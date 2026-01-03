import { View, Text, StyleSheet, Image } from "react-native";

type Props = {
    userName: string | null;
};

export const HeaderSection = ({ userName }: Props) => {
    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.greetingText}>Chào mừng trở lại!</Text>
                <Text style={styles.subGreetingText}>{userName}</Text>
            </View>

            <View style={styles.profileIcon}>
                <Image
                    source={require('@/assets/images/user-icon.png')}
                    style={styles.avatarImage}
                    resizeMode="cover"
                />
            </View>
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
        width: '50%',
        height: '50%',
    },
});
