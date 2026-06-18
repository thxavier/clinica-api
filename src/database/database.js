const Database = require('better-sqlite3');
const path = require('path');

// Cria (ou abre) o arquivo do banco de dados na raiz do projeto
const db = new Database(path.join(__dirname, '../../clinica.db'));

// Ativa chaves estrangeiras (necessário no SQLite)
db.pragma('foreign_keys = ON');

// Cria a tabela de pacientes se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS pacientes (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nome      TEXT    NOT NULL,
    cpf       TEXT    NOT NULL UNIQUE,
    email     TEXT    NOT NULL,
    telefone  TEXT    NOT NULL,
    data_nasc TEXT    NOT NULL,
    created_at TEXT   DEFAULT (datetime('now'))
  )
`);

// Cria a tabela de consultas se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS consultas (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id  INTEGER NOT NULL,
    medico       TEXT    NOT NULL,
    especialidade TEXT   NOT NULL,
    data_consulta TEXT   NOT NULL,
    status       TEXT    NOT NULL DEFAULT 'agendada',
    observacoes  TEXT,
    created_at   TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE
  )
`);

console.log('✅ Banco de dados conectado e tabelas criadas.');

module.exports = db;