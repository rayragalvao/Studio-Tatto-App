import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

function nomeFromEmail(email) {
  if (!email) return 'usuário';
  const parteAntes = email.split('@')[0];
  const primeiraParte = parteAntes.split(/[._-]/)[0];
  return primeiraParte.charAt(0).toUpperCase() + primeiraParte.slice(1);
}

export function AuthProvider({ children }) {
  const [email, setEmail] = useState('');

  const nome = nomeFromEmail(email);

  return (
    <AuthContext.Provider value={{ email, setEmail, nome }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}