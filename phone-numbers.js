//@ts-check
const defaultOperatorPrefixes = require('./operator-prefixes.json');

/**
 * @typedef {Object} localOperatorAliases
 * @prop {Object} [UA]
 * @prop {any=} UA.Kyivstar
 * @prop {any=} UA.Vodafone
 * @prop {any=} UA.Lifecell
 * 
 * @prop {Object} [KZ]
 * @prop {any=} KZ.Activ
 * @prop {any=} KZ.Altel
 * @prop {any=} KZ.Beeline
 * @prop {any=} KZ.Tele2
 * 
 * @prop {any} UNKNOWN
 * @prop {any} INCORRECT
 * @prop {any} EMPTY
 */

/**
 * @type {localOperatorAliases}
 */
const defaultLocalOperators = require('./local-operator-aliases.json');


const countryCode = require('./countries-metadata.json');
/**
 * Function to return country name by international code 
 * @param {String|Number} code  String or numeric representation of country prefix
 * @returns Alpha‑2 code country name if found otherwise 'GLOBAL'  
 */
const getCountry = (code) => Object.entries(countryCode)
    .find(([, value]) =>
        value.code == code)?.[0] ?? 'GLOBAL';

const proxying = (map) => new Proxy(
    Object.entries(map)
        .reduce((dic, [key, value]) =>
            (dic[value.join('|')] = key, dic), {}), {
    get: (target, property) => {
        for (let k in target)
            if (new RegExp(k).test(property.toString()))
                return target[k];
        return null;
    }
});

const normalizeCountryName = (country) => {
    switch (country) {
        case 'Украина':
        case 'UA':
        case '🇺🇦':
            return 'UA';
        case 'Казахстан':
        case 'KZ':
        case '🇰🇿':
            return 'KZ';
        default:
            return 'GLOBAL';
    }
};
/**
 * 
 * @param {String} phone number to be masked
 * @param {String} pattern pattern to mask inputted number which contains '#' as placceholder 
 * @returns masked phone number e.g. value=123453, pattern='+### # ##' will gives '+123 4 53'
 */
const mask = (phone = '', pattern = '+#############') => {
    let i = 0;
    const v = phone.toString();
    return pattern.replace(/#/g, _ => v[i++] ?? '').trimEnd();
};
/**
 * Function of converting mobile number to international format e.g. phone = '0965558844' and country = 'UA' -> +38 096 555 88 44
 * @param {String} phone 
 * @param {'UA'| 'KZ'| 'GLOBAL'} country
 * @param {'UA'| 'KZ'| 'GLOBAL' | undefined} prevCountry
 * @returns {String} Formatted 
 */
const formatPhone = (phone, country, prevCountry = undefined) => {
    if (phone) {

        country = normalizeCountryName(country);
        prevCountry = prevCountry ? normalizeCountryName(prevCountry) : prevCountry;

        //prevent formatting before any national/international prefix were inputted
        if (phone.replace(/^\+/, '').length <= countryCode[prevCountry ?? country].code.length)
            return phone;

        //strip all non-numeric characters
        phone = phone.replace(/\D/gm, '');

        let prefix;
        if (
            prefix = countryCode[prevCountry ?? country].codes
                .find((x) =>
                    new RegExp(`^${x}`).test(phone))
        ) {
            phone = phone
                .replace(
                    new RegExp(`^${prefix}`),
                    countryCode[prevCountry ?? country].code
                );
        }
        //if nothing was found just add the prefix
        else {
            phone = `${countryCode[prevCountry ?? country].code}${phone}`;
        }
        if (country != 'GLOBAL' && prevCountry && prevCountry != 'GLOBAL') {
            phone = phone
                .replace(
                    new RegExp(`^${countryCode[prevCountry].code}`),
                    countryCode[country].code
                );
        }
        //masking the phone to natural human representation
        phone = mask(phone, countryCode[country].mask);
        return phone;
    }
    return '';
};

/**
 * 
 * @param {localOperatorAliases} localOperatorAliases 
 * @returns 
 */
const config = (localOperatorAliases) => {
    const localOperators = localOperatorAliases ?? defaultLocalOperators;
    const operatorPrefixes = defaultOperatorPrefixes;
    const proxy = Object.entries(operatorPrefixes)
        .reduce((dic, [key, value]) =>
            (dic[key] = proxying(value), dic), {});
    /**
     * 
     * @param {String} code 
     * @param {'UA'|'KZ'|String} country 
     * @returns 
     */
    const recognize = (code, country) => proxy[country][code];

    /**
     *  Mobile operator icon recognition function by phone number
     * @param {String} phone 
     * @param {'UA'| 'KZ'| 'GLOBAL'} country 
     * @returns {String} icon name of specific recognized mobile operator
     */
    const recognizeOperator = (phone, country = 'GLOBAL') => {
        country = normalizeCountryName(country);
        phone = formatPhone(phone, country);

        let currentCountryCode = countryCode[country];

        if (phone.replace(/^\+/, '').length == 0)
            return localOperators.EMPTY;

        //counting phone digits
        const numLen = (phone.match(/\d/g) || []).length;
        if (country == 'GLOBAL') {
            if (numLen >= currentCountryCode.minLen && numLen <= currentCountryCode.maxLen)
                return localOperators.UNKNOWN;
        }

        if (numLen != currentCountryCode.maxLen) {
            return localOperators.INCORRECT
        }
        //@ts-ignore can't type annotate regex groups
        let { int, operator } = phone
            .replace('+', '')
            .match(/(?<int>^\d+) (?<operator>\d+)/)
            ?.groups;
        if (!!operator && !!int) {
            operator = recognize(operator, country);
            if (operator)
                return localOperators[country][operator];
            return localOperators.UNKNOWN;
        }
        return localOperators.INCORRECT;
    };

    return { getCountry, formatPhone, recognizeOperator };
};

module.exports = config;
module.exports.default = config;
