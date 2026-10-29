import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import AlbumCard from '../components/AlbumCard';
import { Album } from '../data/albuns';
import {
  carregarAlbuns,
  carregarIdsFavoritos,
  salvarIdsFavoritos,
} from '../services/albumStorage';

export default function FavoritosScreen() {
  const router = useRouter();
  const [albuns, setAlbuns] = useState<Album[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const atualizarLista = useCallback(async () => {
    setCarregando(true);
    setErro(false);

    try {
      const [albunsCarregados, idsFavoritos] = await Promise.all([
        carregarAlbuns(),
        carregarIdsFavoritos(),
      ]);
      setAlbuns(albunsCarregados);
      setFavoritos(idsFavoritos);
    } catch (error) {
      console.error('Erro ao carregar a página de favoritos:', error);
      setErro(true);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      atualizarLista();
    }, [atualizarLista])
  );

  const removerFavorito = async (id: string) => {
    const novosFavoritos = favoritos.filter((favoritoId) => favoritoId !== id);

    try {
      await salvarIdsFavoritos(novosFavoritos);
      setFavoritos(novosFavoritos);
    } catch (error) {
      console.error('Erro ao remover álbum dos favoritos:', error);
      Alert.alert('Erro', 'Não foi possível remover o álbum dos favoritos.');
    }
  };

  const albunsFavoritos = albuns.filter((album) => favoritos.includes(album.id));

  return (
    <LinearGradient colors={['#1DB954', '#191414']} style={styles.container}>
      <FlatList
        data={albunsFavoritos}
        keyExtractor={(album) => album.id}
        renderItem={({ item }) => (
          <AlbumCard
            id={item.id}
            nomeAlbum={item.nomeAlbum}
            nomeArtista={item.nomeArtista}
            dataLancamento={item.dataLancamento}
            urlImagem={item.urlImagem}
            nota={item.nota}
            onPress={() => router.push(`/detalhes/${item.id}` as any)}
            onFavorite={() => removerFavorito(item.id)}
            isFavorite
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            <View style={styles.titleRow}>
              <Ionicons name="heart" size={28} color="#FF6B6B" />
              <Text style={styles.title}>Favoritos</Text>
            </View>
            <Text style={styles.subtitle}>
              Seus álbuns favoritos ficam salvos aqui e continuam na página principal.
            </Text>
            <TouchableOpacity
              style={styles.addAlbumButton}
              onPress={() => router.push('/' as any)}
            >
              <Ionicons name="add" size={18} color="#000000" />
              <Text style={styles.addAlbumButtonText}>Adicionar ou favoritar um álbum</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator size="large" color="#FFFFFF" style={styles.loading} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name={erro ? 'alert-circle-outline' : 'heart-outline'} size={48} color="#777" />
              <Text style={styles.emptyTitle}>
                {erro
                  ? 'Não foi possível carregar os favoritos.'
                  : 'Você ainda não tem álbuns favoritos.'}
              </Text>
              <Text style={styles.emptyText}>
                {erro
                  ? 'Tente carregar a lista novamente.'
                  : 'Toque no coração ao lado do lápis de um álbum para salvá-lo aqui.'}
              </Text>
              {erro && (
                <TouchableOpacity style={styles.retryButton} onPress={atualizarLista}>
                  <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 32,
  },
  header: {
    width: '100%',
    maxWidth: 500,
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    marginBottom: 20,
  },
  backButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: '#E0E0E0', fontSize: 14, lineHeight: 20, marginTop: 8 },
  addAlbumButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1DB954',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 16,
  },
  addAlbumButtonText: { color: '#000000', fontSize: 13, fontWeight: 'bold' },
  loading: { marginTop: 40 },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyText: {
    color: '#B3B3B3',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
  },
  retryButton: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#1DB954',
    borderRadius: 18,
  },
  retryButtonText: { color: '#000000', fontWeight: 'bold' },
});
