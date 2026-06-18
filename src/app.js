const express = require('express');
const cors = require('cors');

const pacientesRoutes = require('./routes/pacientes');
const consultasRoutes = require('./routes/consultas');

const app = express();

// Middlewares
app.use(cors());                          // Permite requisições de qualquer origem
app.use(express.json());                  // Faz o Express entender JSON no corpo da requisição

// Rota inicial para testar se a API está rodando
app.get('/', (req, res) => {
  res.json({
    mensagem: '🏥 API da Clínica está funcionando!',
    rotas: {
      pacientes: '/pacientes',
      consultas: '/consultas'
    }
  });
});

// Rotas da aplicação
app.use('/pacientes', pacientesRoutes);
app.use('/consultas', consultasRoutes);

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ sucesso: false, mensagem: 'Rota não encontrada.' });
});

module.exports = app;