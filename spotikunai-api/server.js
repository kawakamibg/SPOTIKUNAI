const express = require('express');
const cors = require('cors');
const conectarBanco = require('./db');

try {
  require('dotenv').config();
} catch (e) {
  // Ignora se o ficheiro .env não existir
}

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

let db;

// Credenciais do Spotify Developer
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '188080a6d78b4f76960f9df95d78eff6';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || 'c3490384c4e74d0291b84065c0ddf9b3';

let spotifyToken = '';
let tokenExpirationTime = 0;

// Conexão ao banco SQLite
conectarBanco()
  .then(bancoInstancia => {
    db = bancoInstancia;
    console.log('📦 Banco de Dados SQLite conectado com sucesso!');
  })
  .catch(err => {
    console.error('❌ Erro ao conectar no SQLite:', err);
  });

// Função para obter o Token de Acesso do Spotify
async function getSpotifyToken() {
  const agora = Date.now();
  if (spotifyToken && agora < tokenExpirationTime) {
    return spotifyToken;
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();

  if (!response.ok) {
    spotifyToken = '';
    tokenExpirationTime = 0;
    throw new Error(data.error_description || data.error || 'Falha de autenticação');
  }

  spotifyToken = data.access_token;
  tokenExpirationTime = agora + (data.expires_in - 60) * 1000;
  return spotifyToken;
}

// Busca alternativa via iTunes API (sem limites de quota ou chaves)
async function buscarNoITunes(termo) {
  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(termo)}&entity=album&limit=20`
    );
    const data = await response.json();
    
    if (!data.results) return [];

    return data.results.map(item => ({
      id: String(item.collectionId),
      idiTunes: String(item.collectionId),
      nomeAlbum: item.collectionName || 'Sem Nome',
      nomeArtista: item.artistName || 'Artista Desconhecido',
      ano: item.releaseDate ? parseInt(item.releaseDate.split('-')[0]) : 2024,
      urlImagem: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '300x300bb') : ''
    }));
  } catch (err) {
    console.error('❌ Erro na busca do iTunes:', err.message);
    return [];
  }
}

// ----------------------------------------------------
// ROTAS DA API
// ----------------------------------------------------

// 1. Rota de Busca com Fallback Automático
app.get('/spotify/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json([]);
    }

    const termo = q.trim();

    // Tenta buscar no Spotify primeiro
    try {
      const token = await getSpotifyToken();
      
      const spotifyRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(termo)}&type=album&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await spotifyRes.json();

      if (spotifyRes.ok && data.albums?.items) {
        const albunsFormatados = data.albums.items.map(item => ({
          id: item.id,
          idiTunes: item.id,
          nomeAlbum: item.name,
          nomeArtista: item.artists ? item.artists.map(a => a.name).join(', ') : 'Artista Desconhecido',
          ano: item.release_date ? parseInt(item.release_date.split('-')[0]) : 2024,
          urlImagem: item.images && item.images[0] ? item.images[0].url : ''
        }));

        if (albunsFormatados.length > 0) {
          return res.json(albunsFormatados);
        }
      }
      
      console.warn('⚠️ Spotify retornou erro ou 0 resultados. Ativando fallback para o iTunes...');
    } catch (spotifyErr) {
      console.warn('⚠️ Falha no Spotify:', spotifyErr.message, '- Redirecionando para o iTunes...');
    }

    // Se o Spotify falhar ou retornar erro, busca no iTunes automaticamente
    const albunsITunes = await buscarNoITunes(termo);
    res.json(albunsITunes);

  } catch (error) {
    console.error('❌ Erro geral na busca:', error.message);
    res.json([]);
  }
});

// 2. Listar álbuns salvos
app.get('/albuns', async (req, res) => {
  try {
    if (!db) return res.json([]);
    const albuns = await db.all('SELECT * FROM albuns ORDER BY id DESC');
    res.json(albuns);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar álbuns do banco.' });
  }
});

// 3. Cadastrar álbum
app.post('/albuns', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ erro: 'Banco não inicializado' });
    const { nomeAlbum, nomeArtista, ano, urlImagem, nota, descricao, usuarioId } = req.body;

    const resultado = await db.run(
      `INSERT INTO albuns (nomeAlbum, nomeArtista, ano, urlImagem, nota, descricao, usuarioId) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nomeAlbum || 'Sem título',
        nomeArtista || 'Desconhecido',
        Number(ano) || 2024,
        urlImagem || '',
        nota || 5,
        descricao || '',
        usuarioId || null
      ]
    );

    res.status(201).json({
      id: resultado.lastID,
      nomeAlbum,
      nomeArtista,
      ano: Number(ano) || 2024,
      urlImagem: urlImagem || '',
      nota: nota || 5,
      descricao: descricao || '',
      usuarioId: usuarioId || null
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar álbum.' });
  }
});

// 4. Eliminar álbum
app.delete('/albuns/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ erro: 'Banco não inicializado' });
    const { id } = req.params;
    await db.run('DELETE FROM albuns WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir álbum.' });
  }
});

// 5. Atualizar álbum
app.put('/albuns/:id', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ erro: 'Banco não inicializado' });

    const { id } = req.params;
    const { nomeAlbum, nomeArtista, ano, urlImagem, nota, descricao, usuarioId } = req.body;

    const resultado = await db.run(
      `UPDATE albuns
       SET nomeAlbum = ?, nomeArtista = ?, ano = ?, urlImagem = ?, nota = ?, descricao = ?, usuarioId = ?
       WHERE id = ?`,
      [
        nomeAlbum || 'Sem título',
        nomeArtista || 'Desconhecido',
        Number(ano) || 2024,
        urlImagem || '',
        Number(nota) || 5,
        descricao || '',
        usuarioId || null,
        id
      ]
    );

    if (resultado.changes === 0) {
      return res.status(404).json({ erro: 'Álbum não encontrado.' });
    }

    const albumAtualizado = await db.get('SELECT * FROM albuns WHERE id = ?', [id]);
    res.json(albumAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar álbum:', error);
    res.status(500).json({ erro: 'Erro ao atualizar álbum.' });
  }
});

// Inicialização
const PORTA = 3000;
app.listen(PORTA, '0.0.0.0', () => {
  console.log(`🚀 API do Spotikunai rodando em http://localhost:${PORTA}`);
});