// tests/consultas.test.js
const request = require('supertest');

jest.mock('../src/database/database', () => ({
  prepare: jest.fn(),
}));

const db = require('../src/database/database');
const app = require('../src/app');

const mockQuery = (method, returnValue) => {
  db.prepare.mockReturnValue({ [method]: jest.fn().mockReturnValue(returnValue) });
};

describe('Consultas - GET /', () => {
  it('deve retornar lista de consultas com dados do paciente', async () => {
    const consultas = [{
      id: 1, medico: 'Dr. Silva', especialidade: 'Clínica Geral',
      paciente_nome: 'João', paciente_cpf: '111.111.111-11',
    }];
    mockQuery('all', consultas);

    const res = await request(app).get('/consultas');
    expect(res.statusCode).toBe(200);
    expect(res.body.sucesso).toBe(true);
    expect(res.body.dados).toEqual(consultas);
  });

  it('deve retornar 500 se o banco falhar', async () => {
    db.prepare.mockReturnValue({
      all: jest.fn().mockImplementation(() => { throw new Error('DB error'); }),
    });

    const res = await request(app).get('/consultas');
    expect(res.statusCode).toBe(500);
  });
});

describe('Consultas - GET /:id', () => {
  it('deve retornar uma consulta pelo id', async () => {
    const consulta = { id: 1, medico: 'Dr. Silva', paciente_nome: 'João' };
    mockQuery('get', consulta);

    const res = await request(app).get('/consultas/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.dados).toEqual(consulta);
  });

  it('deve retornar 404 se consulta não existir', async () => {
    mockQuery('get', undefined);

    const res = await request(app).get('/consultas/999');
    expect(res.statusCode).toBe(404);
  });
});

describe('Consultas - GET /paciente/:paciente_id', () => {
  it('deve retornar consultas de um paciente', async () => {
    const consultas = [{ id: 1, paciente_id: 1, medico: 'Dr. Silva' }];
    mockQuery('all', consultas);

    const res = await request(app).get('/consultas/paciente/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.dados).toEqual(consultas);
  });
});

describe('Consultas - POST /', () => {
  const novaConsulta = {
    paciente_id: 1,
    medico: 'Dr. Costa',
    especialidade: 'Cardiologia',
    data_consulta: '2025-07-10',
    status: 'agendada',
  };

  it('deve criar uma nova consulta', async () => {
    db.prepare
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id: 1 }) }) // verifica paciente
      .mockReturnValueOnce({ run: jest.fn().mockReturnValue({ lastInsertRowid: 5 }) }) // insert
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id: 5, ...novaConsulta }) }); // select

    const res = await request(app).post('/consultas').send(novaConsulta);
    expect(res.statusCode).toBe(201);
    expect(res.body.sucesso).toBe(true);
  });

  it('deve retornar 400 se faltar campos obrigatórios', async () => {
    const res = await request(app).post('/consultas').send({ medico: 'Dr. Costa' });
    expect(res.statusCode).toBe(400);
  });

  it('deve retornar 404 se paciente não existir', async () => {
    mockQuery('get', undefined); // paciente não encontrado

    const res = await request(app).post('/consultas').send(novaConsulta);
    expect(res.statusCode).toBe(404);
  });

  it('deve retornar 400 para status inválido', async () => {
    db.prepare.mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id: 1 }) });

    const res = await request(app).post('/consultas').send({ ...novaConsulta, status: 'invalido' });
    expect(res.statusCode).toBe(400);
    expect(res.body.mensagem).toContain('Status inválido');
  });
});

describe('Consultas - PUT /:id', () => {
  const dadosAtualizados = {
    paciente_id: 1,
    medico: 'Dr. Lima',
    especialidade: 'Neurologia',
    data_consulta: '2025-08-01',
    status: 'realizada',
  };

  it('deve atualizar uma consulta existente', async () => {
    db.prepare
      .mockReturnValueOnce({ run: jest.fn().mockReturnValue({ changes: 1 }) })
      .mockReturnValueOnce({ get: jest.fn().mockReturnValue({ id: 1, ...dadosAtualizados }) });

    const res = await request(app).put('/consultas/1').send(dadosAtualizados);
    expect(res.statusCode).toBe(200);
    expect(res.body.sucesso).toBe(true);
  });

  it('deve retornar 404 se consulta não existir', async () => {
    mockQuery('run', { changes: 0 });

    const res = await request(app).put('/consultas/999').send(dadosAtualizados);
    expect(res.statusCode).toBe(404);
  });

  it('deve retornar 400 para status inválido', async () => {
    const res = await request(app).put('/consultas/1').send({ ...dadosAtualizados, status: 'pendente' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Consultas - DELETE /:id', () => {
  it('deve deletar uma consulta existente', async () => {
    mockQuery('run', { changes: 1 });

    const res = await request(app).delete('/consultas/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.sucesso).toBe(true);
  });

  it('deve retornar 404 se consulta não existir', async () => {
    mockQuery('run', { changes: 0 });

    const res = await request(app).delete('/consultas/999');
    expect(res.statusCode).toBe(404);
  });
});