import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import FlashCard from '../../components/FlashCard';
import FlashDetailModal from '../../components/FlashDetailModal';
import AddFlashModal from '../../components/AddFlashModal';
import { apiRequest, API_URL } from '../../services/api';
import { colors } from '../../theme/colors';
import { styles } from './FlashScreen.styles';

const flashsIniciais = [
  { codigo: 'F-01', nome: 'Serpente', detalhe: 'Tribal', imagem: require('../../assets/flashs/serpente.jpg'), preco: '280', descricao: 'Cobra estilizada em traço grosso. Adaptável ao pulso ou tornozelo. Aplicação aprox. 1h30.' },
  { codigo: 'F-02', nome: 'Caveira Mexicana', detalhe: 'Colorida', imagem: require('../../assets/flashs/caveira.jpg'), preco: '350' },
  { codigo: 'F-03', nome: 'Rosa Minimalista', detalhe: 'Preto e Cinza', imagem: require('../../assets/flashs/rosa.jpg'), preco: '200', aplicado: true },
  { codigo: 'F-04', nome: 'Dragão Oriental', detalhe: 'Colorido', imagem: require('../../assets/flashs/dragao.jpg'), preco: '400' },
  { codigo: 'F-05', nome: 'Fênix', detalhe: 'Aquarela', imagem: require('../../assets/flashs/fenix.jpg'), preco: '450' },
  { codigo: 'F-06', nome: 'Mandala', detalhe: 'Geométrica', imagem: require('../../assets/flashs/mandala.webp'), preco: '300' },
  { codigo: 'F-07', nome: 'Lobo', detalhe: 'Realismo', imagem: require('../../assets/flashs/lobo.jpeg'), preco: '380' },
  { codigo: 'F-08', nome: 'Coração Tradicional', detalhe: 'Old School', imagem: require('../../assets/flashs/coracao.jpeg'), preco: '250' },
];

export default function FlashScreen() {
  const [flashs, setFlashs] = useState(flashsIniciais);
  const [flashSelecionado, setFlashSelecionado] = useState(null);
  const [flashEmEdicao, setFlashEmEdicao] = useState(null);
  const [modalAdicionarVisivel, setModalAdicionarVisivel] = useState(false);

  useEffect(() => {
    carregarFlashs();
  }, []);

  const carregarFlashs = async () => {
    try {
      const dados = await apiRequest('/flash-tattoos');

      const flashsFormatados = dados.map((flash) => ({
        id: flash.id,
        codigo: `API-${flash.id}`,
        nome: flash.nome,
        detalhe: flash.estilo,
        estilo: flash.estilo,
        preco: String(flash.preco),
        descricao: flash.descricao,
        imagem: {
          uri: flash.imagemUrl.startsWith('http')
            ? flash.imagemUrl
            : `${API_URL}${flash.imagemUrl}`,
        },
        imagemUrl: flash.imagemUrl,
      }));

      setFlashs([...flashsFormatados.reverse(), ...flashsIniciais]);
    } catch (erro) {
      console.log('Erro ao carregar flashes:', erro);
    }
  };

  const handleEditar = (flash) => {
    setFlashSelecionado(null);
    setFlashEmEdicao(flash);
  };

 const handleSalvarFlash = async (flashSalvo) => {
  try {
    const formData = new FormData();

    formData.append('nome', flashSalvo.nome);
    formData.append('estilo', flashSalvo.estilo);
    formData.append('preco', flashSalvo.preco);
    formData.append('descricao', flashSalvo.descricao || '');

    if (flashSalvo.imagemUri) {
      const nomeArquivo =
        flashSalvo.imagemUri.split('/').pop() || 'flash.jpg';

      const extensao =
        nomeArquivo.split('.').pop()?.toLowerCase() || 'jpg';

      const tipoImagem =
        extensao === 'png'
          ? 'image/png'
          : extensao === 'webp'
            ? 'image/webp'
            : 'image/jpeg';

      formData.append('foto', {
        uri: flashSalvo.imagemUri,
        name: nomeArquivo,
        type: tipoImagem,
      });
    }

    const flashCriado = await apiRequest('/flash-tattoos', {
      method: 'POST',
      body: formData,
    });

    const flashFormatado = {
      id: flashCriado.id,
      codigo: `API-${flashCriado.id}`,
      nome: flashCriado.nome,
      detalhe: flashCriado.estilo,
      estilo: flashCriado.estilo,
      preco: String(flashCriado.preco),
      descricao: flashCriado.descricao,
      imagem: {
        uri: flashCriado.imagemUrl.startsWith('http')
          ? flashCriado.imagemUrl
          : `${API_URL}${flashCriado.imagemUrl}`,
      },
      imagemUrl: flashCriado.imagemUrl,
    };

    setFlashs((atual) => [
      flashFormatado,
      ...atual,
    ]);

    setModalAdicionarVisivel(false);
    setFlashEmEdicao(null);
  } catch (erro) {
    console.log('Erro ao cadastrar flash:', erro);
  }
};

  const handleFecharFormulario = () => {
    setModalAdicionarVisivel(false);
    setFlashEmEdicao(null);
  };


  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.flashScrollContent}>
        <View style={styles.flashHeader}>
          <Text style={styles.greeting}>Flash Tattoos</Text>
          <Text style={styles.date}>Catálogo de designs prontos</Text>
        </View>

        <View style={styles.flashGrid}>
          <TouchableOpacity
            style={styles.flashCardAdd}
            onPress={() => setModalAdicionarVisivel(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Adicionar flash"
          >
            <Ionicons
              name="add"
              size={28}
              color={colors.textMuted}
            />
            <Text style={styles.flashCardAddText}>
              Adicionar flash
            </Text>
          </TouchableOpacity>

          {flashs.map((flash) => (
            <FlashCard
              key={flash.id ? `api-${flash.id}` : flash.codigo}
              {...flash}
              onPress={() => setFlashSelecionado(flash)}
            />
          ))}
        </View>
      </ScrollView>

      <FlashDetailModal
        flash={flashSelecionado}
        visible={!!flashSelecionado}
        onClose={() => setFlashSelecionado(null)}
        onEdit={handleEditar}
      />

      <AddFlashModal
        visible={modalAdicionarVisivel || !!flashEmEdicao}
        onClose={handleFecharFormulario}
        onSave={handleSalvarFlash}
        flashParaEditar={flashEmEdicao}
      />
    </View>
  );
}