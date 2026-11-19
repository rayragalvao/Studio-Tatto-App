import { apiRequest } from './api';

export function fazerLogin(email, senha) {
  return apiRequest('/usuario/login', {
    method: 'POST',
    body: { email: email.trim().toLowerCase(), senha },
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'mobile',
    },
  });
}

export function buscarMeuPerfil() {
  return apiRequest('/usuario/me');
}

export function alterarMinhaSenha(dados) {
  return apiRequest('/usuario/me/senha', {
    method: 'PATCH',
    body: dados,
  });
}
