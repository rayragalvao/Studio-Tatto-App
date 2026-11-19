import { apiRequest } from './api';

export function listarHistoricoClientes(busca = '', signal) {
  const query = busca.trim() ? `?busca=${encodeURIComponent(busca.trim())}` : '';
  return apiRequest(`/historico-clientes${query}`, { signal });
}

export function buscarDetalhesCliente(clienteId, signal) {
  return apiRequest(`/historico-clientes/${clienteId}`, { signal });
}

const moeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatarMoeda(valor) {
  return valor == null ? '—' : moeda.format(Number(valor));
}

export function formatarUltimaSessao(dataHora) {
  if (!dataHora) return '—';
  const data = new Date(dataHora);
  if (Number.isNaN(data.getTime())) return '—';

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diaSessao = new Date(data);
  diaSessao.setHours(0, 0, 0, 0);
  const dias = Math.max(0, Math.floor((hoje - diaSessao) / 86400000));

  if (dias === 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias === 7) return '1 semana';
  if (dias === 30) return '1 mês';
  if (dias < 30 && dias % 7 === 0) return `${dias / 7} semanas`;
  return `${dias} dias atrás`;
}

export function formatarDataSessao(dataHora) {
  if (!dataHora) return 'Data não informada';
  const data = new Date(dataHora);
  if (Number.isNaN(data.getTime())) return 'Data não informada';
  return new Intl.DateTimeFormat('pt-BR').format(data);
}

export function formatarDuracao(minutos) {
  if (!minutos) return null;
  const horas = Math.floor(minutos / 60);
  const restante = minutos % 60;
  if (!horas) return `${restante}min`;
  if (!restante) return `${horas}h`;
  return `${horas}h${String(restante).padStart(2, '0')}`;
}
