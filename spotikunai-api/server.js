require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

// ─────────────────────────────────────────────
//  BANCO DE DADOS LOCAL (Álbuns avaliados)
// ─────────────────────────────────────────────

let albuns = [
  {
    id: 1,
    nomeAlbum: "Dark Side of the Moon",
    nomeArtista: "Pink Floyd",
    ano: 1973,
    urlImagem: "https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png"
  },
  {
    id: 2,
    nomeAlbum: "Nevermind",
    nomeArtista: "Nirvana",
    ano: 1991,
    urlImagem: "https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg"
  }
];

let proximoId = 3;

// ─────────────────────────────────────────────
//  ROTAS DE ÁLBUNS (CRUD local)
// ─────────────────────────────────────────────

// GET - Todos os álbuns
app.get('/albuns', (req, res) => {
  res.json(albuns);
});

// GET - Álbum específico por ID
app.get('/albuns/:id', (req, res) => {
  const id = Number(req.params.id);
  const album = albuns.find(a => a.id === id);
  if (!album) return res.status(404).json({ mensagem: 'Não encontrado' });
  res.json(album);
});

// POST - Criar álbum
app.post('/albuns', (req, res) => {
  const { nomeAlbum, nomeArtista, ano, urlImagem, nota, descricao } = req.body;
  if (!nomeAlbum || !nomeArtista) {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }
  const novoAlbum = {
    id: proximoId++,
    nomeAlbum,
    nomeArtista,
    ano: Number(ano) || 2024,
    urlImagem: urlImagem || '',
    nota: nota || 5,
    descricao: descricao || '',
  };
  albuns.push(novoAlbum);
  res.status(201).json(novoAlbum);
});

// PUT - Atualizar álbum
app.put('/albuns/:id', (req, res) => {
  const id = Number(req.params.id);
  const album = albuns.find(a => a.id === id);
  if (!album) return res.status(404).json({ mensagem: 'Não encontrado' });

  const { nomeAlbum, nomeArtista, ano, urlImagem, nota, descricao } = req.body;
  if (!nomeAlbum || !nomeArtista) {
    return res.status(400).json({ erro: 'Faltam dados' });
  }

  album.nomeAlbum = nomeAlbum;
  album.nomeArtista = nomeArtista;
  album.ano = Number(ano);
  album.urlImagem = urlImagem;
  album.nota = nota;
  album.descricao = descricao;

  res.json(album);
});

// DELETE - Remover álbum
app.delete('/albuns/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = albuns.findIndex(a => a.id === id);
  if (indice === -1) return res.status(404).json({ erro: 'Não encontrado' });
  albuns.splice(indice, 1);
  res.status(204).send();
});

// ─────────────────────────────────────────────
//  PROXY SPOTIFY (credenciais ficam no servidor)
// ─────────────────────────────────────────────

let spotifyToken = null;
let tokenExpiresAt = 0;

async function getSpotifyToken() {
  const agora = Date.now();

  // Reutiliza o token se ainda for válido (com 30s de margem)
  if (spotifyToken && agora < tokenExpiresAt - 30000) {
    return spotifyToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Credenciais do Spotify não configuradas no .env');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  spotifyToken = response.data.access_token;
  tokenExpiresAt = agora + response.data.expires_in * 1000;

  console.log('🎵 Novo token Spotify obtido. Válido por', response.data.expires_in, 'segundos.');
  return spotifyToken;
}

// GET /spotify/search?q=termo&limit=8
app.get('/spotify/search', async (req, res) => {
  const { q, limit = 8 } = req.query;

  if (!q || !q.trim()) {
    return res.status(400).json({ erro: 'Parâmetro "q" é obrigatório.' });
  }

  try {
    const token = await getSpotifyToken();

    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        q: q.trim(),
        type: 'album',
        limit: Math.min(Number(limit), 20),
        market: 'BR',
      },
    });

    const albums = response.data.albums.items.map(album => ({
      id: album.id,
      nomeAlbum: album.name,
      nomeArtista: album.artists.map(a => a.name).join(', '),
      ano: album.release_date ? album.release_date.substring(0, 4) : '',
      urlImagem: album.images && album.images[0] ? album.images[0].url : '',
      totalFaixas: album.total_tracks,
      tipo: album.album_type,
    }));

    res.json({ albums });
  } catch (error) {
    console.error('Erro Spotify search:', error.response?.data || error.message);
    res.status(500).json({ erro: 'Falha ao buscar no Spotify.', detalhe: error.message });
  }
});

// GET /spotify/album/:id  (detalhes completos de um álbum)
app.get('/spotify/album/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const token = await getSpotifyToken();

    const response = await axios.get(`https://api.spotify.com/v1/albums/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { market: 'BR' },
    });

    const album = response.data;
    res.json({
      id: album.id,
      nomeAlbum: album.name,
      nomeArtista: album.artists.map(a => a.name).join(', '),
      ano: album.release_date ? album.release_date.substring(0, 4) : '',
      urlImagem: album.images && album.images[0] ? album.images[0].url : '',
      totalFaixas: album.total_tracks,
      generos: album.genres,
      label: album.label,
      popularidade: album.popularity,
    });
  } catch (error) {
    console.error('Erro Spotify album:', error.response?.data || error.message);
    res.status(500).json({ erro: 'Falha ao buscar álbum no Spotify.' });
  }
});

// ─────────────────────────────────────────────
//  INICIAR SERVIDOR
// ─────────────────────────────────────────────

const PORTA = process.env.PORT || 3000;
app.listen(PORTA, () => {
  console.log(`🚀 API do Spotikunai rodando em http://localhost:${PORTA}`);
  console.log(`🎵 Spotify proxy disponível em http://localhost:${PORTA}/spotify/search`);
});
