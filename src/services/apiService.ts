import { Platform } from 'react-native';

// Na Web utiliza localhost; em dispositivos móveis/emuladores utiliza o IP local da máquina
const API_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/albuns' 
  : 'http://192.168.1.100:3000/albuns'; // Substitui pelo teu IP local se fores testar no telemóvel

export interface AlbumAPI {
  id?: number | string;
  nomeAlbum: string;
  nomeArtista: string;
  ano?: number | string;
  urlImagem?: string;
  nota?: number;
  descricao?: string;
}

export const apiService = {
  // GET: Buscar todos os álbuns da API
  async getAlbuns(): Promise<AlbumAPI[]> {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Erro ao buscar álbuns');
      return await response.json();
    } catch (error) {
      console.error('Erro na API getAlbuns:', error);
      return [];
    }
  },

  // POST: Cadastrar novo álbum na API
  async criarAlbum(album: AlbumAPI): Promise<AlbumAPI | null> {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(album),
      });
      if (!response.ok) throw new Error('Erro ao criar álbum');
      return await response.json();
    } catch (error) {
      console.error('Erro na API criarAlbum:', error);
      return null;
    }
  },

  // PUT: Atualizar álbum existente na API
  async atualizarAlbum(id: string | number, album: AlbumAPI): Promise<AlbumAPI | null> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(album),
      });
      if (!response.ok) throw new Error('Erro ao atualizar álbum');
      return await response.json();
    } catch (error) {
      console.error('Erro na API atualizarAlbum:', error);
      return null;
    }
  },

  // DELETE: Remover álbum da API
  async deletarAlbum(id: string | number): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      return response.status === 204 || response.ok;
    } catch (error) {
      console.error('Erro na API deletarAlbum:', error);
      return false;
    }
  },
};