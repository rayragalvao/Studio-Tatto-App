import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import FlashCard from '../components/FlashCard';
import FlashDetailModal from '../components/FlashDetailModal';
import AddFlashModal from '../components/AddFlashModal';
import { colors } from '../theme/colors';
import { styles } from './FlashScreen.styles';

const flashsIniciais = [
  { codigo: 'F-01', nome: 'Serpente', detalhe: 'Tribal', imagem: require('../assets/flashs/serpente.jpg'), preco: '280', descricao: 'Cobra estilizada em traço grosso. Adaptável ao pulso ou tornozelo. Aplicação aprox. 1h30.' },
  { codigo: 'F-02', nome: 'Caveira Mexicana', detalhe: 'Colorida', imagem: require('../assets/flashs/caveira.jpg'), preco: '350' },
  { codigo: 'F-03', nome: 'Rosa Minimalista', detalhe: 'Preto e Cinza', imagem: require('../assets/flashs/rosa.jpg'), preco: '200', aplicado: true },
  { codigo: 'F-04', nome: 'Dragão Oriental', detalhe: 'Colorido', imagem: require('../assets/flashs/dragao.jpg'), preco: '400' },
  { codigo: 'F-05', nome: 'Fênix', detalhe: 'Aquarela', imagem: require('../assets/flashs/fenix.jpg'), preco: '450' },
  { codigo: 'F-06', nome: 'Mandala', detalhe: 'Geométrica', imagem: require('../assets/flashs/mandala.webp'), preco: '300' },
  { codigo: 'F-07', nome: 'Lobo', detalhe: 'Realismo', imagem: require('../assets/flashs/lobo.jpeg'), preco: '380' },
  { codigo: 'F-08', nome: 'Coração Tradicional', detalhe: 'Old School', imagem: require('../assets/flashs/coracao.jpeg'), preco: '250' },
];

export default function FlashScreen() {
  const [flashs, setFlashs] = useState(flashsIniciais);
  const [flashSelecionado, setFlashSelecionado] = useState(null);
  const [flashEmEdicao, setFlashEmEdicao] = useState(null);
  const [modalAdicionarVisivel, setModalAdicionarVisivel] = useState(false);

  const handleEditar = (flash) => {
    setFlashSelecionado(null);
    setFlashEmEdicao(flash);
  };

  const handleSalvarFlash = (flashSalvo) => {
    setFlashs((atual) => {
      const jaExiste = atual.some((f) => f.codigo === flashSalvo.codigo);
      return jaExiste
        ? atual.map((f) => (f.codigo === flashSalvo.codigo ? flashSalvo : f))
        : [...atual, flashSalvo];
    });
    setModalAdicionarVisivel(false);
    setFlashEmEdicao(null);
  };

  const handleFecharFormulario = () => {
    setModalAdicionarVisivel(false);
    setFlashEmEdicao(null);
  };

  return (
    <View style={styles.container}>
      <Header/>
      <ScrollView contentContainerStyle={styles.flashScrollContent}>
        <View style={styles.flashHeader}>
          <Text style={styles.greeting}>Flash Tattoos</Text>
          <Text style={styles.date}>Catálogo de designs prontos</Text>
        </View>
        <View style={styles.flashGrid}>
          {flashs.map((flash) => (
            <FlashCard key={flash.codigo} {...flash} onPress={() => setFlashSelecionado(flash)} />
          ))}

          <TouchableOpacity style={styles.flashCardAdd} onPress={() => setModalAdicionarVisivel(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={28} color={colors.textMuted} />
            <Text style={styles.flashCardAddText}>Adicionar flash</Text>
          </TouchableOpacity>
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