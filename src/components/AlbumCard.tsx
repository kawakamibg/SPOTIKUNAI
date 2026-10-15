import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AlbumCardProps {
  id: string;
  nomeAlbum: string;
  nomeArtista: string;
  dataLancamento?: string;
  urlImagem?: string;
  nota: number;
  modoCompacto?: boolean;
  onPress?: () => void;
}

export default function AlbumCard({
  nomeAlbum,
  nomeArtista,
  dataLancamento,
  urlImagem,
  nota,
  modoCompacto = false,
  onPress,
}: AlbumCardProps) {
  // Renderização em Modo Compacto
  if (modoCompacto) {
    return (
      <TouchableOpacity 
        style={styles.cardCompact} 
        onPress={onPress} 
        activeOpacity={0.7}
      >
        <Ionicons name="disc" size={20} color="#1DB954" style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.albumTitleCompact} numberOfLines={1}>{nomeAlbum}</Text>
          <Text style={styles.artistNameCompact} numberOfLines={1}>{nomeArtista}</Text>
        </View>
        <View style={styles.starsRow}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingTextCompact}>{nota}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Renderização Normal / Completa
  return (
    <TouchableOpacity 
      style={styles.cardLetterboxd} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      {urlImagem ? (
        <Image 
          source={{ uri: urlImagem }} 
          style={styles.albumCover} 
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.albumCover, styles.albumCoverPlaceholder]}>
          <Ionicons name="disc" size={36} color="#1DB954" />
        </View>
      )}

      <View style={styles.cardInfo}>
        <Text style={styles.albumTitle} numberOfLines={1}>
          {nomeAlbum}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {nomeArtista}
        </Text>
        
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((starIndex) => (
            <Ionicons
              key={starIndex}
              name={starIndex <= nota ? "star" : "star-outline"}
              size={16}
              color="#FFD700"
              style={{ marginRight: 2 }}
            />
          ))}
        </View>

        {dataLancamento ? (
          <Text style={styles.releaseDate}>
            Lançamento: {dataLancamento}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardLetterboxd: {
    width: '100%',
    maxWidth: 500,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  albumCover: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 14,
  },
  albumCoverPlaceholder: {
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  albumTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  artistName: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  releaseDate: {
    color: '#B3B3B3',
    fontSize: 12,
  },
  cardCompact: {
    width: '100%',
    maxWidth: 500,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  albumTitleCompact: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  artistNameCompact: {
    color: '#1DB954',
    fontSize: 12,
  },
  ratingTextCompact: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});