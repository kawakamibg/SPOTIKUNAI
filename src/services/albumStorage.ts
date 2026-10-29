import AsyncStorage from '@react-native-async-storage/async-storage';

import { Album } from '../data/albuns';
import { apiService, AlbumAPI } from './apiService';

export const ALBUNS_STORAGE_KEY = '@spotikunai_albuns';
export const FAVORITOS_STORAGE_KEY = '@spotikunai_favoritos';

function formatarAlbum(item: AlbumAPI): Album {
  return {
    id: String(item.id),
    nomeAlbum: item.nomeAlbum || 'Sem título',
    nomeArtista: item.nomeArtista || 'Artista desconhecido',
    dataLancamento: String(item.ano || '2024'),
    urlImagem: item.urlImagem || '',
    nota: item.nota || 5,
    genero: item.genero || 'Gênero não informado',
    descricao: item.descricao || 'Álbum vindo do servidor Express.',
  };
}

export async function carregarAlbuns(): Promise<Album[]> {
  const albunsAPI = await apiService.getAlbuns();

  if (albunsAPI.length > 0) {
    const albuns = albunsAPI.map(formatarAlbum);
    await AsyncStorage.setItem(ALBUNS_STORAGE_KEY, JSON.stringify(albuns));
    return albuns;
  }

  const albunsSalvos = await AsyncStorage.getItem(ALBUNS_STORAGE_KEY);
  return albunsSalvos ? JSON.parse(albunsSalvos) as Album[] : [];
}

export async function carregarIdsFavoritos(): Promise<string[]> {
  const favoritosSalvos = await AsyncStorage.getItem(FAVORITOS_STORAGE_KEY);
  if (!favoritosSalvos) return [];

  const favoritos: unknown = JSON.parse(favoritosSalvos);
  if (!Array.isArray(favoritos) || !favoritos.every((id) => typeof id === 'string')) {
    throw new Error('A lista de favoritos salva está em um formato inválido.');
  }

  return favoritos;
}

export async function salvarIdsFavoritos(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITOS_STORAGE_KEY, JSON.stringify(ids));
}
