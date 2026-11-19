import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SlidersHorizontal, X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { interpretarNumero } from '../services/notaFiscalParser';
import { styles } from './MaterialModal.styles';

const MODOS = [
  { key: 'entrada', label: '+ Entrada' },
  { key: 'saida', label: '− Saída' },
  { key: 'definir', label: 'Definir total' },
];

const formatar = (valor) => String(Number(Number(valor).toFixed(4))).replace('.', ',');

export function calcularNovaQuantidade(atual, modo, valor) {
  if (!Number.isFinite(valor) || valor < 0) return NaN;
  if (modo === 'entrada') return Number((atual + valor).toFixed(4));
  if (modo === 'saida') return Number((atual - valor).toFixed(4));
  return Number(valor.toFixed(4));
}

/** Ajusta a quantidade de um material. `onSalvar(novaQuantidade)` envia o PATCH. */
export default function AjusteQuantidadeModal({ visible, material, onClose, onSalvar }) {
  const [modo, setModo] = useState('entrada');
  const [valor, setValor] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!visible) return;
    setModo('entrada');
    setValor('');
    setErro('');
    setSalvando(false);
  }, [visible, material]);

  if (!material) return null;

  const numero = interpretarNumero(valor);
  const nova = valor.trim() ? calcularNovaQuantidade(material.qtdAtual, modo, numero) : NaN;

  function fechar() {
    if (!salvando) onClose();
  }

  async function salvar() {
    if (!Number.isFinite(numero) || numero < 0 || (modo !== 'definir' && numero === 0)) {
      return setErro('Informe uma quantidade válida.');
    }
    if (!Number.isFinite(nova) || nova < 0) {
      return setErro(`A saída é maior que o saldo atual (${formatar(material.qtdAtual)} ${material.unidade}).`);
    }
    setSalvando(true);
    setErro('');
    try {
      await onSalvar(nova);
      setSalvando(false);
      onClose();
    } catch (falha) {
      setSalvando(false);
      setErro(falha?.message || 'Não foi possível ajustar a quantidade.');
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={fechar}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalBox}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}><SlidersHorizontal size={18} color="#00D3F2" /></View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Ajustar quantidade</Text>
                <Text style={styles.headerSubtitle}>{material.material}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={fechar} disabled={salvando} accessibilityLabel="Fechar" hitSlop={10}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <Text style={styles.atualText}>Saldo atual: {formatar(material.qtdAtual)} {material.unidade}</Text>
            <View style={styles.modoRow}>
              {MODOS.map((opcao) => {
                const ativo = modo === opcao.key;
                return (
                  <TouchableOpacity key={opcao.key} style={[styles.modoBotao, ativo && styles.modoBotaoAtivo]} onPress={() => { setModo(opcao.key); setErro(''); }}>
                    <Text style={[styles.modoTexto, ativo && styles.modoTextoAtivo]}>{opcao.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>{modo === 'definir' ? `Novo total (${material.unidade})` : `Quantidade (${material.unidade})`}</Text>
            <TextInput style={styles.input} value={valor} onChangeText={setValor} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.textMuted} autoFocus />

            {Number.isFinite(nova) && nova >= 0 && <Text style={styles.previewText}>Novo saldo: {formatar(nova)} {material.unidade}</Text>}

            {!!erro && <Text style={styles.errorText}>{erro}</Text>}
            <TouchableOpacity style={[styles.startButton, salvando && styles.startButtonDisabled]} onPress={salvar} disabled={salvando}>
              {salvando ? <ActivityIndicator color="#00D3F2" /> : <Text style={styles.startButtonText}>Confirmar ajuste</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
