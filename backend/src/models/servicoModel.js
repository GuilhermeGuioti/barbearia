const connection = require('./connection');

const findById = async (id) => {
    const query = 'SELECT * FROM servicos WHERE id = ?';
    const [servicos] = await connection.execute(query, [id]);
    return servicos[0];
};

const getAll = async () => {
    const query = 'SELECT * FROM servicos';
    const [servicos] = await connection.execute(query);
    return servicos;
};

const createServico = async (servico) => {
    const { nome, preco, duracao_minutos } = servico;
    const query = 'INSERT INTO servicos(nome, preco, duracao_minutos) VALUES (?, ?, ?)';
    const [result] = await connection.execute(query, [nome, preco, duracao_minutos]);
    return { insertId: result.insertId };
};

const updateServico = async (id, servico) => {
    const { nome, preco, duracao_minutos } = servico;
    const query = 'UPDATE servicos SET nome = ?, preco = ?, duracao_minutos = ? WHERE id = ?';
    const [result] = await connection.execute(query, [nome, preco, duracao_minutos, id]);
    return result;
};

const deleteServico = async (id) => {
    const query = 'DELETE FROM servicos WHERE id = ?';
    const [result] = await connection.execute(query, [id]);
    return result;
};


module.exports = {
    findById,
    getAll,
    createServico,
    updateServico,
    deleteServico,
};