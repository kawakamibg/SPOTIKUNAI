const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Memória do Servidor (Array de Álbuns)
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

// 1. READ: Método GET (Consultar Todos) -> Slide 1
app.get('/albuns', (req, res) => {
  res.json(albuns); // Envia o array inteiro com status 200 OK
});

// 1. READ: Método GET (Consultar Específico por ID) -> Slide 1[cite: 4, 8]
app.get('/albuns/:id', (req, res) => {
  const id = Number(req.params.id);
  const album = albuns.find(a => a.id === id);

  if (!album) {
    return res.status(404).json({ mensagem: 'Não encontrado' });
  }

  res.json(album);
});

// 2. CREATE: Método POST (Cadastrar) -> Slide 2
app.post('/albuns', (req, res) => {
  const { nomeAlbum, nomeArtista, ano, urlImagem } = req.body;

  // Validação dos dados de entrada
  if (!nomeAlbum || !nomeArtista) {
    return res.status(400).json({ erro: 'Dados inválidos' });
  }

  const novoAlbum = {
    id: proximoId++,
    nomeAlbum,
    nomeArtista,
    ano: Number(ano) || 2024,
    urlImagem: urlImagem || ''
  };

  albuns.push(novoAlbum);
  res.status(201).json(novoAlbum); // Retorna 201 Created com o novo objeto
});

// 3. UPDATE: Método PUT (Atualizar) -> Slide 3[cite: 6, 8]
app.put('/albuns/:id', (req, res) => {
  const id = Number(req.params.id);
  const album = albuns.find(a => a.id === id);

  if (!album) {
    return res.status(404).json({ mensagem: 'Não encontrado' });
  }

  const { nomeAlbum, nomeArtista, ano, urlImagem } = req.body;

  if (!nomeAlbum || !nomeArtista) {
    return res.status(400).json({ erro: 'Faltam dados' });
  }

  // Atualiza na memória
  album.nomeAlbum = nomeAlbum;
  album.nomeArtista = nomeArtista;
  album.ano = Number(ano);
  album.urlImagem = urlImagem;

  res.json(album); // Retorna 200 OK com o item atualizado
});

// 4. DELETE: Método DELETE (Excluir) -> Slide 4[cite: 7, 8]
app.delete('/albuns/:id', (req, res) => {
  const id = Number(req.params.id);
  const indice = albuns.findIndex(a => a.id === id);

  if (indice === -1) {
    return res.status(404).json({ erro: 'Não encontrado' });
  }

  albuns.splice(indice, 1); // Remove 1 item
  res.status(204).send(); // Resposta vazia (204 No Content)
});

// Iniciar o Servidor
const PORTA = 3000;
app.listen(PORTA, () => {
  console.log(`🚀 API do Spotikunai rodando em http://localhost:${PORTA}`);
});