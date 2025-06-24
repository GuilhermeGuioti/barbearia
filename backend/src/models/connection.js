// Usamos o 'dotenv' para carregar as variáveis do arquivo .env
require('dotenv').config();

// Usamos o 'mysql2/promise' para ter suporte a async/await nas queries
const mysql = require('mysql2/promise');

// Criamos um "Pool de Conexões". É mais eficiente que criar uma nova conexão a cada query.
// O pool gerencia múltiplas conexões e as reutiliza.
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Exportamos a conexão para que outros arquivos possam usá-la para fazer queries.
module.exports = connection;