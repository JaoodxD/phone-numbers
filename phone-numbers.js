const mask = require('./lib/mask.js')

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
    const phone = number.startsWith('+') ? number.slice(1) : number
    const prefix = leadPlus ? '+' : ''
    return prefix + mask(phone, phoneMask)
  }
  function recognizeOperator (number, country) {
    const countryInfo = countries.get(country)
    if (!countryInfo) throw new Error(`Unknown country: ${country}`)
    const { operators, countryCode } = countryInfo
    if (!operators) throw new Error(`No operators specified for ${country} country`)
    const phone = number.startsWith('+') ? number.slice(1) : number
    const phoneWitoutCountryCode = phone.startsWith(countryCode) ? phone.slice(countryCode.length) : phone
    for (const operator of operators) {
      const { prefixes, name } = operator
      for (const prefix of prefixes) { if (phoneWitoutCountryCode.startsWith(prefix)) return name }
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
