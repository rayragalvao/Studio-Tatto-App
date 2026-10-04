import axios from 'axios';
import { Platform } from 'react-native';

const URL_PADRAO = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
});

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || URL_PADRAO).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let tokenJwt = null;

export function configurarTokenApi(token) {
  tokenJwt = token || null;
}

function obterMensagem(data, status) {
  if (data?.errors && typeof data.errors === 'object') {
    const validacoes = Object.values(data.errors).filter(Boolean);
    if (validacoes.length) return validacoes.join('\n');
  }
  if (typeof data?.message === 'string' && data.message.trim()) return data.message;
  if (typeof data === 'string' && data.trim()) return data;
  return `O servidor respondeu com o status ${status}.`;
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  if (tokenJwt) config.headers.Authorization = `Bearer ${tokenJwt}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (erro) => {
    if (axios.isCancel(erro)) {
      return Promise.reject(new ApiError('Requisição cancelada.', 0));
    }
    if (erro.code === 'ECONNABORTED') {
      return Promise.reject(new ApiError('O servidor demorou demais para responder. Tente novamente.', 0));
    }
    if (erro.response) {
      const { data, status } = erro.response;
      return Promise.reject(new ApiError(obterMensagem(data, status), status, data));
    }
    return Promise.reject(new ApiError(`Não foi possível conectar ao servidor em ${API_URL}.`, 0));
  }
);

export async function apiRequest(caminho, { method = 'GET', body, signal, headers } = {}) {
  const resposta = await api.request({
    url: caminho,
    method,
    data: body,
    signal,
    headers,
  });
  return resposta.data;
}
