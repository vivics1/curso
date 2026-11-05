const test = require('node:test');
const assert = require('node:assert/strict');
const { aplicarTransacao, formatarMoeda } = require('../js/bytebank.js');

test('deve somar valor em depósitos', () => {
  assert.equal(aplicarTransacao(3000, 'Depósito', 250), 3250);
});

test('deve subtrair valor em transferências', () => {
  assert.equal(aplicarTransacao(3000, 'Transferência', 150), 2850);
});

test('deve formatar valores em moeda brasileira', () => {
  assert.equal(formatarMoeda(2575.5), 'R$ 2.575,50');
});
