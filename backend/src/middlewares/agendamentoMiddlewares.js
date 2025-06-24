const agendamentoModel = require('../models/agendamentoModel');
const { getServiceDuration } = require('../utils/services');

const validateBody = (request, response, next) => {
    // Pega o corpo da requisição para facilitar o acesso.
    const { body } = request;

    // --- Validação para o campo 'nome_cliente' ---
    if (body.nome_cliente === undefined) {
        return response.status(400).json({ message: 'O campo "nome_cliente" é obrigatório.' });
    }
    if (body.nome_cliente === '') {
        return response.status(400).json({ message: 'O campo "nome_cliente" não pode ser vazio.' });
    }

    // --- Validação para o campo 'servico' ---
    if (body.servico === undefined) {
        return response.status(400).json({ message: 'O campo "servico" é obrigatório.' });
    }
    if (body.servico === '') {
        return response.status(400).json({ message: 'O campo "servico" não pode ser vazio.' });
    }

    // --- Validação para o campo 'telefone_cliente' ---
    // (Como definimos no banco que é obrigatório, a validação aqui também deve ser)
    if (body.telefone_cliente === undefined) {
        return response.status(400).json({ message: 'O campo "telefone_cliente" é obrigatório.' });
    }
    if (body.telefone_cliente === '') {
        return response.status(400).json({ message: 'O campo "telefone_cliente" não pode ser vazio.' });
    }

    // --- Validação para o campo 'data_hora' ---
    if (body.data_hora === undefined) {
        return response.status(400).json({ message: 'O campo "data_hora" é obrigatório.' });
    }
    if (body.data_hora === '') {
        return response.status(400).json({ message: 'O campo "data_hora" não pode ser vazio.' });
    }

    // Se todas as validações acima passarem, chama a próxima função do fluxo (o controller).
    next();
};

const validateHorario = async (request, response, next) => {
    const { servico, data_hora } = request.body;

    // 1. Pega a duração do serviço solicitado.
    const duration = getServiceDuration(servico);

    // 2. Chama a função do model para encontrar conflitos.
    const conflictingAgendamentos = await agendamentoModel.findConflictingAgendamentos(data_hora, duration);

    // 3. Se a lista de conflitos tiver algum item, significa que o horário está ocupado.
    if (conflictingAgendamentos.length > 0) {
        // Retorna um erro 409 Conflict.
        return response.status(409).json({ message: 'Este horário já está ocupado.' });
    }

    // 4. Se não houver conflitos, permite que a requisição continue para o Controller.
    next();
};

module.exports = {
    validateBody,
    validateHorario
};