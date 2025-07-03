const express = require('express');

// Controladores
const agendamentoController = require('./controllers/agendamentoController');
const disponibilidadeController = require('./controllers/disponibilidadeController');
const usuarioController = require('./controllers/usuarioController');
const dashboardController = require('./controllers/dashboardController');
const servicoController = require('./controllers/servicoController');

// Middlewares
const agendamentoMiddlewares = require('./middlewares/agendamentoMiddlewares');
const authMiddleware = require('./middlewares/authMiddleware');

const router = express.Router();


// ======================================================
// --- ROTAS PÚBLICAS (Acessíveis por qualquer um) ---
// ======================================================

// Rota para o cliente verificar horários disponíveis
router.get('/disponibilidade', disponibilidadeController.getDisponibilidade);

// Rota para o cliente criar um novo agendamento
router.post(
    '/agendamentos',
    agendamentoMiddlewares.validateBody,
    agendamentoMiddlewares.validateHorario,
    agendamentoController.createAgendamento
);

// Rota para o proprietário fazer login
router.post('/login', usuarioController.login);

router.get('/servicos', servicoController.getAll);

// =================================================================
// --- ROTAS PROTEGIDAS (Acessíveis apenas com token de login) ---
// =================================================================

// Rota para o proprietário ver TODOS os agendamentos
router.get('/agendamentos', authMiddleware, agendamentoController.getAllAgendamentos);

// Rota para o proprietário ATUALIZAR um agendamento (usando PUT)
router.put(
    '/agendamentos/:id',
    authMiddleware, // Garante que só o proprietário logado pode atualizar
    agendamentoMiddlewares.validateBody,
    agendamentoController.updateAgendamento
);

// Rota para o proprietário DELETAR um agendamento
router.delete('/agendamentos/:id', authMiddleware, agendamentoController.deleteAgendamento);

router.get('/dashboard/stats', authMiddleware, dashboardController.getStats);

router.get('/dashboard/services', authMiddleware, dashboardController.getServiceStats);

router.get('/dashboard/status-stats', authMiddleware, dashboardController.getStatusStats);

router.get('/dashboard/faturamento', authMiddleware, dashboardController.getFaturamento);

router.get('/dashboard/revenue-stats', authMiddleware, dashboardController.getRevenueStats);


module.exports = router;