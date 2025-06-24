const connection = require('./connection');
const { getServiceDuration } = require('../utils/services'); // Importe nosso novo utilitário

const getAll = async () => {
    const query = 'SELECT * FROM agendamentos';
    const [agendamentos] = await connection.execute(query);
    return agendamentos;
};

const createAgendamento = async (agendamento) => {
    // Desestrutura o objeto para pegar cada campo individualmente.
    const { nome_cliente, servico, data_hora, telefone_cliente } = agendamento;

    const query = 'INSERT INTO agendamentos(nome_cliente, servico, data_hora, telefone_cliente) VALUES (?, ?, ?, ?)';

    // Executa a query, passando os valores em um array para evitar SQL Injection.
    const [result] = await connection.execute(query, [nome_cliente, servico, data_hora, telefone_cliente]);
    
    // Retorna o ID do agendamento que acabamos de criar.
    return { insertId: result.insertId };
};

const deleteAgendamento = async (id) => {
    const query = 'DELETE FROM agendamentos WHERE id = ?';
    
    // Executa a query, passando o ID como parâmetro para segurança.
    const [removed] = await connection.execute(query, [id]);
    
    // Retorna o resultado da operação de delete.
    return removed;
};

const updateAgendamento = async (id, agendamento) => {
    // Desestrutura o objeto para pegar os novos dados
    const { nome_cliente, servico, telefone_cliente, data_hora, status } = agendamento;

    // Monta a query de UPDATE
    const query = `
        UPDATE agendamentos
        SET nome_cliente = ?, servico = ?, telefone_cliente = ?, data_hora = ?, status = ?
        WHERE id = ?
    `;

    // Executa a query, passando os novos dados e o ID como parâmetros
    const [updated] = await connection.execute(query, [nome_cliente, servico, telefone_cliente, data_hora, status, id]);
    
    // Retorna o resultado da operação de update
    return updated;
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

module.exports = {
    getAll,
    createAgendamento,
    deleteAgendamento,
    updateAgendamento,
    findConflictingAgendamentos,
    getAgendamentosPorData,
};