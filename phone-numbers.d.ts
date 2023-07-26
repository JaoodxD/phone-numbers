type Prefix = string
type Operator = {
  name: string
  prefixes: Prefix[]
}
type Country = {
  ISO: string
  countryCode: string
  mask: string
  operators?: Operator[]
}

type FormatPhone = (number: string, country: Country['ISO'], leadPlus?:Boolean) => string
type RecognizeOperator = (number: string, country: Country['ISO']) => string
type GetCountry = (number: string) => string

type ConfiguredUtils = {
  formatPhone: FormatPhone
  recognizeOperator: RecognizeOperator
  getCountry: GetCountry
}

export declare function config(option: Country[]): ConfiguredUtils
