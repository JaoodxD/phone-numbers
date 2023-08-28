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
    const codeLength = countryCode?.length ?? 0
    if (phone.length < codeLength) return number
    const trimmedPhone = trimStart(phone, codeToTrim)
    const code = countryCode ?? codeToTrim ?? ''
    const phoneWithCountryCode = code + trimmedPhone
    const prefix = leadPlus ? '+' : ''
    return prefix + mask(phoneWithCountryCode, phoneMask)
  }
  function recognizeOperator (number, country) {
    const countryInfo = countries.get(country)
    if (!countryInfo) throw new Error(`Unknown country: ${country}`)
    const { operators, countryCode, mask } = countryInfo
    if (!operators || !operators.length) return UNKNOWN
    const phone = stripNumber(number)
    if (mask) {
      const numberLength = mask.match(/#/g).length
      if (phone.length !== numberLength) return INCORRECT
    }
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
    const stripped = stripNumber(number)
    for (const [ISO, country] of countries) {
      const { countryCode } = country
      if (stripped.startsWith(countryCode)) return ISO
    }
    for (const [ISO, country] of countries) {
      const { operators } = country
      if (!operators) continue
      for (const operator of operators) {
        const { prefixes } = operator
        if (!prefixes) continue
        for (const prefix of prefixes) {
          if (stripped.startsWith(prefix)) return ISO
        }
      }
    }

    throw new Error('country not recognized')
  };
  return { formatPhone, recognizeOperator, getCountry }
}

module.exports = config
module.exports.default = config
module.exports.config = config
