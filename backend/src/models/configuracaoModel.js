const connection = require('./connection');

const getSettings = async () => {
    const query = 'SELECT * FROM configuracoes WHERE id = 1';
    const [[settings]] = await connection.execute(query); // Pega o primeiro objeto do resultado
    return settings;
};

const updateSettings = async (settings) => {
    const { horario_abertura, horario_fechamento, almoco_inicio, almoco_fim } = settings;
    const query = `
        UPDATE configuracoes 
        SET horario_abertura = ?, horario_fechamento = ?, almoco_inicio = ?, almoco_fim = ? 
        WHERE id = 1
    `;
    const [result] = await connection.execute(query, [horario_abertura, horario_fechamento, almoco_inicio, almoco_fim]);
    return result;
};

module.exports = {
    getSettings,
    updateSettings,
};