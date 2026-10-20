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
  onDelete,
}: AlbumCardProps) {
  const renderEstrelas = (qtd: number) => {
    const estrelas = [];
    for (let i = 1; i <= 5; i++) {
      estrelas.push(
        <Ionicons
          key={i}
          name={i <= qtd ? 'star' : 'star-outline'}
          size={modoCompacto ? 14 : 18}
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

      {/* Ações: Editar e Excluir */}
      <View style={styles.actionsContainer}>
        {onEdit && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={onEdit}
          >
            <Ionicons name="pencil" size={18} color="#1DB954" />
          </TouchableOpacity>
        )}

        {onDelete && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
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
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardCompacto: {
    padding: 8,
    marginBottom: 8,
  },
  capa: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#282828',
  },
  capaCompacta: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tituloCompacto: {
    fontSize: 14,
  },
  artista: {
    color: '#B3B3B3',
    fontSize: 13,
    marginTop: 2,
  },
  ano: {
    color: '#777',
  },
  avaliacaoContainer: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});