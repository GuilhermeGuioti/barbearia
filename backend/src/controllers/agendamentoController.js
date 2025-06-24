// O controller precisa importar o model para poder interagir com o banco de dados.
const agendamentoModel = require('../models/agendamentoModel');

// Esta é a função que será chamada pela rota de criação.
const createAgendamento = async (request, response) => {
    try {
        // 1. O controller chama a função createAgendamento do model.
        //    Ele passa os dados do corpo da requisição (que o middleware já validou).
        const createdAgendamento = await agendamentoModel.createAgendamento(request.body);

        // 2. Se tudo der certo no model, ele retorna uma resposta de sucesso.
        //    O status 201 significa "Created" (Criado), que é o correto para um POST.
        return response.status(201).json(createdAgendamento);

    } catch (error) {
        // 3. Se ocorrer qualquer erro durante o processo (ex: falha de conexão com o banco),
        //    este bloco `catch` será executado.
        console.error('Erro ao criar agendamento:', error); // Loga o erro no terminal para depuração.
        
        // Retorna uma mensagem de erro genérica para o usuário.
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const getAllAgendamentos = async (_request, response) => {
    try {
        // 1. Chama a função getAll do model.
        const agendamentos = await agendamentoModel.getAll();

        // 2. Retorna uma resposta de sucesso (200 OK) com a lista de agendamentos em JSON.
        return response.status(200).json(agendamentos);

    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
}

const deleteAgendamento = async (request, response) => {
    try {
        // O ID vem dos "parâmetros da rota", que estão em request.params.
        const { id } = request.params;

        // Chama a função do model para deletar o registro no banco.
        await agendamentoModel.deleteAgendamento(id);

        // Retorna uma resposta de sucesso SEM corpo (body).
        // O status 204 "No Content" é o ideal para uma operação de DELETE bem-sucedida.
        return response.status(204).send();

    } catch (error) {
        console.error('Erro ao deletar agendamento:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};

const updateAgendamento = async (request, response) => {
    try {
        // Pega o ID dos parâmetros da rota.
        const { id } = request.params;
        
        // Chama a função do model para atualizar, passando o ID e os novos dados do corpo da requisição.
        await agendamentoModel.updateAgendamento(id, request.body);

        // Retorna uma resposta de sucesso SEM corpo (body).
        // O status 204 "No Content" é o ideal para uma operação de UPDATE bem-sucedida.
        return response.status(204).send();

    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        return response.status(500).json({ message: 'Erro interno no servidor' });
    }
};



module.exports = {
    createAgendamento,
    getAllAgendamentos,
    deleteAgendamento,
    updateAgendamento
};