export const colors = {
  background: '#0F0808',
  backgroundGlowMid: '#280809',
  backgroundGlowBright: '#D70004',
  card: 'rgba(255,255,255,0.03)',
  cardBorder: 'rgba(255,255,255,0.08)',
  input: 'rgba(255,255,255,0.05)',
  inputBorder: 'rgba(255,255,255,0.08)',
  primary: '#9F1214',
  primaryDark: '#5c0a0b',
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.5)',
  textPlaceholder: 'rgba(255,255,255,0.3)',
  success: '#3ddc84',
  warning: '#e2a83e',
};

// status -> cor da barra/indicador. "critico" reaproveita a paleta de vermelho do app
// em vez de outro tom, pra não competir com o accent principal.
export const statusColors = {
  critico: colors.backgroundGlowBright, // #D70004
  atencao: colors.warning,
  ok: colors.success,
};