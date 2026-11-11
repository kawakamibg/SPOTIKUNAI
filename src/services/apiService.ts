import { API_BASE_URL } from './apiConfig';

const API_BASE = API_BASE_URL;
const API_URL = `${API_BASE}/albuns`;

export interface AlbumAPI {
  id?: number | string;
  nomeAlbum: string;
  nomeArtista: string;
  ano?: number | string;
  urlImagem?: string;
  nota?: number;
  descricao?: string;
  genero?: string;
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
  async atualizarAlbum(id: string | number, album: any) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(album),
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        console.error(`Status HTTP ${response.status}:`, errorDetail);
        throw new Error(`Erro ao atualizar álbum (${response.status})`);
      }

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