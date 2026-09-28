import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import {
  buscarDetalhesCliente,
  formatarDataSessao,
  formatarDuracao,
  formatarMoeda,
  formatarUltimaSessao,
} from '../../services/historicoClientesService';
import { colors } from '../../theme/colors';
import { styles } from './DetalhesClienteScreen.styles';

function Indicador({ titulo, valor }) {
  return (
    <View style={styles.indicador}>
      <Text style={styles.indicadorTitulo}>{titulo}</Text>
      <Text style={styles.indicadorValor} adjustsFontSizeToFit numberOfLines={1}>{valor}</Text>
    </View>
  );
}

function CartaoSessao({ sessao, numero }) {
  return (
    <View style={styles.cartaoSessao}>
      <View style={styles.linhaSessao}>
        <Text style={styles.numeroSessao}>SESSÃO {String(numero).padStart(2, '0')}</Text>
        <Text style={styles.dataSessao}>{formatarDataSessao(sessao.dataHora)}</Text>
      </View>

      <Text style={styles.procedimento}>{sessao.procedimento}</Text>
      <View style={styles.metadados}>
        <View style={styles.etiquetaEstilo}>
          <Text style={styles.textoEstilo}>{sessao.estilo}</Text>
        </View>
        {sessao.duracaoMinutos && <Text style={styles.duracao}>Duração · {formatarDuracao(sessao.duracaoMinutos)}</Text>}
      </View>

      <View style={styles.divisor} />
      <View style={styles.linhaValor}>
        <Text style={styles.rotuloValor}>VALOR REGISTRADO</Text>
        <Text style={styles.valorSessao}>
          {sessao.valor == null ? 'Não registrado' : formatarMoeda(sessao.valor)}
        </Text>
      </View>
    </View>
  );
}

export default function DetalhesClienteScreen({ route, navigation }) {
  const [cliente, definirCliente] = useState(null);
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState('');
  const [tentativa, definirTentativa] = useState(0);
  const { token, sair } = useAuth();
  const clienteId = route.params?.clienteId;

  useEffect(() => {
    let ativo = true;
    const controlador = new AbortController();

    const carregar = async () => {
      try {
        definirCarregando(true);
        definirErro('');
        const resposta = await buscarDetalhesCliente(clienteId, controlador.signal);
        if (ativo) definirCliente(resposta);
      } catch (falha) {
        if (!ativo) return;
        if (falha.status === 401) {
          await sair();
          navigation.getParent()?.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
          return;
        }
        definirErro(falha.status === 404 ? 'Cliente não encontrado.' : (falha.message || 'Não foi possível carregar o cliente.'));
      } finally {
        if (ativo) definirCarregando(false);
      }
    };

    carregar();
    return () => {
      ativo = false;
      controlador.abort();
    };
  }, [clienteId, navigation, sair, tentativa, token]);

  if (carregando) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBorder}><Header /></View>
        <View style={styles.estado}><ActivityIndicator color={colors.primary} /></View>
      </View>
    );
  }

  if (erro || !cliente) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBorder}><Header /></View>
        <View style={styles.conteudo}>
          <Text style={styles.titulo}>{erro || 'Cliente não encontrado'}</Text>
          <Pressable style={styles.botaoTentar} onPress={() => definirTentativa((valor) => valor + 1)}>
            <Text style={styles.textoBotaoTentar}>Tentar novamente</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBorder}><Header /></View>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.titulo}>Detalhes do cliente</Text>

        <View style={styles.perfil}>
          <View style={styles.cabecalhoPerfil}>
            <View style={styles.avatar}>
              <Text style={styles.iniciais}>{cliente.iniciais}</Text>
            </View>
            <View style={styles.identificacao}>
              <Text style={styles.nome}>{cliente.nome}</Text>
              <Text style={styles.textoSecundario}>
                {cliente.quantidadeSessoes} {cliente.quantidadeSessoes === 1 ? 'sessão registrada' : 'sessões registradas'}
              </Text>
            </View>
          </View>
          <View style={styles.estilos}>
            {cliente.estilos.map((estilo) => (
              <View key={estilo} style={styles.etiquetaEstilo}>
                <Text style={styles.textoEstilo}>{estilo}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.indicadores}>
          <Indicador titulo="SESSÕES" valor={String(cliente.quantidadeSessoes)} />
          <Indicador titulo="VALOR TOTAL" valor={cliente.gastoTotal ? formatarMoeda(cliente.gastoTotal) : '—'} />
          <Indicador titulo="ÚLTIMA SESSÃO" valor={formatarUltimaSessao(cliente.ultimaSessao)} />
        </View>

        <View style={styles.cabecalhoLista}>
          <Text style={styles.tituloLista}>Sessões</Text>
          <Text style={styles.textoSecundario}>Mais recentes primeiro</Text>
        </View>

        {(cliente.sessoes || []).map((sessao, indice) => (
          <CartaoSessao
            key={sessao.id}
            sessao={sessao}
            numero={cliente.sessoes.length - indice}
          />
        ))}
      </ScrollView>
    </View>
  );
}
