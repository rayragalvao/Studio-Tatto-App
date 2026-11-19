import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { alterarMinhaSenha, buscarMeuPerfil, fazerLogin } from '../services/authService';
import { configurarTokenApi } from '../services/api';

const AuthContext = createContext();
const CHAVE_SESSAO = '@studio_tatto/sessao_v1';

function nomeDoEmail(email) {
  if (!email) return 'usuário';
  const parteAntes = email.split('@')[0];
  const primeiraParte = parteAntes.split(/[._-]/)[0];
  return primeiraParte.charAt(0).toUpperCase() + primeiraParte.slice(1);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const versaoFoto = useRef(0);

  const email = usuario?.email || '';
  const nome = usuario?.nome || nomeDoEmail(email);

  useEffect(() => {
    let ativo = true;

    const restaurarSessao = async () => {
      try {
        const salvo = await AsyncStorage.getItem(CHAVE_SESSAO);
        if (!salvo) return;

        const sessao = JSON.parse(salvo);
        if (!sessao?.token || !sessao?.usuario) return;

        try {
          configurarTokenApi(sessao.token);
          const perfil = await buscarMeuPerfil();
          const usuarioAtualizado = { ...sessao.usuario, ...perfil };
          if (!ativo) return;
          setToken(sessao.token);
          setUsuario(usuarioAtualizado);
          await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify({ token: sessao.token, usuario: usuarioAtualizado }));
        } catch (erro) {
          if (!ativo) return;
          if (erro.status === 401 || erro.status === 404) {
            configurarTokenApi(null);
            await AsyncStorage.removeItem(CHAVE_SESSAO);
          } else {
            setToken(sessao.token);
            setUsuario(sessao.usuario);
          }
        }
      } catch {
        await AsyncStorage.removeItem(CHAVE_SESSAO);
      } finally {
        if (ativo) setCarregandoSessao(false);
      }
    };

    restaurarSessao();
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    let ativo = true;
    const versao = ++versaoFoto.current;
    setFotoPerfil(null);

    if (email.trim()) {
      AsyncStorage.getItem(`foto-perfil:${email.trim().toLowerCase()}`)
        .then((foto) => {
          if (ativo && versaoFoto.current === versao) setFotoPerfil(foto);
        })
        .catch(() => {
          if (ativo && versaoFoto.current === versao) setFotoPerfil(null);
        });
    }

    return () => { ativo = false; };
  }, [email]);

  const entrar = async (emailInformado, senha) => {
    const resposta = await fazerLogin(emailInformado, senha);
    const usuarioAutenticado = {
      id: resposta.id,
      nome: resposta.nome,
      email: resposta.email,
      isAdmin: resposta.isAdmin,
    };
    setToken(resposta.token);
    setUsuario(usuarioAutenticado);
    configurarTokenApi(resposta.token);
    try {
      await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify({
        token: resposta.token,
        usuario: usuarioAutenticado,
      }));
    } catch {
      // A sessão continua válida em memória mesmo se o dispositivo não conseguir persistir.
    }
    return usuarioAutenticado;
  };

  const sair = async () => {
    versaoFoto.current += 1;
    setToken(null);
    setUsuario(null);
    configurarTokenApi(null);
    setFotoPerfil(null);
    try {
      await AsyncStorage.removeItem(CHAVE_SESSAO);
    } catch {
      // O estado em memória já foi limpo; a remoção será tentada no próximo acesso.
    }
  };

  const alterarSenha = (dados) => alterarMinhaSenha(dados);

  const salvarFotoPerfil = async (foto) => {
    if (email.trim()) {
      await AsyncStorage.setItem(`foto-perfil:${email.trim().toLowerCase()}`, foto);
    }
    versaoFoto.current += 1;
    setFotoPerfil(foto);
  };

  const removerFotoPerfil = async () => {
    if (email.trim()) {
      await AsyncStorage.removeItem(`foto-perfil:${email.trim().toLowerCase()}`);
    }
    versaoFoto.current += 1;
    setFotoPerfil(null);
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      email,
      nome,
      autenticado: Boolean(token && usuario),
      carregandoSessao,
      entrar,
      alterarSenha,
      fotoPerfil,
      salvarFotoPerfil,
      removerFotoPerfil,
      sair,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
