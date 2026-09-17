import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Header from '../../components/Header';
import { clientes, formatarMoeda, formatarUltimaSessao, obterResumoCliente } from '../../data/historicoClientes';
import { colors } from '../../theme/colors';
import { styles } from './HistoricoClientesScreen.styles';

function normalizar(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function CartaoResumo({ label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function LinhaCliente({ cliente, resumo, ultimaLinha, aoPressionar }) {
  const ultimaSessao = formatarUltimaSessao(resumo.diasDesdeUltimaSessao);

  return (
    <Pressable
      onPress={aoPressionar}
      style={({ pressed }) => [styles.tableRow, ultimaLinha && styles.lastRow, pressed && styles.rowPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Abrir detalhes de ${cliente.nome}, ${resumo.quantidadeSessoes} sessões, ${resumo.gastoTotal ? formatarMoeda(resumo.gastoTotal) : 'sem gasto registrado'}, última sessão ${ultimaSessao}`}
      accessibilityHint="Mostra as sessões deste cliente"
    >
      <View style={styles.clientCell}>
        <View style={styles.clientAvatar}>
          <Text style={styles.clientInitials}>{cliente.iniciais}</Text>
        </View>
      </View>
      <Text style={[styles.cellText, styles.sessionsCell]}>{resumo.quantidadeSessoes}</Text>
      <Text style={[styles.cellText, styles.spentCell, styles.spentCellText]}>{resumo.gastoTotal ? formatarMoeda(resumo.gastoTotal) : '—'}</Text>
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

  const clientesFiltrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return clientes;

    return clientes.filter((cliente) =>
      normalizar(`${cliente.nome} ${cliente.estilos.join(' ')}`).includes(termo)
    );
  }, [busca]);

  const totais = clientesFiltrados.reduce((resultado, cliente) => {
    const resumo = obterResumoCliente(cliente);
    return {
      sessoes: resultado.sessoes + resumo.quantidadeSessoes,
      receita: resultado.receita + resumo.gastoTotal,
    };
  }, { sessoes: 0, receita: 0 });

  return (
    <View style={styles.container}>
      <View style={styles.headerBorder}><Header /></View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Histórico de clientes</Text>
        <Text style={styles.subtitle}>
          {clientesFiltrados.length} {clientesFiltrados.length === 1 ? 'cliente' : 'clientes'} · {formatarMoeda(totais.receita)} em receita acumulada
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
          <CartaoResumo label="Total clientes" value={String(clientesFiltrados.length)} />
          <CartaoResumo label="Sessões realizadas" value={String(totais.sessoes)} />
          <CartaoResumo label="Receita acumulada" value={formatarMoeda(totais.receita).replace(' ', '\n')} />
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
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map((cliente, index) => (
                  <LinhaCliente
                    key={cliente.id}
                    cliente={cliente}
                    resumo={obterResumoCliente(cliente)}
                    ultimaLinha={index === clientesFiltrados.length - 1}
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
