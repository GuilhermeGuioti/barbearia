// Este script é executado separadamente para criar o primeiro usuário admin.
const bcrypt = require('bcrypt');
const connection = require('../src/models/connection'); // Precisamos navegar para fora da pasta 'scripts'

// --- Defina aqui os dados do proprietário ---
const adminUser = {
    nome: 'admin',
    email: 'admin@admin.com',
    senhaPura: 'admin' // Use uma senha forte aqui!
};

const saltRounds = 10;

// Função principal que faz todo o trabalho
const createAdminUser = async () => {
    console.log('Iniciando criação do usuário administrador...');

    try {
        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(adminUser.senhaPura, saltRounds);
        console.log('Senha criptografada com sucesso.');

        // Prepara a query SQL
        const query = 'INSERT INTO usuarios(nome, email, senha) VALUES (?, ?, ?)';
        
        // Executa a query
        await connection.execute(query, [adminUser.nome, adminUser.email, hashedPassword]);
        
        console.log('✅ Usuário administrador criado com sucesso!');
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   Senha: (a que você definiu acima)`);

    } catch (error) {
        // Trata erros comuns, como email duplicado
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('❌ Erro: Este email já existe no banco de dados.');
        } else {
            console.error('❌ Erro ao criar o usuário administrador:', error);
        }
    } finally {
        // Fecha a conexão com o banco, já que este é um script único
        await connection.end();
        console.log('Conexão com o banco de dados encerrada.');
    }
};

// Executa a função
createAdminUser();