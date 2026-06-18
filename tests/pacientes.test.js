// tests/pacientes.test.js
const request = require('supertest');

// Mock do banco de dados ANTES de importar o app
jest.mock('../src/database/database', () => ({
  prepare: jest.fn(),
}));

const db = require('../src/database/database');
const app = require('../src/app');

// Helper para montar o mock de prepare().método()
const mockQuery = (method, returnValue) => {
  db.prepare.mockReturnValue({ [method]: jest.fn().mockReturnValue(returnValue) });
};

describe('Pacientes - GET /', () => {
  it('deve retornar lista de pacientes', async () => {
    const pacientes = [{ id: 1, nome: 'João Silva', cpf: '111.111.111-11' }];
    mockQuery('all', pacientes);

    const res = await request(app).get('/pacientes');
    expect(res.statusCode).toBe(200);
    expect(res.body.sucesso).toBe(true);
    expect(res.body.dados).toEqual(pacientes);
  });

  it('deve retornar 500 se o banco falhar', async () => {
    db.prepare.mockReturnValue({
      all: jest.fn().mockImplementation(() => { throw new Error('DB error'); }),
    });

    const res = await request(app).get('/pacientes');
    expect(res.statusCode).toBe(500);
    expect(res.body.sucesso).toBe(false);
  });
});

describe('Pacientes - GET /:id', () => {
  it('deve retornar um paciente pelo id', async () => {
    const paciente = { id: 1, nome: 'João Silva', cpf: '111.111.111-11' };
    mockQuery('get', paciente);

    const res = await request(app).get('/pacientes/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.dados).toEqual(paciente);
  });

  it('deve retornar 404 se paciente não existir', async () => {
    mockQuery('get', undefined);

    const res = await request(app).get('/pacientes/999');
    expect(res.statusCode).toBe(404);
    expect(res.body.sucesso).toBe(false);
  });
});

describe('Pacientes - POST /', () => {
  const novoPaciente = {
    nome: 'Maria Souza',
    cpf: '222.222.222-22',
    email: 'maria@email.com',
    telefone: '48999999999',
    data_nasc: '1990-05-15',
  };

  it('deve criar um novo paciente', async () => {
    db.prepare
      .mockReturnValueOnce({ run: jest.fn().mockReturnValue({ lastInsertRowid: 2 }) })
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id: 2, ...novoPaciente }) });

    const res = await request(app).post('/pacientes').send(novoPaciente);
    expect(res.statusCode).toBe(201);
    expect(res.body.sucesso).toBe(true);
  });

  it('deve retornar 400 se faltar campos obrigatórios', async () => {
    const res = await request(app).post('/pacientes').send({ nome: 'Incompleto' });
    expect(res.statusCode).toBe(400);
    expect(res.body.sucesso).toBe(false);
  });

  it('deve retornar 409 se CPF já cadastrado', async () => {
    db.prepare.mockReturnValue({
      run: jest.fn().mockImplementation(() => { throw new Error('UNIQUE constraint failed'); }),
    });

    const res = await request(app).post('/pacientes').send(novoPaciente);
    expect(res.statusCode).toBe(409);
  });
});

describe('Pacientes - PUT /:id', () => {
  const dadosAtualizados = {
    nome: 'João Atualizado',
    cpf: '111.111.111-11',
    email: 'joao@email.com',
    telefone: '48988887777',
    data_nasc: '1985-03-20',
  };

  it('deve atualizar um paciente existente', async () => {
    db.prepare
      .mockReturnValueOnce({ run: jest.fn().mockReturnValue({ changes: 1 }) })
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id: 1, ...dadosAtualizados }) });

    const res = await request(app).put('/pacientes/1').send(dadosAtualizados);
    expect(res.statusCode).toBe(200);
    expect(res.body.sucesso).toBe(true);
  });

  it('deve retornar 404 se paciente não existir', async () => {
    mockQuery('run', { changes: 0 });

    const res = await request(app).put('/pacientes/999').send(dadosAtualizados);
    expect(res.statusCode).toBe(404);
  });
});

describe('Pacientes - DELETE /:id', () => {
  it('deve deletar um paciente existente', async () => {
    mockQuery('run', { changes: 1 });

    const res = await request(app).delete('/pacientes/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.sucesso).toBe(true);
  });

  it('deve retornar 404 se paciente não existir', async () => {
    mockQuery('run', { changes: 0 });

    const res = await request(app).delete('/pacientes/999');
    expect(res.statusCode).toBe(404);
  });
});