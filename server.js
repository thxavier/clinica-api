const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Rotas disponíveis:`);
  console.log(`   GET    http://localhost:${PORT}/pacientes`);
  console.log(`   GET    http://localhost:${PORT}/pacientes/:id`);
  console.log(`   POST   http://localhost:${PORT}/pacientes`);
  console.log(`   PUT    http://localhost:${PORT}/pacientes/:id`);
  console.log(`   DELETE http://localhost:${PORT}/pacientes/:id`);
  console.log(`   ---`);
  console.log(`   GET    http://localhost:${PORT}/consultas`);
  console.log(`   GET    http://localhost:${PORT}/consultas/:id`);
  console.log(`   GET    http://localhost:${PORT}/consultas/paciente/:paciente_id`);
  console.log(`   POST   http://localhost:${PORT}/consultas`);
  console.log(`   PUT    http://localhost:${PORT}/consultas/:id`);
  console.log(`   DELETE http://localhost:${PORT}/consultas/:id`);
});