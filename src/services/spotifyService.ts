import { API_BASE_URL } from './apiConfig';

export interface SpotifyAlbum {
  id?: string | number;
  idiTunes?: string;
  nomeAlbum: string;
  nomeArtista: string;
  ano?: number | string;
  urlImagem?: string;
}

export const spotifyService = {
  async buscarAlbuns(termo: string, limite = 8): Promise<SpotifyAlbum[]> {
    if (!termo || !termo.trim()) return [];

    try {
      const query = encodeURIComponent(termo.trim());
      const response = await fetch(`${API_BASE_URL}/spotify/search?q=${query}`);

      if (!response.ok) {
        console.warn(`Erro na resposta da API: ${response.status}`);
        return [];
      }

      const data = await response.json();

      // Se for uma lista direta [ ... ]
      if (Array.isArray(data)) {
        return data.slice(0, limite);
      }

      // Se for um objeto com a chave albums { albums: [ ... ] }
      if (data && data.albums) {
        if (Array.isArray(data.albums)) return data.albums.slice(0, limite);
        if (Array.isArray(data.albums.items)) return data.albums.items.slice(0, limite);
      }

      return [];
    } catch (error) {
      console.error('Erro em spotifyService.buscarAlbuns:', error);
      return [];
    }
  }
};