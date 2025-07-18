const servicoModel = require('../models/servicoModel');

const getAll = async (_request, response) => {
    try {
        const servicos = await servicoModel.getAll();
        return response.status(200).json(servicos);
    } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const createServico = async (request, response) => {
    try {
        const createdServico = await servicoModel.createServico(request.body);
        return response.status(201).json(createdServico);
    } catch (error) {
        console.error('Erro ao criar serviço:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const updateServico = async (request, response) => {
    try {
        const { id } = request.params;
        await servicoModel.updateServico(id, request.body);
        return response.status(204).send();
    } catch (error) {
        console.error('Erro ao atualizar serviço:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const deleteServico = async (request, response) => {
    try {
        const { id } = request.params;
        await servicoModel.deleteServico(id);
        return response.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar serviço:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

module.exports = {
    getAll,
    createServico,
    updateServico,
    deleteServico,
};