import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { formatarMoeda, formatarUltimaSessao, listarHistoricoClientes } from '../../services/historicoClientesService';
import { colors } from '../../theme/colors';
import { styles } from './HistoricoClientesScreen.styles';

function CartaoResumo({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function LinhaCliente({ cliente, ultimaLinha, aoPressionar }) {
  const ultimaSessao = formatarUltimaSessao(cliente.ultimaSessao);

  return (
    <Pressable
      onPress={aoPressionar}
      style={({ pressed }) => [styles.tableRow, ultimaLinha && styles.lastRow, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir detalhes de ${cliente.nome}, ${cliente.quantidadeSessoes} sessões, ${cliente.gastoTotal ? formatarMoeda(cliente.gastoTotal) : 'sem gasto registrado'}, última sessão ${ultimaSessao}`}
      accessibilityHint="Mostra as sessões deste cliente"
    >
      <View style={styles.clientCell}>
        <View style={styles.clientAvatar}>
          <Text style={styles.clientInitials}>{cliente.iniciais}</Text>
        </View>
      </View>
      <Text style={[styles.cellText, styles.sessionsCell]}>{cliente.quantidadeSessoes}</Text>
      <Text style={[styles.cellText, styles.spentCell, styles.spentCellText]}>{cliente.gastoTotal ? formatarMoeda(cliente.gastoTotal) : '—'}</Text>
      <Text style={[styles.cellText, styles.lastSessionCell]}>{ultimaSessao}</Text>
      <View style={styles.stylesCell}>
        {cliente.estilos.map((estilo) => (
          <View key={estilo} style={styles.styleBadge}>
            <Text style={styles.styleBadgeText}>{estilo}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

export default function HistoricoClientesScreen({ navigation }) {
  const [busca, definirBusca] = useState('');
  const [dados, definirDados] = useState({ totalClientes: 0, totalSessoes: 0, receitaAcumulada: 0, clientes: [] });
  const [carregando, definirCarregando] = useState(true);
  const [erro, definirErro] = useState('');
  const [tentativa, definirTentativa] = useState(0);
  const { token, sair } = useAuth();

  useEffect(() => {
    let ativo = true;
    const controlador = new AbortController();
    const timer = setTimeout(async () => {
      try {
        definirCarregando(true);
        definirErro('');
        const resposta = await listarHistoricoClientes(busca, controlador.signal);
        if (ativo) definirDados(resposta);
      } catch (falha) {
        if (!ativo) return;
        if (falha.status === 401) {
          await sair();
          navigation.getParent()?.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
          return;
        }
        definirErro(falha.message || 'Não foi possível carregar o histórico.');
      } finally {
        if (ativo) definirCarregando(false);
      }
    }, busca ? 350 : 0);

    return () => {
      ativo = false;
      clearTimeout(timer);
      controlador.abort();
    };
  }, [busca, navigation, sair, tentativa, token]);

  const clientes = dados.clientes || [];

  return (
    <View style={styles.container}>
      <View style={styles.headerBorder}><Header /></View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Histórico de clientes</Text>
        <Text style={styles.subtitle}>
          {dados.totalClientes} {dados.totalClientes === 1 ? 'cliente' : 'clientes'} · {formatarMoeda(dados.receitaAcumulada)} em receita acumulada
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou estilo..."
          placeholderTextColor={colors.textPlaceholder}
          value={busca}
          onChangeText={definirBusca}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Buscar clientes por nome ou estilo"
        />

        <View style={styles.statsRow}>
          <CartaoResumo label="Total clientes" value={String(dados.totalClientes)} />
          <CartaoResumo label="Sessões realizadas" value={String(dados.totalSessoes)} />
          <CartaoResumo label="Receita acumulada" value={formatarMoeda(dados.receitaAcumulada).replace(' ', '\n')} />
        </View>

        <View style={styles.tableFrame}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityLabel="Tabela de histórico de clientes">
            <View>
              <View style={styles.tableHeader}>
                <Text style={[styles.columnHeading, styles.clientCell]}>CLIENTE</Text>
                <Text style={[styles.columnHeading, styles.sessionsCell]}>SESSÕES</Text>
                <Text style={[styles.columnHeading, styles.spentCell]}>GASTO TOTAL</Text>
                <Text style={[styles.columnHeading, styles.lastSessionCell]}>ÚLTIMA{ '\n' }SESSÃO</Text>
                <Text style={[styles.columnHeading, styles.stylesCell]}>ESTILOS</Text>
              </View>
              {carregando ? (
                <View style={styles.stateContainer}><ActivityIndicator color={colors.primary} /></View>
              ) : erro ? (
                <View style={styles.stateContainer}>
                  <Text style={styles.emptyText}>{erro}</Text>
                  <Pressable style={styles.retryButton} onPress={() => definirTentativa((valor) => valor + 1)}>
                    <Text style={styles.retryButtonText}>Tentar novamente</Text>
                  </Pressable>
                </View>
              ) : clientes.length > 0 ? (
                clientes.map((cliente, index) => (
                  <LinhaCliente
                    key={cliente.id}
                    cliente={cliente}
                    ultimaLinha={index === clientes.length - 1}
                    aoPressionar={() => navigation.navigate('DetalhesCliente', { clienteId: cliente.id })}
                  />
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhum cliente encontrado.</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}
