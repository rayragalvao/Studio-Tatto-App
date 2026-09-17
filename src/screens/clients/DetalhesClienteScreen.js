import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Header from '../../components/Header';
import {
  clientes,
  formatarDataSessao,
  formatarMoeda,
  formatarUltimaSessao,
  obterResumoCliente,
} from '../../data/historicoClientes';
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
        <Text style={styles.dataSessao}>{formatarDataSessao(sessao.diasAtras)}</Text>
      </View>

      <Text style={styles.procedimento}>{sessao.procedimento}</Text>
      <View style={styles.metadados}>
        <View style={styles.etiquetaEstilo}>
          <Text style={styles.textoEstilo}>{sessao.estilo}</Text>
        </View>
        {sessao.duracao && <Text style={styles.duracao}>Duração · {sessao.duracao}</Text>}
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

export default function DetalhesClienteScreen({ route }) {
  const cliente = clientes.find((item) => item.id === route.params?.clienteId);

  if (!cliente) {
    return (
      <View style={styles.container}>
        <View style={styles.headerBorder}><Header /></View>
        <View style={styles.conteudo}>
          <Text style={styles.titulo}>Cliente não encontrado</Text>
          <Text style={styles.textoSecundario}>Volte ao histórico e selecione outro cliente.</Text>
        </View>
      </View>
    );
  }

  const resumo = obterResumoCliente(cliente);

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
                {resumo.quantidadeSessoes} {resumo.quantidadeSessoes === 1 ? 'sessão registrada' : 'sessões registradas'}
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
          <Indicador titulo="SESSÕES" valor={String(resumo.quantidadeSessoes)} />
          <Indicador titulo="VALOR TOTAL" valor={resumo.gastoTotal ? formatarMoeda(resumo.gastoTotal) : '—'} />
          <Indicador titulo="ÚLTIMA SESSÃO" valor={formatarUltimaSessao(resumo.diasDesdeUltimaSessao)} />
        </View>

        <View style={styles.cabecalhoLista}>
          <Text style={styles.tituloLista}>Sessões</Text>
          <Text style={styles.textoSecundario}>Mais recentes primeiro</Text>
        </View>

        {cliente.sessoes.map((sessao, indice) => (
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
