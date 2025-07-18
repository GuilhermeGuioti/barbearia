const configuracaoModel = require('../models/configuracaoModel');

const getSettings = async (_request, response) => {
    try {
        const settings = await configuracaoModel.getSettings();
        return response.status(200).json(settings);
    } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const updateSettings = async (request, response) => {
    try {
        await configuracaoModel.updateSettings(request.body);
        return response.status(204).send();
    } catch (error) {
        console.error('Erro ao atualizar configurações:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

module.exports = {
    getSettings,
    updateSettings,
};