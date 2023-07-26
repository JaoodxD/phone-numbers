'use strict'

const test = require('node:test');
const assert = require('node:assert');
const config = require('..');

test('simple lib configuring', async (t) => {
  assert.doesNotThrow(() => config([]));
});

test('format UA number', async (t) => {
  const countries = [{ ISO: 'UA', countryCode: '380', mask: '## ### ### ####' }];
  const { formatPhone } = config(countries);
  const initalNumber = '+380965556677';
  const result = formatPhone(initalNumber, 'UA');
  const expected = '+38 096 555 6677';
  assert.equal(result, expected);
});

test('recognize operator by number and country', async (t) => {
  const countries = [{
    ISO: 'UA',
    countryCode: '380',
    mask: '## ### ### ####',
    operators: [{ prefixes: ['96'], name: 'Kyivstar' }]
  }];
  const { recognizeOperator } = config(countries);
  const initalNumber = '+380965556677';
  const result = recognizeOperator(initalNumber, 'UA');
  const expected = 'Kyivstar';
  assert.equal(result, expected);
});
