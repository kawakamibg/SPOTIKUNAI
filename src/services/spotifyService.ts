import { Platform } from 'react-native';

const API_BASE = Platform.OS === 'web' 
  ? 'http://localhost:3000' 
  : 'http://192.168.1.100:3000';

export const spotifyService = {
  async buscarAlbuns(termo: string) {
    if (!termo || !termo.trim()) return [];

    try {
      const query = encodeURIComponent(termo.trim());
      const response = await fetch(`${API_BASE}/spotify/search?q=${query}`);

      if (!response.ok) {
        console.warn(`Erro na resposta da API: ${response.status}`);
        return [];
      }

      const data = await response.json();

      // Se for uma lista direta [ ... ]
      if (Array.isArray(data)) {
        return data;
      }

      // Se for um objeto com a chave albums { albums: [ ... ] }
      if (data && data.albums) {
        if (Array.isArray(data.albums)) return data.albums;
        if (Array.isArray(data.albums.items)) return data.albums.items;
      }

      return [];
    } catch (error) {
      console.error('Erro em spotifyService.buscarAlbuns:', error);
      return [];
    }
  }
};