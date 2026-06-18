const express = require('express');
const router = express.Router();
const db = require('../database/database');


router.get('/', (req, res) => {
  try {
    const pacientes = db.prepare('SELECT * FROM pacientes ORDER BY nome').all();
    res.json({ sucesso: true, dados: pacientes });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});


router.get('/:id', (req, res) => {
  try {
    const paciente = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(req.params.id);

    if (!paciente) {
      return res.status(404).json({ sucesso: false, mensagem: 'Paciente não encontrado.' });
    }

    res.json({ sucesso: true, dados: paciente });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});


router.post('/', (req, res) => {
  const { nome, cpf, email, telefone, data_nasc } = req.body;

  // Validação dos campos obrigatórios
  if (!nome || !cpf || !email || !telefone || !data_nasc) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Todos os campos são obrigatórios: nome, cpf, email, telefone, data_nasc.'
    });
  }

  try {
    const resultado = db.prepare(`
      INSERT INTO pacientes (nome, cpf, email, telefone, data_nasc)
      VALUES (?, ?, ?, ?, ?)
    `).run(nome, cpf, email, telefone, data_nasc);

    const novoPaciente = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(resultado.lastInsertRowid);
    res.status(201).json({ sucesso: true, mensagem: 'Paciente criado com sucesso!', dados: novoPaciente });
  } catch (erro) {
    // Erro de CPF duplicado
    if (erro.message.includes('UNIQUE')) {
      return res.status(409).json({ sucesso: false, mensagem: 'CPF já cadastrado.' });
    }
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});


router.put('/:id', (req, res) => {
  const { nome, cpf, email, telefone, data_nasc } = req.body;

  if (!nome || !cpf || !email || !telefone || !data_nasc) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Todos os campos são obrigatórios: nome, cpf, email, telefone, data_nasc.'
    });
  }

  try {
    const resultado = db.prepare(`
      UPDATE pacientes
      SET nome = ?, cpf = ?, email = ?, telefone = ?, data_nasc = ?
      WHERE id = ?
    `).run(nome, cpf, email, telefone, data_nasc, req.params.id);

    if (resultado.changes === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Paciente não encontrado.' });
    }

    const atualizado = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(req.params.id);
    res.json({ sucesso: true, mensagem: 'Paciente atualizado com sucesso!', dados: atualizado });
  } catch (erro) {
    if (erro.message.includes('UNIQUE')) {
      return res.status(409).json({ sucesso: false, mensagem: 'CPF já cadastrado.' });
    }
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});


router.delete('/:id', (req, res) => {
  try {
    const resultado = db.prepare('DELETE FROM pacientes WHERE id = ?').run(req.params.id);

    if (resultado.changes === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Paciente não encontrado.' });
    }

    res.json({ sucesso: true, mensagem: 'Paciente removido com sucesso!' });
  } catch (erro) {
    res.status(500).json({ sucesso: false, mensagem: erro.message });
  }
});

module.exports = router;