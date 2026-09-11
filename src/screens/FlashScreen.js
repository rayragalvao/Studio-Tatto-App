import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Header from '../components/Header';
import FlashCard from '../components/FlashCard';
import { styles } from './FlashScreen.styles';

const flashs = [
  { nome: 'Serpente', detalhe: 'Tribal', imagem: require('../assets/flashs/26984c5389c3caaaa59aed631270e9f06d39076d.png'), preco: '280' },
  { nome: 'Caveira Mexicana', detalhe: 'Colorida', imagem: require('../assets/flashs/ef09c073bbf8fb946766e971e90c1d806c375516.png'), preco: '350' },
  { nome: 'Rosa Minimalista', detalhe: 'Preto e Cinza', imagem: require('../assets/flashs/26984c5389c3caaaa59aed631270e9f06d39076d.png'), preco: '200', aplicado: true },
  { nome: 'Dragão Oriental', detalhe: 'Colorido', imagem: require('../assets/flashs/ef09c073bbf8fb946766e971e90c1d806c375516.png'), preco: '400' },
  { nome: 'Fênix', detalhe: 'Aquarela', imagem: require('../assets/flashs/26984c5389c3caaaa59aed631270e9f06d39076d.png'), preco: '450' },
  { nome: 'Mandala', detalhe: 'Geométrica', imagem: require('../assets/flashs/ef09c073bbf8fb946766e971e90c1d806c375516.png'), preco: '300' },
  { nome: 'Lobo', detalhe: 'Realismo', imagem: require('../assets/flashs/26984c5389c3caaaa59aed631270e9f06d39076d.png'), preco: '380' },
  { nome: 'Coração Tradicional', detalhe: 'Old School', imagem: require('../assets/flashs/ef09c073bbf8fb946766e971e90c1d806c375516.png'), preco: '250' },
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