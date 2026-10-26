import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import { colors } from '../../theme/colors';
import { styles } from './DashboardScreen.styles';
import { useAuth } from '../../context/AuthContext';
import RevenueChart from '../../components/RevenueChart';
import { useExitOnDoubleBack } from '../../hooks/UseExitDoubleBack';
import { useApiRecurso } from '../../hooks/useApiRecurso';
import { carregarDashboard } from '../../services/dashboardService';
import {
  formatarDataCabecalho,
  formatarDiaCurto,
  formatarDuracao,
  formatarMoeda,
  formatarVariacao,
  saudacao,
} from '../../services/dashboardModel';

const ICONE_STATUS = {
  ok: { nome: 'checkmark-circle', cor: colors.success },
  concluido: { nome: 'checkmark-done-circle', cor: colors.info },
  cancelado: { nome: 'close-circle', cor: colors.textMuted },
};

function Variacao({ valor, sufixo }) {
  const texto = formatarVariacao(valor);
  if (!texto) return sufixo ? <Text>{sufixo}</Text> : null;
  const positivo = valor >= 0;
  return (
    <Text>
      <Text style={positivo ? styles.cardSubtextGreen : styles.cardSubtextRed}>{positivo ? '↗' : '↘'} {texto} </Text>
      {sufixo}
    </Text>
  );
}

function plural(qtd, singular, pluralTexto) {
  return `${qtd} ${qtd === 1 ? singular : pluralTexto}`;
}

export default function DashboardScreen() {
  const { nome } = useAuth();
  const navigation = useNavigation();
  useExitOnDoubleBack();

  const abrirEstoqueCritico = () => navigation.navigate('Estoque', { screen: 'Estoque', params: { filtro: 'critico' } });
  const abrirOrcamentos = () => navigation.navigate('Orcamentos');

  const carregar = useCallback((signal) => carregarDashboard(signal), []);
  const { dados, carregando, atualizando, erro, recarregar } = useApiRecurso(carregar);

  // Ao voltar para o Dashboard (ex.: depois de mexer no estoque), atualiza sem piscar a tela.
  const primeiroFoco = useRef(true);
  useFocusEffect(useCallback(() => {
    if (primeiroFoco.current) {
      primeiroFoco.current = false;
      return;
    }
    recarregar('silencioso');
  }, [recarregar]));

  const agora = new Date();

  const cabecalho = (
    <View style={styles.greetingRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.greeting}>{saudacao(agora)}, {nome}</Text>
        <Text style={styles.date}>{formatarDataCabecalho(agora)}</Text>
      </View>
      {dados && dados.alertasEstoque.length > 0 && (
        <TouchableOpacity style={styles.alertBadge} activeOpacity={0.7} onPress={abrirEstoqueCritico}>
          <Ionicons name="warning-outline" size={12} color={colors.warning} />
          <Text style={styles.alertBadgeText}>{plural(dados.alertasEstoque.length, 'alerta de estoque', 'alertas de estoque')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (carregando || (erro && !dados)) {
    return (
      <View style={styles.container}>
        <Header />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {cabecalho}
          <View style={[styles.card, styles.stateContainer]}>
            {carregando ? <ActivityIndicator color={colors.primary} /> : (
              <>
                <Text style={styles.emptyText}>{erro}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => recarregar()}>
                  <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  const { agenda, resumoHoje, proximasSessoes, alertasEstoque, totalOrcamentosPendentes, orcamentosPendentes, faturamento, ticket } = dados;
  const partesResumo = [
    resumoHoje.confirmadas && plural(resumoHoje.confirmadas, 'confirmada', 'confirmadas'),
    resumoHoje.pendentes && plural(resumoHoje.pendentes, 'pendente', 'pendentes'),
    resumoHoje.concluidas && plural(resumoHoje.concluidas, 'concluída', 'concluídas'),
    resumoHoje.canceladas && plural(resumoHoje.canceladas, 'cancelada', 'canceladas'),
  ].filter(Boolean);

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={() => recarregar('atualizar')} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {cabecalho}
        {!!erro && <Text style={styles.inlineError}>{erro}</Text>}

        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={abrirOrcamentos}>
          <Text style={styles.cardLabel}>SESSÕES HOJE</Text>
          <Text style={styles.cardBigNumber}>{plural(resumoHoje.sessoes, 'sessão', 'sessões')}</Text>
          <Text style={styles.cardSubtext}>
            {resumoHoje.minutos > 0 && <Text style={styles.cardSubtextGreen}>↗ {formatarDuracao(resumoHoje.minutos)} previstas </Text>}
            {partesResumo.length ? partesResumo.join(' · ') : 'Nenhuma sessão agendada'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={abrirOrcamentos}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Próximas Sessões</Text>
          </View>
          {proximasSessoes.length === 0 && <Text style={styles.rowSubtitle}>Nenhuma sessão futura agendada.</Text>}
          {proximasSessoes.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{item.nome}</Text>
                <Text style={styles.rowSubtitle}>{item.detalhe}</Text>
              </View>
            </View>
          ))}
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={abrirOrcamentos}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Agenda de Hoje</Text>
            <Text style={styles.cardTitleMuted}>{formatarDiaCurto(agora)}</Text>
          </View>
          {agenda.length === 0 && <Text style={styles.rowSubtitle}>Nenhum agendamento para hoje.</Text>}
          {agenda.map((item, i) => {
            const icone = ICONE_STATUS[item.status];
            const cancelado = item.status === 'cancelado';
            return (
              <View key={item.id ?? i}>
                <View style={[styles.row, cancelado && styles.rowCancelada]}>
                  <Text style={styles.rowTime}>{item.hora}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowName, cancelado && styles.textoRiscado]}>{item.nome}</Text>
                    <Text style={styles.rowSubtitle}>{item.detalhe}</Text>
                  </View>
                  {icone && <Ionicons name={icone.nome} size={18} color={icone.cor} />}
                </View>
                {i < agenda.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={abrirEstoqueCritico}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>⚠ Alertas de Estoque</Text>
          </View>
          {alertasEstoque.length === 0 && <Text style={styles.rowSubtitle}>Nenhum material abaixo do mínimo.</Text>}
          {alertasEstoque.map((item) => (
            <View key={item.id} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: item.zerado ? colors.primary : colors.warning }]} />
              <Text style={[styles.rowName, { flex: 1 }]}>{item.nome}</Text>
              <Text style={styles.rowSubtitle}>{item.detalhe}</Text>
            </View>
          ))}
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={abrirOrcamentos}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Orçamentos pendentes</Text>
            {totalOrcamentosPendentes > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalOrcamentosPendentes} aguardando</Text>
              </View>
            )}
          </View>
          {orcamentosPendentes == null && <Text style={styles.rowSubtitle}>Não foi possível carregar a lista de orçamentos.</Text>}
          {orcamentosPendentes?.length === 0 && <Text style={styles.rowSubtitle}>Nenhum orçamento aguardando resposta.</Text>}
          {orcamentosPendentes?.map((item) => (
            <View key={item.codigo} style={styles.row}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.iniciais}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{item.nome}</Text>
                <Text style={styles.rowSubtitle}>{item.detalhe}</Text>
              </View>
              {item.local && <Text style={styles.rowSubtitle} numberOfLines={1}>{item.local}</Text>}
            </View>
          ))}
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>TICKET MÉDIO</Text>
          <Text style={styles.cardBigNumber}>{formatarMoeda(ticket?.ticket)}</Text>
          <Text style={styles.cardSubtext}>
            {!ticket ? 'Dados indisponíveis' : (
              <Variacao
                valor={ticket.variacao}
                sufixo={ticket.geral
                  ? `média geral · ${plural(ticket.sessoes, 'sessão concluída', 'sessões concluídas')}`
                  : `últimos 30 dias · ${plural(ticket.sessoes, 'sessão', 'sessões')}`}
              />
            )}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>FATURAMENTO DO MÊS</Text>
          <Text style={styles.cardBigNumber}>{formatarMoeda(faturamento.mesAtual)}</Text>
          {faturamento.mesAnterior != null && (
            <Text style={styles.cardSubtext}>
              <Variacao valor={faturamento.variacao} sufixo={`vs. ${formatarMoeda(faturamento.mesAnterior)} em ${faturamento.nomeMesAnterior}`} />
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Faturamento mensal</Text>
            <Text style={styles.cardTitleMuted}>últimos {faturamento.serie.length} meses</Text>
          </View>
          <RevenueChart data={faturamento.serie} />
        </View>
      </ScrollView>
    </View>
  );
}
