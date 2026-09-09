import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Header from '../components/Header';
import FlashCard from '../components/FlashCard';
import { styles } from './FlashScreen.styles';

const flashs = [
  { nome: 'Serpente', detalhe: 'Tribal', imagem: 'IMG', preco: '280' },
  { nome: 'Caveira Mexicana', detalhe: 'Colorida', imagem: 'IMG', preco: '350' },
  { nome: 'Rosa Minimalista', detalhe: 'Preto e Cinza', imagem: 'IMG', preco: '200' },
  { nome: 'Dragão Oriental', detalhe: 'Colorido', imagem: 'IMG', preco: '400' },
  { nome: 'Fênix', detalhe: 'Aquarela', imagem: 'IMG', preco: '450' },
  { nome: 'Mandala', detalhe: 'Geométrica', imagem: 'IMG', preco: '300' },
  { nome: 'Lobo', detalhe: 'Realismo', imagem: 'IMG', preco: '380' },
  { nome: 'Coração Tradicional', detalhe: 'Old School', imagem: 'IMG', preco: '250' },
];

export default function FlashScreen() {
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
            <FlashCard key={flash.nome} {...flash} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}