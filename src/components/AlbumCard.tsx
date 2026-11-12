import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AlbumCardProps {
  id: string;
  nomeAlbum: string;
  nomeArtista: string;
  dataLancamento: string;
  urlImagem?: string;
  nota: number;
  modoCompacto?: boolean;
  onPress: () => void;
  onEdit?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  onDelete?: () => void;
}

export default function AlbumCard({
  nomeAlbum,
  nomeArtista,
  dataLancamento,
  urlImagem,
  nota,
  modoCompacto = false,
  onPress,
  onEdit,
  onFavorite,
  isFavorite = false,
  onDelete,
}: AlbumCardProps) {
  const renderEstrelas = (qtd: number) => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <Ionicons
          key={i}
          name={i <= qtd ? 'star' : 'star-outline'}
          size={modoCompacto ? 13 : 16}
          color="#FFD700"
        />
      );
    }
    return estrelas;
  };

  return (
    <TouchableOpacity 
      style={[styles.card, modoCompacto && styles.cardCompacto]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={
          urlImagem && urlImagem.trim() !== ''
            ? { uri: urlImagem }
            : { uri: 'https://via.placeholder.com/150/1DB954/FFFFFF?text=Spotikunai' }
        }
        style={[styles.capa, modoCompacto && styles.capaCompacta]}
        resizeMode="cover"
      />

      <View style={styles.infoContainer}>
        <Text style={[styles.titulo, modoCompacto && styles.tituloCompacto]} numberOfLines={1}>
          {nomeAlbum}
        </Text>
        <Text style={styles.artista} numberOfLines={1}>
          {nomeArtista} • <Text style={styles.ano}>{dataLancamento}</Text>
        </Text>

        <View style={styles.avaliacaoContainer}>
          {renderEstrelas(nota)}
        </View>
      </View>

      {/* Ações: Editar, Favoritar e Excluir */}
      <View style={styles.actionsContainer}>
        {onEdit && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={(e) => {
              e.stopPropagation?.();
              onEdit();
            }}
          >
            <Ionicons name="pencil" size={17} color="#1DB954" />
          </TouchableOpacity>
        )}

        {onFavorite && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation?.();
              onFavorite();
            }}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={17}
              color={isFavorite ? '#FF6B6B' : '#B3B3B3'}
            />
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={(e) => {
              e.stopPropagation?.();
              onDelete();
            }}
          >
            <Ionicons name="trash-outline" size={17} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardCompacto: {
    padding: 8,
    marginBottom: 8,
  },
  capa: {
    width: 62,
    height: 62,
    borderRadius: 8,
    backgroundColor: '#282828',
    flexShrink: 0,
  },
  capaCompacta: {
    width: 46,
    height: 46,
    borderRadius: 6,
  },
  infoContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
    justifyContent: 'center',
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  tituloCompacto: {
    fontSize: 13,
  },
  artista: {
    color: '#B3B3B3',
    fontSize: 12,
    marginTop: 2,
  },
  ano: {
    color: '#777',
  },
  avaliacaoContainer: {
    flexDirection: 'row',
    marginTop: 5,
    gap: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 6,
    flexShrink: 0,
  },
  actionButton: {
    padding: 5,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});