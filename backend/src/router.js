const express = require('express');
const agendamentoController = require('./controllers/agendamentoController');
const disponibilidadeController = require('./controllers/disponibilidadeController');
const agendamentoMiddlewares = require('./middlewares/agendamentoMiddlewares');

const router = express.Router();

// Rota para BUSCAR todos agendamentos
router.get('/agendamentos', agendamentoController.getAllAgendamentos);

// Rota para CRIAR um novo agendamento
router.post(
    '/agendamentos',
    agendamentoMiddlewares.validateBody,
    agendamentoMiddlewares.validateHorario,
    agendamentoController.createAgendamento
);

// Rota para DELETAR um agendamento
router.delete('/agendamentos/:id', agendamentoController.deleteAgendamento);

// Rota para ATUALIZAR (UPDATE) um agendamento específico pelo ID
router.put(
    '/agendamentos/:id',
    agendamentoMiddlewares.validateBody, // Reutilizamos o mesmo middleware de validação
    agendamentoController.updateAgendamento
);

// Rota para verificar horários disponíveis em uma data
router.get('/disponibilidade', disponibilidadeController.getDisponibilidade);

module.exports = router;