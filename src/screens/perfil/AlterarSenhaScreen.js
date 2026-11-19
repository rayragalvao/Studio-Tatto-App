import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { styles } from './AlterarSenhaScreen.styles';

export default function AlterarSenhaScreen({ navigation }) {
  const [senhaAtual, definirSenhaAtual] = useState('');
  const [novaSenha, definirNovaSenha] = useState('');
  const [confirmacao, definirConfirmacao] = useState('');
  const [salvando, definirSalvando] = useState(false);
  const [erro, definirErro] = useState('');
  const { alterarSenha, sair } = useAuth();

  const campos = [
    { rotulo: 'SENHA ATUAL', dica: 'Digite a senha atual', valor: senhaAtual, alterar: definirSenhaAtual },
    { rotulo: 'NOVA SENHA', dica: 'Digite a nova senha', valor: novaSenha, alterar: definirNovaSenha },
    { rotulo: 'CONFIRMAR NOVA SENHA', dica: 'Repita a nova senha', valor: confirmacao, alterar: definirConfirmacao },
  ];
  const desabilitado = salvando || !senhaAtual || !novaSenha || !confirmacao;

  const salvar = async () => {
    if (novaSenha !== confirmacao) {
      definirErro('A confirmação da nova senha não confere.');
      return;
    }
    try {
      definirSalvando(true);
      definirErro('');
      await alterarSenha({ senhaAtual, novaSenha, confirmarNovaSenha: confirmacao });
      Alert.alert('Senha alterada', 'Sua nova senha foi salva com sucesso.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (falha) {
      if (falha.status === 401) {
        await sair();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }
      definirErro(falha.message || 'Não foi possível alterar a senha.');
    } finally {
      definirSalvando(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bordaCabecalho}>
        <Header showNotifications={false} showAvatar={false} />
      </View>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.titulo}>Alterar senha</Text>
        <Text style={styles.subtitulo}>Segurança da conta</Text>

        <View style={styles.cartao}>
          {campos.map((campo) => (
            <View key={campo.rotulo} style={styles.campo}>
              <Text style={styles.rotulo}>{campo.rotulo}</Text>
              <TextInput
                style={styles.entrada}
                placeholder={campo.dica}
                placeholderTextColor={colors.textPlaceholder}
                value={campo.valor}
                onChangeText={campo.alterar}
                secureTextEntry
                editable={!salvando}
                autoCapitalize="none"
              />
            </View>
          ))}
          {!!erro && <Text style={styles.erro}>{erro}</Text>}
          <TouchableOpacity
            style={[styles.botao, desabilitado && styles.botaoDesabilitado]}
            disabled={desabilitado}
            onPress={salvar}
            accessibilityRole="button"
          >
            {salvando
              ? <ActivityIndicator color={colors.text} />
              : <Text style={styles.textoBotao}>Salvar nova senha</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
