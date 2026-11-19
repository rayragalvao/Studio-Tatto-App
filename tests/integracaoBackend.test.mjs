import assert from 'node:assert/strict';
import test from 'node:test';
import {
  agruparEntradasPorMaterial,
  anexarHistorico,
  encontrarMaterialEstoque,
  normalizarMaterial,
  prepararEntrada,
  resolverMaterialDaEntrada,
} from '../src/services/estoqueModel.js';
import {
  calcularTicketMedio,
  formatarDataCabecalho,
  formatarMoeda,
  indexarOrcamentos,
  lerDataHora,
  montarAgendaHoje,
  montarAlertasEstoque,
  montarFaturamento,
  montarOrcamentosPendentes,
  montarProximasSessoes,
  resumirAgendaHoje,
} from '../src/services/dashboardModel.js';

const DO_BACKEND = [
  { id: 1, nome: 'Luvas', quantidade: 10, unidadeMedida: 'unidades', minAviso: 10 },
  { id: 3, nome: 'Tinta preta', quantidade: 30.5, unidadeMedida: 'ml', minAviso: null },
  { id: 14, nome: 'Plástico filme', quantidade: 2, unidadeMedida: 'rolos', minAviso: 1 },
].map(normalizarMaterial);

test('normaliza o DTO do backend para o formato da tela', () => {
  assert.deepEqual(DO_BACKEND[0], { id: 1, material: 'Luvas', qtdAtual: 10, unidade: 'unidades', minAviso: 10, status: 'critico' });
  assert.equal(DO_BACKEND[1].status, 'semDados');
  assert.equal(DO_BACKEND[2].status, 'ok');
});

test('reconhece materiais do backend pelo nome e pelos apelidos', () => {
  assert.equal(encontrarMaterialEstoque('LUVAS NITRÍLICAS P', DO_BACKEND)?.id, 1);
  assert.equal(encontrarMaterialEstoque('PAPEL FILME PVC', DO_BACKEND)?.id, 14);
  assert.equal(encontrarMaterialEstoque('Tinta azul', DO_BACKEND), null);
});

test('prepara entrada com id numérico e agrupa por material', () => {
  const a = prepararEntrada({ material: 'Luvas', materialEstoqueId: 1, quantidade: 2, unidade: 'CX', valorUnitario: 30, conteudoPorEmbalagem: 100 }, DO_BACKEND);
  const b = prepararEntrada({ material: 'Luva M', materialEstoqueId: 1, quantidade: 5, unidade: 'un', valorUnitario: 1 }, DO_BACKEND);
  assert.equal(a.materialId, 1);
  const totais = agruparEntradasPorMaterial([a, b]);
  assert.equal(totais.get(1), 205);
});

test('liga histórico antigo (id em texto) e novo (id numérico) sem alterar quantidades', () => {
  const antigo = { materialId: 'luvas', quantidade: 12, unidade: 'unidades', identificador: 'NF 1', data: '01/09', valorUnitario: 2, valorTotal: 24 };
  const novo = { materialId: 3, quantidade: 1000, unidade: 'ml', identificador: 'NF 2', data: '02/09', valorUnitario: 0.05, valorTotal: 50 };
  assert.equal(resolverMaterialDaEntrada(antigo, DO_BACKEND)?.id, 1);
  const estoque = anexarHistorico(DO_BACKEND, { itens: [antigo, novo] });
  assert.equal(estoque.find((m) => m.id === 1).qtdAtual, 10);
  assert.equal(estoque.find((m) => m.id === 1).nf, 'NF 1');
  assert.equal(estoque.find((m) => m.id === 3).nf, 'NF 2');
  assert.equal(DO_BACKEND[0].nf, undefined);
});

test('lê LocalDateTime em string e em array', () => {
  assert.equal(lerDataHora('2026-10-22T15:30:00').getHours(), 15);
  assert.equal(lerDataHora([2026, 10, 22, 9, 5]).getMinutes(), 5);
  assert.equal(lerDataHora(null), null);
});

test('monta agenda e resumo do dia', () => {
  const agenda = montarAgendaHoje([
    { id: 2, dataHora: '2026-10-22T14:00:00', status: 'PENDENTE', usuario: { nome: 'Rafael' }, orcamento: { estilo: 'Geométrico', tempo: '02:00:00' } },
    { id: 1, dataHora: '2026-10-22T10:00:00', status: 'CONFIRMADO', usuario: { nome: 'Lucas' }, orcamento: { estilo: 'Manga', localCorpo: 'braço', tempo: '03:30:00' } },
    { id: 3, dataHora: '2026-10-22T18:00:00', status: 'CANCELADO', usuario: { nome: 'Ana' }, orcamento: { tempo: '01:00:00' } },
  ]);
  assert.deepEqual(agenda.map((a) => a.hora), ['10:00', '14:00', '18:00']);
  assert.equal(agenda[0].detalhe, 'Manga · braço · 3h30');
  const resumo = resumirAgendaHoje(agenda);
  assert.equal(resumo.sessoes, 2);
  assert.equal(resumo.minutos, 330);
  assert.equal(resumo.confirmadas, 1);
  assert.equal(resumo.pendentes, 1);
  assert.equal(resumo.canceladas, 1);
});

test('faturamento rotula meses a partir do mês atual', () => {
  const valores = [0, 0, 0, 0, 0, 0, 6800, 9200, 7000, 7800, 10000, 12000];
  const fat = montarFaturamento(valores, new Date(2026, 9, 22));
  assert.deepEqual(fat.serie.map((s) => s.mes), ['Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out']);
  assert.equal(fat.mesAtual, 12000);
  assert.equal(fat.nomeMesAnterior, 'setembro');
  assert.equal(Math.round(fat.variacao), 20);
  assert.deepEqual(montarFaturamento([], new Date()).serie, []);
});

test('ticket médio dos últimos 30 dias usa o valor do orçamento', () => {
  const agora = new Date(2026, 9, 22, 12);
  const orcamentos = indexarOrcamentos([{ codigoOrcamento: 'A', valor: 300 }, { codigoOrcamento: 'B', valor: 500 }, { codigoOrcamento: 'C', valor: 200 }]);
  const agendamentos = [
    { codigoOrcamento: 'A', status: 'CONCLUIDO', dataHora: '2026-10-10T10:00:00' },
    { codigoOrcamento: 'B', status: 'CONCLUIDO', dataHora: '2026-10-01T10:00:00' },
    { codigoOrcamento: 'C', status: 'CONCLUIDO', dataHora: '2026-09-10T10:00:00' },
    { codigoOrcamento: 'B', status: 'CONFIRMADO', dataHora: '2026-10-15T10:00:00' },
  ];
  const ticket = calcularTicketMedio({ agendamentos, orcamentosPorCodigo: orcamentos, agora });
  assert.equal(ticket.ticket, 400);
  assert.equal(ticket.sessoes, 2);
  assert.equal(ticket.variacao, 100);
  assert.equal(calcularTicketMedio({ agendamentos: null, orcamentosPorCodigo: orcamentos, agora }), null);
});

test('próximas sessões, alertas e orçamentos pendentes', () => {
  const agora = new Date(2026, 9, 22, 12);
  const proximas = montarProximasSessoes({
    agendamentos: [
      { id: 1, dataHora: '2026-10-21T10:00:00', status: 'CONFIRMADO', nomeUsuario: 'Passado' },
      { id: 2, dataHora: '2026-10-25T15:00:00', status: 'CONFIRMADO', nomeUsuario: 'Fernanda', codigoOrcamento: 'X' },
      { id: 3, dataHora: '2026-10-23T09:00:00', status: 'PENDENTE', nomeUsuario: 'Bia' },
      { id: 4, dataHora: '2026-10-24T09:00:00', status: 'CANCELADO', nomeUsuario: 'Cancelado' },
    ],
    orcamentosPorCodigo: indexarOrcamentos([{ codigoOrcamento: 'X', estilo: 'Fineline' }]),
    agora,
  });
  assert.deepEqual(proximas.map((p) => p.nome), ['Bia', 'Fernanda']);
  assert.equal(proximas[1].detalhe, '25/10 às 15:00 · Fineline');

  const alertas = montarAlertasEstoque([{ id: 1, nome: 'Luvas', quantidade: 2.5, minAviso: 10, unidadeMedida: 'unidades' }]);
  assert.equal(alertas[0].detalhe, '2,5/10 unidades');

  const pend = montarOrcamentosPendentes([
    { codigoOrcamento: '1', nome: 'Beatriz Alves', estilo: 'Neotradicional', valor: null, status: 'PENDENTE' },
    { codigoOrcamento: '2', nome: 'Outro', status: 'APROVADO' },
  ]);
  assert.equal(pend.length, 1);
  assert.equal(pend[0].iniciais, 'BA');
  assert.equal(pend[0].detalhe, 'Neotradicional · valor a definir');
});

test('formatações', () => {
  assert.equal(formatarMoeda(12400), 'R$ 12.400');
  assert.equal(formatarMoeda(null), '—');
  assert.equal(formatarDataCabecalho(new Date(2026, 9, 22)), 'QUI · 22 OUT 2026');
});
