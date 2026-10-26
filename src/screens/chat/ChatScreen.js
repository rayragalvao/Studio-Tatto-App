import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://192.168.18.70:8080'; // troca para o IP do backend

export default function ChatScreen() {
    const { token } = useAuth();
  const [mensagens, setMensagens] = useState([
    { id: '0', role: 'model', texto: 'Olá! Sou o assistente do Orcana. Como posso te ajudar?' },
  ]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const flatListRef = useRef(null);

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || carregando) return;

    const novaMensagem = { id: Date.now().toString(), role: 'user', texto };
    const novaLista = [...mensagens, novaMensagem];
    setMensagens(novaLista);
    setInput('');
    setCarregando(true);

    try {
      const historico = mensagens
        .filter(m => m.id !== '0')
        .map(m => ({ role: m.role, texto: m.texto }));

      const response = await fetch(`${API_URL}/chat/mensagem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mensagem: texto, historico }),
      });

      console.log('STATUS:', response.status); // adiciona
const text = await response.text();      // adiciona
console.log('BODY:', text);      

      const data = JSON.parse(text); 
      setMensagens(prev => [
        ...prev,
        { id: Date.now().toString() + '_r', role: 'model', texto: data.resposta },
      ]);
    } catch (err) {
        console.log('ERRO CHAT:', err.message, err);
      setMensagens(prev => [
        ...prev,
        { id: Date.now().toString() + '_err', role: 'model', texto: 'Erro ao conectar com o assistente.' },
      ]);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Assistente IA" showMenu={false} showNotifications={false} showAvatar={false} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={flatListRef}
          data={mensagens}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.lista}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[
              styles.bolha,
              item.role === 'user' ? styles.bolhaUser : styles.bolhaModel,
            ]}>
              <Text style={[
                styles.textoBolha,
                item.role === 'user' ? styles.textoUser : styles.textoModel,
              ]}>
                {item.texto}
              </Text>
            </View>
          )}
        />

        {carregando && (
          <View style={styles.digitando}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.textoDigitando}>digitando...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Pergunte algo..."
            placeholderTextColor={colors.textMuted}
            multiline
            onSubmitEditing={enviar}
          />
          <TouchableOpacity
            style={[styles.botaoEnviar, (!input.trim() || carregando) && styles.botaoDisabled]}
            onPress={enviar}
            disabled={!input.trim() || carregando}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  lista: { padding: 16, gap: 10 },
  bolha: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  bolhaUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bolhaModel: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface ?? '#1e1e1e',
    borderBottomLeftRadius: 4,
  },
  textoBolha: { fontSize: 14, lineHeight: 20 },
  textoUser: { color: '#fff' },
  textoModel: { color: colors.text },
  digitando: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  textoDigitando: { color: colors.textMuted, fontSize: 12 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border ?? '#333',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface ?? '#1e1e1e',
    color: colors.text,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  botaoEnviar: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 10,
  },
  botaoDisabled: { opacity: 0.4 },
});