import assert from 'node:assert/strict';
import test from 'node:test';
import { extrairItensNota, interpretarNumero } from '../src/services/notaFiscalParser.js';
import { ESTOQUE_INICIAL } from '../src/data/estoqueInicial.js';
import { encontrarMaterialEstoque, fatorConversao, montarEstoque, prepararEntrada, removerNotaDoEstado } from '../src/services/estoqueModel.js';

test('converte valores brasileiros usados nas notas', () => {
  assert.equal(interpretarNumero('1.234,56'), 1234.56);
  assert.equal(interpretarNumero('2,0000'), 2);
  assert.equal(interpretarNumero('R$ 45,50'), 45.5);
  assert.ok(Number.isNaN(interpretarNumero('45abc')));
});

test('sugere produto de DANFE apenas com total coerente', () => {
  const texto = [
    '123 TINTA PRETA 32151100 000 5102 UN 2,0000 45,50 91,00',
    '124 AGULHAS RL 3 90189099 000 5102 CX 3,0000 20,00 99,00',
  ].join('\n');
  const itens = extrairItensNota(texto);
  assert.equal(itens.length, 1);
  assert.equal(itens[0].material, 'TINTA PRETA');
  assert.equal(itens[0].quantidade, '2');
  assert.equal(itens[0].valorUnitario, '45,50');
});

test('aceita linha simples de cupom com quantidade e preço', () => {
  const itens = extrairItensNota('AGULHA RL 3 2 UN X 12,50 25,00');
  assert.equal(itens.length, 1);
  assert.equal(itens[0].material, 'AGULHA RL 3');
});

test('extrai as cinco linhas da DANFE apresentada, inclusive descrição quebrada', () => {
  const texto = [
    '001757 Atadura elástica FAMARA 10cm 90211010 0102 5102 Rl 2,0000 25,00 50,00 0,00 0,00',
    '013646 ROSIDAL K-BAND 6CM DE CURTO ESTIR E',
    'ALTA COMP 30059090 0102 5102 Un 1,0000 59,00 59,00 0,00',
    '004123 Meia Kendal Calça Média s/pont. M 61151012 0102 5102 Par 1,0000 139,00 139,00 0,00',
    '003396 Mascara c/elastico CX 63079010 0102 5102 Cx 1,0000 14,00 14,00 0,00',
    '000286 Luva Proced. M 40151200 0102 5102 Cx 1,0000 32,00 32,00 0,00',
  ].join('\n');
  const itens = extrairItensNota(texto);
  assert.equal(itens.length, 5);
  assert.deepEqual(itens.map((item) => item.unidade), ['rl', 'un', 'par', 'cx', 'cx']);
  assert.deepEqual(itens.map((item) => item.valorUnitario), ['25,00', '59,00', '139,00', '14,00', '32,00']);
  assert.match(itens[1].material, /ROSIDAL K-BAND.*ALTA COMP/);
  assert.equal(itens[4].material, 'Luva Proced. M');
});

test('usa os 20 materiais e quantidades informados pelo estúdio', () => {
  assert.equal(ESTOQUE_INICIAL.length, 20);
  assert.deepEqual(ESTOQUE_INICIAL.find((item) => item.id === 'luvas'), {
    id: 'luvas', material: 'Luvas', qtdAtual: 1, unidade: 'unidades', minAviso: 10,
  });
  assert.equal(montarEstoque({ itens: [] }).find((item) => item.id === 'tinta-preta').qtdAtual, 30);
  assert.equal(montarEstoque({ itens: [] }).find((item) => item.id === 'luvas').status, 'critico');
});

test('reconhece descrições de nota sem confundir materiais distintos', () => {
  assert.equal(encontrarMaterialEstoque('Tinta Preta Dynamic 30ML')?.id, 'tinta-preta');
  assert.equal(encontrarMaterialEstoque('LUVAS NITRÍLICAS P')?.id, 'luvas');
  assert.equal(encontrarMaterialEstoque('PAPEL FILME PVC')?.id, 'plastico-filme');
  assert.equal(encontrarMaterialEstoque('Sabonete higienizador para as mãos')?.id, 'sabonete-higienizador-maos');
  assert.equal(encontrarMaterialEstoque('Tinta azul')?.id, undefined);
  assert.equal(encontrarMaterialEstoque('Kit tinta preta e tinta vermelha')?.id, undefined);
});

test('soma quantidade convertida apenas ao material cadastrado e recalcula aviso', () => {
  const entradaLuvas = prepararEntrada({ material: 'Luvas nitrílicas', materialEstoqueId: 'luvas', quantidade: 12, unidade: 'UN', valorUnitario: 2 });
  const entradaTinta = prepararEntrada({ material: 'Tinta preta Dynamic', materialEstoqueId: 'tinta-preta', quantidade: 1, unidade: 'L', valorUnitario: 50 });
  const estoque = montarEstoque({ itens: [
    { ...entradaLuvas, identificador: 'NF 42', data: '13/09' },
    { ...entradaTinta, identificador: 'NF 42', data: '13/09' },
  ] });
  assert.equal(estoque.length, 20);
  assert.equal(estoque.find((item) => item.id === 'luvas').qtdAtual, 13);
  assert.equal(estoque.find((item) => item.id === 'luvas').status, 'ok');
  assert.equal(estoque.find((item) => item.id === 'tinta-preta').qtdAtual, 1030);
  assert.equal(entradaTinta.valorTotal, 50);
  assert.equal(entradaTinta.valorUnitario, 0.05);
  assert.equal(fatorConversao('CX', 'unidades'), null);
});

test('bloqueia material desconhecido e unidade sem conversão segura', () => {
  assert.throws(() => prepararEntrada({ material: 'Tinta azul', quantidade: 2, unidade: 'ml', valorUnitario: 10 }), /Selecione o material/);
  assert.throws(() => prepararEntrada({ material: 'Luvas', materialEstoqueId: 'luvas', quantidade: 1, unidade: 'CX', valorUnitario: 20 }), /unidade/);
  assert.equal(montarEstoque({ itens: [{ material: 'Tinta azul', quantidade: 10, unidade: 'ml', valorUnitario: 1 }] }).length, 20);
});

test('compra em caixa mantém o preço da nota e converte só o saldo do estoque', () => {
  const mascara = prepararEntrada({
    material: 'Máscara com elástico', materialEstoqueId: 'mascara-descartavel',
    quantidade: 1, unidade: 'CX', valorUnitario: 14, conteudoPorEmbalagem: 50,
  });
  assert.equal(mascara.quantidade, 50);
  assert.equal(mascara.valorTotal, 14);
  assert.equal(mascara.valorUnitario, 0.28);
  assert.equal(mascara.valorUnitarioNota, 14);
  const estoque = montarEstoque({ itens: [{ ...mascara, identificador: 'NF 6578', data: '13/09' }] });
  const item = estoque.find((material) => material.id === 'mascara-descartavel');
  assert.equal(item.qtdAtual, 100);
  assert.equal(item.ultimaEntradaQtd, '1 CX → 50 unidades');
  assert.equal(item.ultimaEntradaValorTotal, 14);
  assert.equal(item.ultimoValorUnitarioNota, 14);
});

test('duas caixas multiplicam o preço pelas caixas, nunca pelas peças internas', () => {
  const entrada = prepararEntrada({
    material: 'Luvas', materialEstoqueId: 'luvas', quantidade: 2,
    unidade: 'CX', valorUnitario: 32, conteudoPorEmbalagem: 100,
  });
  assert.equal(entrada.quantidade, 200);
  assert.equal(entrada.valorTotal, 64);
  assert.equal(fatorConversao('CX', 'unidades', 100), 100);
  assert.throws(() => prepararEntrada({ material: 'Luvas', materialEstoqueId: 'luvas', quantidade: 1, unidade: 'CX', valorUnitario: 32 }), /Informe quantas/);
  assert.throws(() => prepararEntrada({ material: 'Luvas', materialEstoqueId: 'luvas', quantidade: 1, unidade: 'CX', valorUnitario: 32, conteudoPorEmbalagem: 2.5 }), /Informe quantas/);
});

test('remover uma nota errada desfaz só as entradas dela e permite reimportação', () => {
  const mascara = prepararEntrada({ material: 'Máscara', materialEstoqueId: 'mascara-descartavel', quantidade: 1, unidade: 'CX', valorUnitario: 14, conteudoPorEmbalagem: 50 });
  const estado = {
    notas: [{ identificador: 'NF 6578' }, { identificador: 'NF 1000' }],
    itens: [
      { ...mascara, identificador: 'NF 6578' },
      { ...mascara, identificador: 'NF 1000' },
    ],
  };
  const atualizado = removerNotaDoEstado(estado, 'NF 6578');
  assert.deepEqual(atualizado.notas.map((nota) => nota.identificador), ['NF 1000']);
  assert.equal(atualizado.itens.length, 1);
  assert.equal(montarEstoque(atualizado).find((item) => item.id === 'mascara-descartavel').qtdAtual, 100);
  assert.throws(() => removerNotaDoEstado(atualizado, 'NF 6578'), /não encontrada/);
});
