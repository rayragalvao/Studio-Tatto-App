import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '../../components/Header';
import { apiRequest } from '../../services/api';
import { colors } from '../../theme/colors';
import { styles } from './FinalizarAgendamentoScreen.styles';

const formasPagamento = ['Pix', 'Crédito', 'Débito', 'Dinheiro'];

export default function FinalizarAgendamentoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const agendamento = route.params?.agendamento;
  const [estoque, setEstoque] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [erroFinalizacao, setErroFinalizacao] = useState('');
  const [tentativa, setTentativa] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [materiais, setMateriais] = useState([{ materialId: '', quantidade: '' }]);
  const [materialAberto, setMaterialAberto] = useState(null);
  const [duracao, setDuracao] = useState(
    agendamento?.tempoDuracao ? String(agendamento.tempoDuracao) : ''
  );
  const [pagamento, setPagamento] = useState('');
  const bloqueio = useRef(false);

  useEffect(() => {
    let ativo = true;

    async function carregarEstoque() {
      setCarregando(true);
      setErro('');
      try {
        const todos = [];
        let pagina = 0;
        while (true) {
          const resposta = await apiRequest(`/estoque?page=${pagina}&size=100&sort=id,asc`);
          if (!ativo) return;
          if (!resposta) break;
          if (!Array.isArray(resposta.content)) {
            throw new Error('Formato inesperado na resposta do estoque.');
          }
          todos.push(...resposta.content);
          pagina += 1;
          if (resposta.last || resposta.content.length === 0
              || pagina >= resposta.totalPages) break;
        }
        if (ativo) setEstoque(todos);
      } catch (e) {
        if (ativo) setErro(e.message || 'Não foi possível carregar o estoque.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarEstoque();
    return () => { ativo = false; };
  }, [tentativa]);

  const atualizarMaterial = (index, campo, valor) => {
    setErroFinalizacao('');
    setMateriais(atuais => atuais.map((item, i) =>
      i === index ? { ...item, [campo]: valor } : item
    ));
  };

  const removerMaterial = index => {
    setErroFinalizacao('');
    setMateriais(atuais => atuais.length === 1
      ? [{ materialId: '', quantidade: '' }]
      : atuais.filter((_, i) => i !== index));
    setMaterialAberto(null);
  };

  const finalizar = async () => {
    if (bloqueio.current) return;
    setErroFinalizacao('');

    if (!agendamento?.id) {
      setErroFinalizacao('Sessão não encontrada. Volte à lista e selecione um agendamento.');
      return;
    }

    if (carregando || erro || estoque.length === 0) {
      setErroFinalizacao('O estoque precisa estar carregado e ter materiais cadastrados.');
      return;
    }

    const minutos = Number(duracao.trim());
    if (!Number.isInteger(minutos) || minutos <= 0 || minutos > 2147483647) {
      setErroFinalizacao('Informe a duração em minutos inteiros. Exemplo: 90 para 1h30.');
      return;
    }

    if (!pagamento) {
      setErroFinalizacao('Selecione a forma de pagamento recebido.');
      return;
    }

    const totais = new Map();
    for (const item of materiais) {
      const quantidade = Number(item.quantidade.trim());
      if (!item.materialId || !Number.isInteger(quantidade)
          || quantidade <= 0 || quantidade > 2147483647) {
        setErroFinalizacao('Selecione todos os materiais e informe uma quantidade inteira positiva em cada linha.');
        return;
      }
      totais.set(item.materialId, (totais.get(item.materialId) || 0) + quantidade);
    }

    for (const [id, quantidade] of totais) {
      const material = estoque.find(item => item.id === id);
      if (quantidade > 2147483647 || !material
          || !Number.isFinite(material.quantidade)
          || quantidade > material.quantidade) {
        setErroFinalizacao(`Confira o estoque de ${material?.nome || 'material'}. Disponível: ${material?.quantidade ?? 0}.`);
        return;
      }
    }

    bloqueio.current = true;
    setSalvando(true);

    try {
      const resposta = await apiRequest(`/agendamento/${agendamento.id}/finalizar`, {
        method: 'POST',
        body: {
          tempoDuracao: minutos,
          pagamentoFeito: true,
          formaPagamento: pagamento,
          materiais: [...totais].map(([materialId, quantidade]) => ({
            materialId,
            quantidade,
          })),
        },
      });

      if (resposta?.status?.toUpperCase() !== 'CONCLUIDO') {
        throw new Error('O servidor não confirmou o status CONCLUIDO. Confira o agendamento no Swagger.');
      }

      navigation.goBack();
    } catch (e) {
      const mensagem = e.status
        ? `Status ${e.status}: ${e.message || 'Não foi possível concluir.'}`
        : e.message || 'Não foi possível concluir.';
      setErroFinalizacao(mensagem);
      console.error('Erro ao finalizar agendamento:', mensagem);
    } finally {
      bloqueio.current = false;
      setSalvando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} disabled={salvando}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color={colors.text} />
          <Text style={styles.backText}>Voltar para agendamentos</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Concluir sessão</Text>
        <Text style={styles.subtitle}>{agendamento?.nome} · {agendamento?.estilo}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materiais usados</Text>
          {carregando ? (
            <ActivityIndicator color={colors.info} />
          ) : erro ? (
            <View>
              <Text style={{ color: colors.danger }}>{erro}</Text>
              <TouchableOpacity onPress={() => setTentativa(valor => valor + 1)}>
                <Text style={styles.addButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          ) : estoque.length === 0 ? (
            <Text style={styles.unitText}>Cadastre materiais no estoque antes de concluir.</Text>
          ) : materiais.map((material, index) => {
            const selecionado = estoque.find(item => item.id === material.materialId);
            const aberto = materialAberto === index;

            return (
              <View key={index} style={styles.materialGroup}>
                <View style={styles.materialRow}>
                  <TouchableOpacity style={styles.materialSelect} disabled={salvando}
                    onPress={() => setMaterialAberto(aberto ? null : index)}>
                    <Text style={selecionado ? styles.selectText : styles.selectPlaceholder}>
                      {selecionado?.nome || 'Selecionar material'}
                    </Text>
                    <Ionicons name={aberto ? 'chevron-up' : 'chevron-down'}
                      size={17} color={colors.textMuted} />
                  </TouchableOpacity>

                  <TextInput style={styles.quantityInput} value={material.quantidade}
                    onChangeText={valor => atualizarMaterial(index, 'quantidade', valor)}
                    placeholder="Qtd." placeholderTextColor={colors.textPlaceholder}
                    keyboardType="number-pad" editable={!salvando} />

                  <TouchableOpacity style={styles.removeButton} disabled={salvando}
                    onPress={() => removerMaterial(index)}
                    accessibilityLabel="Remover material">
                    <Ionicons name="trash-outline" size={17} color={colors.danger} />
                  </TouchableOpacity>
                </View>

                {selecionado && (
                  <Text style={styles.unitText}>
                    Unidade: {selecionado.unidadeMedida} · Disponível: {selecionado.quantidade}
                  </Text>
                )}

                {aberto && (
                  <ScrollView nestedScrollEnabled style={styles.dropdownList}>
                    {estoque.map(opcao => (
                      <TouchableOpacity key={opcao.id} style={styles.dropdownOption}
                        disabled={salvando || !(opcao.quantidade > 0)}
                        onPress={() => {
                          atualizarMaterial(index, 'materialId', opcao.id);
                          setMaterialAberto(null);
                        }}>
                        <Text style={styles.dropdownOptionText}>{opcao.nome}</Text>
                        <Text style={styles.dropdownOptionUnit}>
                          {opcao.quantidade} {opcao.unidadeMedida} disponíveis
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            );
          })}

          <TouchableOpacity style={styles.addButton}
            disabled={salvando || carregando || !!erro || estoque.length === 0}
            onPress={() => {
              setErroFinalizacao('');
              setMateriais(atuais => [...atuais, { materialId: '', quantidade: '' }]);
            }}>
            <Ionicons name="add" size={17} color={colors.text} />
            <Text style={styles.addButtonText}>Adicionar material</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Duração da sessão em minutos</Text>
          <TextInput style={styles.input} value={duracao}
            onChangeText={valor => {
              setDuracao(valor);
              setErroFinalizacao('');
            }}
            placeholder="Ex.: 90" placeholderTextColor={colors.textPlaceholder}
            keyboardType="number-pad" editable={!salvando} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pagamento recebido</Text>
          <View style={styles.paymentGrid}>
            {formasPagamento.map(forma => (
              <TouchableOpacity key={forma} disabled={salvando}
                style={[styles.paymentOption, forma === pagamento && styles.paymentOptionActive]}
                accessibilityRole="radio"
                accessibilityState={{ selected: forma === pagamento }}
                onPress={() => {
                  setPagamento(forma);
                  setErroFinalizacao('');
                }}>
                <Text style={[styles.paymentText, forma === pagamento && styles.paymentTextActive]}>
                  {forma}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {erroFinalizacao ? (
          <Text accessibilityRole="alert" style={{ color: colors.danger, marginBottom: 12 }}>
            {erroFinalizacao}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[styles.submitButton, salvando && { opacity: 0.5 }]}
          disabled={salvando}
          onPress={finalizar}>
          {salvando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="checkmark-done" size={18} color="#fff" />
          )}
          <Text style={styles.submitText}>
            {salvando ? 'Salvando...' : 'Salvar e concluir sessão'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
