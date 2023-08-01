const mask = require('./lib/mask.js')
const trimStart = require('./lib/trimStart.js')
const stripNumber = require('./lib/stripNumber.js')

const DEFAULT_FALLBACK_OPERATORS = {
  UNKNOWN: 'unknown',
  INCORRECT: 'incorrect'
}

function config (options, fallbackOperators = {}) {
  const countries = new Map()
  for (const country of options) {
    const { ISO } = country
    countries.set(ISO, country)
  }
  const UNKNOWN = fallbackOperators.unknown || DEFAULT_FALLBACK_OPERATORS.UNKNOWN
  const INCORRECT = fallbackOperators.incorrect || DEFAULT_FALLBACK_OPERATORS.INCORRECT
  function formatPhone (number, country, prevCountry, leadPlus = true) {
    const countryInfo = countries.get(country)
    const prevCountryInfo = countries.get(prevCountry)
    if (!countryInfo) throw new Error(`Unknown country: ${country}`)
    if (prevCountry && !prevCountryInfo) throw new Error(`Unknown previous country: ${country}`)
    const phoneMask = countryInfo.mask
    const countryCode = countryInfo.countryCode
    const phone = stripNumber(number)
    const codeToTrim = prevCountryInfo ? prevCountryInfo.countryCode : countryCode
    if (phone.length < countryCode.length) return number
    const trimmedPhone = trimStart(phone, codeToTrim)
    const phoneWithCountryCode = countryCode + trimmedPhone
    const prefix = leadPlus ? '+' : ''
    return prefix + mask(phoneWithCountryCode, phoneMask)
  }
  function recognizeOperator (number, country) {
    const countryInfo = countries.get(country)
    if (!countryInfo) throw new Error(`Unknown country: ${country}`)
    const { operators, countryCode, mask } = countryInfo
    if (!operators) throw new Error(`No operators specified for ${country} country`)
    const phone = stripNumber(number)
    const numberLength = mask.match(/#/g).length
    if (phone.length !== numberLength) return INCORRECT
    const phoneWithoutCountryCode = trimStart(phone, countryCode)
    for (const operator of operators) {
      const { prefixes, name } = operator
      for (const prefix of prefixes) {
        if (phoneWithoutCountryCode.startsWith(prefix)) return name
      }
    }
    return UNKNOWN
  }
  function getCountry (number) {
    throw new Error('Not yet implemented')
  };
  return { formatPhone, recognizeOperator, getCountry }
}

module.exports = config
module.exports.default = config
module.exports.config = config
