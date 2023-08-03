type Operator = {
  name: string
  prefixes: string[]
}
type Country = {
  ISO: string
  countryCode?: string
  mask: string
  operators?: Operator[]
}

type FallbackValues = {
  incorrect?: string
  unknown?: string
}

type FormatPhone = (number: string, country: Country['ISO'], prevCountry?: Country['ISO'], leadPlus?:Boolean) => string
type RecognizeOperator = (number: string, country: Country['ISO']) => string
type GetCountry = (number: string) => string

type ConfiguredUtils = {
  formatPhone: FormatPhone
  recognizeOperator: RecognizeOperator
  getCountry: GetCountry
}

export declare function config(option: Country[], fallbackValues?: FallbackValues): ConfiguredUtils
export default config
export = config
