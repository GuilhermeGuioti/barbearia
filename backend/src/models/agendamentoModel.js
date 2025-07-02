const connection = require('./connection');
const { getServiceDuration } = require('../utils/services'); // Importe nosso novo utilitário

const getAll = async () => {
    // Esta query agora "junta" as tabelas agendamentos e servicos
    const query = `
        SELECT 
            ag.id,
            ag.nome_cliente,
            ag.telefone_cliente,
            ag.data_hora,
            ag.status,
            s.nome AS servico_nome,  -- Pega o nome da tabela de serviços
            s.preco AS servico_preco -- Pega o preço da tabela de serviços
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

const getCountLast7Days = async () => {
    // Esta query SQL agrupa os agendamentos por dia e conta quantos existem em cada dia.
    // Ela pega os dados de 6 dias atrás até hoje.
    const query = `
        SELECT 
            DATE(data_hora) as dia, 
            COUNT(id) as total
        FROM agendamentos
        WHERE data_hora >= CURDATE() - INTERVAL 6 DAY AND data_hora < CURDATE() + INTERVAL 1 DAY
        GROUP BY DATE(data_hora)
        ORDER BY dia ASC;
    `;
    const [stats] = await connection.execute(query);
    return stats;
};

const getServiceStats = async () => {
    // A query agora une as tabelas 'agendamentos' e 'servicos'
    const query = `
        SELECT 
            s.nome AS servico,  -- Pega o NOME do serviço da tabela 'servicos'
            COUNT(ag.id) as total
        FROM 
            agendamentos ag
        JOIN 
            servicos s ON ag.servico_id = s.id
        WHERE 
            YEARWEEK(ag.data_hora, 1) = YEARWEEK(CURDATE(), 1)
        GROUP BY 
            s.nome -- Agrupa pelo nome do serviço
        ORDER BY 
            total DESC;
    `;
    const [stats] = await connection.execute(query);
    return stats;
};

const getStatusStatsThisWeek = async () => {
    // YEARWEEK(data_hora) retorna o ano e a semana de uma data.
    // YEARWEEK(CURDATE()) retorna o ano e a semana de hoje.
    // Comparamos os dois para pegar apenas os registros da semana corrente.
    const query = `
        SELECT status, COUNT(id) as total
        FROM agendamentos
        WHERE YEARWEEK(data_hora, 1) = YEARWEEK(CURDATE(), 1)
        GROUP BY status;
    `;
    const [stats] = await connection.execute(query);
    return stats;
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
};