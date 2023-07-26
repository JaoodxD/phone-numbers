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

declare function formatPhone(number: string, country: Country['ISO'], leadPlus?:Boolean): string
declare function recognizeOperator(number: string, country: Country['ISO']): string
declare function getCountry(number: string): string

type ConfiguredUtils = {
  formatPhone: typeof formatPhone
  recognizeOperator: typeof recognizeOperator
  getCountry: typeof getCountry
}

export declare function config(option: Country[]): ConfiguredUtils
