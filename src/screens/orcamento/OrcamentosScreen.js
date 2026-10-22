import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  Alert, Modal, TextInput, Image, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { apiRequest, API_URL } from '../../services/api';
import { colors } from '../../theme/colors';
import { styles } from './OrcamentosScreen.styles';

const tabs = [
  { key: 'todos', label: 'Todos' },
  { key: 'pendente', label: 'Pendentes' },
  { key: 'aprovado', label: 'Aprovados' },
  { key: 'agendado', label: 'Agendados' },
];

const statusConfig = {
  pendente: { label: 'Pendente', icon: 'time-outline', cor: colors.warning },
  aprovado: { label: 'Aprovado', icon: 'checkmark-circle-outline', cor: colors.success },
  agendado: { label: 'Agendado', icon: 'calendar-outline', cor: colors.warning },
  rejeitado: { label: 'Recusado', icon: 'close-circle-outline', cor: colors.danger },
};

function minutosSugeridos(tempo) {
  if (tempo == null || !Number.isFinite(Number(tempo))) return null;
  return Math.round(Number(tempo) * 60);
}

function tempoParaMinutos(tempo) {
  if (!tempo) return null;
  const partes = String(tempo).split(':').map(Number);
  if (partes.length < 2 || partes.some((parte) => !Number.isFinite(parte))) return null;
  return partes[0] * 60 + partes[1];
}

function formatarDuracao(minutos) {
  if (minutos == null) return 'Não informada';
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return horas ? `${horas}h${resto ? String(resto).padStart(2, '0') : ''}` : `${resto}min`;
}

function formatarValor(valor) {
  if (valor == null) return 'Indisponível';
  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function StatusBadge({ status }) {
  const config = statusConfig[status];
  if (!config) return null;

  return (
    <View style={[styles.statusBadge, { backgroundColor: `${config.cor}26` }]}>
      <Ionicons name={config.icon} size={10} color={config.cor} />
      <Text style={[styles.statusBadgeText, { color: config.cor }]}>
        {config.label}
      </Text>
    </View>
  );
}

function AiSuggestion({ item }) {
  return (
    <View style={styles.aiBar}>
      <View style={styles.aiBarTop}>
        <Ionicons name="sparkles-outline" size={12} color={colors.info} />
        <Text style={styles.aiLabel}>Sugestão IA</Text>
        <Text style={styles.aiPrice}>{formatarValor(item.precoSugerido)}</Text>
      </View>
      <Text style={styles.aiDuration}>
        Duração: {formatarDuracao(minutosSugeridos(item.tempoSugerido))}
      </Text>
    </View>
  );
}

function OrcamentoCard({ item, ocupado, onAnalisar, onAprovar, onRecusar }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.clientName}>{item.nome}</Text>
          {!!item.estilo && (
            <View style={styles.styleBadge}>
              <Text style={styles.styleBadgeText}>{item.estilo}</Text>
            </View>
          )}
          <StatusBadge status={item.statusTela} />
        </View>
      </View>

      <Text style={styles.description}>{item.ideia}</Text>

      <AiSuggestion item={item} />

      {item.status === 'APROVADO' && (
        <Text style={styles.description}>
          Valor aprovado: {formatarValor(item.valor)}
          {' · '}{formatarDuracao(tempoParaMinutos(item.tempo))}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          disabled={ocupado}
          onPress={() => onAnalisar(item)}
          style={[styles.actionBtn, { backgroundColor: 'rgba(159,18,20,0.2)' }]}
        >
          <Ionicons name="search-outline" size={13} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>Analisar</Text>
        </TouchableOpacity>

        {item.status === 'PENDENTE' && !item.temAgendamento && (
          <>
            <TouchableOpacity
              disabled={ocupado}
              onPress={() => onAprovar(item)}
              style={[styles.actionBtn, { backgroundColor: 'rgba(61,220,132,0.15)' }]}
            >
              <Ionicons name="checkmark" size={13} color={colors.success} />
              <Text style={[styles.actionText, { color: colors.success }]}>Aprovar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={ocupado}
              onPress={() => onRecusar(item)}
              style={[styles.actionBtn, { backgroundColor: 'rgba(255,90,95,0.15)' }]}
            >
              <Ionicons name="close" size={13} color={colors.danger} />
              <Text style={[styles.actionText, { color: colors.danger }]}>Recusar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

export default function OrcamentosScreen() {
  const [activeTab, setActiveTab] = useState('todos');
  const [orcamentos, setOrcamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [selecionado, setSelecionado] = useState(null);
  const [valor, setValor] = useState('');
  const [duracao, setDuracao] = useState('');
  const travaSalvar = useRef(false);

  useEffect(() => {
    carregarOrcamentos();
  }, []);

  const carregarOrcamentos = async () => {
    setCarregando(true);
    setErro('');

    try {
      const dados = await apiRequest('/orcamento');
      console.log('Orçamentos retornados pelo backend:', dados);
      const itens = dados === '' || dados == null ? [] : dados;

      if (!Array.isArray(itens)) {
        throw new Error('O backend retornou uma lista em formato inesperado.');
      }

      const formatados = await Promise.all(
        itens.map(async (item) => {
          const agendamento = await apiRequest(
            `/orcamento/${encodeURIComponent(item.codigoOrcamento)}/tem-agendamento`
          );

          return {
            ...item,
            temAgendamento: agendamento.temAgendamento === true,
            statusTela: agendamento.temAgendamento
              ? 'agendado'
              : String(item.status).toLowerCase(),
          };
        })
      );

      setOrcamentos(formatados);
    } catch (falha) {
      setErro(falha.message || 'Não foi possível carregar os orçamentos.');
    } finally {
      setCarregando(false);
    }
  };

  const abrirAnalise = (item) => {
    const minutos = tempoParaMinutos(item.tempo) ?? minutosSugeridos(item.tempoSugerido);

    setSelecionado(item);
    setValor(
      item.valor != null || item.precoSugerido != null
        ? String(item.valor ?? item.precoSugerido).replace('.', ',')
        : ''
    );
    setDuracao(
      minutos != null
        ? `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`
        : ''
    );
  };

  const atualizarNaLista = (atualizado) => {
    setOrcamentos((atuais) => atuais.map((item) => (
      item.codigoOrcamento === atualizado.codigoOrcamento
        ? {
          ...item,
          ...atualizado,
          statusTela: item.temAgendamento
            ? 'agendado'
            : String(atualizado.status).toLowerCase(),
        }
        : item
    )));
  };

  const aprovarOrcamento = async () => {
    if (travaSalvar.current || !selecionado) return;

    const textoValor = valor.trim();
    const preco = Number(textoValor.replace(',', '.'));
    const textoDuracao = duracao.trim();

    if (
      !/^\d+(?:[.,]\d{1,2})?$/.test(textoValor) ||
      !Number.isFinite(preco) || preco <= 0
    ) {
      Alert.alert('Valor inválido', 'Informe um preço positivo, como 480,00.');
      return;
    }

    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(textoDuracao) || textoDuracao === '00:00') {
      Alert.alert('Duração inválida', 'Use HH:mm, como 02:30. O limite é 23:59.');
      return;
    }

    travaSalvar.current = true;
    setSalvando(true);

    try {
      const resposta = await apiRequest(
        `/orcamento/${encodeURIComponent(selecionado.codigoOrcamento)}`,
        {
          method: 'PUT',
          body: {
            status: 'APROVADO',
            valor: preco,
            tempo: `${textoDuracao}:00`,
          },
        }
      );

      if (resposta.orcamento?.status !== 'APROVADO') {
        throw new Error('O backend não confirmou a aprovação.');
      }

      atualizarNaLista(resposta.orcamento);
      setSelecionado(null);
      Alert.alert('Pronto', 'Orçamento aprovado.');
    } catch (falha) {
      Alert.alert('Erro ao aprovar', falha.message);
    } finally {
      travaSalvar.current = false;
      setSalvando(false);
    }
  };

  const recusarOrcamento = (item) => {
    Alert.alert('Recusar orçamento', `Recusar o pedido de ${item.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Recusar',
        style: 'destructive',
        onPress: async () => {
          if (travaSalvar.current) return;
          travaSalvar.current = true;
          setSalvando(true);

          try {
            const resposta = await apiRequest(
              `/orcamento/${encodeURIComponent(item.codigoOrcamento)}`,
              { method: 'PUT', body: { status: 'REJEITADO' } }
            );

            if (resposta.orcamento?.status !== 'REJEITADO') {
              throw new Error('O backend não confirmou a recusa.');
            }

            atualizarNaLista(resposta.orcamento);
          } catch (falha) {
            Alert.alert('Erro ao recusar', falha.message);
          } finally {
            travaSalvar.current = false;
            setSalvando(false);
          }
        },
      },
    ]);
  };

  const pendentes = orcamentos.filter((item) => item.status === 'PENDENTE').length;

  const lista = useMemo(
    () => activeTab === 'todos'
      ? orcamentos
      : orcamentos.filter((item) => item.statusTela === activeTab),
    [activeTab, orcamentos]
  );

  const inputStyle = {
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.textMuted,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={carregando}
            onRefresh={carregarOrcamentos}
            tintColor={colors.text}
          />
        }
      >
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Orçamentos</Text>
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendentes} pendentes</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Pedidos recebidos via site · sugestões da IA preditiva
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
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {!!erro && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{erro}</Text>
            <TouchableOpacity onPress={carregarOrcamentos} disabled={carregando}>
              <Text style={{ color: colors.info, marginTop: 12 }}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {carregando && <ActivityIndicator color={colors.info} />}

        {!carregando && !erro && lista.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={28} color={colors.textMuted} />
            <Text style={styles.emptyText}>Nenhum orçamento nesta categoria</Text>
          </View>
        )}

        {lista.map((item) => (
          <OrcamentoCard
            key={item.codigoOrcamento}
            item={item}
            ocupado={salvando || carregando}
            onAnalisar={abrirAnalise}
            onAprovar={abrirAnalise}
            onRecusar={recusarOrcamento}
          />
        ))}
      </ScrollView>

      <Modal
        visible={!!selecionado}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!salvando) setSelecionado(null);
        }}
      >
        <View style={{ flex: 1, backgroundColor: '#000B', justifyContent: 'center', padding: 20 }}>
          <View style={[styles.card, { backgroundColor: '#190D0D', maxHeight: '90%' }]}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.clientName}>{selecionado?.nome}</Text>
              <Text style={styles.description}>{selecionado?.codigoOrcamento}</Text>
              <Text style={styles.description}>{selecionado?.email}</Text>
              <Text style={styles.description}>{selecionado?.ideia}</Text>
              <Text style={styles.description}>
                Estilo: {selecionado?.estilo || 'Não informado'}
                {'\n'}Local: {selecionado?.localCorpo}
                {'\n'}Tamanho: {selecionado?.tamanho} cm
                {'\n'}Cores: {selecionado?.cores}
              </Text>

              {(selecionado?.imagemReferencia || []).filter(Boolean).map((url, indice) => (
                <Image
                  key={`${url}-${indice}`}
                  source={{
                    uri: /^https?:\/\//i.test(url)
                      ? url
                      : `${API_URL}/${url.replace(/^\/+/, '')}`,
                  }}
                  style={{ width: '100%', height: 180, marginBottom: 12, borderRadius: 10 }}
                  resizeMode="contain"
                />
              ))}

              {selecionado && <AiSuggestion item={selecionado} />}

              {selecionado?.status === 'PENDENTE' && !selecionado?.temAgendamento && (
                <>
                  <Text style={{ color: colors.text, marginTop: 16 }}>Preço final (R$)</Text>
                  <TextInput
                    value={valor}
                    onChangeText={setValor}
                    keyboardType="decimal-pad"
                    placeholder="480,00"
                    placeholderTextColor={colors.textMuted}
                    style={inputStyle}
                    editable={!salvando}
                  />

                  <Text style={{ color: colors.text }}>Duração final (HH:mm)</Text>
                  <TextInput
                    value={duracao}
                    onChangeText={setDuracao}
                    placeholder="02:30"
                    placeholderTextColor={colors.textMuted}
                    style={inputStyle}
                    editable={!salvando}
                    maxLength={5}
                  />

                  <TouchableOpacity
                    onPress={aprovarOrcamento}
                    disabled={salvando}
                    style={[styles.actionBtn, { backgroundColor: 'rgba(61,220,132,0.15)', padding: 12 }]}
                  >
                    {salvando
                      ? <ActivityIndicator color={colors.success} />
                      : <Text style={[styles.actionText, { color: colors.success }]}>
                        Confirmar aprovação
                      </Text>}
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                disabled={salvando}
                onPress={() => setSelecionado(null)}
                style={{ padding: 16, alignItems: 'center' }}
              >
                <Text style={{ color: colors.text }}>Fechar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}