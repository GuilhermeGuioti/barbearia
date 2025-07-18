const agendamentoModel = require('../models/agendamentoModel');

const createBloqueio = async (request, response) => {
    try {
        // Para um bloqueio, o "nome" pode ser o motivo, ex: "Pausa para o Café"
        const { motivo, data_hora, duracao_minutos } = request.body;

        const bloqueioData = {
            nome_cliente: motivo, // Usamos o campo nome_cliente para guardar o motivo
            data_hora,
            duracao_minutos,
        };

        const createdBloqueio = await agendamentoModel.createBloqueio(bloqueioData);
        return response.status(201).json(createdBloqueio);
    } catch (error) {
        console.error('Erro ao criar bloqueio:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const getAllBloqueios = async (_request, response) => {
    try {
        const bloqueios = await agendamentoModel.getAllBloqueios();
        return response.status(200).json(bloqueios);
    } catch (error) {
        console.error('Erro ao buscar bloqueios:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

module.exports = { 
    createBloqueio,
    getAllBloqueios
 };