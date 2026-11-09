import { ESTOQUE_INICIAL } from '../data/estoqueInicial.js';
import { interpretarNumero } from './notaFiscalParser.js';

// Apelidos indexados pelo nome normalizado do material (independe do id do backend).
const ALIASES = {
  luvas: ['luva', 'luvas'],
  cartuchos: ['cartucho', 'cartuchos'],
  batoque: ['batoque', 'batoques'],
  'plastico filme': ['papel filme', 'filme pvc'],
  'alcool 70': ['alcool 70', 'alcool 70 porcento'],
  'sabonete higienizador para as maos': ['sabonete higienizador para as maos'],
};

export function normalizarTexto(texto) {
  return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

export function calcularStatus(qtdAtual, minAviso) {
  if (minAviso == null) return 'semDados';
  return qtdAtual <= minAviso ? 'critico' : 'ok';
}

// Converte DetalhesMaterialOutput { id, nome, quantidade, unidadeMedida, minAviso } para o formato da tela.
export function normalizarMaterial(dto) {
  const qtdAtual = Number(dto?.quantidade ?? 0);
  const minAviso = dto?.minAviso == null ? null : Number(dto.minAviso);
  return {
    id: dto?.id,
    material: String(dto?.nome ?? ''),
    qtdAtual,
    unidade: String(dto?.unidadeMedida ?? ''),
    minAviso,
    status: calcularStatus(qtdAtual, minAviso),
  };
}

// Itens que pedem atenção (abaixo do mínimo) ficam no topo; dentro de cada grupo, ordem alfabética.
const PRIORIDADE_STATUS = { critico: 0, ok: 1, semDados: 2 };

export function ordenarMateriais(materiais) {
  return [...materiais].sort((a, b) =>
    (PRIORIDADE_STATUS[a.status] ?? 3) - (PRIORIDADE_STATUS[b.status] ?? 3)
    || a.material.localeCompare(b.material, 'pt-BR', { sensitivity: 'base' }));
}

export function encontrarMaterialEstoque(descricao, materiais = ESTOQUE_INICIAL) {
  const texto = ` ${normalizarTexto(descricao)} `;
  const encontrados = materiais.filter((material) => {
    const nomes = [material.material, ...(ALIASES[normalizarTexto(material.material)] || [])];
    return nomes.some((nome) => texto.includes(` ${normalizarTexto(nome)} `));
  });
  return encontrados.length === 1 ? encontrados[0] : null;
}

function unidadePadrao(unidade) {
  const valor = normalizarTexto(unidade);
  if (['un', 'und', 'unid', 'unidade', 'unidades', 'pc', 'peca', 'pecas'].includes(valor)) return 'unidades';
  if (['cx', 'caixa', 'caixas'].includes(valor)) return 'caixas';
  if (['pct', 'pac', 'pacote', 'pacotes'].includes(valor)) return 'pacotes';
  if (['rolo', 'rolos', 'rl'].includes(valor)) return 'rolos';
  if (['folha', 'folhas'].includes(valor)) return 'folhas';
  if (['l', 'litro', 'litros'].includes(valor)) return 'litros';
  if (['ml', 'mililitro', 'mililitros'].includes(valor)) return 'ml';
  if (['kg', 'quilo', 'quilos'].includes(valor)) return 'kg';
  if (['g', 'grama', 'gramas'].includes(valor)) return 'g';
  return null;
}

export function eEmbalagem(unidade) {
  return ['caixas', 'pacotes'].includes(unidadePadrao(unidade));
}

export function fatorConversao(unidadeNota, unidadeEstoque, conteudoPorEmbalagem) {
  const origem = unidadePadrao(unidadeNota);
  const destino = unidadePadrao(unidadeEstoque);
  if (!origem || !destino) return null;
  if (origem === destino) return 1;
  if (eEmbalagem(unidadeNota)) {
    const conteudo = interpretarNumero(conteudoPorEmbalagem);
    if (!Number.isFinite(conteudo) || conteudo <= 0) return null;
    if (['unidades', 'rolos', 'folhas'].includes(destino) && !Number.isInteger(conteudo)) return null;
    return conteudo;
  }
  if (origem === 'litros' && destino === 'ml') return 1000;
  if (origem === 'ml' && destino === 'litros') return 0.001;
  if (origem === 'kg' && destino === 'g') return 1000;
  if (origem === 'g' && destino === 'kg') return 0.001;
  return null;
}

export function prepararEntrada(item, materiais = ESTOQUE_INICIAL) {
  const material = materiais.find((cadastrado) => cadastrado.id === item.materialEstoqueId);
  if (!material) throw new Error(`Selecione o material do estoque para "${item.material || 'item da nota'}".`);
  const quantidadeNota = interpretarNumero(item.quantidade);
  const valorUnitarioNota = interpretarNumero(item.valorUnitario);
  if (!Number.isFinite(quantidadeNota) || quantidadeNota <= 0 ||
      !Number.isFinite(valorUnitarioNota) || valorUnitarioNota < 0) {
    throw new Error(`Confira a quantidade e o valor de "${item.material || material.material}".`);
  }
  const fator = fatorConversao(item.unidade, material.unidade, item.conteudoPorEmbalagem);
  if (fator == null) {
    if (eEmbalagem(item.unidade)) {
      throw new Error(`Informe quantas ${material.unidade} existem em cada ${item.unidade} de "${item.material || material.material}".`);
    }
    throw new Error(`A unidade de "${item.material || material.material}" (${item.unidade}) não corresponde a ${material.unidade}. Confira unidade, quantidade e valor unitário antes de importar.`);
  }
  const quantidade = Number((quantidadeNota * fator).toFixed(4));
  if (quantidade <= 0) throw new Error('A quantidade convertida é pequena demais para registrar.');
  const valorTotal = Number((quantidadeNota * valorUnitarioNota).toFixed(2));
  return {
    materialId: material.id,
    descricaoNota: String(item.material || '').trim(),
    quantidade,
    unidade: material.unidade,
    valorUnitario: valorTotal / quantidade,
    valorTotal,
    quantidadeNota,
    unidadeNota: item.unidade,
    valorUnitarioNota,
    conteudoPorEmbalagem: eEmbalagem(item.unidade) ? fator : null,
  };
}

export function montarEstoque(importacoes, materiais = ESTOQUE_INICIAL) {
  const resultado = materiais.map((item) => ({ ...item }));
  for (const entrada of importacoes.itens || []) {
    let registro = entrada;
    // Lê entradas feitas antes da migração, sem inventar materiais novos.
    if (!registro.materialId) {
      const correspondente = encontrarMaterialEstoque(registro.material, materiais);
      if (!correspondente) continue;
      try {
        registro = prepararEntrada({ ...registro, materialEstoqueId: correspondente.id }, materiais);
        registro = { ...registro, data: entrada.data, identificador: entrada.identificador };
      } catch { continue; }
    }
    const indice = resultado.findIndex((material) => material.id === registro.materialId);
    if (indice < 0 || !Number.isFinite(registro.quantidade) || registro.quantidade <= 0 ||
        registro.unidade !== resultado[indice].unidade) continue;
    const atual = resultado[indice];
    resultado[indice] = {
      ...atual,
      qtdAtual: Number((atual.qtdAtual + registro.quantidade).toFixed(4)),
      ...dadosUltimaEntrada(registro, atual.unidade),
    };
  }
  return resultado.map((item) => ({
    ...item,
    status: calcularStatus(item.qtdAtual, item.minAviso),
  }));
}

function dadosUltimaEntrada(registro, unidadeMaterial) {
  return {
    ultimaEntradaData: registro.data,
    ultimaEntradaQtd: registro.conteudoPorEmbalagem
      ? `${registro.quantidadeNota} ${registro.unidadeNota} → ${registro.quantidade} ${unidadeMaterial}`
      : `${registro.quantidade} ${unidadeMaterial}`,
    nf: registro.identificador,
    ultimoValorUnitario: registro.valorUnitario,
    ultimoValorUnitarioNota: registro.valorUnitarioNota,
    ultimaUnidadeNota: registro.unidadeNota,
    ultimaEntradaValorTotal: registro.valorTotal,
  };
}

/**
 * Descobre a qual material do backend uma entrada salva no celular pertence.
 * - entradas novas guardam o id numérico do backend;
 * - entradas antigas guardam o id em texto da lista fixa (ex.: 'luvas') e são ligadas pelo nome;
 * - entradas muito antigas não têm id e são ligadas pela descrição da nota.
 */
export function resolverMaterialDaEntrada(entrada, materiais) {
  const { materialId } = entrada;
  if (typeof materialId === 'number') return materiais.find((material) => material.id === materialId) || null;
  if (typeof materialId === 'string' && materialId) {
    const antigo = ESTOQUE_INICIAL.find((material) => material.id === materialId);
    if (!antigo) return null;
    const nome = normalizarTexto(antigo.material);
    return materiais.find((material) => normalizarTexto(material.material) === nome) || null;
  }
  return encontrarMaterialEstoque(entrada.descricaoNota || entrada.material, materiais);
}

/**
 * Acrescenta as informações de "última entrada / última compra" do histórico local
 * aos materiais vindos do backend. Não altera quantidades: o backend já é a fonte da verdade.
 */
export function anexarHistorico(materiais, importacoes) {
  const resultado = materiais.map((item) => ({ ...item }));
  for (const entrada of importacoes?.itens || []) {
    const material = resolverMaterialDaEntrada(entrada, resultado);
    if (!material || !Number.isFinite(entrada.quantidade) || entrada.quantidade <= 0) continue;
    Object.assign(material, dadosUltimaEntrada(entrada, material.unidade));
  }
  return resultado;
}

// Soma as entradas de uma nota por material (duas linhas da nota podem ir para o mesmo material).
export function agruparEntradasPorMaterial(entradas) {
  const totais = new Map();
  for (const entrada of entradas) {
    totais.set(entrada.materialId, Number(((totais.get(entrada.materialId) || 0) + entrada.quantidade).toFixed(4)));
  }
  return totais;
}

export function removerNotaDoEstado(estado, identificador) {
  if (!estado.notas.some((nota) => nota.identificador === identificador)) {
    throw new Error('Nota não encontrada neste dispositivo.');
  }
  return {
    notas: estado.notas.filter((nota) => nota.identificador !== identificador),
    itens: estado.itens.filter((item) => item.identificador !== identificador),
  };
}
