const servicoModel = require('../models/servicoModel'); // Importa o novo model
const agendamentoModel = require('../models/agendamentoModel');

/**
 * Middleware para validar o corpo da requisição.
 * Agora verifica por 'servico_id'.
 */
const validateBody = (request, response, next) => {
    const { body } = request;
    const requiredFields = ['nome_cliente', 'telefone_cliente', 'data_hora', 'servico_id'];

    for (const field of requiredFields) {
        if (body[field] === undefined || body[field] === '') {
            return response.status(400).json({ message: `O campo "${field}" é obrigatório.` });
        }
    }
    next();
};

/**
 * Middleware para validar se o horário solicitado está disponível.
 * Agora busca a duração do serviço no banco de dados.
 */
const validateHorario = async (request, response, next) => {
    const { servico_id, data_hora } = request.body;

    try {
        // Busca os detalhes do serviço para saber sua duração
        const servico = await servicoModel.findById(servico_id);
        if (!servico) {
            return response.status(404).json({ message: 'Serviço não encontrado.' });
        }

        // Usa a duração vinda do banco de dados
        const duracao = servico.duracao_minutos;

        const conflitos = await agendamentoModel.findConflictingAgendamentos(data_hora, duracao);

        if (conflitos.length > 0) {
            return response.status(409).json({ message: 'Este horário já está ocupado.' });
        }
        
        next();

    } catch (error) {
        console.error('Erro ao validar horário:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

module.exports = {
    validateBody,
    validateHorario,
};