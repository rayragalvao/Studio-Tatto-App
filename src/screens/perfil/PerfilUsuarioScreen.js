import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Header from '../../components/Header';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { styles } from './PerfilUsuarioScreen.styles';

function CampoConta({ icone, rotulo, valor }) {
  return (
    <View style={styles.campo}>
      <View style={styles.iconeCampo}>
        <Ionicons name={icone} size={18} color={colors.textMuted} />
      </View>
      <View style={styles.textosCampo}>
        <Text style={styles.rotuloCampo}>{rotulo}</Text>
        <Text style={styles.valorCampo} selectable>{valor}</Text>
      </View>
    </View>
  );
}

function OpcaoPerfil({ icone, titulo, descricao, aoPressionar, desabilitada }) {
  return (
    <TouchableOpacity
      style={styles.opcao}
      onPress={aoPressionar}
      disabled={desabilitada}
      accessibilityRole="button"
      accessibilityLabel={titulo}
    >
      <View style={styles.iconeCampo}>
        <Ionicons name={icone} size={18} color={colors.textMuted} />
      </View>
      <View style={styles.textosCampo}>
        <Text style={styles.tituloOpcao}>{titulo}</Text>
        <Text style={styles.descricaoOpcao}>{descricao}</Text>
      </View>
      <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function PerfilUsuarioScreen({ navigation }) {
  const { email, nome, fotoPerfil, salvarFotoPerfil, removerFotoPerfil, sair } = useAuth();
  const [salvandoFoto, definirSalvandoFoto] = useState(false);

  const escolherFoto = async () => {
    if (!email.trim()) {
      Alert.alert('E-mail necessário', 'Entre com um e-mail para salvar a foto neste dispositivo.');
      return;
    }

    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.35,
        base64: true,
      });

      if (resultado.canceled) return;
      const imagem = resultado.assets?.[0]?.base64;
      if (!imagem) throw new Error('Imagem sem dados');
      if (imagem.length > 1800000) {
        Alert.alert('Imagem muito grande', 'Escolha uma imagem menor para usar como foto de perfil.');
        return;
      }

      definirSalvandoFoto(true);
      await salvarFotoPerfil(`data:image/jpeg;base64,${imagem}`);
    } catch {
      Alert.alert('Não foi possível alterar a foto', 'Tente escolher outra imagem.');
    } finally {
      definirSalvandoFoto(false);
    }
  };

  const removerFoto = async () => {
    try {
      definirSalvandoFoto(true);
      await removerFotoPerfil();
    } catch {
      Alert.alert('Não foi possível remover a foto', 'Tente novamente.');
    } finally {
      definirSalvandoFoto(false);
    }
  };

  const encerrarSessao = () => {
    sair();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.container}>
      <View style={styles.bordaCabecalho}>
        <Header showNotifications={false} showAvatar={false} />
      </View>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.titulo}>Meu perfil</Text>
        <Text style={styles.subtitulo}>Informações da conta conectada</Text>

        <View style={styles.cartaoPerfil}>
          <TouchableOpacity
            onPress={escolherFoto}
            disabled={salvandoFoto}
            style={styles.botaoAvatar}
            accessibilityRole="button"
            accessibilityLabel="Alterar foto de perfil"
          >
            {fotoPerfil ? (
              <Image source={{ uri: fotoPerfil }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.inicial}>{nome.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.iconeCamera}>
              <Ionicons name="camera-outline" size={13} color={colors.text} />
            </View>
          </TouchableOpacity>
          <Text style={styles.nome}>{nome}</Text>
          <Text style={styles.tipoConta}>Equipe do estúdio</Text>
        </View>

        <View style={styles.cartaoDados}>
          <Text style={styles.tituloSecao}>Dados da conta</Text>
          <CampoConta icone="person-outline" rotulo="NOME DE EXIBIÇÃO" valor={nome} />
          <View style={styles.divisor} />
          <CampoConta icone="mail-outline" rotulo="E-MAIL DE ACESSO" valor={email || 'Não informado'} />
        </View>

        <View style={styles.cartaoAcoes}>
          <Text style={styles.tituloSecao}>Conta e segurança</Text>
          <OpcaoPerfil
            icone="camera-outline"
            titulo={salvandoFoto ? 'Salvando foto...' : 'Alterar foto de perfil'}
            descricao="Escolher da galeria · salva neste dispositivo"
            aoPressionar={escolherFoto}
            desabilitada={salvandoFoto}
          />
          {fotoPerfil && (
            <TouchableOpacity
              onPress={removerFoto}
              disabled={salvandoFoto}
              style={styles.removerFoto}
              accessibilityRole="button"
            >
              <Text style={styles.textoRemoverFoto}>Remover foto atual</Text>
            </TouchableOpacity>
          )}
          <View style={styles.divisor} />
          <OpcaoPerfil
            icone="lock-closed-outline"
            titulo="Alterar senha"
            descricao="Preparado para integração da autenticação"
            aoPressionar={() => navigation.navigate('AlterarSenha')}
          />
        </View>

        <TouchableOpacity
          style={styles.botaoSair}
          onPress={encerrarSessao}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
        >
          <Ionicons name="log-out-outline" size={19} color={colors.text} />
          <Text style={styles.textoSair}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
