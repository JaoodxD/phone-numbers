'use strict'

const test = require('node:test')
const assert = require('node:assert')
const config = require('..')

test('simple lib configuring', async (t) => {
  assert.doesNotThrow(() => config([]))
})

test('format UA number', async (t) => {
  const countries = [{ ISO: 'UA', countryCode: '380', mask: '## ### ### ####' }]
  const { formatPhone } = config(countries)
  const initalNumber = '+380965556677'
  const result = formatPhone(initalNumber, 'UA')
  const expected = '+38 096 555 6677'
  assert.equal(result, expected)
})

test('recognize operator by number and country', async (t) => {
  const countries = [{
    ISO: 'UA',
    countryCode: '380',
    mask: '## ### ### ####',
    operators: [{ prefixes: ['96'], name: 'Kyivstar' }]
  }]
  const { recognizeOperator } = config(countries)
  const initalNumber = '+380965556677'
  const result = recognizeOperator(initalNumber, 'UA')
  const expected = 'Kyivstar'
  assert.equal(result, expected)
})

test('return uknown when operator is not present in country', async (t) => {
  const countries = [{
    ISO: 'UA',
    countryCode: '380',
    mask: '## ### ### ####',
    operators: [{ prefixes: ['96'], name: 'Kyivstar' }]
  }]
  const { recognizeOperator } = config(countries)
  const initalNumber = '+380775556677'
  const result = recognizeOperator(initalNumber, 'UA')
  const expected = 'unknown'
  assert.equal(result, expected)
})

test('recognize operator with formatted number', async (t) => {
  const countries = [{
    ISO: 'UA',
    countryCode: '380',
    mask: '## ### ### ####',
    operators: [{ prefixes: ['96'], name: 'Kyivstar' }]
  }]
  const { recognizeOperator } = config(countries)
  const initalNumber = '+38 096 555 6677'
  const result = recognizeOperator(initalNumber, 'UA')
  const expected = 'Kyivstar'
  assert.equal(result, expected)
})

test('format on input', async (t) => {
  const countries = [{
    ISO: 'UA',
    countryCode: '380',
    mask: '## ### ### ####',
    operators: [{ prefixes: ['96'], name: 'Kyivstar' }]
  }]
  const { formatPhone } = config(countries)
  const table = [
    ['+', '+'],
    ['+3', '+3'],
    ['+38', '+38'],
    ['+380', '+38 0'],
    ['+3809', '+38 09'],
    ['+38096', '+38 096'],
    ['+380965', '+38 096 5'],
    ['+3809655', '+38 096 55'],
    ['+38096555', '+38 096 555'],
    ['+380965556', '+38 096 555 6'],
    ['+3809655566', '+38 096 555 66'],
    ['+38096555667', '+38 096 555 667'],
    ['+380965556677', '+38 096 555 6677']
  ]
  for (const [input, expected] of table) {
    const result = formatPhone(input, 'UA')
    assert.equal(result, expected)
  }
})

test('auto prepend country code when ommited', async (t) => {
  const countries = [{
    ISO: 'UA',
    countryCode: '380',
    mask: '## ### ### ####',
    operators: [{ prefixes: ['96'], name: 'Kyivstar' }]
  }]
  const { formatPhone } = config(countries)
  const input = '123'
  const result = formatPhone(input, 'UA')
  const expected = '+38 012 3'
  assert.equal(result, expected)
})

test('multi country format', async (t) => {
  const countries = [{
    ISO: 'UA',
    countryCode: '380',
    mask: '## ### ### ####',
    operators: [{ prefixes: ['96'], name: 'Kyivstar' }]
  }, {
    ISO: 'KZ',
    countryCode: '7',
    mask: '# ### ### ####',
    operators: [{ prefixes: ['705', '771', '776', '777'], name: 'Beeline' }]
  }]
  const { formatPhone } = config(countries)
  const table = [
    [['+380965556677', 'UA'], '+38 096 555 6677'],
    [['77773456789', 'KZ'], '+7 777 345 6789']
  ]
  for (const [[input, country], expected] of table) {
    const result = formatPhone(input, country)
    assert.equal(result, expected)
  }
})
