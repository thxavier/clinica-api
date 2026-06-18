// tests/selenium.test.js
// Teste de interface usando Selenium WebDriver
// Sobe um servidor real em porta de teste e verifica respostas via browser headless

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const http = require('http');
const app = require('../src/app');

let driver;
let server;
let BASE_URL;

beforeAll(async () => {
  // Sobe servidor em porta aleatória
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      BASE_URL = `http://localhost:${port}`;
      resolve();
    });
  });

  // Configura Chrome headless
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}, 30000);

afterAll(async () => {
  if (driver) await driver.quit();
  if (server) server.close();
});

describe('Selenium - Verificação de respostas da API no browser', () => {

  it('GET /pacientes deve retornar JSON com sucesso=true', async () => {
    await driver.get(`${BASE_URL}/pacientes`);

    // Aguarda o body ter conteúdo
    await driver.wait(until.elementLocated(By.tagName('body')), 5000);
    const body = await driver.findElement(By.tagName('body')).getText();

    const json = JSON.parse(body);
    expect(json.sucesso).toBe(true);
    expect(Array.isArray(json.dados)).toBe(true);
  }, 15000);

  it('GET /consultas deve retornar JSON com sucesso=true', async () => {
    await driver.get(`${BASE_URL}/consultas`);

    await driver.wait(until.elementLocated(By.tagName('body')), 5000);
    const body = await driver.findElement(By.tagName('body')).getText();

    const json = JSON.parse(body);
    expect(json.sucesso).toBe(true);
    expect(Array.isArray(json.dados)).toBe(true);
  }, 15000);

  it('GET /pacientes/999 deve retornar 404 com sucesso=false', async () => {
    await driver.get(`${BASE_URL}/pacientes/999`);

    await driver.wait(until.elementLocated(By.tagName('body')), 5000);
    const body = await driver.findElement(By.tagName('body')).getText();

    const json = JSON.parse(body);
    expect(json.sucesso).toBe(false);
  }, 15000);

  it('GET /consultas/999 deve retornar mensagem de não encontrada', async () => {
    await driver.get(`${BASE_URL}/consultas/999`);

    await driver.wait(until.elementLocated(By.tagName('body')), 5000);
    const body = await driver.findElement(By.tagName('body')).getText();

    const json = JSON.parse(body);
    expect(json.sucesso).toBe(false);
    expect(json.mensagem).toBeTruthy();
  }, 15000);

});