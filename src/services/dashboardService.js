import { apiRequest } from './api';
import {
  calcularTicketMedio,
  indexarOrcamentos,
  montarAgendaHoje,
  montarAlertasEstoque,
  montarFaturamento,
  montarOrcamentosPendentes,
  montarProximasSessoes,
  resumirAgendaHoje,
} from './dashboardModel';

// Endpoints que respondem 204 sem corpo quando não há registros.
const listaOuVazia = (resposta) => (Array.isArray(resposta) ? resposta : []);

async function opcional(promessa) {
  try {
    return await promessa;
  } catch (falha) {
    // Sessão expirada deve derrubar a tela inteira; outros erros só escondem o bloco.
    if (falha?.status === 401) throw falha;
    return undefined;
  }
}

export async function carregarDashboard(signal) {
  const agora = new Date();
  const [kpis, faturamentoAnual, orcamentosResp, agendamentosResp] = await Promise.all([
    apiRequest('/dashboard/kpis', { signal }),
    apiRequest('/dashboard/faturamento-anual', { signal }),
    opcional(apiRequest('/orcamento', { signal })),
    opcional(apiRequest('/agendamento', { signal })),
  ]);

  const orcamentos = orcamentosResp === undefined ? null : listaOuVazia(orcamentosResp);
  const agendamentos = agendamentosResp === undefined ? null : listaOuVazia(agendamentosResp);
  const orcamentosPorCodigo = indexarOrcamentos(orcamentos);

  const agendaHoje = montarAgendaHoje(kpis?.agendamentosDoDia || []);

  let ticket = calcularTicketMedio({ agendamentos, orcamentosPorCodigo, agora });
  if (!ticket) {
    // Sem /agendamento ou /orcamento: média geral (faturamento total ÷ sessões concluídas).
    const estatisticas = await opcional(apiRequest('/dashboard/estatisticas', { signal }));
    if (estatisticas) {
      const concluidos = Number(estatisticas.agendamentosConcluidos) || 0;
      ticket = {
        ticket: concluidos ? Number(estatisticas.faturamentoTotal || 0) / concluidos : null,
        sessoes: concluidos,
        variacao: null,
        geral: true,
      };
    }
  }

  return {
    agenda: agendaHoje,
    resumoHoje: resumirAgendaHoje(agendaHoje),
    proximasSessoes: montarProximasSessoes({
      agendamentos,
      orcamentosPorCodigo,
      proximoAgendamento: kpis?.proximoAgendamento,
      agora,
    }),
    alertasEstoque: montarAlertasEstoque(kpis?.alertasEstoque || []),
    totalOrcamentosPendentes: Number(kpis?.orcamentosPendentes) || 0,
    orcamentosPendentes: orcamentos ? montarOrcamentosPendentes(orcamentos) : null,
    faturamento: montarFaturamento(faturamentoAnual, agora),
    ticket,
  };
}
