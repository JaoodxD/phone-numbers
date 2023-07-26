type prefix = string
type Operator = {
  name: string
  prefixes: prefix[]
}
type Country = {
  ISO: string
  countryCode: string
  mask: string
  operators?: Operator[]
}

function formatPhone(number: string, country: Country['ISO'], leadPlus?:Boolean): string
function recognizeOperator(number: string, country: Country['ISO']): string
function getCountry(number: string): string

type ConfiguredUtils = {
  formatPhone: typeof formatPhone
  recognizeOperator: typeof recognizeOperator
  getCountry: typeof getCountry
}

export declare function config(option: Country[]): ConfiguredUtils
