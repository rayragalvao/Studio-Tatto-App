import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { colors } from '../../theme/colors';
import { styles } from './OrcamentosScreen.styles';

const tabs = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendente', label: 'Pendentes' },
  { key: 'aprovado', label: 'Aprovados' },
  { key: 'agendado', label: 'Agendados' },
];

const orcamentos = [
  {
    id: '1',
    nome: 'Beatriz Alves',
    estilo: 'Neotradicional',
    quando: 'Hoje, 09:14',
    descricao: 'Dragão japonês no antebraço, tamanho médio, blackwork com sombreado suave',
    status: 'pendente',
    ia: { preco: 'R$ 480', duracao: '2h30', confianca: '91% conf.' },
  },
  {
    id: '2',
    nome: 'Thiago Nunes',
    estilo: 'Lettering',
    quando: 'Hoje, 11:32',
    descricao: 'Frase em italiano no pescoço, lettering cursivo, tamanho pequeno',
    status: 'pendente',
    ia: { preco: 'R$ 180', duracao: '45min', confianca: '97% conf.' },
  },
  {
    id: '3',
    nome: 'Camila Rocha',
    estilo: 'Blackwork',
    quando: 'Ontem, 16:07',
    descricao: 'Mandala na coxa, P&B, sem preenchimento, aprox. 15cm',
    status: 'aprovado',
    ia: { preco: 'R$ 620', duracao: '3h30', confianca: '85% conf.' },
  },
  {
    id: '4',
    nome: 'Diego Lopes',
    estilo: 'Realismo',
    quando: 'Ontem, 14:22',
    descricao: 'Realismo: rosto de lobo no peito, colorido, referência enviada por e-mail',
    status: 'pendente',
    ia: { preco: 'R$ 1200', duracao: '6h (2 sessões)', confianca: '78% conf.' },
  },
  {
    id: '5',
    nome: 'Fernanda Lima',
    estilo: 'Fineline',
    quando: 'Ontem, 09:55',
    descricao: 'Flor de lótus no tornozelo, linework delicado, sem sombra',
    status: 'agendado',
    sessao: 'Sessão: 22/08 às 15:00',
    ia: { preco: 'R$ 220', duracao: '1h15', confianca: '95% conf.' },
  },
];

const statusConfig = {
  aprovado: { label: 'Aprovado', icon: 'checkmark-circle-outline', cor: colors.success },
  agendado: { label: 'Agendado', icon: 'calendar-outline', cor: colors.warning },
};

function StatusBadge({ status }) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <View style={[styles.statusBadge, { backgroundColor: `${config.cor}26` }]}>
      <Ionicons name={config.icon} size={10} color={config.cor} />
      <Text style={[styles.statusBadgeText, { color: config.cor }]}>{config.label}</Text>
    </View>
  );
}

function AiSuggestion({ ia }) {
  return (
    <View style={styles.aiBar}>
      <View style={styles.aiBarTop}>
        <Ionicons name="sparkles-outline" size={12} color={colors.info} />
        <Text style={styles.aiLabel}>Sugestão IA</Text>
        <Text style={styles.aiPrice}>{ia.preco}</Text>
        <Text style={styles.aiSeparator}>·</Text>
        <Ionicons name="time-outline" size={12} color={colors.textMuted} />
        <Text style={styles.aiDuration}>{ia.duracao}</Text>
      </View>
      <Text style={styles.aiConfidence}>{ia.confianca}</Text>
    </View>
  );
}

function CardActions() {
  return (
    <View style={styles.actions}>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(159,18,20,0.2)' }]}>
        <Ionicons name="search-outline" size={13} color={colors.text} />
        <Text style={[styles.actionText, { color: colors.text }]}>Analisar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(61,220,132,0.15)' }]}>
        <Ionicons name="checkmark" size={13} color={colors.success} />
        <Text style={[styles.actionText, { color: colors.success }]}>Aprovar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(255,90,95,0.15)' }]}>
        <Ionicons name="close" size={13} color={colors.danger} />
        <Text style={[styles.actionText, { color: colors.danger }]}>Recusar</Text>
      </TouchableOpacity>
    </View>
  );
}

function OrcamentoCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.clientName}>{item.nome}</Text>
          <View style={styles.styleBadge}>
            <Text style={styles.styleBadgeText}>{item.estilo}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
        <Text style={styles.dateLabel}>{item.quando}</Text>
      </View>

      <Text style={styles.description}>{item.descricao}</Text>

      {item.sessao && (
        <View style={styles.scheduledRow}>
          <Ionicons name="calendar-outline" size={12} color={colors.warning} />
          <Text style={styles.scheduledText}>{item.sessao}</Text>
        </View>
      )}

      <AiSuggestion ia={item.ia} />

      {item.status === 'pendente' && <CardActions />}
    </View>
  );
}

export default function OrcamentosScreen() {
  const [activeTab, setActiveTab] = useState('todos');

  const pendentes = orcamentos.filter((item) => item.status === 'pendente').length;
  const lista = useMemo(
    () => (activeTab === 'todos' ? orcamentos : orcamentos.filter((item) => item.status === activeTab)),
    [activeTab]
  );

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Orçamentos</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendentes} pendentes</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Pedidos recebidos via site · preço sugerido por IA via histórico
          </Text>
        </View>

        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {lista.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={28} color={colors.textMuted} />
            <Text style={styles.emptyText}>Nenhum orçamento nesta categoria</Text>
          </View>
        ) : (
          lista.map((item) => <OrcamentoCard key={item.id} item={item} />)
        )}
      </ScrollView>
    </View>
  );
}
