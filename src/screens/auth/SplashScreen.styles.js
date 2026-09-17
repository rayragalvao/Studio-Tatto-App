import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    top: '25%',
    right: -180,
    width: 500,
    height: 500,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    fontWeight: '800',
    letterSpacing: 1,
  },
});