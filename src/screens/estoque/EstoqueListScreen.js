import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Camera, Pencil, Plus, SlidersHorizontal, Trash2 } from 'lucide-react-native';
import Header from '../../components/Header';
import EscanearNotaModal from '../../components/EscanearNotaModal';
import MaterialFormModal from '../../components/MaterialFormModal';
import AjusteQuantidadeModal from '../../components/AjusteQuantidadeModal';
import { useApiRecurso } from '../../hooks/useApiRecurso';
import { carregarImportacoes, excluirImportacao, registrarImportacao, validarNotaNova } from '../../services/estoqueImportadoService';
import { agruparEntradasPorMaterial, anexarHistorico, ordenarMateriais, prepararEntrada } from '../../services/estoqueModel';
import { atualizarMaterial, criarMaterial, definirQuantidade, excluirMaterial, listarMateriais } from '../../services/estoqueService';
import { colors, statusColors } from '../../theme/colors';
import { styles } from './EstoqueListScreen.styles';

const FILTROS = [
  { key: null, label: 'Todos' },
  { key: 'critico', label: 'Abaixo do mínimo' },
  { key: 'ok', label: 'OK' },
  { key: 'semDados', label: 'Sem mínimo' },
];

const moeda = (valor) => `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
const numero = (valor) => String(Number(Number(valor).toFixed(4))).replace('.', ',');

export default function EstoqueListScreen({ route, navigation }) {
  const [filtroAtivo, setFiltroAtivo] = useState(null);

  // Filtro vindo de outra tela (ex.: Dashboard). Aplica e limpa o parâmetro para não "grudar"
  // quando o Estoque for aberto depois pelo menu.
  const filtroRecebido = route?.params?.filtro;
  useEffect(() => {
    if (filtroRecebido === undefined) return;
    if (FILTROS.some((filtro) => filtro.key === filtroRecebido)) setFiltroAtivo(filtroRecebido);
    navigation?.setParams({ filtro: undefined });
  }, [filtroRecebido, navigation]);
  const [showScanModal, setShowScanModal] = useState(false);
  const [mostrarNotas, setMostrarNotas] = useState(false);
  const [importacoes, setImportacoes] = useState({ notas: [], itens: [] });
  const [selecionadoId, setSelecionadoId] = useState(null);
  const [formulario, setFormulario] = useState({ visivel: false, material: null });
  const [ajuste, setAjuste] = useState(null);

  const carregar = useCallback((signal) => listarMateriais(signal), []);
  const { dados, setDados, carregando, atualizando, erro, recarregar, tratarNaoAutorizado } = useApiRecurso(carregar);
  const materiais = dados || [];

  const lerHistoricoLocal = useCallback(async () => {
    try {
      setImportacoes(await carregarImportacoes());
    } catch {
      Alert.alert('Histórico indisponível', 'Não foi possível ler as notas salvas neste dispositivo.');
    }
  }, []);

  useEffect(() => { lerHistoricoLocal(); }, [lerHistoricoLocal]);

  const estoque = anexarHistorico(materiais, importacoes);
  const dadosFiltrados = filtroAtivo ? estoque.filter((item) => item.status === filtroAtivo) : estoque;
  const abaixoDoMinimo = estoque.filter((item) => item.status === 'critico').length;

  // Repassa 401 para o logout; outros erros sobem para quem chamou (modal/alerta).
  async function chamarApi(acao) {
    try {
      return await acao();
    } catch (falha) {
      if (await tratarNaoAutorizado(falha)) return undefined;
      throw falha;
    }
  }

  function substituirMaterial(atualizado) {
    if (!atualizado) return;
    setDados((anteriores) => ordenarMateriais((anteriores || []).map((item) => (item.id === atualizado.id ? atualizado : item))));
  }

  async function salvarMaterial(valores) {
    const editando = formulario.material;
    const salvo = await chamarApi(() => (editando ? atualizarMaterial(editando.id, valores) : criarMaterial(valores)));
    if (!salvo) return;
    if (editando) substituirMaterial(salvo);
    else setDados((anteriores) => ordenarMateriais([...(anteriores || []), salvo]));
    recarregar('silencioso');
  }

  async function salvarAjuste(novaQuantidade) {
    try {
      substituirMaterial(await chamarApi(() => definirQuantidade(ajuste.id, novaQuantidade)));
    } finally {
      recarregar('silencioso');
    }
  }

  function confirmarExclusaoMaterial(item) {
    Alert.alert('Excluir material?', `"${item.material}" será removido do estoque do estúdio.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            await chamarApi(() => excluirMaterial(item.id));
            setDados((anteriores) => (anteriores || []).filter((material) => material.id !== item.id));
            setSelecionadoId(null);
          } catch (falha) {
            Alert.alert('Não foi possível excluir', falha?.message || 'Tente novamente.');
            recarregar('silencioso');
          }
        },
      },
    ]);
  }

  async function importarNota(nota) {
    const identificador = validarNotaNova(importacoes, nota.identificador);
    if (!nota.itens?.length) throw new Error('Selecione pelo menos um material da nota.');

    // Busca os saldos mais recentes antes de somar, para não sobrescrever alterações feitas em outro aparelho.
    const atuais = await chamarApi(() => listarMateriais());
    if (!atuais) return;
    const entradas = nota.itens.map((item) => prepararEntrada(item, atuais));
    const totais = agruparEntradasPorMaterial(entradas);

    const atualizados = new Set();
    const falhas = [];
    for (const [id, soma] of totais) {
      const material = atuais.find((item) => item.id === id);
      try {
        const resultado = await chamarApi(() => definirQuantidade(id, material.qtdAtual + soma));
        if (!resultado) return; // sessão expirada
        atualizados.add(id);
      } catch (falha) {
        falhas.push(`• ${material.material}: ${falha?.message || 'erro desconhecido'}`);
      }
    }

    recarregar('silencioso');
    if (atualizados.size === 0) {
      throw new Error(`Nenhum material foi atualizado.\n${falhas.join('\n')}`);
    }

    try {
      const atualizado = await registrarImportacao(importacoes, identificador, entradas.filter((entrada) => atualizados.has(entrada.materialId)));
      setImportacoes(atualizado);
    } catch {
      // Não relança: as quantidades já foram somadas no servidor e repetir a importação duplicaria a entrada.
      Alert.alert('Estoque atualizado', 'As quantidades foram lançadas, mas não foi possível salvar a nota no histórico deste dispositivo.');
    }

    if (falhas.length) {
      Alert.alert(
        'Nota importada parcialmente',
        `${atualizados.size} de ${totais.size} materiais foram atualizados.\n\nNão atualizados:\n${falhas.join('\n')}\n\nAjuste esses materiais manualmente.`
      );
    }
  }

  function confirmarExclusaoNota(identificador) {
    Alert.alert(
      'Remover nota do histórico?',
      `${identificador} sairá do histórico deste dispositivo. As quantidades já lançadas no estoque não serão alteradas; para corrigir, ajuste o material manualmente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover', style: 'destructive', onPress: async () => {
            try {
              setImportacoes(await excluirImportacao(importacoes, identificador));
            } catch (falha) {
              Alert.alert('Não foi possível remover a nota', falha?.message || 'Tente novamente.');
            }
          },
        },
      ]
    );
  }

  function atualizarTela() {
    recarregar('atualizar');
    lerHistoricoLocal();
  }

  const subtitulo = carregando
    ? 'Carregando materiais...'
    : `${materiais.length} ${materiais.length === 1 ? 'material cadastrado' : 'materiais cadastrados'}${abaixoDoMinimo ? ` · ${abaixoDoMinimo} abaixo do mínimo` : ''}`;

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={atualizarTela} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Estoque</Text>
            <Text style={styles.subtitle}>{subtitulo}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.8} disabled={carregando} onPress={() => setFormulario({ visivel: true, material: null })}>
              <Plus size={16} color={colors.text} />
              <Text style={styles.addButtonText}>Novo material</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.scanButton, (carregando || !!erro) && styles.buttonDisabled]} activeOpacity={0.8} disabled={carregando || !!erro} onPress={() => setShowScanModal(true)}>
              <Camera size={16} color="#00D3F2" />
              <Text style={styles.scanButtonText}>Escanear nota fiscal</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.notesToggle} onPress={() => setMostrarNotas((anterior) => !anterior)}>
          <Text style={styles.notesToggleText}>Notas importadas ({importacoes.notas.length}) {mostrarNotas ? '▴' : '▾'}</Text>
        </TouchableOpacity>
        {mostrarNotas && <View style={styles.notesCard}>
          {importacoes.notas.length === 0 ? <Text style={styles.itemDetail}>Nenhuma nota importada neste dispositivo.</Text> :
            importacoes.notas.map((nota) => <View key={nota.identificador} style={styles.noteRow}>
              <Text style={styles.noteName}>{nota.identificador}</Text>
              <TouchableOpacity onPress={() => confirmarExclusaoNota(nota.identificador)}><Text style={styles.noteRemove}>Remover</Text></TouchableOpacity>
            </View>)}
        </View>}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTROS.map((filtro) => {
            const ativo = filtroAtivo === filtro.key;
            const cor = filtro.key ? statusColors[filtro.key] || colors.textMuted : colors.text;
            return (
              <TouchableOpacity key={filtro.label} style={[styles.filterPill, { borderColor: cor }, ativo && { backgroundColor: cor }]} onPress={() => setFiltroAtivo(filtro.key)}>
                {filtro.key && <View style={[styles.filterDot, { backgroundColor: ativo ? colors.background : cor }]} />}
                <Text style={[styles.filterLabel, { color: ativo ? colors.background : cor }]}>{filtro.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.card}>
          {carregando ? (
            <View style={styles.stateContainer}><ActivityIndicator color={colors.primary} /></View>
          ) : erro && !dados ? (
            <View style={styles.stateContainer}>
              <Text style={styles.emptyText}>{erro}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => recarregar()}>
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {!!erro && <Text style={styles.inlineError}>{erro}</Text>}
              {dadosFiltrados.map((item, index) => {
                const selecionado = selecionadoId === item.id;
                return (
                  <View key={item.id}>
                    <TouchableOpacity
                      style={styles.itemRow}
                      activeOpacity={0.7}
                      onPress={() => setSelecionadoId(selecionado ? null : item.id)}
                      accessibilityRole="button"
                      accessibilityHint="Mostra as ações do material"
                    >
                      <View style={[styles.statusBar, { backgroundColor: statusColors[item.status] || colors.textMuted }]} />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemMaterial}>{item.material}</Text>
                        <Text style={styles.itemDetail}>{item.minAviso == null ? 'Mínimo não definido' : `Avisar com ${numero(item.minAviso)} ${item.unidade} ou menos`}</Text>
                        {item.nf && <Text style={styles.itemDetail}>Última entrada: {item.ultimaEntradaData} · {item.ultimaEntradaQtd} ({item.nf})</Text>}
                        {item.ultimoValorUnitario != null && <Text style={styles.itemDetail}>Última compra: {moeda(item.ultimoValorUnitarioNota ?? item.ultimoValorUnitario)} / {item.ultimaUnidadeNota ?? item.unidade} · total {moeda(item.ultimaEntradaValorTotal)}</Text>}
                      </View>
                      <View style={styles.itemRight}>
                        <Text style={styles.itemQtd}>{numero(item.qtdAtual)}<Text style={styles.itemUnidade}> {item.unidade}</Text></Text>
                        {item.status !== 'semDados' && <View style={[styles.reposicaoBadge, { borderColor: statusColors[item.status] }]}>
                          <Text style={[styles.reposicaoBadgeText, { color: statusColors[item.status] }]}>{item.status === 'critico' ? 'Baixo' : 'OK'}</Text>
                        </View>}
                      </View>
                    </TouchableOpacity>
                    {selecionado && (
                      <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => setAjuste(item)}>
                          <SlidersHorizontal size={14} color="#00D3F2" />
                          <Text style={styles.actionText}>Ajustar qtd.</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => setFormulario({ visivel: true, material: item })}>
                          <Pencil size={14} color="#00D3F2" />
                          <Text style={styles.actionText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.actionDanger]} onPress={() => confirmarExclusaoMaterial(item)}>
                          <Trash2 size={14} color="#ff7878" />
                          <Text style={[styles.actionText, styles.actionDangerText]}>Excluir</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    {index < dadosFiltrados.length - 1 && <View style={styles.divider} />}
                  </View>
                );
              })}
              {dadosFiltrados.length === 0 && (
                <Text style={styles.emptyText}>{materiais.length === 0 ? 'Nenhum material cadastrado. Toque em "Novo material" para começar.' : 'Nenhum material nesse filtro.'}</Text>
              )}
            </>
          )}
        </View>
      </ScrollView>

      <EscanearNotaModal visible={showScanModal} materiais={materiais} onClose={() => setShowScanModal(false)} onSuccess={importarNota} />
      <MaterialFormModal
        visible={formulario.visivel}
        material={formulario.material}
        onClose={() => setFormulario({ visivel: false, material: null })}
        onSalvar={salvarMaterial}
      />
      <AjusteQuantidadeModal visible={!!ajuste} material={ajuste} onClose={() => setAjuste(null)} onSalvar={salvarAjuste} />
    </View>
  );
}
