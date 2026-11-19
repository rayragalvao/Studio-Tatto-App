import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

function navegacaoRaiz(navigation) {
  let atual = navigation;
  while (atual?.getParent?.()) atual = atual.getParent();
  return atual;
}

/**
 * Retorna uma função que, para erros 401, encerra a sessão e volta ao Login.
 * Devolve true quando tratou o erro.
 */
export function useTratarNaoAutorizado() {
  const navigation = useNavigation();
  const { sair } = useAuth();
  const sairRef = useRef(sair);
  sairRef.current = sair;

  return useCallback(async (falha) => {
    if (falha?.status !== 401) return false;
    await sairRef.current();
    navegacaoRaiz(navigation)?.reset({ index: 0, routes: [{ name: 'Login' }] });
    return true;
  }, [navigation]);
}

/**
 * Carrega um recurso da API com cancelamento, estado de carregamento/erro e
 * tratamento de sessão expirada.
 *
 * `carregar(signal)` deve devolver uma Promise com os dados.
 * `recarregar(modo)`: 'inicial' (mostra carregando), 'atualizar' (puxar para atualizar)
 * ou 'silencioso' (sem indicador, ex.: depois de salvar algo).
 */
export function useApiRecurso(carregar, deps = []) {
  const { token } = useAuth();
  const tratarNaoAutorizado = useTratarNaoAutorizado();
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const modoRef = useRef('inicial');
  const carregarRef = useRef(carregar);
  carregarRef.current = carregar;

  useEffect(() => {
    if (!token) return undefined;
    let ativo = true;
    const controlador = new AbortController();
    const modo = modoRef.current;
    modoRef.current = 'inicial';
    if (modo === 'inicial') setCarregando(true);
    if (modo === 'atualizar') setAtualizando(true);
    setErro('');

    (async () => {
      try {
        const resultado = await carregarRef.current(controlador.signal);
        if (ativo) setDados(resultado);
      } catch (falha) {
        if (!ativo || controlador.signal.aborted) return;
        if (await tratarNaoAutorizado(falha)) return;
        setErro(falha?.message || 'Não foi possível carregar os dados.');
      } finally {
        if (ativo) {
          setCarregando(false);
          setAtualizando(false);
        }
      }
    })();

    return () => {
      ativo = false;
      controlador.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tentativa, tratarNaoAutorizado, ...deps]);

  const recarregar = useCallback((modo = 'inicial') => {
    modoRef.current = modo;
    setTentativa((valor) => valor + 1);
  }, []);

  return { dados, setDados, carregando, atualizando, erro, recarregar, tratarNaoAutorizado };
}
