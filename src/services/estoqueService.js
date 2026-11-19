import { apiRequest } from './api';
import { normalizarMaterial, ordenarMateriais } from './estoqueModel';

const TAMANHO_PAGINA = 500;

// O backend devolve Page<DetalhesMaterialOutput> ou 204 sem corpo quando não há materiais.
export async function listarMateriais(signal) {
  const materiais = [];
  let pagina = 0;
  let totalPaginas = 1;
  while (pagina < totalPaginas) {
    const resposta = await apiRequest(`/estoque?page=${pagina}&size=${TAMANHO_PAGINA}&sort=id,asc`, { signal });
    if (!resposta || typeof resposta !== 'object') break;
    if (Array.isArray(resposta)) {
      materiais.push(...resposta.map(normalizarMaterial));
      break;
    }
    materiais.push(...(resposta.content || []).map(normalizarMaterial));
    totalPaginas = Number(resposta.totalPages) || 1;
    pagina += 1;
  }
  return ordenarMateriais(materiais);
}

function corpoMaterial({ nome, quantidade, unidadeMedida, minAviso }) {
  return {
    nome: String(nome).trim(),
    quantidade: Number(quantidade),
    unidadeMedida: String(unidadeMedida).trim(),
    minAviso: minAviso == null || minAviso === '' ? null : Number(minAviso),
  };
}

export async function criarMaterial(dados) {
  return normalizarMaterial(await apiRequest('/estoque', { method: 'POST', body: corpoMaterial(dados) }));
}

export async function atualizarMaterial(id, dados) {
  return normalizarMaterial(await apiRequest(`/estoque/${id}`, { method: 'PUT', body: corpoMaterial(dados) }));
}

export function excluirMaterial(id) {
  return apiRequest(`/estoque/${id}`, { method: 'DELETE' });
}

// A quantidade vai no caminho da URL; sempre com ponto decimal e sem notação científica.
export function formatarQuantidadeApi(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) throw new Error('Quantidade inválida.');
  return String(Number(numero.toFixed(4)));
}

/**
 * Define a quantidade absoluta do material.
 * O backend grava a quantidade antes de disparar o e-mail de estoque baixo; se o e-mail
 * falhar ele responde 500 mesmo com o valor salvo. Nesse caso conferimos a lista.
 */
export async function definirQuantidade(id, quantidade) {
  const valor = formatarQuantidadeApi(quantidade);
  try {
    return normalizarMaterial(await apiRequest(`/estoque/${id}/${valor}`, { method: 'PATCH' }));
  } catch (falha) {
    if (falha.status >= 500) {
      const lista = await listarMateriais().catch(() => null);
      const material = lista?.find((item) => item.id === id);
      if (material && Math.abs(material.qtdAtual - Number(valor)) < 1e-6) return material;
    }
    throw falha;
  }
}
