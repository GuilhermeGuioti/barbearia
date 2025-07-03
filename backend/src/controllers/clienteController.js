const agendamentoModel = require('../models/agendamentoModel'); // Reutilizamos o agendamentoModel

const getAllClientes = async (_request, response) => {
    try {
        const clientes = await agendamentoModel.getUniqueClientes();
        return response.status(200).json(clientes);
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

module.exports = {
    getAllClientes,
};