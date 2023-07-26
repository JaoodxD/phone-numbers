const mask = require('./lib/mask.js')
const trimStart = require('./lib/trim.js')

function config (options) {
  const countries = new Map()
  for (const country of options) {
    const { ISO } = country
    countries.set(ISO, country)
  }
  function formatPhone (number, country, leadPlus = true) {
    const countryInfo = countries.get(country)
    if (!countryInfo) throw new Error(`Unknown country: ${country}`)
    const phoneMask = countryInfo.mask
    const phone = trimStart(number, '+')
    const prefix = leadPlus ? '+' : ''
    return prefix + mask(phone, phoneMask)
  }
  function recognizeOperator (number, country) {
    const countryInfo = countries.get(country)
    if (!countryInfo) throw new Error(`Unknown country: ${country}`)
    const { operators, countryCode } = countryInfo
    if (!operators) throw new Error(`No operators specified for ${country} country`)
    const phone = trimStart(number, '+')
    const phoneWithoutCountryCode = trimStart(phone, countryCode)
    for (const operator of operators) {
      const { prefixes, name } = operator
      for (const prefix of prefixes) {
        if (phoneWithoutCountryCode.startsWith(prefix)) return name
      }
    }
    return 'unknown'
  }
  function getCountry (number) {
    throw new Error('Not yet implemented')
  };
  return { formatPhone, recognizeOperator, getCountry }
}

module.exports = config
module.exports.default = config
module.exports.config = config
