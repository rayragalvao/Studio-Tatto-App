import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  button: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 11,
    paddingHorizontal: 10,
  },
  text: { fontSize: 13, fontWeight: '700' },
});
