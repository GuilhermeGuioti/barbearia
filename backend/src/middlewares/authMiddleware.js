const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (request, response, next) => {
    // 1. O token geralmente é enviado no cabeçalho (header) 'Authorization' da requisição.
    const authHeader = request.headers.authorization;

    // 2. Verifica se o cabeçalho de autorização existe.
    if (!authHeader) {
        return response.status(401).json({ message: 'Token não fornecido. Acesso negado.' });
    }

    // 3. O formato do token geralmente é "Bearer [token]". Vamos separar as duas partes.
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return response.status(401).json({ message: 'Erro no token.' });
    }

    const [scheme, token] = parts;

    // Verifica se o formato é "Bearer"
    if (!/^Bearer$/i.test(scheme)) {
        return response.status(401).json({ message: 'Token mal formatado.' });
    }

    // 4. Verifica se o token é válido usando nossa chave secreta.
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // Se houver um erro (token expirado, assinatura inválida), o acesso é negado.
            return response.status(401).json({ message: 'Token inválido ou expirado.' });
        }

        // 5. Se o token for válido, 'decoded' contém os dados que guardamos nele (id, nome).
        // Podemos adicionar o id do usuário na requisição para uso futuro nos controllers.
        request.userId = decoded.id;

        // 6. Tudo certo! Chama next() para deixar a requisição passar e chegar ao controller.
        return next();
    });
};

module.exports = authMiddleware;