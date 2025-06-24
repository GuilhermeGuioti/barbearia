// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

const app = require('./app');

// Define a porta onde o servidor vai rodar.
// Ele vai tentar usar a porta definida no arquivo .env, ou usará a 3333 como padrão.
const PORT = process.env.PORT || 5000;

// Inicia o servidor e o faz "escutar" na porta definida.
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));