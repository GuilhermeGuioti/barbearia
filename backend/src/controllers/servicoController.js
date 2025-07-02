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

module.exports = {
    getAll,
};