import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import Header from '../components/Header';
import EscanearNotaModal from '../components/EscanearNotaModal';
import { carregarImportacoes, salvarImportacao } from '../services/estoqueImportadoService';
import { montarEstoque } from '../services/estoqueModel';
import { colors, statusColors } from '../theme/colors';
import { styles } from './EstoqueListScreen.styles';

const FILTROS = [
  { key: null, label: 'Todos' },
  { key: 'critico', label: 'Abaixo do mínimo' },
  { key: 'ok', label: 'OK' },
  { key: 'semDados', label: 'Sem mínimo' },
];

const moeda = (valor) => `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;

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

  const estoque = montarEstoque(importacoes);
  const dadosFiltrados = filtroAtivo ? estoque.filter((item) => item.status === filtroAtivo) : estoque;

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
            <Text style={styles.subtitle}>20 materiais cadastrados · entradas locais</Text>
          </View>
          <TouchableOpacity style={styles.scanButton} activeOpacity={0.8} disabled={!estoqueCarregado} onPress={() => setShowScanModal(true)}>
            <Camera size={16} color="#00D3F2" />
            <Text style={styles.scanButtonText}>Escanear nota fiscal</Text>
          </TouchableOpacity>
        </View>

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
          {dadosFiltrados.map((item, index) => (
            <View key={item.id}>
              <View style={styles.itemRow}>
                <View style={[styles.statusBar, { backgroundColor: statusColors[item.status] || colors.textMuted }]} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemMaterial}>{item.material}</Text>
                  <Text style={styles.itemDetail}>{item.minAviso == null ? 'Mínimo não definido' : `Avisar com ${item.minAviso} ${item.unidade} ou menos`}</Text>
                  {item.nf && <Text style={styles.itemDetail}>Última entrada: {item.ultimaEntradaData} · {item.ultimaEntradaQtd} ({item.nf})</Text>}
                  {item.ultimoValorUnitario != null && <Text style={styles.itemDetail}>Última compra: {moeda(item.ultimoValorUnitario)} / {item.unidade} · total {moeda(item.ultimaEntradaValorTotal)}</Text>}
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemQtd}>{item.qtdAtual}<Text style={styles.itemUnidade}> {item.unidade}</Text></Text>
                  {item.status !== 'semDados' && <View style={[styles.reposicaoBadge, { borderColor: statusColors[item.status] }]}>
                    <Text style={[styles.reposicaoBadgeText, { color: statusColors[item.status] }]}>{item.status === 'critico' ? 'Baixo' : 'OK'}</Text>
                  </View>}
                </View>
              </View>
              {index < dadosFiltrados.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
          {dadosFiltrados.length === 0 && <Text style={styles.emptyText}>Nenhum material nesse filtro.</Text>}
        </View>
      </ScrollView>
      <EscanearNotaModal visible={showScanModal} onClose={() => setShowScanModal(false)} onSuccess={importarNota} />
    </View>
  );
}
