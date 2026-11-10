const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function conectarBanco() {
  const db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Garante a criação automática das tabelas essenciais no SQLite
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      fotoPerfil TEXT
    );

    CREATE TABLE IF NOT EXISTS albuns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nomeAlbum TEXT NOT NULL,
      nomeArtista TEXT NOT NULL,
      ano INTEGER,
      urlImagem TEXT,
      nota INTEGER,
      descricao TEXT,
      usuarioId INTEGER
    );
  `);

  return db;
}

module.exports = conectarBanco;