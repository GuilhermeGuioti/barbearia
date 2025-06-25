const usuarioModel = require('../models/usuarioModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (request, response) => {
    try {
        const { email, senha } = request.body;

        // 1. Validação básica para garantir que email e senha foram enviados
        if (!email || !senha) {
            return response.status(400).json({ message: 'Email e senha são obrigatórios.' });
        }

        // 2. Usa o model para encontrar o usuário no banco pelo email
        const user = await usuarioModel.findUserByEmail(email);

        // Se o usuário não for encontrado, retorna um erro genérico
        if (!user) {
            return response.status(401).json({ message: 'Credenciais inválidas.' }); // 401 Unauthorized
        }

        // 3. Compara a senha enviada pelo cliente com a senha (hash) salva no banco
        const passwordMatch = await bcrypt.compare(senha, user.senha);

        // Se as senhas não baterem, retorna o mesmo erro genérico
        if (!passwordMatch) {
            return response.status(401).json({ message: 'Credenciais inválidas.' });
        }
        
        // 4. Se a senha estiver correta, gera o Token JWT
        const token = jwt.sign(
            { id: user.id, nome: user.nome }, // Informações que queremos guardar no token (payload)
            process.env.JWT_SECRET,            // Chave secreta para assinar o token
            { expiresIn: '8h' }                // Define o tempo de expiração do token
        );

        // 5. Retorna o token para o cliente
        return response.status(200).json({ token });

    } catch (error) {
        console.error('Erro no login:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

module.exports = {
    login,
};