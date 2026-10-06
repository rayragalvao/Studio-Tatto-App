import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../components/Header';
import { ESTOQUE_INICIAL } from '../../data/estoqueInicial';
import { colors } from '../../theme/colors';
import { styles } from './FinalizarAgendamentoScreen.styles';

const formasPagamento = ['Pix', 'Crédito', 'Débito', 'Dinheiro'];

export default function FinalizarAgendamentoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const agendamento = route.params?.agendamento;
  const [materiais, setMateriais] = useState([{ materialId: '', quantidade: '' }]);
  const [materialAberto, setMaterialAberto] = useState(null);
  const [duracao, setDuracao] = useState(agendamento?.duracao || '');
  const [pagamento, setPagamento] = useState('');

  const atualizarQuantidade = (index, quantidade) => {
    setMateriais((atuais) => atuais.map((material, itemIndex) => (
      itemIndex === index ? { ...material, quantidade } : material
    )));
  };

  const selecionarMaterial = (index, materialId) => {
    setMateriais((atuais) => atuais.map((material, itemIndex) => (
      itemIndex === index ? { ...material, materialId } : material
    )));
    setMaterialAberto(null);
  };

  const adicionarMaterial = () => setMateriais((atuais) => [...atuais, { materialId: '', quantidade: '' }]);

  const removerMaterial = (index) => {
    setMateriais((atuais) => atuais.length === 1
      ? [{ materialId: '', quantidade: '' }]
      : atuais.filter((_, itemIndex) => itemIndex !== index));
    setMaterialAberto(null);
  };

  const finalizar = () => {
    const materiaisValidos = materiais.filter((material) => (
      material.materialId && Number(material.quantidade.replace(',', '.')) > 0
    ));
    if (materiaisValidos.length !== materiais.length || !duracao.trim() || !pagamento) {
      Alert.alert('Campos obrigatórios', 'Preencha os materiais usados, a duração e a forma de pagamento.');
      return;
    }

    navigation.navigate('Agendamentos', { concludedId: agendamento.id });
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
          <Text style={styles.backText}>Voltar para agendamentos</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Concluir sessão</Text>
        <Text style={styles.subtitle}>{agendamento?.nome} · {agendamento?.estilo}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materiais usados</Text>
          {materiais.map((material, index) => {
            const materialSelecionado = ESTOQUE_INICIAL.find((item) => item.id === material.materialId);
            const listaAberta = materialAberto === index;

            return (
            <View key={`material-${index}`} style={styles.materialGroup}>
              <View style={styles.materialRow}>
                <TouchableOpacity
                  style={styles.materialSelect}
                  onPress={() => setMaterialAberto(listaAberta ? null : index)}
                  accessibilityRole="button"
                  accessibilityLabel="Selecionar material do estoque"
                >
                  <Text style={materialSelecionado ? styles.selectText : styles.selectPlaceholder}>
                    {materialSelecionado?.material || 'Selecionar material'}
                  </Text>
                  <Ionicons name={listaAberta ? 'chevron-up' : 'chevron-down'} size={17} color={colors.textMuted} />
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={material.quantidade}
                  onChangeText={(valor) => atualizarQuantidade(index, valor)}
                  placeholder="Qtd."
                  placeholderTextColor={colors.textPlaceholder}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removerMaterial(index)}
                  accessibilityRole="button"
                  accessibilityLabel="Remover material"
                >
                  <Ionicons name="trash-outline" size={17} color={colors.danger} />
                </TouchableOpacity>
              </View>
              {materialSelecionado && <Text style={styles.unitText}>Unidade: {materialSelecionado.unidade}</Text>}
              {listaAberta && (
                <ScrollView nestedScrollEnabled style={styles.dropdownList}>
                  {ESTOQUE_INICIAL.map((opcao) => (
                    <TouchableOpacity
                      key={opcao.id}
                      style={styles.dropdownOption}
                      onPress={() => selecionarMaterial(index, opcao.id)}
                    >
                      <Text style={styles.dropdownOptionText}>{opcao.material}</Text>
                      <Text style={styles.dropdownOptionUnit}>{opcao.qtdAtual} {opcao.unidade} disponíveis</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
            );
          })}
          <TouchableOpacity style={styles.addButton} onPress={adicionarMaterial}>
            <Ionicons name="add" size={17} color={colors.text} />
            <Text style={styles.addButtonText}>Adicionar material</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duração da sessão</Text>
          <TextInput
            style={styles.input}
            value={duracao}
            onChangeText={setDuracao}
            placeholder="Ex.: 3h30"
            placeholderTextColor={colors.textPlaceholder}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forma de pagamento</Text>
          <View style={styles.paymentGrid}>
            {formasPagamento.map((forma) => {
              const selecionada = forma === pagamento;
              return (
                <TouchableOpacity
                  key={forma}
                  style={[styles.paymentOption, selecionada && styles.paymentOptionActive]}
                  onPress={() => setPagamento(forma)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selecionada }}
                >
                  <Text style={[styles.paymentText, selecionada && styles.paymentTextActive]}>{forma}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={finalizar}>
          <Ionicons name="checkmark-done" size={18} color="#fff" />
          <Text style={styles.submitText}>Salvar e concluir sessão</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
