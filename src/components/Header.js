import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function Header({ title, hasNotification = true }) {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { nome } = useAuth();

    const handleLeftPress = () => {
        if (canGoBack) {
            navigation.goBack();
        } else {
            navigation.getParent('RootDrawer')?.openDrawer();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top + 1 }]}>
            <TouchableOpacity onPress={handleLeftPress} hitSlop={10}>
                <Ionicons name="menu" size={24} color={colors.text} />
            </TouchableOpacity>

            {title ? <Text style={styles.title}>{title}</Text> : <View />}

            <View style={styles.rightIcons}>
                <TouchableOpacity hitSlop={10} style={{ marginRight: 16 }}>
                    <Ionicons name="notifications-outline" size={22} color={colors.text} />
                    {hasNotification && <View style={styles.dot} />}
                </TouchableOpacity>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{nome.charAt(0).toUpperCase()}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 12,
    },
    title: { color: colors.text, fontSize: 16, fontWeight: '700' },
    rightIcons: { flexDirection: 'row', alignItems: 'center' },
    dot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { color: colors.text, fontSize: 12, fontWeight: '700' },
});