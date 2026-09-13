import { ESTOQUE_INICIAL } from '../data/estoqueInicial.js';
import { interpretarNumero } from './notaFiscalParser.js';

const ALIASES = {
  luvas: ['luva', 'luvas'],
  cartuchos: ['cartucho', 'cartuchos'],
  batoque: ['batoque', 'batoques'],
  'plastico-filme': ['papel filme', 'filme pvc'],
  'alcool-70': ['alcool 70', 'alcool 70 porcento'],
  'sabonete-higienizador-maos': ['sabonete higienizador para as maos'],
};

export function normalizarTexto(texto) {
  return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

export function encontrarMaterialEstoque(descricao) {
  const texto = ` ${normalizarTexto(descricao)} `;
  const encontrados = ESTOQUE_INICIAL.filter((material) => {
    const nomes = [material.material, ...(ALIASES[material.id] || [])];
    return nomes.some((nome) => texto.includes(` ${normalizarTexto(nome)} `));
  });
  return encontrados.length === 1 ? encontrados[0] : null;
}

function unidadePadrao(unidade) {
  const valor = normalizarTexto(unidade);
  if (['un', 'und', 'unid', 'unidade', 'unidades', 'pc', 'peca', 'pecas'].includes(valor)) return 'unidades';
  if (['rolo', 'rolos', 'rl'].includes(valor)) return 'rolos';
  if (['folha', 'folhas'].includes(valor)) return 'folhas';
  if (['l', 'litro', 'litros'].includes(valor)) return 'litros';
  if (['ml', 'mililitro', 'mililitros'].includes(valor)) return 'ml';
  if (['kg', 'quilo', 'quilos'].includes(valor)) return 'kg';
  if (['g', 'grama', 'gramas'].includes(valor)) return 'g';
  return null;
}

export function fatorConversao(unidadeNota, unidadeEstoque) {
  const origem = unidadePadrao(unidadeNota);
  const destino = unidadePadrao(unidadeEstoque);
  if (!origem || !destino) return null;
  if (origem === destino) return 1;
  if (origem === 'litros' && destino === 'ml') return 1000;
  if (origem === 'ml' && destino === 'litros') return 0.001;
  if (origem === 'kg' && destino === 'g') return 1000;
  if (origem === 'g' && destino === 'kg') return 0.001;
  return null;
}

export function prepararEntrada(item) {
  const material = ESTOQUE_INICIAL.find((cadastrado) => cadastrado.id === item.materialEstoqueId);
  if (!material) throw new Error(`Selecione o material do estoque para "${item.material || 'item da nota'}".`);
  const quantidadeNota = interpretarNumero(item.quantidade);
  const valorUnitarioNota = interpretarNumero(item.valorUnitario);
  if (!Number.isFinite(quantidadeNota) || quantidadeNota <= 0 ||
      !Number.isFinite(valorUnitarioNota) || valorUnitarioNota < 0) {
    throw new Error(`Confira a quantidade e o valor de "${item.material || material.material}".`);
  }
  const fator = fatorConversao(item.unidade, material.unidade);
  if (fator == null) {
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
  };
}

export function montarEstoque(importacoes) {
  const resultado = ESTOQUE_INICIAL.map((item) => ({ ...item }));
  for (const entrada of importacoes.itens || []) {
    let registro = entrada;
    // Lê entradas feitas antes da migração, sem inventar materiais novos.
    if (!registro.materialId) {
      const correspondente = encontrarMaterialEstoque(registro.material);
      if (!correspondente) continue;
      try {
        registro = prepararEntrada({ ...registro, materialEstoqueId: correspondente.id });
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
      ultimaEntradaData: registro.data,
      ultimaEntradaQtd: `${registro.quantidade} ${atual.unidade}`,
      nf: registro.identificador,
      ultimoValorUnitario: registro.valorUnitario,
      ultimaEntradaValorTotal: registro.valorTotal,
    };
  }
  return resultado.map((item) => ({
    ...item,
    status: item.minAviso == null ? 'semDados' : item.qtdAtual <= item.minAviso ? 'critico' : 'ok',
  }));
}
