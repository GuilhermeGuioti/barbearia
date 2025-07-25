const agendamentoModel = require('../models/agendamentoModel');

const getStats = async (_request, response) => {
    try {
        const stats = await agendamentoModel.getCountLast7Days();
        return response.status(200).json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const getServiceStats = async (_request, response) => {
    try {
        const stats = await agendamentoModel.getServiceStats();
        return response.status(200).json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas de serviços:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const getStatusStats = async (_request, response) => {
    try {
        const stats = await agendamentoModel.getStatusStatsThisWeek();
        return response.status(200).json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas de status:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const getFaturamento = async (_request, response) => {
    try {
        const faturamento = await agendamentoModel.getFaturamentoSemana();
        // Se não houver faturamento, o valor será null. Retornamos 0 nesse caso.
        return response.status(200).json({ faturamentoTotal: faturamento.faturamentoTotal || 0 });
    } catch (error) {
        console.error('Erro ao buscar faturamento:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const getRevenueStats = async (_request, response) => {
    try {
        const revenue = await agendamentoModel.getRevenuePerDayOfWeek();
        return response.status(200).json(revenue);
    } catch (error) {
        console.error('Erro ao buscar estatísticas de faturamento:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

module.exports = {
    getStats,
    getServiceStats,
    getStatusStats,
    getFaturamento,
    getRevenueStats
};