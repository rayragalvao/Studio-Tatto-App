import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Package, X } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { interpretarNumero } from '../services/notaFiscalParser';
import { styles } from './MaterialModal.styles';

const UNIDADES = ['unidades', 'ml', 'litros', 'g', 'kg', 'rolos', 'folhas', 'caixas', 'pacotes'];

const paraTexto = (valor) => (valor == null ? '' : String(valor).replace('.', ','));

/**
 * Cadastro/edição de material.
 * `material` = null cria um novo; caso contrário edita.
 * `onSalvar({ nome, quantidade, unidadeMedida, minAviso })` deve lançar erro para manter o modal aberto.
 */
export default function MaterialFormModal({ visible, material, onClose, onSalvar }) {
  const editando = Boolean(material);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('unidades');
  const [minAviso, setMinAviso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!visible) return;
    setNome(material?.material ?? '');
    setQuantidade(material ? paraTexto(material.qtdAtual) : '');
    setUnidade(material?.unidade ?? 'unidades');
    setMinAviso(paraTexto(material?.minAviso));
    setErro('');
    setSalvando(false);
  }, [visible, material]);

  function fechar() {
    if (!salvando) onClose();
  }

  async function salvar() {
    const nomeLimpo = nome.trim();
    const unidadeLimpa = unidade.trim();
    const qtd = interpretarNumero(quantidade);
    const minimo = minAviso.trim() ? interpretarNumero(minAviso) : null;
    if (!nomeLimpo) return setErro('Informe o nome do material.');
    if (!Number.isFinite(qtd) || qtd < 0) return setErro('Informe uma quantidade válida (0 ou mais).');
    if (!unidadeLimpa) return setErro('Informe a unidade de medida.');
    if (unidadeLimpa.length > 50) return setErro('A unidade deve ter no máximo 50 caracteres.');
    if (minimo != null && (!Number.isFinite(minimo) || minimo < 0)) return setErro('O mínimo de aviso deve ser um número (0 ou mais) ou ficar vazio.');

    setSalvando(true);
    setErro('');
    try {
      await onSalvar({ nome: nomeLimpo, quantidade: qtd, unidadeMedida: unidadeLimpa, minAviso: minimo });
      setSalvando(false);
      onClose();
    } catch (falha) {
      setSalvando(false);
      setErro(falha?.message || 'Não foi possível salvar o material.');
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={fechar}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalBox}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}><Package size={18} color="#00D3F2" /></View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>{editando ? 'Editar material' : 'Novo material'}</Text>
                <Text style={styles.headerSubtitle}>{editando ? material.material : 'Cadastrar no estoque do estúdio'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={fechar} disabled={salvando} accessibilityLabel="Fechar" hitSlop={10}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <Text style={styles.label}>Nome</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex.: Tinta preta" placeholderTextColor={colors.textMuted} maxLength={255} />

            <Text style={styles.label}>Quantidade atual</Text>
            <TextInput style={styles.input} value={quantidade} onChangeText={setQuantidade} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.textMuted} />

            <Text style={styles.label}>Unidade de medida</Text>
            <View style={styles.chipRow}>
              {UNIDADES.map((opcao) => {
                const ativo = unidade === opcao;
                return (
                  <TouchableOpacity key={opcao} style={[styles.chip, ativo && styles.chipAtivo]} onPress={() => setUnidade(opcao)}>
                    <Text style={[styles.chipText, ativo && styles.chipTextAtivo]}>{opcao}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TextInput style={styles.input} value={unidade} onChangeText={setUnidade} placeholder="ou digite outra unidade" placeholderTextColor={colors.textMuted} autoCapitalize="none" maxLength={50} />

            <Text style={styles.label}>Avisar quando chegar a (opcional)</Text>
            <TextInput style={styles.input} value={minAviso} onChangeText={setMinAviso} keyboardType="decimal-pad" placeholder="Sem mínimo definido" placeholderTextColor={colors.textMuted} />

            {!!erro && <Text style={styles.errorText}>{erro}</Text>}
            <TouchableOpacity style={[styles.startButton, salvando && styles.startButtonDisabled]} onPress={salvar} disabled={salvando}>
              {salvando ? <ActivityIndicator color="#00D3F2" /> : <Text style={styles.startButtonText}>{editando ? 'Salvar alterações' : 'Cadastrar material'}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
