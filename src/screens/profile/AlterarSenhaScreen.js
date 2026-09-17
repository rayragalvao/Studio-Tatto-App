import React from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { colors } from '../../theme/colors';
import { styles } from './AlterarSenhaScreen.styles';

const campos = [
  { rotulo: 'SENHA ATUAL', dica: 'Digite a senha atual' },
  { rotulo: 'NOVA SENHA', dica: 'Digite a nova senha' },
  { rotulo: 'CONFIRMAR NOVA SENHA', dica: 'Repita a nova senha' },
];

export default function AlterarSenhaScreen() {
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
                secureTextEntry
                editable={false}
                accessibilityState={{ disabled: true }}
              />
            </View>
          ))}
          <View style={styles.botaoDesabilitado} accessibilityState={{ disabled: true }}>
            <Text style={styles.textoBotao}>Salvar nova senha</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
