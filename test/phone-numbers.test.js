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

test('format with country switch', async (t) => {
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
  const input = '+7 777 345 6789'
  const result = formatPhone(input, 'UA', 'KZ')
  const expected = '+38 077 734 5678'
  assert.equal(result, expected)
})

test('should recognize phone as incorrect if it has insufficient amount of digits', async (t) => {
  const countries = [{
    ISO: 'UA',
    countryCode: '380',
    mask: '## ### ### ####',
    operators: [{ prefixes: ['96'], name: 'Kyivstar' }]
  }]
  const { recognizeOperator } = config(countries)
  const input = '+38 096 555 667'
  const result = recognizeOperator(input, 'UA')
  const expected = 'incorrect'
  assert.equal(result, expected)
})

test('should return custom incorrect fallback value', async (t) => {
  const countries = [{
    ISO: 'UA',
    countryCode: '380',
    mask: '## ### ### ####',
    operators: [{ prefixes: ['96'], name: 'Kyivstar' }]
  }]
  const fallbackValues = {
    incorrect: 'custom incorrect value'
  }
  const { recognizeOperator } = config(countries, fallbackValues)
  const input = '+38 096 555 667'
  const result = recognizeOperator(input, 'UA')
  const expected = fallbackValues.incorrect
  assert.equal(result, expected)
})

test('should return custom unknown fallback value', async (t) => {
  const countries = [{
    ISO: 'UA',
    countryCode: '380',
    mask: '## ### ### ####',
    operators: [{ prefixes: ['96'], name: 'Kyivstar' }]
  }]
  const fallbackValues = {
    incorrect: 'custom incorrect value',
    unknown: 'custom unknown value'
  }
  const { recognizeOperator } = config(countries, fallbackValues)
  const input = '+38 033 555 6677'
  const result = recognizeOperator(input, 'UA')
  const expected = fallbackValues.unknown
  assert.equal(result, expected)
})

test('should correctly switch format between countries back and forth', async (t) => {
  const countries = [{
    ISO: 'UA',
    countryCode: '380',
    mask: '## ### ### ####'
  }, {
    ISO: 'VN',
    countryCode: '84',
    mask: '## ## ### ####'
  }]
  const { formatPhone } = config(countries)
  const input = formatPhone('+38 096 555 6677', 'UA')
  const temp = formatPhone(input, 'VN', 'UA')
  const result = formatPhone(temp, 'UA', 'VN')
  assert.equal(result, input)
})

test('no country code should be treated as 0 length', async (t) => {
  const countries = [{
    ISO: 'GBL',
    mask: '###############'
  }]
  const { formatPhone } = config(countries)
  const input = '+38 096 555 6677'

  assert.doesNotThrow(() => formatPhone(input, 'GBL'))
  const result = formatPhone(input, 'GBL')
  const expected = '+380965556677'
  assert.equal(result, expected)
})
