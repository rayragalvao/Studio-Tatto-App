import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { colors } from '../theme/colors';
import { styles } from './DashboardScreen.styles';
import { useAuth } from '../context/AuthContext';
import RevenueChart from '../components/RevenueChart';
import { useExitOnDoubleBack } from '../hooks/UseExitDoubleBack';

const proximasSessoes = [
  { nome: 'Fernanda Lima', detalhe: '22/08 às 15:00 · Fineline' },
];

const agendaHoje = [
  { hora: '10:00', nome: 'Lucas Ferreira', detalhe: 'Manga japonesa · 3h', status: 'ok' },
  { hora: '14:00', nome: 'Mariana Costa', detalhe: 'Letra fina — pulso · 1h', status: 'ok' },
  { hora: '17:30', nome: 'Rafael Souza', detalhe: 'Geométrico — costela · 2h', status: 'pendente' },
];

const alertasEstoque = [
  { nome: 'Tinta Preta Dynamic', dias: '4 dias', cor: colors.warning },
  { nome: 'Agulhas RS 7', dias: '2 dias', cor: colors.primary },
  { nome: 'Papel filme PVC', dias: '5 dias', cor: colors.warning },
];

const orcamentosPendentes = [
  { iniciais: 'BA', nome: 'Beatriz Alves', detalhe: 'Neotradicional · R$ 480 (IA)', quando: 'Hoje, 09:14' },
  { iniciais: 'TN', nome: 'Thiago Nunes', detalhe: 'Lettering · R$ 180 (IA)', quando: 'Hoje, 11:32' },
  { iniciais: 'DL', nome: 'Diego Lopes', detalhe: 'Realismo · R$ 1200 (IA)', quando: 'Ontem, 14:22' },
];

const faturamentoMensal = [
  { mes: 'Fev', valor: 6800 },
  { mes: 'Mar', valor: 9200 },
  { mes: 'Abr', valor: 7000 },
  { mes: 'Mai', valor: 7800 },
  { mes: 'Jun', valor: 10600 },
  { mes: 'Jul', valor: 12400 },
];

export default function DashboardScreen() {
  const { nome } = useAuth();
  useExitOnDoubleBack();

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.greetingRow}>
          <View>
            <Text style={styles.greeting}>Bom dia, {nome}</Text>
            <Text style={styles.date}>TER · 19 AGO 2025</Text>
          </View>
          <View style={styles.alertBadge}>
            <Ionicons name="warning-outline" size={12} color={colors.warning} />
            <Text style={styles.alertBadgeText}>3 alertas de estoque</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>SESSÕES HOJE</Text>
          <Text style={styles.cardBigNumber}>3 sessões</Text>
          <Text style={styles.cardSubtext}>
            <Text style={styles.cardSubtextGreen}>↗ 6h previstas </Text>
            2 confirmadas · 1 pendente
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Próximas Sessões</Text>
          </View>
          {proximasSessoes.map((item, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.rowName}>{item.nome}</Text>
                <Text style={styles.rowSubtitle}>{item.detalhe}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Agenda de Hoje</Text>
            <Text style={styles.cardTitleMuted}>TER 19/08</Text>
          </View>
          {agendaHoje.map((item, i) => (
            <View key={i}>
              <View style={styles.row}>
                <Text style={styles.rowTime}>{item.hora}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName}>{item.nome}</Text>
                  <Text style={styles.rowSubtitle}>{item.detalhe}</Text>
                </View>
                <Ionicons
                  name={item.status === 'ok' ? 'checkmark-circle' : 'help-circle'}
                  size={18}
                  color={item.status === 'ok' ? colors.success : colors.warning}
                />
              </View>
              {i < agendaHoje.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>⚠ Alertas de Estoque</Text>
          </View>
          {alertasEstoque.map((item, i) => (
            <View key={i} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: item.cor }]} />
              <Text style={[styles.rowName, { flex: 1 }]}>{item.nome}</Text>
              <Text style={styles.rowSubtitle}>{item.dias}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Orçamentos pendentes</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3 aguardando</Text>
            </View>
          </View>
          {orcamentosPendentes.map((item, i) => (
            <View key={i} style={styles.row}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.iniciais}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{item.nome}</Text>
                <Text style={styles.rowSubtitle}>{item.detalhe}</Text>
              </View>
              <Text style={styles.rowSubtitle}>{item.quando}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>TICKET MÉDIO</Text>
          <Text style={styles.cardBigNumber}>R$ 340</Text>
          <Text style={styles.cardSubtext}>
            <Text style={styles.cardSubtextGreen}>↗ +5% </Text>
            últimos 30 dias · 37 sessões
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>FATURAMENTO DO MÊS</Text>
          <Text style={styles.cardBigNumber}>R$ 12.400</Text>
          <Text style={styles.cardSubtext}>
            <Text style={styles.cardSubtextGreen}>↗ +17% </Text>
            vs. R$ 10.600 em junho
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Faturamento mensal</Text>
            <Text style={styles.cardTitleMuted}>últimos 6 meses</Text>
          </View>
          <RevenueChart data={faturamentoMensal} />
        </View>
      </ScrollView>
    </View>
  );
}