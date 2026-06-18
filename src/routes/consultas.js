const express = require('express');
const router = express.Router();
const db = require('../database/database');


router.get('/', (req, res) => {
  try {
    const consultas = db.prepare(`
      SELECT
        c.*,
        p.nome  AS paciente_nome,
        p.cpf   AS paciente_cpf,
        p.email AS paciente_email
      FROM consultas c
      JOIN pacientes p ON p.id = c.paciente_id
      ORDER BY c.data_consulta DESC
    `).all();

    res.json({ sucesso: true, dados: consultas });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});


router.get('/:id', (req, res) => {
  try {
    const consulta = db.prepare(`
      SELECT
        c.*,
        p.nome  AS paciente_nome,
        p.cpf   AS paciente_cpf,
        p.email AS paciente_email
      FROM consultas c
      JOIN pacientes p ON p.id = c.paciente_id
      WHERE c.id = ?
    `).get(req.params.id);

    if (!consulta) {
      return res.status(404).json({ sucesso: false, mensagem: 'Consulta não encontrada.' });
    }

    res.json({ sucesso: true, dados: consulta });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});


router.get('/paciente/:paciente_id', (req, res) => {
  try {
    const consultas = db.prepare(`
      SELECT * FROM consultas
      WHERE paciente_id = ?
      ORDER BY data_consulta DESC
    `).all(req.params.paciente_id);

    res.json({ sucesso: true, dados: consultas });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});


router.post('/', (req, res) => {
  const { paciente_id, medico, especialidade, data_consulta, status, observacoes } = req.body;

  if (!paciente_id || !medico || !especialidade || !data_consulta) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Campos obrigatórios: paciente_id, medico, especialidade, data_consulta.'
    });
  }

  // Verifica se o paciente existe
  const paciente = db.prepare('SELECT id FROM pacientes WHERE id = ?').get(paciente_id);
  if (!paciente) {
    return res.status(404).json({ sucesso: false, mensagem: 'Paciente não encontrado.' });
  }

  // Status permitidos
  const statusPermitidos = ['agendada', 'realizada', 'cancelada'];
  const statusFinal = status || 'agendada';
  if (!statusPermitidos.includes(statusFinal)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: `Status inválido. Use: ${statusPermitidos.join(', ')}.`
    });
  }

  try {
    const resultado = db.prepare(`
      INSERT INTO consultas (paciente_id, medico, especialidade, data_consulta, status, observacoes)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(paciente_id, medico, especialidade, data_consulta, statusFinal, observacoes || null);

    const novaConsulta = db.prepare('SELECT * FROM consultas WHERE id = ?').get(resultado.lastInsertRowid);
    res.status(201).json({ sucesso: true, mensagem: 'Consulta criada com sucesso!', dados: novaConsulta });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});


router.put('/:id', (req, res) => {
  const { paciente_id, medico, especialidade, data_consulta, status, observacoes } = req.body;

  if (!paciente_id || !medico || !especialidade || !data_consulta || !status) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Campos obrigatórios: paciente_id, medico, especialidade, data_consulta, status.'
    });
  }

  const statusPermitidos = ['agendada', 'realizada', 'cancelada'];
  if (!statusPermitidos.includes(status)) {
    return res.status(400).json({
      sucesso: false,
      mensagem: `Status inválido. Use: ${statusPermitidos.join(', ')}.`
    });
  }

  try {
    const resultado = db.prepare(`
      UPDATE consultas
      SET paciente_id = ?, medico = ?, especialidade = ?, data_consulta = ?, status = ?, observacoes = ?
      WHERE id = ?
    `).run(paciente_id, medico, especialidade, data_consulta, status, observacoes || null, req.params.id);

    if (resultado.changes === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Consulta não encontrada.' });
    }

    const atualizada = db.prepare('SELECT * FROM consultas WHERE id = ?').get(req.params.id);
    res.json({ sucesso: true, mensagem: 'Consulta atualizada com sucesso!', dados: atualizada });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});


router.delete('/:id', (req, res) => {
  try {
    const resultado = db.prepare('DELETE FROM consultas WHERE id = ?').run(req.params.id);

    if (resultado.changes === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Consulta não encontrada.' });
    }

    res.json({ sucesso: true, mensagem: 'Consulta removida com sucesso!' });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});

module.exports = router;