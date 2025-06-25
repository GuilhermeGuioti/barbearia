const connection = require('./connection');

const findUserByEmail = async (email) => {
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    const [users] = await connection.execute(query, [email]);
    return users[0];
};

module.exports = {
    findUserByEmail,
};