import React, { useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { colors } from '../../theme/colors';
import { styles } from './AgendamentosScreen.styles';

const filtros = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendente', label: 'Pendentes' },
  { key: 'confirmado', label: 'Confirmados' },
  { key: 'concluido', label: 'Concluídos' },
  { key: 'cancelado', label: 'Cancelados' },
];

const agendamentos = [
  {
    id: '1',
    nome: 'Fernanda Lima',
    estilo: 'Fineline',
    data: '22/08/2025',
    horario: '15:00',
    duracao: '1h15',
    descricao: 'Flor de lótus no tornozelo, linework delicado, sem sombra.',
    status: 'confirmado',
  },
  {
    id: '2',
    nome: 'Lucas Ferreira',
    estilo: 'Japonês',
    data: '23/08/2025',
    horario: '10:00',
    duracao: '3h',
    descricao: 'Manga japonesa com acabamento e detalhes em preto.',
    status: 'pendente',
  },
  {
    id: '3',
    nome: 'Mariana Costa',
    estilo: 'Lettering',
    data: '23/08/2025',
    horario: '14:00',
    duracao: '1h30',
    descricao: 'Letra fina no pulso com composição floral.',
    status: 'confirmado',
  },
  {
    id: '4',
    nome: 'Rafael Souza',
    estilo: 'Geométrico',
    data: '19/08/2025',
    horario: '17:30',
    duracao: '2h',
    descricao: 'Desenho geométrico na costela.',
    status: 'concluido',
  },
  {
    id: '5',
    nome: 'Clara Ribeiro',
    estilo: 'Blackwork',
    data: '16/08/2025',
    horario: '09:00',
    duracao: '4h',
    descricao: 'Composição blackwork no braço.',
    status: 'cancelado',
  },
];

const statusConfig = {
  pendente: { label: 'Pendente', icon: 'time-outline', cor: colors.warning },
  confirmado: { label: 'Confirmado', icon: 'checkmark-circle-outline', cor: colors.success },
  concluido: { label: 'Concluído', icon: 'checkmark-done-outline', cor: colors.info },
  cancelado: { label: 'Cancelado', icon: 'close-circle-outline', cor: colors.danger },
};

const statusOrder = {
  pendente: 0,
  confirmado: 1,
  concluido: 2,
  cancelado: 3,
};

function StatusBadge({ status }) {
  const config = statusConfig[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: `${config.cor}26` }]}>
      <Ionicons name={config.icon} size={11} color={config.cor} />
      <Text style={[styles.statusBadgeText, { color: config.cor }]}>{config.label}</Text>
    </View>
  );
}

function ActionButton({ icon, label, color, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      friction: 7,
      tension: 180,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.actionButtonWrapper, { transform: [{ scale }] }]}>
      <Pressable
        style={[styles.actionButton, { backgroundColor: `${color}20` }]}
        onPress={onPress}
        onPressIn={() => animateTo(0.94)}
        onPressOut={() => animateTo(1)}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Ionicons name={icon} size={14} color={color} />
        <Text style={[styles.actionButtonText, { color }]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function AgendamentoCard({ item, onStatusChange }) {
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
      </View>

      <View style={styles.scheduleRow}>
        <View style={styles.scheduleItem}>
          <Ionicons name="calendar-outline" size={15} color={colors.text} />
          <Text style={styles.scheduleText}>{item.data}</Text>
        </View>
        <View style={styles.scheduleItem}>
          <Ionicons name="time-outline" size={15} color={colors.text} />
          <Text style={styles.scheduleText}>{item.horario} · {item.duracao}</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.descricao}</Text>

      {item.status === 'pendente' && (
        <View style={styles.actions}>
          <ActionButton
            icon="checkmark"
            label="Confirmar"
            color={colors.success}
            onPress={() => onStatusChange(item.id, 'confirmado')}
          />
          <ActionButton
            icon="close"
            label="Negar"
            color={colors.danger}
            onPress={() => onStatusChange(item.id, 'cancelado')}
          />
        </View>
      )}

      {item.status === 'confirmado' && (
        <View style={styles.actions}>
          <ActionButton
            icon="checkmark-done"
            label="Concluir"
            color={colors.info}
            onPress={() => onStatusChange(item.id, 'concluido')}
          />
        </View>
      )}
    </View>
  );
}

export default function AgendamentosScreen() {
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [listaAgendamentos, setListaAgendamentos] = useState(agendamentos);
  const lista = useMemo(
    () => {
      const filtrados = filtroAtivo === 'todos'
        ? listaAgendamentos
        : listaAgendamentos.filter((item) => item.status === filtroAtivo);

      return [...filtrados].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    },
    [filtroAtivo, listaAgendamentos]
  );
  const pendentes = listaAgendamentos.filter((item) => item.status === 'pendente').length;

  const handleStatusChange = (id, status) => {
    setListaAgendamentos((atual) => atual.map((item) => (
      item.id === id ? { ...item, status } : item
    )));
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Agendamentos</Text>
            <Text style={styles.subtitle}>Sessões do estúdio e próximos horários</Text>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendentes} pendente{pendentes === 1 ? '' : 's'}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
          {filtros.map((filtro) => {
            const isActive = filtro.key === filtroAtivo;
            return (
              <TouchableOpacity
                key={filtro.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setFiltroAtivo(filtro.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{filtro.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {lista.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={28} color={colors.textMuted} />
            <Text style={styles.emptyText}>Nenhum agendamento nesta categoria</Text>
          </View>
        ) : (
          lista.map((item) => (
            <AgendamentoCard
              key={item.id}
              item={item}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
