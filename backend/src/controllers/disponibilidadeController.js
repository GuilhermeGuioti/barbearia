const agendamentoModel = require('../models/agendamentoModel');
const { getServiceDuration } = require('../utils/services');

const getDisponibilidade = async (request, response) => {
    try {
        // 1. Pega a data da query string da URL (ex: ?data=2025-07-25)
        const { data } = request.query;

        // Se a data não for fornecida, retorna um erro.
        if (!data) {
            return response.status(400).json({ message: 'A data é obrigatória.' });
        }

        // --- Regras de Negócio (podem ser ajustadas) ---
        const diaDeTrabalhoInicio = 9 * 60; // 9:00 em minutos
        const diaDeTrabalhoFim = 18 * 60;   // 18:00 em minutos
        const almocoInicio = 12 * 60;       // 12:00 em minutos
        const almocoFim = 13 * 60;          // 13:00 em minutos
        const intervaloMinutos = 60;        // Os horários serão mostrados de 30 em 30 minutos

        // 2. Busca no banco todos os agendamentos para o dia selecionado.
        const agendamentosDoDia = await agendamentoModel.getAgendamentosPorData(data); // PRECISAREMOS CRIAR ESTA FUNÇÃO NO MODEL

        const horariosDisponiveis = [];

        // 3. Itera sobre o dia de trabalho, de 30 em 30 minutos.
        for (let i = diaDeTrabalhoInicio; i < diaDeTrabalhoFim; i += intervaloMinutos) {
            
            // Pula o horário de almoço
            if (i >= almocoInicio && i < almocoFim) {
                continue;
            }

            const hora = String(Math.floor(i / 60)).padStart(2, '0');
            const minuto = String(i % 60).padStart(2, '0');
            const horarioAtual = `${hora}:${minuto}`;

            // 4. Verifica se o horário atual está ocupado
            const horarioOcupado = agendamentosDoDia.some(agendamento => {
                const agendamentoHora = new Date(agendamento.data_hora).getHours();
                const agendamentoMinuto = new Date(agendamento.data_hora).getMinutes();
                const agendamentoEmMinutos = (agendamentoHora * 60) + agendamentoMinuto;

                // Simplificação: Assume que cada agendamento ocupa apenas o slot de 30 min.
                // Uma lógica mais avançada consideraria a duração do serviço.
                return i === agendamentoEmMinutos;
            });
            
            if (!horarioOcupado) {
                horariosDisponiveis.push(horarioAtual);
            }
        }
        
        // 5. Retorna a lista de horários disponíveis.
        return response.status(200).json(horariosDisponiveis);

    } catch (error) {
        console.error('Erro ao buscar disponibilidade:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

module.exports = {
  getDisponibilidade
}