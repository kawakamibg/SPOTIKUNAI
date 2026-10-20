import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ALBUNS_INICIAIS } from '../../data/albuns';

export default function DetalhesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Busca o álbum selecionado na memória compartilhada
  const album = ALBUNS_INICIAIS.find((item) => item.id === id);

  if (!album) {
    return (
      <LinearGradient colors={['#1DB954', '#191414']} style={styles.containerNotFound}>
        <Ionicons name="alert-circle-outline" size={64} color="#E74C3C" />
        <Text style={styles.titleNotFound}>Álbum não encontrado</Text>
        <Text style={styles.subNotFound}>ID buscado: {id}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color="#000" />
          <Text style={styles.backButtonText}>Voltar ao Feed</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const renderEstrelas = (qtd: number) => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <Ionicons
          key={i}
          name={i <= qtd ? 'star' : 'star-outline'}
          size={22}
          color="#FFD700"
        />
      );
    }
    return estrelas;
  };

  return (
    <LinearGradient colors={['#1DB954', '#191414', '#000000']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Botão de Voltar */}
        <TouchableOpacity style={styles.topBackButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.topBackButtonText}>Voltar</Text>
        </TouchableOpacity>

        {/* Capa e Informações Principais */}
        <View style={styles.headerCard}>
          <Image
            source={
              album.urlImagem && album.urlImagem.trim() !== ''
                ? { uri: album.urlImagem }
                : { uri: 'https://via.placeholder.com/300/1DB954/FFFFFF?text=Spotikunai' }
            }
            style={styles.capaGrande}
            resizeMode="cover"
          />

          <Text style={styles.nomeAlbum}>{album.nomeAlbum}</Text>
          <Text style={styles.nomeArtista}>{album.nomeArtista}</Text>
          <Text style={styles.anoText}>Ano: {album.dataLancamento}</Text>

          <View style={styles.starsContainer}>
            {renderEstrelas(album.nota)}
          </View>
        </View>

        {/* Card da Review / Crítica do Usuário */}
        <View style={styles.reviewCard}>
          <View style={styles.reviewHeader}>
            <Ionicons name="chatbox-ellipses-outline" size={20} color="#1DB954" />
            <Text style={styles.reviewTitle}>Sua Review</Text>
          </View>
          <Text style={styles.reviewBody}>{album.descricao || 'Sem review cadastrada.'}</Text>
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: 'center',
  },
  topBackButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  topBackButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  headerCard: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 450,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  capaGrande: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#282828',
  },
  nomeAlbum: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  nomeArtista: { fontSize: 18, color: '#1DB954', marginTop: 4, fontWeight: '600' },
  anoText: { fontSize: 14, color: '#B3B3B3', marginTop: 4 },
  starsContainer: { flexDirection: 'row', marginTop: 12, gap: 4 },
  reviewCard: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#181818',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  reviewTitle: { color: '#1DB954', fontSize: 16, fontWeight: 'bold' },
  reviewBody: { color: '#E0E0E0', fontSize: 15, lineHeight: 22 },
  containerNotFound: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  titleNotFound: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  subNotFound: { color: '#B3B3B3', fontSize: 14, marginTop: 4, marginBottom: 24 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  backButtonText: { color: '#000000', fontWeight: 'bold', marginLeft: 6 },
});