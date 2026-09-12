import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE = '@studio_tatto/notas_estoque_v1';

export async function carregarImportacoes() {
  const salvo = await AsyncStorage.getItem(CHAVE);
  if (!salvo) return { notas: [], itens: [] };
  const dados = JSON.parse(salvo);
  return {
    notas: Array.isArray(dados.notas) ? dados.notas : [],
    itens: Array.isArray(dados.itens) ? dados.itens : [],
  };
}

export async function salvarImportacao(estadoAtual, nota) {
  const identificador = nota.identificador.trim().replace(/\s+/g, ' ').toLocaleUpperCase('pt-BR');
  if (estadoAtual.notas.some((n) => n.identificador === identificador)) {
    throw new Error('Esta nota já foi importada.');
  }
  const data = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const itens = [...estadoAtual.itens, ...nota.itens.map((item) => ({
    ...item,
    identificador,
    data,
  }))];
  const atualizado = {
    notas: [...estadoAtual.notas, { identificador, importadaEm: new Date().toISOString() }],
    itens,
  };
  await AsyncStorage.setItem(CHAVE, JSON.stringify(atualizado));
  return atualizado;
}

export function montarEstoque(base, importacoes) {
  const resultado = base.map((item) => ({ ...item }));
  const unidadeNormalizada = (unidade) => {
    const sigla = unidade.trim().toLocaleLowerCase('pt-BR');
    return ['und', 'unid', 'pc'].includes(sigla) ? 'un' : sigla;
  };
  const chave = (nome, unidade) => `${nome.trim().toLocaleLowerCase('pt-BR')}|${unidadeNormalizada(unidade)}`;
  for (const entrada of importacoes.itens) {
    const indice = resultado.findIndex((item) => chave(item.material, item.unidade) === chave(entrada.material, entrada.unidade));
    const quantidade = Number(entrada.quantidade);
    const atual = indice >= 0 ? resultado[indice] : null;
    const novo = {
      ...(atual || {}),
      id: atual?.id || `importado-${chave(entrada.material, entrada.unidade)}`,
      material: atual?.material || entrada.material,
      status: 'semDados',
      qtdAtual: String(Number((Number(atual?.qtdAtual || 0) + quantidade).toFixed(4))),
      unidade: atual?.unidade || unidadeNormalizada(entrada.unidade),
      burnRate: atual?.burnRate || 'sem histórico',
      ultimaEntradaData: entrada.data,
      ultimaEntradaQtd: `${quantidade} ${entrada.unidade}`,
      nf: entrada.identificador,
      reposicaoDias: null,
      ultimoValorUnitario: entrada.valorUnitario,
      ultimaEntradaValorTotal: Number((quantidade * Number(entrada.valorUnitario)).toFixed(2)),
    };
    if (indice >= 0) resultado[indice] = novo;
    else resultado.push(novo);
  }
  return resultado;
}
