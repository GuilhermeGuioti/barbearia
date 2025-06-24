// Este objeto mapeia o nome do serviço para sua duração em minutos.
const DURATIONS = {
    'Corte': 30,
    'Barba': 30,
    'Corte e Barba': 60,
};

const getServiceDuration = (serviceName) => {
  return DURATIONS[serviceName] || 60; // Retorna 60 min (1h) se o serviço não estiver na lista.
};

module.exports = {
  getServiceDuration,
};