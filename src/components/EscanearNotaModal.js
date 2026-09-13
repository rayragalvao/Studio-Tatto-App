import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { lerNotaFiscal } from '../services/notaFiscalService';
import { interpretarNumero } from '../services/notaFiscalParser';
import { ESTOQUE_INICIAL } from '../data/estoqueInicial';
import { eEmbalagem, encontrarMaterialEstoque, fatorConversao } from '../services/estoqueModel';
import { styles } from './EscanearNotaModal.styles';

const novoItem = () => ({ id: `${Date.now()}-${Math.random()}`, material: '', materialEstoqueId: null, quantidade: '', unidade: 'un', valorUnitario: '', conteudoPorEmbalagem: '' });
const formatarMoeda = (valor) => `R$ ${valor.toFixed(2).replace('.', ',')}`;

export default function EscanearNotaModal({ visible, onClose, onSuccess }) {
  const [asset, setAsset] = useState(null);
  const [chaveApi, setChaveApi] = useState('');
  const [etapa, setEtapa] = useState('foto');
  const [textoOcr, setTextoOcr] = useState('');
  const [itens, setItens] = useState([]);
  const [sugestoesEncontradas, setSugestoesEncontradas] = useState(0);
  const [identificador, setIdentificador] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [selecionandoId, setSelecionandoId] = useState(null);

  function limparEFechar() {
    setAsset(null);
    setChaveApi('');
    setEtapa('foto');
    setTextoOcr('');
    setItens([]);
    setSugestoesEncontradas(0);
    setIdentificador('');
    setErro('');
    setSelecionandoId(null);
    onClose();
  }

  function fechar() {
    if (!loading) limparEFechar();
  }

  async function selecionar(origem) {
    try {
      if (origem === 'camera') {
        const permissao = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissao.granted) throw new Error('Permita o uso da câmera para fotografar a nota.');
      }
      const resultado = origem === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (!resultado.canceled && resultado.assets?.[0]) {
        setAsset(resultado.assets[0]);
        setErro('');
      }
    } catch (error) {
      setErro(error.message || 'Não foi possível abrir a imagem.');
    }
  }

  async function ler() {
    if (!asset) return setErro('Fotografe ou escolha uma imagem da nota.');
    if (!chaveApi.trim()) return setErro('Informe sua chave gratuita da OCR.space.');
    setLoading(true);
    setErro('');
    try {
      const resultado = await lerNotaFiscal(asset, chaveApi);
      setTextoOcr(resultado.texto);
      setSugestoesEncontradas(resultado.itens.length);
      setItens(resultado.itens.map((item) => ({
        ...item,
        materialEstoqueId: encontrarMaterialEstoque(item.material)?.id || null,
        conteudoPorEmbalagem: '',
      })));
      setEtapa('conferencia');
    } catch (error) {
      setErro(error.message || 'Falha ao ler a nota.');
    } finally {
      setLoading(false);
    }
  }

  function editarItem(id, campo, valor) {
    setItens((anteriores) => anteriores.map((item) => {
      if (item.id !== id) return item;
      const atualizado = { ...item, [campo]: valor };
      if (campo === 'material') {
        atualizado.materialEstoqueId = encontrarMaterialEstoque(valor)?.id || null;
        if (atualizado.materialEstoqueId !== item.materialEstoqueId) atualizado.conteudoPorEmbalagem = '';
      }
      if (campo === 'materialEstoqueId' || campo === 'unidade') atualizado.conteudoPorEmbalagem = '';
      return atualizado;
    }));
  }

  async function importar() {
    if (!identificador.trim()) return setErro('Informe o número ou identificador da nota para evitar duplicidade.');
    if (itens.length === 0) return setErro('Adicione pelo menos um material.');
    const itensValidados = itens.map((item) => ({
      material: item.material.trim(),
      materialEstoqueId: item.materialEstoqueId,
      unidade: item.unidade.trim().toLowerCase(),
      quantidade: interpretarNumero(item.quantidade),
      valorUnitario: interpretarNumero(item.valorUnitario),
      conteudoPorEmbalagem: item.conteudoPorEmbalagem,
    }));
    if (itensValidados.some((item) => !item.material || !item.unidade ||
        !Number.isFinite(item.quantidade) || item.quantidade <= 0 ||
        !Number.isFinite(item.valorUnitario) || item.valorUnitario < 0)) {
      return setErro('Confira nome, unidade, quantidade e valor unitário de todos os materiais.');
    }
    if (itensValidados.some((item) => !item.materialEstoqueId)) {
      return setErro('Vincule cada item da nota a um material cadastrado ou remova o item que não pertence ao estoque.');
    }
    setLoading(true);
    setErro('');
    try {
      await onSuccess({ identificador, itens: itensValidados });
      setLoading(false);
      limparEFechar();
    } catch (error) {
      setErro(error.message || 'Não foi possível salvar a entrada.');
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={fechar}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalBox}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}><Camera size={18} color="#00D3F2" /></View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Escanear nota fiscal</Text>
                <Text style={styles.headerSubtitle}>{etapa === 'foto' ? '1. Ler imagem' : '2. Conferir materiais'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={fechar} disabled={loading} accessibilityLabel="Fechar leitura da nota" hitSlop={10}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            {etapa === 'foto' ? <>
              <View style={styles.uploadArea}>
                {asset ? <Image source={{ uri: asset.uri }} style={styles.previewImage} resizeMode="contain" /> : <>
                  <Camera size={28} color={colors.textMuted} />
                  <Text style={styles.uploadTitle}>Imagem da nota fiscal</Text>
                  <Text style={styles.uploadSubtitle}>Fotografe a tabela de produtos com boa luz e sem cortes.</Text>
                </>}
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => selecionar('camera')} disabled={loading}><Text style={styles.secondaryText}>Tirar foto</Text></TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => selecionar('galeria')} disabled={loading}><Text style={styles.secondaryText}>Galeria</Text></TouchableOpacity>
              </View>
              <Text style={styles.label}>Chave da OCR.space</Text>
              <TextInput style={styles.input} value={chaveApi} onChangeText={setChaveApi} placeholder="Cole sua chave gratuita" placeholderTextColor={colors.textMuted} autoCapitalize="none" autoCorrect={false} secureTextEntry />
              <TouchableOpacity onPress={() => Linking.openURL('https://ocr.space/ocrapi/freekey')}><Text style={styles.link}>Obter chave gratuita</Text></TouchableOpacity>
              <Text style={styles.notice}>A imagem será enviada à OCR.space para leitura. Revise os dados antes de incluí-los no estoque. A chave não é salva no aplicativo.</Text>
            </> : <>
              <Text style={styles.notice}>Confira os dados e o material do estoque correspondente. Itens não cadastrados devem ser removidos; nenhuma linha cria material novo. Os dados ficam neste dispositivo.</Text>
              <Text style={styles.notice}>A leitura sugeriu {sugestoesEncontradas} {sugestoesEncontradas === 1 ? 'produto' : 'produtos'}. Compare com todas as linhas da nota. Se faltou algum, adicione-o manualmente ou fotografe somente a tabela de produtos, mais de perto.</Text>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => { setEtapa('foto'); setErro(''); }}><Text style={styles.secondaryText}>Refazer foto da tabela</Text></TouchableOpacity>
              <Text style={styles.label}>Número/identificador da nota</Text>
              <TextInput style={styles.input} value={identificador} onChangeText={setIdentificador} placeholder="Ex.: NF 1234" placeholderTextColor={colors.textMuted} maxLength={80} />
              <Text style={styles.sectionTitle}>Materiais ({itens.length})</Text>
              {itens.map((item, index) => {
                const cadastrado = ESTOQUE_INICIAL.find((material) => material.id === item.materialEstoqueId);
                const embalagem = eEmbalagem(item.unidade);
                const fator = cadastrado ? fatorConversao(item.unidade, cadastrado.unidade, item.conteudoPorEmbalagem) : null;
                const quantidadeNota = interpretarNumero(item.quantidade);
                const precoNota = interpretarNumero(item.valorUnitario);
                const quantidadeConvertida = quantidadeNota * fator;
                const totalNota = quantidadeNota * precoNota;
                return <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}><Text style={styles.itemTitle}>Item {index + 1}</Text><TouchableOpacity onPress={() => setItens((anteriores) => anteriores.filter((atual) => atual.id !== item.id))}><Text style={styles.removeText}>Remover</Text></TouchableOpacity></View>
                <Text style={styles.label}>Descrição na nota</Text>
                <TextInput style={styles.input} value={item.material} onChangeText={(v) => editarItem(item.id, 'material', v)} placeholder="Nome do material" placeholderTextColor={colors.textMuted} />
                <Text style={styles.label}>Adicionar ao material cadastrado</Text>
                <TouchableOpacity style={styles.targetButton} onPress={() => setSelecionandoId(selecionandoId === item.id ? null : item.id)}>
                  <Text style={cadastrado ? styles.targetText : styles.targetMissing}>{cadastrado ? `${cadastrado.material} · ${cadastrado.unidade}` : 'Selecionar material do estoque'}</Text>
                </TouchableOpacity>
                {selecionandoId === item.id && <ScrollView nestedScrollEnabled style={styles.targetList}>
                  {ESTOQUE_INICIAL.map((material) => <TouchableOpacity key={material.id} style={styles.targetOption} onPress={() => { editarItem(item.id, 'materialEstoqueId', material.id); setSelecionandoId(null); }}>
                    <Text style={styles.targetText}>{material.material} · {material.unidade}</Text>
                  </TouchableOpacity>)}
                </ScrollView>}
                <View style={styles.fieldRow}>
                  <View style={styles.field}><Text style={styles.label}>Qtd. na nota</Text><TextInput style={styles.input} value={item.quantidade} onChangeText={(v) => editarItem(item.id, 'quantidade', v)} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.textMuted} /></View>
                  <View style={styles.field}><Text style={styles.label}>Unid. na nota</Text><TextInput style={styles.input} value={item.unidade} onChangeText={(v) => editarItem(item.id, 'unidade', v)} placeholder="cx" placeholderTextColor={colors.textMuted} autoCapitalize="none" /></View>
                  <View style={styles.field}><Text style={styles.label}>{embalagem ? `R$ por ${item.unidade.toUpperCase()}` : 'Preço/unid. NF'}</Text><TextInput style={styles.input} value={item.valorUnitario} onChangeText={(v) => editarItem(item.id, 'valorUnitario', v)} keyboardType="decimal-pad" placeholder="0,00" placeholderTextColor={colors.textMuted} /></View>
                </View>
                {cadastrado && embalagem && <>
                  <Text style={styles.label}>Quantas {cadastrado.unidade} há em cada {item.unidade}?</Text>
                  <TextInput style={styles.input} value={item.conteudoPorEmbalagem} onChangeText={(v) => editarItem(item.id, 'conteudoPorEmbalagem', v)} keyboardType="decimal-pad" placeholder={`Ex.: 50 ${cadastrado.unidade}`} placeholderTextColor={colors.textMuted} />
                  <Text style={styles.notice}>Mantenha a quantidade e o preço na unidade da nota. Confira o conteúdo na embalagem; o preço não será multiplicado pelas peças internas.</Text>
                </>}
                {cadastrado && fator == null && <Text style={styles.errorText}>{embalagem ? `Informe o conteúdo de cada ${item.unidade} em ${cadastrado.unidade}.` : `Unidade incompatível com ${cadastrado.unidade}. Confira a unidade da nota.`}</Text>}
                {cadastrado && fator != null && fator !== 1 && Number.isFinite(quantidadeConvertida) && <Text style={styles.notice}>Entrada no estoque: {Number(quantidadeConvertida.toFixed(4))} {cadastrado.unidade}.</Text>}
                {Number.isFinite(totalNota) && <Text style={styles.totalText}>Total desta linha na nota: {formatarMoeda(totalNota)}</Text>}
              </View>})}
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setItens((anteriores) => [...anteriores, novoItem()])}><Text style={styles.secondaryText}>+ Adicionar material</Text></TouchableOpacity>
              <Text style={styles.label}>Texto extraído para conferência</Text>
              <Text selectable style={styles.ocrText}>{textoOcr}</Text>
            </>}

            {!!erro && <Text style={styles.errorText}>{erro}</Text>}
            <TouchableOpacity style={[styles.startButton, loading && styles.startButtonDisabled]} onPress={etapa === 'foto' ? ler : importar} disabled={loading}>
              {loading ? <ActivityIndicator color="#00D3F2" /> : <Text style={styles.startButtonText}>{etapa === 'foto' ? 'Ler nota' : 'Confirmar entrada no estoque'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
