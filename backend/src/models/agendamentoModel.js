const connection = require('./connection');
const { getServiceDuration } = require('../utils/services'); // Importe nosso novo utilitário

const getAll = async () => {
    const query = `
        SELECT 
            ag.id,
            ag.nome_cliente,
            ag.telefone_cliente,
            ag.data_hora,
            ag.status,
            ag.servico_id, -- << ADICIONE ESTA LINHA
            s.nome AS servico_nome,
            s.preco AS servico_preco
        FROM 
            agendamentos ag
        JOIN 
            servicos s ON ag.servico_id = s.id
        ORDER BY 
            ag.data_hora ASC;
    `;
    const [agendamentos] = await connection.execute(query);
    return agendamentos;
};

const createAgendamento = async (agendamento) => {
    // A propriedade 'servico' foi trocada por 'servico_id'
    const { nome_cliente, telefone_cliente, data_hora, servico_id, status } = agendamento;
    const query = 'INSERT INTO agendamentos(nome_cliente, telefone_cliente, data_hora, servico_id, status) VALUES (?, ?, ?, ?, ?)';
    
    const [createdAgendamento] = await connection.execute(query, [nome_cliente, telefone_cliente, data_hora, servico_id, status]);
    return { insertId: createdAgendamento.insertId };
};

const deleteAgendamento = async (id) => {
    const query = 'DELETE FROM agendamentos WHERE id = ?';
    
    // Executa a query, passando o ID como parâmetro para segurança.
    const [removed] = await connection.execute(query, [id]);
    
    // Retorna o resultado da operação de delete.
    return removed;
};

const updateAgendamento = async (id, agendamento) => {
    // A propriedade 'servico' foi trocada por 'servico_id'
    const { nome_cliente, telefone_cliente, data_hora, servico_id, status } = agendamento;
    const query = 'UPDATE agendamentos SET nome_cliente = ?, telefone_cliente = ?, data_hora = ?, servico_id = ?, status = ? WHERE id = ?';

    const [updatedAgendamento] = await connection.execute(query, [nome_cliente, telefone_cliente, data_hora, servico_id, status, id]);
    return updatedAgendamento;
};

const findConflictingAgendamentos = async (startTime, durationInMinutes) => {
    // A query para verificar sobreposição de horários. É complexa, mas poderosa.
    // Ela verifica se um novo agendamento (A) conflita com qualquer agendamento existente (B).
    const query = `
        SELECT * FROM agendamentos
        WHERE 
            -- Condição 1: Um agendamento existente (B) começa durante o novo agendamento (A).
            (data_hora >= ? AND data_hora < DATE_ADD(?, INTERVAL ? MINUTE))
    `;

    // Parâmetros para a query: [Início de A, Início de A, Duração de A]
    const params = [startTime, startTime, durationInMinutes];

    const [conflicts] = await connection.execute(query, params);
    
    // Retorna a lista de agendamentos conflitantes. Se estiver vazia, o horário está livre.
    return conflicts;
};

const getAgendamentosPorData = async (data) => {
    // Busca agendamentos que começam no dia especificado (ignora a hora).
    const query = 'SELECT data_hora FROM agendamentos WHERE DATE(data_hora) = ?';
    const [agendamentos] = await connection.execute(query, [data]);
    return agendamentos;
};

// Função para o gráfico de barras
const getCountLast7Days = async () => {
    const query = `
        SELECT DATE(data_hora) as dia, COUNT(id) as total
        FROM agendamentos
        WHERE YEARWEEK(data_hora, 0) = YEARWEEK(CURDATE(), 0) -- Usando 0 para Domingo
        GROUP BY DATE(data_hora) ORDER BY dia ASC;
    `;
    const [stats] = await connection.execute(query);
    return stats;
};

// Função para o gráfico de serviços
const getServiceStats = async () => {
    const query = `
        SELECT s.nome AS servico, COUNT(ag.id) as total
        FROM agendamentos ag JOIN servicos s ON ag.servico_id = s.id
        WHERE YEARWEEK(ag.data_hora, 0) = YEARWEEK(CURDATE(), 0) -- Usando 0 para Domingo
        GROUP BY s.nome ORDER BY total DESC;
    `;
    const [stats] = await connection.execute(query);
    return stats;
};

// Função para o gráfico de status
const getStatusStatsThisWeek = async () => {
    const query = `
        SELECT status, COUNT(id) as total
        FROM agendamentos
        WHERE YEARWEEK(data_hora, 0) = YEARWEEK(CURDATE(), 0) -- Usando 0 para Domingo
        GROUP BY status;
    `;
    const [stats] = await connection.execute(query);
    return stats;
};

const getFaturamentoSemana = async () => {
    // SUM(s.preco) soma os preços.
    // O status é filtrado para 'Concluído'.
    // A data é filtrada pela semana atual (Dom-Sáb).
    const query = `
        SELECT SUM(s.preco) AS faturamentoTotal
        FROM agendamentos ag
        JOIN servicos s ON ag.servico_id = s.id
        WHERE 
            ag.status = 'Concluído' AND
            YEARWEEK(ag.data_hora, 0) = YEARWEEK(CURDATE(), 0);
    `;
    const [[resultado]] = await connection.execute(query); // Usamos [[resultado]] para pegar o primeiro objeto do array
    return resultado;
};


//Calcula o faturamento por dia da semana atual (Dom-Sáb),
const getRevenuePerDayOfWeek = async () => {
    const query = `
        SELECT 
            DATE(ag.data_hora) as dia, 
            SUM(s.preco) as total
        FROM 
            agendamentos ag
        JOIN 
            servicos s ON ag.servico_id = s.id
        WHERE 
            ag.status = 'Concluído' AND
            YEARWEEK(ag.data_hora, 0) = YEARWEEK(CURDATE(), 0)
        GROUP BY 
            DATE(ag.data_hora)
        ORDER BY 
            dia ASC;
    `;
    const [revenue] = await connection.execute(query);
    return revenue;
};

const getUniqueClientes = async () => {
    const query = `
        SELECT 
            nome_cliente, 
            telefone_cliente, 
            MAX(data_hora) as ultima_visita
        FROM 
            agendamentos
        GROUP BY 
            nome_cliente, telefone_cliente
        ORDER BY 
            nome_cliente ASC;
    `;
    const [clientes] = await connection.execute(query);
    return clientes;
};

module.exports = {
    getAll,
    createAgendamento,
    deleteAgendamento,
    updateAgendamento,
    findConflictingAgendamentos,
    getAgendamentosPorData,
    getCountLast7Days,
    getServiceStats,
    getStatusStatsThisWeek,
    getFaturamentoSemana,
    getRevenuePerDayOfWeek,
    getUniqueClientes
};