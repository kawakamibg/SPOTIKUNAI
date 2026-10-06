import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

// Importação dos 5 pacotes instalados
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import uuid from 'react-native-uuid';
import * as Animatable from 'react-native-animatable';

export default function App() {
  // Gerando um ID único para a review usando o react-native-uuid
  const reviewId = uuid.v4();
  
  // Formatando a data atual usando o date-fns
  const dataAtual = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <LinearGradient
      // Utilizando o expo-linear-gradient no fundo
      colors={['#1DB954', '#191414']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Utilizando o react-native-animatable para animar o título */}
        <Animatable.Text animation="fadeInDown" duration={1500} style={styles.title}>
          Spotikunai
        </Animatable.Text>

        <Text style={styles.subtitle}>Sua rede social de álbuns</Text>

        {/* Exemplo de uso dos dados (Simulando uma Review) */}
        <View style={styles.card}>
          <Text style={styles.albumName}>Daft Punk - Discovery</Text>
          <View style={styles.stars}>
            {/* Utilizando o @expo/vector-icons */}
            <Ionicons name="star" size={20} color="#FFD700" />
            <Ionicons name="star" size={20} color="#FFD700" />
            <Ionicons name="star" size={20} color="#FFD700" />
            <Ionicons name="star" size={20} color="#FFD700" />
            <Ionicons name="star-half" size={20} color="#FFD700" />
          </View>
          <Text style={styles.reviewText}>Um marco na música eletrônica. Incrível!</Text>
          <Text style={styles.infoText}>Avaliado em: {dataAtual}</Text>
          <Text style={styles.infoText}>ID da Avaliação: {reviewId.toString().substring(0, 8)}...</Text>
        </View>

        {/* Seção Obrigatória: Tecnologias Utilizadas */}
        <View style={styles.techSection}>
          <Text style={styles.techTitle}>Tecnologias utilizadas:</Text>
          <Text style={styles.techItem}>• expo-linear-gradient (Fundo)</Text>
          <Text style={styles.techItem}>• react-native-animatable (Animação)</Text>
          <Text style={styles.techItem}>• @expo/vector-icons (Estrelas)</Text>
          <Text style={styles.techItem}>• date-fns (Data da review)</Text>
          <Text style={styles.techItem}>• react-native-uuid (ID da review)</Text>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#B3B3B3',
    marginBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 40,
  },
  albumName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 15,
    color: '#FFF',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  infoText: {
    fontSize: 12,
    color: '#B3B3B3',
    marginBottom: 2,
  },
  techSection: {
    width: '100%',
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 12,
  },
  techTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 15,
  },
  techItem: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 8,
  }
});