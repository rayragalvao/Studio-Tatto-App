import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    glow: {
        position: 'absolute',
        top: '35%',
        right: -180,
        width: 500,
        height: 500,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    iconBox: {
        backgroundColor: colors.primary,
        width: 45,
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        width: 45,
        height: 45,
    },
    logoText: {
        color: colors.text,
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    subtitle: {
        color: colors.textMuted,
        fontSize: 13,
    },
    card: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        borderRadius: 20,
        padding: 24,
    },
    label: {
        color: colors.textMuted,
        fontSize: 11,
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.input,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: colors.text,
        fontSize: 15,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
    },
    buttonText: {
        color: colors.text,
        fontWeight: '700',
        fontSize: 15,
    },
    footerText: {
        color: colors.textMuted,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 16,
    },
});