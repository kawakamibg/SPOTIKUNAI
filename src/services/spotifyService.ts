import { Platform } from 'react-native';

// O frontend chama NOSSO servidor Express, que por sua vez chama o Spotify.
// As credenciais ficam apenas no servidor — nunca no cliente.
const API_BASE = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : 'http://192.168.1.100:3000'; // Troque pelo IP local ao testar no celular

export interface SpotifyAlbum {
  id: string;
  nomeAlbum: string;
  nomeArtista: string;
  ano: string;
  urlImagem: string;
  totalFaixas?: number;
  tipo?: string;
}

export interface SpotifyAlbumDetalhes extends SpotifyAlbum {
  generos?: string[];
  label?: string;
  popularidade?: number;
}

export const spotifyService = {
  /**
   * Busca álbuns pelo nome/artista via proxy do servidor Express.
   */
  async buscarAlbuns(query: string, limite = 8): Promise<SpotifyAlbum[]> {
    try {
      const params = new URLSearchParams({ q: query, limit: String(limite) });
      const response = await fetch(`${API_BASE}/spotify/search?${params}`);

      if (!response.ok) {
        const erro = await response.json().catch(() => ({}));
        throw new Error(erro.erro || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.albums ?? [];
    } catch (error) {
      console.error('Erro spotifyService.buscarAlbuns:', error);
      throw error;
    }
  },

  /**
   * Busca detalhes completos de um álbum pelo ID do Spotify.
   */
  async buscarDetalhes(spotifyId: string): Promise<SpotifyAlbumDetalhes | null> {
    try {
      const response = await fetch(`${API_BASE}/spotify/album/${spotifyId}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Erro spotifyService.buscarDetalhes:', error);
      return null;
    }
  },
};

