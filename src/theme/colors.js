export const colors = {
  background: '#130a0a',
  backgroundGlowMid: '#280809',
  backgroundGlowBright: '#D70004',
  card: '#1b0d0d',
  cardBorder: '#e40e111f',
  input: '#ffffff0d',
  inputBorder: '#ffffff14',
  primary: '#9F1214',
  primaryDark: '#5c0a0b',
  text: '#d8d8d8',
  textMuted: '#ffffff80',
  textPlaceholder: '#ffffff4d',
  success: '#3ddc84',
  warning: '#e2a83e',
  danger: '#ff5a5f',
  info: '#22b8cf',
};

// status -> cor da barra/indicador. "critico" reaproveita a paleta de vermelho do app
// em vez de outro tom, pra não competir com o accent principal.
export const statusColors = {
  critico: colors.backgroundGlowBright, // #D70004
  atencao: colors.warning,
  ok: colors.success,
};