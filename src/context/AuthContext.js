import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

function nomeDoEmail(email) {
  if (!email) return 'usuário';
  const parteAntes = email.split('@')[0];
  const primeiraParte = parteAntes.split(/[._-]/)[0];
  return primeiraParte.charAt(0).toUpperCase() + primeiraParte.slice(1);
}

export function AuthProvider({ children }) {
  const [email, setEmail] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const versaoFoto = useRef(0);

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

  const nome = nomeDoEmail(email);
  const sair = () => {
    versaoFoto.current += 1;
    setEmail('');
    setFotoPerfil(null);
  };

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
    <AuthContext.Provider value={{ email, setEmail, nome, fotoPerfil, salvarFotoPerfil, removerFotoPerfil, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}