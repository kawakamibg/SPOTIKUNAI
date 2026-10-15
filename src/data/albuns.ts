export interface Album {
  id: string;
  nomeAlbum: string;
  nomeArtista: string;
  dataLancamento: string;
  urlImagem: string;
  nota: number;
  genero?: string;
  descricao?: string;
}

export const ALBUNS_INICIAIS: Album[] = [
  {
    id: '1',
    nomeAlbum: 'The Dark Side of the Moon',
    nomeArtista: 'Pink Floyd',
    dataLancamento: '1973',
    urlImagem: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/The_Dark_Side_of_the_Moon_Cover.svg',
    nota: 5,
    genero: 'Rock Progressivo',
    descricao: 'Um dos álbuns mais aclamados e influentes da história da música, explorando temas como ganância, tempo, conflito e doença mental.'
  },
  {
    id: '2',
    nomeAlbum: 'Abbey Road',
    nomeArtista: 'The Beatles',
    dataLancamento: '1969',
    urlImagem: '',
    nota: 5,
    genero: 'Rock / Pop',
    descricao: 'O último álbum gravado em conjunto pelos quatro membros dos Beatles, famoso por sua icônica foto na faixa de pedestres.'
  },
  {
    id: '3',
    nomeAlbum: 'Random Access Memories',
    nomeArtista: 'Daft Punk',
    dataLancamento: '2013',
    urlImagem: '',
    nota: 4,
    genero: 'Música Eletrônica / Disco',
    descricao: 'Uma celebração da música disco e funk do final dos anos 70 e início dos 80, vencedora do Grammy de Álbum do Ano.'
  },
  {
    id: '4',
    nomeAlbum: 'To Pimp a Butterfly',
    nomeArtista: 'Kendrick Lamar',
    dataLancamento: '2015',
    urlImagem: '',
    nota: 5,
    genero: 'Hip-Hop / Jazz Rap',
    descricao: 'Obra-prima conceitual e política que funde hip-hop com jazz, funk e spoken word.'
  },
  {
    id: '5',
    nomeAlbum: 'Currents',
    nomeArtista: 'Tame Impala',
    dataLancamento: '2015',
    urlImagem: '',
    nota: 4,
    genero: 'Psychedelic Pop / Synthpop',
    descricao: 'Marcado por sintetizadores envolventes, graves marcantes e produção minuciosa conduzida por Kevin Parker.'
  },
];