import React, { useEffect, useState } from 'react';
import { Alert, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Camera } from 'lucide-react-native';
import Header from '../components/Header';
import { colors, statusColors } from '../theme/colors';
import { styles } from './EstoqueListScreen.styles';
import EscanearNotaModal from '../components/EscanearNotaModal';
import { carregarImportacoes, montarEstoque, salvarImportacao } from '../services/estoqueImportadoService';

const ESTOQUE_DATA = [
  {
    id: '1',
    material: 'Tinta Preta Dynamic',
    status: 'atencao',
    qtdAtual: '45',
    unidade: 'ml',
    burnRate: '~12ml/sem',
    ultimaEntradaData: '01/07',
    ultimaEntradaQtd: '200ml',
    nf: 'NF #1023',
    reposicaoDias: 4,
  },
  {
    id: '2',
    material: 'Agulhas RL 3',
    status: 'atencao',
    qtdAtual: '120',
    unidade: 'un',
    burnRate: '~18un/sem',
    ultimaEntradaData: '15/07',
    ultimaEntradaQtd: '500un',
    nf: 'NF #1031',
    reposicaoDias: 7,
  },
  {
    id: '3',
    material: 'Agulhas RS 7',
    status: 'critico',
    qtdAtual: '34',
    unidade: 'un',
    burnRate: '~22un/sem',
    ultimaEntradaData: '15/07',
    ultimaEntradaQtd: '500un',
    nf: 'NF #1031',
    reposicaoDias: 2,
  },
  {
    id: '4',
    material: 'Tinta Vermelha Intenze',
    status: 'ok',
    qtdAtual: '80',
    unidade: 'ml',
    burnRate: '~8ml/sem',
    ultimaEntradaData: '10/07',
    ultimaEntradaQtd: '120ml',
    nf: 'NF #1018',
    reposicaoDias: 10,
  },
  {
    id: '5',
    material: 'Papel filme PVC',
    status: 'atencao',
    qtdAtual: '15',
    unidade: 'm',
    burnRate: '~3m/sem',
    ultimaEntradaData: '20/06',
    ultimaEntradaQtd: '100m',
    nf: 'NF #0987',
    reposicaoDias: 5,
  },
  {
    id: '6',
    material: 'Luvas nitrílica P',
    status: 'atencao',
    qtdAtual: '15',
    unidade: 'cx',
    burnRate: '~2cx/sem',
    ultimaEntradaData: '01/07',
    ultimaEntradaQtd: '10cx',
    nf: 'NF #1023',
    reposicaoDias: 6,
  },
  {
    id: '7',
    material: 'Tinta Azul Eternal',
    status: 'ok',
    qtdAtual: '60',
    unidade: 'ml',
    burnRate: '~5ml/sem',
    ultimaEntradaData: '10/07',
    ultimaEntradaQtd: '120ml',
    nf: 'NF #1018',
    reposicaoDias: 12,
  },
];

const FILTROS = [
  { key: null, label: 'Todos' },
  { key: 'critico', label: 'Crítico' },
  { key: 'atencao', label: 'Atenção' },
  { key: 'ok', label: 'OK' },
  { key: 'semDados', label: 'Sem previsão' },
];

function getReposicaoColor(dias) {
  if (dias <= 3) return statusColors.critico;
  if (dias <= 7) return statusColors.atencao;
  return statusColors.ok;
}

export default function EstoqueListScreen() {
  const [filtroAtivo, setFiltroAtivo] = useState(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [importacoes, setImportacoes] = useState({ notas: [], itens: [] });
  const [estoqueCarregado, setEstoqueCarregado] = useState(false);

  useEffect(() => {
    let ativo = true;
    carregarImportacoes().then((dados) => {
      if (ativo) {
        setImportacoes(dados);
        setEstoqueCarregado(true);
      }
    }).catch(() => {
      if (ativo) Alert.alert('Estoque indisponível', 'Não foi possível carregar as notas salvas neste dispositivo.');
    });
    return () => { ativo = false; };
  }, []);

  const estoque = montarEstoque(ESTOQUE_DATA, importacoes);

  const dadosFiltrados = filtroAtivo
    ? estoque.filter((item) => item.status === filtroAtivo)
    : estoque;

  async function importarNota(nota) {
    if (!estoqueCarregado) throw new Error('Aguarde o carregamento do estoque antes de importar.');
    const atualizado = await salvarImportacao(importacoes, nota);
    setImportacoes(atualizado);
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Estoque</Text>
            <Text style={styles.subtitle}>Estoque demonstrativo · entradas locais</Text>
          </View>
          <TouchableOpacity style={styles.scanButton} activeOpacity={0.8} disabled={!estoqueCarregado} onPress={() => setShowScanModal(true)}>
            <Camera size={16} color="#00D3F2" />
            <Text style={styles.scanButtonText}>Escanear nota fiscal</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTROS.map((filtro) => {
            const isActive = filtroAtivo === filtro.key;
            const dotColor = filtro.key ? statusColors[filtro.key] || colors.textMuted : colors.text;
            return (
              <TouchableOpacity
                key={filtro.label}
                style={[
                  styles.filterPill,
                  { borderColor: dotColor },
                  isActive && { backgroundColor: dotColor },
                ]}
                onPress={() => setFiltroAtivo(filtro.key)}
                activeOpacity={0.7}
              >
                {filtro.key && (
                  <View
                    style={[
                      styles.filterDot,
                      { backgroundColor: isActive ? colors.background : dotColor },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.filterLabel,
                    { color: isActive ? colors.background : dotColor },
                  ]}
                >
                  {filtro.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.card}>
          {dadosFiltrados.map((item, i) => (
            <View key={item.id}>
              <View style={styles.itemRow}>
                <View
                  style={[styles.statusBar, { backgroundColor: statusColors[item.status] || colors.textMuted }]}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemMaterial}>{item.material}</Text>
                  <Text style={styles.itemDetail}>
                    Consumo: {item.burnRate} · Última entrada: {item.ultimaEntradaData} ·{' '}
                    {item.ultimaEntradaQtd} ({item.nf})
                  </Text>
                  {item.ultimoValorUnitario != null && <Text style={styles.itemDetail}>Última compra: R$ {Number(item.ultimoValorUnitario).toFixed(2).replace('.', ',')} / {item.unidade} · total R$ {Number(item.ultimaEntradaValorTotal).toFixed(2).replace('.', ',')}</Text>}
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemQtd}>
                    {item.qtdAtual}
                    <Text style={styles.itemUnidade}> {item.unidade}</Text>
                  </Text>
                  {item.reposicaoDias != null && <View
                    style={[
                      styles.reposicaoBadge,
                      { borderColor: getReposicaoColor(item.reposicaoDias) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.reposicaoBadgeText,
                        { color: getReposicaoColor(item.reposicaoDias) },
                      ]}
                    >
                      {item.reposicaoDias} dias
                    </Text>
                  </View>}
                </View>
              </View>
              {i < dadosFiltrados.length - 1 && <View style={styles.divider} />}
            </View>
          ))}

          {dadosFiltrados.length === 0 && (
            <Text style={styles.emptyText}>Nenhum material nesse status.</Text>
          )}
        </View>
      </ScrollView>

      <EscanearNotaModal
        visible={showScanModal}
        onClose={() => setShowScanModal(false)}
        onSuccess={importarNota}
      />
    </View>
  );
}
