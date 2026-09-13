import AsyncStorage from '@react-native-async-storage/async-storage';
import { prepararEntrada, removerNotaDoEstado } from './estoqueModel';

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
  if (!identificador) throw new Error('Informe o identificador da nota.');
  if (!nota.itens?.length) throw new Error('Selecione pelo menos um material da nota.');
  if (estadoAtual.notas.some((n) => n.identificador === identificador)) {
    throw new Error('Esta nota já foi importada.');
  }
  const data = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const itensDaNota = nota.itens.map((item) => ({
    ...prepararEntrada(item),
    identificador,
    data,
  }));
  const atualizado = {
    notas: [...estadoAtual.notas, { identificador, importadaEm: new Date().toISOString() }],
    itens: [...estadoAtual.itens, ...itensDaNota],
  };
  await AsyncStorage.setItem(CHAVE, JSON.stringify(atualizado));
  return atualizado;
}

export async function excluirImportacao(estadoAtual, identificador) {
  const atualizado = removerNotaDoEstado(estadoAtual, identificador);
  await AsyncStorage.setItem(CHAVE, JSON.stringify(atualizado));
  return atualizado;
}
