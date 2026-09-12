import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Camera, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { lerNotaFiscal } from '../services/notaFiscalService';
import { interpretarNumero } from '../services/notaFiscalParser';
import { styles } from './EscanearNotaModal.styles';

const novoItem = () => ({ id: `${Date.now()}-${Math.random()}`, material: '', quantidade: '', unidade: 'un', valorUnitario: '' });

export default function EscanearNotaModal({ visible, onClose, onSuccess }) {
  const [asset, setAsset] = useState(null);
  const [chaveApi, setChaveApi] = useState('');
  const [etapa, setEtapa] = useState('foto');
  const [textoOcr, setTextoOcr] = useState('');
  const [itens, setItens] = useState([]);
  const [identificador, setIdentificador] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  function limparEFechar() {
    setAsset(null);
    setChaveApi('');
    setEtapa('foto');
    setTextoOcr('');
    setItens([]);
    setIdentificador('');
    setErro('');
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
      setItens(resultado.itens);
      setEtapa('conferencia');
    } catch (error) {
      setErro(error.message || 'Falha ao ler a nota.');
    } finally {
      setLoading(false);
    }
  }

  function editarItem(id, campo, valor) {
    setItens((anteriores) => anteriores.map((item) => item.id === id ? { ...item, [campo]: valor } : item));
  }

  async function importar() {
    if (!identificador.trim()) return setErro('Informe o número ou identificador da nota para evitar duplicidade.');
    if (itens.length === 0) return setErro('Adicione pelo menos um material.');
    const itensValidados = itens.map((item) => ({
      material: item.material.trim(),
      unidade: item.unidade.trim().toLowerCase(),
      quantidade: interpretarNumero(item.quantidade),
      valorUnitario: interpretarNumero(item.valorUnitario),
    }));
    if (itensValidados.some((item) => !item.material || !item.unidade ||
        !Number.isFinite(item.quantidade) || item.quantidade <= 0 ||
        !Number.isFinite(item.valorUnitario) || item.valorUnitario < 0)) {
      return setErro('Confira nome, unidade, quantidade e valor unitário de todos os materiais.');
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
              <Text style={styles.notice}>O OCR pode confundir nomes e números. Corrija cada item antes de importar. Os dados ficam neste dispositivo até existir um backend.</Text>
              <Text style={styles.label}>Número/identificador da nota</Text>
              <TextInput style={styles.input} value={identificador} onChangeText={setIdentificador} placeholder="Ex.: NF 1234" placeholderTextColor={colors.textMuted} maxLength={80} />
              <Text style={styles.sectionTitle}>Materiais ({itens.length})</Text>
              {itens.map((item, index) => <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}><Text style={styles.itemTitle}>Item {index + 1}</Text><TouchableOpacity onPress={() => setItens((anteriores) => anteriores.filter((atual) => atual.id !== item.id))}><Text style={styles.removeText}>Remover</Text></TouchableOpacity></View>
                <Text style={styles.label}>Material</Text>
                <TextInput style={styles.input} value={item.material} onChangeText={(v) => editarItem(item.id, 'material', v)} placeholder="Nome do material" placeholderTextColor={colors.textMuted} />
                <View style={styles.fieldRow}>
                  <View style={styles.field}><Text style={styles.label}>Quantidade</Text><TextInput style={styles.input} value={item.quantidade} onChangeText={(v) => editarItem(item.id, 'quantidade', v)} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.textMuted} /></View>
                  <View style={styles.field}><Text style={styles.label}>Unidade</Text><TextInput style={styles.input} value={item.unidade} onChangeText={(v) => editarItem(item.id, 'unidade', v)} placeholder="un" placeholderTextColor={colors.textMuted} autoCapitalize="none" /></View>
                  <View style={styles.field}><Text style={styles.label}>R$ / un.</Text><TextInput style={styles.input} value={item.valorUnitario} onChangeText={(v) => editarItem(item.id, 'valorUnitario', v)} keyboardType="decimal-pad" placeholder="0,00" placeholderTextColor={colors.textMuted} /></View>
                </View>
              </View>)}
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
