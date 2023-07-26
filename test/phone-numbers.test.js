'use strict'

const test = require('node:test');
const assert = require('node:assert');
const config = require('..');

test('simple lib configuring', async (t) => {
  assert.doesNotThrow(config);
});

test('format UA number', async (t) => {
  const { formatPhone } = config();
  const inital = '+380965556677';
  const result = formatPhone(inital, 'UA');
  const expected = '+38 096 555 6677';
  assert.equal(result, expected);
});
