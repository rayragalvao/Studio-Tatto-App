import AsyncStorage from '@react-native-async-storage/async-storage';
import { prepararEntrada, removerNotaDoEstado } from './estoqueModel';

// Histórico local das notas importadas. As quantidades ficam no backend;
// aqui guardamos só NF, data e valores para exibir "última entrada / última compra".
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

export function normalizarIdentificador(identificador) {
  return String(identificador || '').trim().replace(/\s+/g, ' ').toLocaleUpperCase('pt-BR');
}

export function validarNotaNova(estadoAtual, identificadorInformado) {
  const identificador = normalizarIdentificador(identificadorInformado);
  if (!identificador) throw new Error('Informe o identificador da nota.');
  if (estadoAtual.notas.some((nota) => nota.identificador === identificador)) {
    throw new Error('Esta nota já foi importada.');
  }
  return identificador;
}

function dataCurta() {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

/** Registra no histórico local entradas já preparadas (com o id do material no backend). */
export async function registrarImportacao(estadoAtual, identificadorInformado, entradas) {
  const identificador = validarNotaNova(estadoAtual, identificadorInformado);
  if (!entradas?.length) throw new Error('Nenhum material da nota foi lançado.');
  const data = dataCurta();
  const atualizado = {
    notas: [...estadoAtual.notas, { identificador, importadaEm: new Date().toISOString() }],
    itens: [...estadoAtual.itens, ...entradas.map((entrada) => ({ ...entrada, identificador, data }))],
  };
  await AsyncStorage.setItem(CHAVE, JSON.stringify(atualizado));
  return atualizado;
}

// Mantido para a tela antiga (screens/inventory), que ainda usa a lista fixa.
export async function salvarImportacao(estadoAtual, nota, materiais) {
  if (!nota.itens?.length) throw new Error('Selecione pelo menos um material da nota.');
  validarNotaNova(estadoAtual, nota.identificador);
  const entradas = nota.itens.map((item) => prepararEntrada(item, materiais));
  return registrarImportacao(estadoAtual, nota.identificador, entradas);
}

/** Remove a nota apenas do histórico local. As quantidades no backend não são alteradas. */
export async function excluirImportacao(estadoAtual, identificador) {
  const atualizado = removerNotaDoEstado(estadoAtual, identificador);
  await AsyncStorage.setItem(CHAVE, JSON.stringify(atualizado));
  return atualizado;
}
