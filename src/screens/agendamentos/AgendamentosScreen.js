import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Header from '../../components/Header';
import AgendamentoActionModal from '../../components/AgendamentoActionModal';
import AnimatedActionButton from '../../components/AnimatedActionButton';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme/colors';
import { styles } from './AgendamentosScreen.styles';

const filtros = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendente', label: 'Pendentes' },
  { key: 'confirmado', label: 'Confirmados' },
  { key: 'concluido', label: 'Concluídos' },
  { key: 'cancelado', label: 'Cancelados' },
];

const statusConfig = {
  pendente: { label: 'Pendente', icon: 'time-outline', cor: colors.warning },
  confirmado: { label: 'Confirmado', icon: 'checkmark-circle-outline', cor: colors.success },
  concluido: { label: 'Concluído', icon: 'checkmark-done-outline', cor: colors.info },
  cancelado: { label: 'Cancelado', icon: 'close-circle-outline', cor: colors.danger },
};

const statusOrder = { pendente: 0, confirmado: 1, concluido: 2, cancelado: 3 };

function adaptarAgendamento(dado) {
  const [data = '', hora = ''] = (dado.dataHora || '').split('T');
  const partes = data.split('-');
  const minutos = dado.tempoDuracao;
  const duracao = Number.isInteger(minutos) && minutos > 0
    ? `${Math.floor(minutos / 60) ? `${Math.floor(minutos / 60)}h` : ''}${minutos % 60 ? `${minutos % 60}min` : ''}`
    : 'Duração não informada';

  return {
    ...dado,
    nome: dado.nomeUsuario || 'Cliente',
    estilo: dado.localCorpo || 'Local não informado',
    data: partes.length === 3 ? partes.reverse().join('/') : 'Data não informada',
    horario: hora.slice(0, 5),
    duracao,
    descricao: dado.ideia || 'Sem descrição',
    status: (dado.status || '').toLowerCase(),
  };
}

function StatusBadge({ status }) {
  const config = statusConfig[status] || {
    label: status || 'Não informado',
    icon: 'help-circle-outline',
    cor: colors.textMuted,
  };
  return (
    <View style={[styles.statusBadge, { backgroundColor: `${config.cor}26` }]}>
      <Ionicons name={config.icon} size={11} color={config.cor} />
      <Text style={[styles.statusBadgeText, { color: config.cor }]}>{config.label}</Text>
    </View>
  );
}

function AgendamentoCard({ item, onAction }) {
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
          <AnimatedActionButton icon="checkmark" label="Confirmar" color={colors.success}
            onPress={() => onAction('confirmar', item)} />
          <AnimatedActionButton icon="close" label="Negar" color={colors.danger}
            onPress={() => onAction('cancelar', item)} />
        </View>
      )}
      {item.status === 'confirmado' && (
        <View style={styles.actions}>
          <AnimatedActionButton icon="checkmark-done" label="Concluir" color={colors.info}
            onPress={() => onAction('concluir', item)} />
          <AnimatedActionButton icon="close" label="Cancelar" color={colors.danger}
            onPress={() => onAction('cancelar', item)} />
        </View>
      )}
    </View>
  );
}

export default function AgendamentosScreen() {
  const navigation = useNavigation();
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [listaAgendamentos, setListaAgendamentos] = useState([]);
  const [actionModal, setActionModal] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const bloqueio = useRef(false);
  const sequencia = useRef(0);

  const carregar = useCallback(async () => {
    const requisicao = ++sequencia.current;
    setCarregando(true);
    setErro('');
    try {
      const dados = await apiRequest('/agendamento');
      if (requisicao !== sequencia.current) return;
      if (dados && !Array.isArray(dados)) {
        throw new Error('Formato inesperado na resposta de agendamentos.');
      }
      setListaAgendamentos((dados || []).map(adaptarAgendamento));
    } catch (e) {
      if (requisicao === sequencia.current) {
        setErro(e.message || 'Erro ao carregar agendamentos.');
      }
    } finally {
      if (requisicao === sequencia.current) setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    carregar();
    return () => { sequencia.current += 1; };
  }, [carregar]));

  const lista = useMemo(() => {
    const filtrados = filtroAtivo === 'todos'
      ? listaAgendamentos
      : listaAgendamentos.filter(item => item.status === filtroAtivo);
    return [...filtrados].sort((a, b) =>
      (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4)
      || (a.dataHora || '').localeCompare(b.dataHora || '')
    );
  }, [filtroAtivo, listaAgendamentos]);

  const pendentes = listaAgendamentos.filter(item => item.status === 'pendente').length;

  const handleAction = (type, item) => {
    if (!bloqueio.current) {
      setErro('');
      setActionModal({ type, item });
    }
  };

  const handleConfirmAction = async () => {
    if (!actionModal || bloqueio.current) return;
    const { type, item } = actionModal;

    if (type === 'concluir') {
      setActionModal(null);
      navigation.navigate('FinalizarAgendamento', { agendamento: item });
      return;
    }

    bloqueio.current = true;
    setSalvando(true);
    setActionModal(null);

    try {
      const atual = await apiRequest(`/agendamento/${item.id}`);
      if (atual.status !== 'PENDENTE'
          && !(type === 'cancelar' && atual.status === 'CONFIRMADO')) {
        throw new Error('O status deste agendamento mudou. Atualize a lista antes de continuar.');
      }

      const atualizado = await apiRequest(`/agendamento/${item.id}`, {
        method: 'PUT',
        body: {
          emailUsuario: atual.emailUsuario,
          codigoOrcamento: atual.codigoOrcamento,
          dataHora: atual.dataHora,
          status: type === 'confirmar' ? 'CONFIRMADO' : 'CANCELADO',
          tempoDuracao: atual.tempoDuracao,
          pagamentoFeito: atual.pagamentoFeito,
          formaPagamento: atual.formaPagamento,
        },
      });

      setListaAgendamentos(atuais => atuais.map(registro =>
        registro.id === item.id ? adaptarAgendamento(atualizado) : registro
      ));
    } catch (e) {
      setErro(e.message || 'Não foi possível salvar a alteração.');
    } finally {
      bloqueio.current = false;
      setSalvando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} />}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Agendamentos</Text>
            <Text style={styles.subtitle}>Sessões do estúdio e próximos horários</Text>
          </View>
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>
              {pendentes} pendente{pendentes === 1 ? '' : 's'}
            </Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}>
          {filtros.map(filtro => (
            <TouchableOpacity key={filtro.key}
              style={[styles.tab, filtro.key === filtroAtivo && styles.tabActive]}
              onPress={() => setFiltroAtivo(filtro.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: filtro.key === filtroAtivo }}>
              <Text style={[styles.tabText, filtro.key === filtroAtivo && styles.tabTextActive]}>
                {filtro.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {erro ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.danger }]}>{erro}</Text>
            <TouchableOpacity onPress={carregar}>
              <Text style={[styles.emptyText, { color: colors.info }]}>Atualizar lista</Text>
            </TouchableOpacity>
          </View>
        ) : carregando && listaAgendamentos.length === 0 ? (
          <ActivityIndicator size="large" color={colors.info} />
        ) : lista.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={28} color={colors.textMuted} />
            <Text style={styles.emptyText}>Nenhum agendamento nesta categoria</Text>
          </View>
        ) : lista.map(item => (
          <AgendamentoCard key={item.id} item={item} onAction={handleAction} />
        ))}

        {salvando && <ActivityIndicator color={colors.info} />}
      </ScrollView>

      <AgendamentoActionModal action={actionModal}
        onClose={() => setActionModal(null)}
        onConfirm={handleConfirmAction} />
    </View>
  );
}