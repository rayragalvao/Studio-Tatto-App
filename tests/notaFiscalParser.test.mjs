import assert from 'node:assert/strict';
import test from 'node:test';
import { extrairItensNota, interpretarNumero } from '../src/services/notaFiscalParser.js';

test('converte valores brasileiros usados nas notas', () => {
  assert.equal(interpretarNumero('1.234,56'), 1234.56);
  assert.equal(interpretarNumero('2,0000'), 2);
  assert.equal(interpretarNumero('R$ 45,50'), 45.5);
  assert.ok(Number.isNaN(interpretarNumero('45abc')));
});

test('sugere produto de DANFE apenas com total coerente', () => {
  const texto = [
    '123 TINTA PRETA 32151100 000 5102 UN 2,0000 45,50 91,00',
    '124 AGULHAS RL 3 90189099 000 5102 CX 3,0000 20,00 99,00',
  ].join('\n');
  const itens = extrairItensNota(texto);
  assert.equal(itens.length, 1);
  assert.equal(itens[0].material, 'TINTA PRETA');
  assert.equal(itens[0].quantidade, '2');
  assert.equal(itens[0].valorUnitario, '45,50');
});

test('aceita linha simples de cupom com quantidade e preço', () => {
  const itens = extrairItensNota('AGULHA RL 3 2 UN X 12,50 25,00');
  assert.equal(itens.length, 1);
  assert.equal(itens[0].material, 'AGULHA RL 3');
});
