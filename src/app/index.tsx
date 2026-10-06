import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

// Importações dos pacotes de interface
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

export default function App() {
  return (
    <LinearGradient
      colors={['#1DB954', '#191414']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Título principal com animação suave */}
        <Animatable.Text animation="fadeInDown" duration={1500} style={styles.title}>
          Spotikunai
        </Animatable.Text>

        <Text style={styles.subtitle}>Sua rede social de álbuns</Text>

        {/* Estado inicial (sem reviews fixas) */}
        <View style={styles.emptyContainer}>
          <Ionicons name="disc-outline" size={64} color="#1DB954" style={styles.icon} />
          <Text style={styles.emptyTitle}>Nenhuma avaliação por aqui</Text>
          <Text style={styles.emptySubtitle}>
            Em breve poderás adicionar e avaliar os teus álbuns favoritos!
          </Text>
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
    flexGrow: 1,
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
  emptyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 30,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  icon: {
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#B3B3B3',
    textAlign: 'center',
  },
});