// Funções puras que transformam as respostas do backend nos dados do Dashboard.

const MESES_CURTOS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MESES_LONGOS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const DIA_MS = 86400000;

const dois = (n) => String(n).padStart(2, '0');

/** Converte LocalDateTime do Spring ("2026-10-22T15:00:00" ou [2026,10,22,15,0]) em Date local. */
export function lerDataHora(valor) {
  if (!valor) return null;
  if (Array.isArray(valor)) {
    const [ano, mes, dia, hora = 0, minuto = 0, segundo = 0] = valor;
    return new Date(ano, mes - 1, dia, hora, minuto, segundo);
  }
  const partes = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!partes) return null;
  const [, ano, mes, dia, hora = 0, minuto = 0, segundo = 0] = partes;
  return new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
}

/** "HH:mm:ss" (java.sql.Time) -> minutos. */
export function lerTempoMinutos(tempo) {
  if (tempo == null) return null;
  if (typeof tempo === 'number') return tempo > 0 ? tempo : null;
  const partes = String(tempo).match(/^(\d{1,2}):(\d{2})/);
  if (!partes) return null;
  const minutos = Number(partes[1]) * 60 + Number(partes[2]);
  return minutos > 0 ? minutos : null;
}

export function formatarDuracao(minutos) {
  if (!minutos) return null;
  const horas = Math.floor(minutos / 60);
  const resto = Math.round(minutos % 60);
  if (!horas) return `${resto}min`;
  if (!resto) return `${horas}h`;
  return `${horas}h${dois(resto)}`;
}

export function formatarMoeda(valor, casas = 0) {
  if (valor == null || !Number.isFinite(Number(valor))) return '—';
  const fixo = Number(valor).toFixed(casas);
  const [inteiro, decimal] = fixo.split('.');
  const milhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${milhar}${decimal ? `,${decimal}` : ''}`;
}

export function formatarHora(data) {
  return data ? `${dois(data.getHours())}:${dois(data.getMinutes())}` : '--:--';
}

export function formatarDiaMes(data) {
  return data ? `${dois(data.getDate())}/${dois(data.getMonth() + 1)}` : '--/--';
}

/** "QUI · 22 OUT 2026" */
export function formatarDataCabecalho(agora = new Date()) {
  return `${DIAS_SEMANA[agora.getDay()]} · ${dois(agora.getDate())} ${MESES_CURTOS[agora.getMonth()].toUpperCase()} ${agora.getFullYear()}`;
}

/** "QUI 22/10" */
export function formatarDiaCurto(agora = new Date()) {
  return `${DIAS_SEMANA[agora.getDay()]} ${formatarDiaMes(agora)}`;
}

export function saudacao(agora = new Date()) {
  const hora = agora.getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function iniciais(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return '?';
  const primeira = partes[0][0];
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : '';
  return `${primeira}${ultima}`.toUpperCase();
}

const STATUS_AGENDA = {
  CONFIRMADO: 'ok',
  CONCLUIDO: 'concluido',
  PENDENTE: 'pendente',
  CANCELADO: 'cancelado',
};

function nomeCliente(agendamento) {
  return agendamento?.usuario?.nome || agendamento?.nomeUsuario || agendamento?.orcamento?.nome || 'Cliente';
}

/** Lista "Agenda de hoje" a partir de kpis.agendamentosDoDia (entidades Agendamento). */
export function montarAgendaHoje(agendamentosDoDia = []) {
  return agendamentosDoDia
    .map((agendamento) => {
      const data = lerDataHora(agendamento.dataHora);
      const minutos = lerTempoMinutos(agendamento.orcamento?.tempo) ?? lerTempoMinutos(agendamento.tempoDuracao);
      const detalhe = [
        agendamento.orcamento?.estilo,
        agendamento.orcamento?.localCorpo,
        formatarDuracao(minutos),
      ].filter(Boolean).join(' · ');
      return {
        id: agendamento.id,
        data,
        hora: formatarHora(data),
        nome: nomeCliente(agendamento),
        detalhe: detalhe || 'Detalhes não informados',
        status: STATUS_AGENDA[agendamento.status] || 'pendente',
        minutos: minutos || 0,
      };
    })
    .sort((a, b) => (a.data?.getTime() ?? 0) - (b.data?.getTime() ?? 0));
}

export function resumirAgendaHoje(agenda) {
  const ativas = agenda.filter((item) => item.status !== 'cancelado');
  return {
    sessoes: ativas.length,
    minutos: ativas.reduce((soma, item) => soma + item.minutos, 0),
    confirmadas: agenda.filter((item) => item.status === 'ok').length,
    concluidas: agenda.filter((item) => item.status === 'concluido').length,
    pendentes: agenda.filter((item) => item.status === 'pendente').length,
    canceladas: agenda.length - ativas.length,
  };
}

/**
 * Próximas sessões (até `limite`), futuras e não canceladas/concluídas.
 * Usa a lista de /agendamento quando disponível; senão, kpis.proximoAgendamento.
 */
export function montarProximasSessoes({ agendamentos, orcamentosPorCodigo, proximoAgendamento, agora = new Date(), limite = 3 }) {
  if (Array.isArray(agendamentos)) {
    return agendamentos
      .map((agendamento) => ({ agendamento, data: lerDataHora(agendamento.dataHora) }))
      .filter(({ agendamento, data }) => data && data > agora && ['CONFIRMADO', 'PENDENTE'].includes(agendamento.status))
      .sort((a, b) => a.data - b.data)
      .slice(0, limite)
      .map(({ agendamento, data }) => {
        const orcamento = orcamentosPorCodigo?.get(agendamento.codigoOrcamento);
        const detalhe = [`${formatarDiaMes(data)} às ${formatarHora(data)}`, orcamento?.estilo]
          .filter(Boolean).join(' · ');
        return {
          id: agendamento.id,
          nome: nomeCliente(agendamento),
          detalhe,
          pendente: agendamento.status === 'PENDENTE',
        };
      });
  }
  if (!proximoAgendamento) return [];
  const data = lerDataHora(proximoAgendamento.dataHora);
  return [{
    id: proximoAgendamento.id,
    nome: nomeCliente(proximoAgendamento),
    detalhe: [`${formatarDiaMes(data)} às ${formatarHora(data)}`, proximoAgendamento.orcamento?.estilo].filter(Boolean).join(' · '),
    pendente: false,
  }];
}

function formatarNumero(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return '—';
  return String(Number(numero.toFixed(2))).replace('.', ',');
}

/** kpis.alertasEstoque (entidades Estoque) -> linhas do card de alertas. */
export function montarAlertasEstoque(alertas = []) {
  return alertas.map((item) => ({
    id: item.id,
    nome: item.nome,
    detalhe: `${formatarNumero(item.quantidade)}/${formatarNumero(item.minAviso)} ${item.unidadeMedida || ''}`.trim(),
    zerado: Number(item.quantidade) <= 0,
  }));
}

export function montarOrcamentosPendentes(orcamentos = [], limite = 3) {
  return orcamentos
    .filter((orcamento) => orcamento.status === 'PENDENTE')
    .slice(0, limite)
    .map((orcamento) => ({
      codigo: orcamento.codigoOrcamento,
      iniciais: iniciais(orcamento.nome),
      nome: orcamento.nome || 'Cliente',
      detalhe: [orcamento.estilo, orcamento.valor != null ? formatarMoeda(orcamento.valor) : 'valor a definir']
        .filter(Boolean).join(' · '),
      local: orcamento.localCorpo || null,
    }));
}

/**
 * /dashboard/faturamento-anual devolve 12 valores, do mais antigo ao mês atual.
 * Gera os rótulos contando para trás a partir do mês atual.
 */
export function montarFaturamento(valores = [], agora = new Date(), meses = 6) {
  const lista = Array.isArray(valores) ? valores.map((valor) => Number(valor) || 0) : [];
  const total = lista.length;
  const serie = lista.map((valor, indice) => {
    const mes = new Date(agora.getFullYear(), agora.getMonth() - (total - 1 - indice), 1).getMonth();
    return { mes: MESES_CURTOS[mes], mesLongo: MESES_LONGOS[mes], valor };
  });
  const atual = serie[total - 1] || null;
  const anterior = serie[total - 2] || null;
  return {
    serie: serie.slice(-meses),
    mesAtual: atual?.valor ?? 0,
    mesAnterior: anterior?.valor ?? null,
    nomeMesAnterior: anterior?.mesLongo ?? null,
    variacao: variacaoPercentual(atual?.valor, anterior?.valor),
  };
}

export function variacaoPercentual(atual, anterior) {
  if (atual == null || anterior == null || !Number.isFinite(atual) || !Number.isFinite(anterior) || anterior === 0) return null;
  return ((atual - anterior) / anterior) * 100;
}

/**
 * Ticket médio dos agendamentos concluídos nos últimos `dias` dias
 * (valor vem do orçamento vinculado) e comparação com o período anterior.
 */
export function calcularTicketMedio({ agendamentos, orcamentosPorCodigo, agora = new Date(), dias = 30 }) {
  if (!Array.isArray(agendamentos) || !orcamentosPorCodigo) return null;
  const fim = agora.getTime();
  const inicio = fim - dias * DIA_MS;
  const inicioAnterior = inicio - dias * DIA_MS;

  const periodo = (de, ate) => {
    let soma = 0;
    let sessoes = 0;
    for (const agendamento of agendamentos) {
      if (agendamento.status !== 'CONCLUIDO') continue;
      const data = lerDataHora(agendamento.dataHora)?.getTime();
      if (data == null || data <= de || data > ate) continue;
      const valor = orcamentosPorCodigo.get(agendamento.codigoOrcamento)?.valor;
      if (valor == null || !Number.isFinite(Number(valor))) continue;
      soma += Number(valor);
      sessoes += 1;
    }
    return { sessoes, ticket: sessoes ? soma / sessoes : null };
  };

  const atual = periodo(inicio, fim);
  const anterior = periodo(inicioAnterior, inicio);
  return {
    ticket: atual.ticket,
    sessoes: atual.sessoes,
    variacao: variacaoPercentual(atual.ticket, anterior.ticket),
  };
}

export function indexarOrcamentos(orcamentos) {
  if (!Array.isArray(orcamentos)) return null;
  return new Map(orcamentos.map((orcamento) => [orcamento.codigoOrcamento, orcamento]));
}

export function formatarVariacao(variacao) {
  if (variacao == null) return null;
  const arredondado = Math.round(variacao);
  return `${arredondado > 0 ? '+' : ''}${arredondado}%`;
}
