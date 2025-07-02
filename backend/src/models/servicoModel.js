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

module.exports = {
    findById,
    getAll,
};