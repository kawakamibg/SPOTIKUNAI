import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  ScrollView 
} from 'react-native';

// PASSO 10: Importando useLocalSearchParams e useRouter
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Importação dos dados e da interface de dados
import { ALBUNS_INICIAIS } from '../../data/albuns';

export default function DetalhesAlbumScreen() {
  const router = useRouter();

  // PASSO 10: Recupera o parâmetro 'id' enviado pela rota dinâmica
  const { id } = useLocalSearchParams<{ id: string }>();

  // PASSO 11: Localiza o álbum no Array de dados pelo ID recuperado
  const album = ALBUNS_INICIAIS.find((item) => item.id === id);

  // Se o álbum não for localizado na lista
  if (!album) {
    return (
      <LinearGradient colors={['#191414', '#000000']} style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#E74C3C" />
          <Text style={styles.notFoundTitle}>Álbum não encontrado</Text>
          <Text style={styles.notFoundSubtitle}>ID buscado: {id}</Text>
          
          {/* PASSO 12: Botão para retornar à tela anterior */}
          <TouchableOpacity 
            style={styles.backButtonCenter} 
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={18} color="#000" />
            <Text style={styles.backButtonCenterText}>Voltar ao Feed</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1DB954', '#191414', '#000000']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* PASSO 12: Botão de navegação de retorno (router.back) */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        {/* PASSO 11: Exibição detalhada das informações do álbum */}
        <View style={styles.albumCardHeader}>
          {album.urlImagem ? (
            <Image 
              source={{ uri: album.urlImagem }} 
              style={styles.coverImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <Ionicons name="disc" size={80} color="#1DB954" />
            </View>
          )}

          <Text style={styles.albumTitle}>{album.nomeAlbum}</Text>
          <Text style={styles.artistName}>{album.nomeArtista}</Text>

          {/* Avaliação por Estrelas */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <Ionicons
                key={starIndex}
                name={starIndex <= album.nota ? "star" : "star-outline"}
                size={22}
                color="#FFD700"
                style={{ marginHorizontal: 2 }}
              />
            ))}
          </View>
        </View>

        {/* Seção de Detalhes Adicionais */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID do Registro:</Text>
            <Text style={styles.detailValue}>{id}</Text>
          </View>

          {album.genero ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gênero Musical:</Text>
              <Text style={styles.detailValue}>{album.genero}</Text>
            </View>
          ) : null}

          {album.dataLancamento ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ano de Lançamento:</Text>
              <Text style={styles.detailValue}>{album.dataLancamento}</Text>
            </View>
          ) : null}

          {album.descricao ? (
            <View style={styles.descriptionSection}>
              <Text style={styles.detailLabel}>Sobre o Álbum:</Text>
              <Text style={styles.descriptionText}>{album.descricao}</Text>
            </View>
          ) : null}
        </View>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backButton: {
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
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  albumCardHeader: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 450,
    marginBottom: 24,
  },
  coverImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  coverPlaceholder: {
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  artistName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1DB954',
    textAlign: 'center',
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsCard: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  detailLabel: {
    color: '#B3B3B3',
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  descriptionSection: {
    marginTop: 14,
  },
  descriptionText: {
    color: '#DDDDDD',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  notFoundSubtitle: {
    color: '#B3B3B3',
    fontSize: 14,
    marginTop: 6,
    marginBottom: 24,
  },
  backButtonCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  backButtonCenterText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
});