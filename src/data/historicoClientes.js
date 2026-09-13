// Dados demonstrativos até a integração com o cadastro e a agenda do estúdio.
// As sessões estão ordenadas da mais recente para a mais antiga.
export const clientes = [
  {
    id: 'lf', nome: 'Lucas Ferreira', iniciais: 'LF', estilos: ['Japonês', 'Neotradicional'],
    sessoes: [
      { id: 'lf-6', diasAtras: 0, procedimento: 'Manga japonesa — acabamento', estilo: 'Japonês', duracao: '3h', valor: 500 },
      { id: 'lf-5', diasAtras: 18, procedimento: 'Manga japonesa — sombreamento', estilo: 'Japonês', duracao: '3h', valor: 420 },
      { id: 'lf-4', diasAtras: 42, procedimento: 'Manga japonesa — contorno', estilo: 'Japonês', duracao: '2h30', valor: 380 },
      { id: 'lf-3', diasAtras: 80, procedimento: 'Crisântemo neotradicional', estilo: 'Neotradicional', duracao: '3h', valor: 420 },
      { id: 'lf-2', diasAtras: 130, procedimento: 'Peônia japonesa', estilo: 'Japonês', duracao: '2h', valor: 320 },
      { id: 'lf-1', diasAtras: 210, procedimento: 'Primeiros traços da manga', estilo: 'Japonês', duracao: '2h', valor: 300 },
    ],
  },
  {
    id: 'mc', nome: 'Mariana Costa', iniciais: 'MC', estilos: ['Fineline', 'Lettering'],
    sessoes: [
      { id: 'mc-4', diasAtras: 0, procedimento: 'Letra fina no pulso', estilo: 'Lettering', duracao: '1h30', valor: 320 },
      { id: 'mc-3', diasAtras: 12, procedimento: 'Flores em traço fino', estilo: 'Fineline', duracao: '2h', valor: 300 },
      { id: 'mc-2', diasAtras: 35, procedimento: 'Lettering no antebraço', estilo: 'Lettering', duracao: '1h30', valor: 280 },
      { id: 'mc-1', diasAtras: 90, procedimento: 'Traço fino no ombro', estilo: 'Fineline', duracao: '1h', valor: 220 },
    ],
  },
  {
    id: 'cr', nome: 'Clara Ribeiro', iniciais: 'CR', estilos: ['Blackwork'],
    sessoes: [
      { id: 'cr-3', diasAtras: 2, procedimento: 'Blackwork no braço', estilo: 'Blackwork', duracao: '4h', valor: 620 },
      { id: 'cr-2', diasAtras: 32, procedimento: 'Blackwork geométrico', estilo: 'Blackwork', duracao: '3h', valor: 540 },
      { id: 'cr-1', diasAtras: 100, procedimento: 'Preenchimento blackwork', estilo: 'Blackwork', duracao: '2h30', valor: 420 },
    ],
  },
  {
    id: 'rs', nome: 'Rafael Souza', iniciais: 'RS', estilos: ['Geométrico', 'Fineline'],
    sessoes: [
      { id: 'rs-2', diasAtras: 7, procedimento: 'Geométrico na costela', estilo: 'Geométrico', duracao: '2h', valor: 420 },
      { id: 'rs-1', diasAtras: 58, procedimento: 'Linhas finas no braço', estilo: 'Fineline', duracao: '2h', valor: 320 },
    ],
  },
  {
    id: 'fl', nome: 'Fernanda Lima', iniciais: 'FL', estilos: ['Neotradicional', 'Realismo'],
    sessoes: [
      { id: 'fl-8', diasAtras: 21, procedimento: 'Neotradicional no braço', estilo: 'Neotradicional', duracao: '3h', valor: 540 },
      { id: 'fl-7', diasAtras: 43, procedimento: 'Rosa em realismo', estilo: 'Realismo', duracao: '3h', valor: 480 },
      { id: 'fl-6', diasAtras: 75, procedimento: 'Flor neotradicional', estilo: 'Neotradicional', duracao: '3h', valor: 440 },
      { id: 'fl-5', diasAtras: 108, procedimento: 'Detalhes da composição', estilo: 'Neotradicional', duracao: '2h30', valor: 420 },
      { id: 'fl-4', diasAtras: 140, procedimento: 'Realismo no antebraço', estilo: 'Realismo', duracao: '2h30', valor: 400 },
      { id: 'fl-3', diasAtras: 178, procedimento: 'Sombreamento floral', estilo: 'Neotradicional', duracao: '2h', valor: 360 },
      { id: 'fl-2', diasAtras: 220, procedimento: 'Contorno floral', estilo: 'Neotradicional', duracao: '2h', valor: 300 },
      { id: 'fl-1', diasAtras: 260, procedimento: 'Primeira sessão floral', estilo: 'Neotradicional', duracao: '1h30', valor: 260 },
    ],
  },
  {
    id: 'dl', nome: 'Diego Lopes', iniciais: 'DL', estilos: ['Blackwork'],
    sessoes: [
      { id: 'dl-1', diasAtras: 284, procedimento: 'Medusa na mão', estilo: 'Blackwork', duracao: '3h', valor: 480 },
    ],
  },
  {
    id: 'ba', nome: 'Beatriz Alves', iniciais: 'BA', estilos: ['Neotradicional'],
    sessoes: [
      { id: 'ba-2', diasAtras: 30, procedimento: 'Neotradicional floral', estilo: 'Neotradicional', duracao: '2h', valor: 320 },
      { id: 'ba-1', diasAtras: 90, procedimento: 'Detalhes florais', estilo: 'Neotradicional', duracao: '1h30', valor: 240 },
    ],
  },
];

const moeda = new Intl.NumberFormat('pt-BR');

export function formatarMoeda(valor) {
  return valor == null ? '—' : `R$ ${moeda.format(valor)}`;
}

export function obterResumoCliente(cliente) {
  return {
    quantidadeSessoes: cliente.sessoes.length,
    gastoTotal: cliente.sessoes.reduce((total, sessao) => total + (sessao.valor ?? 0), 0),
    diasDesdeUltimaSessao: cliente.sessoes[0]?.diasAtras ?? null,
  };
}

export function formatarUltimaSessao(diasAtras) {
  if (diasAtras == null) return '—';
  if (diasAtras === 0) return 'hoje';
  if (diasAtras === 1) return 'ontem';
  if (diasAtras < 7) return `${diasAtras} dias atrás`;
  if (diasAtras === 7) return '1 semana';
  if (diasAtras < 30 && diasAtras % 7 === 0) return `${diasAtras / 7} semanas`;
  if (diasAtras === 30) return '1 mês';
  return `${diasAtras} dias atrás`;
}

export function formatarDataSessao(diasAtras) {
  if (diasAtras == null) return 'Data não informada';

  const data = new Date();
  data.setHours(12, 0, 0, 0);
  data.setDate(data.getDate() - diasAtras);

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${data.getFullYear()}`;
}
