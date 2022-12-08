//@ts-check
const operatorPrefixes = require('./operator-prefixes.json');

const countryCode = require('./countries-metada.json');
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
const localOperatorIcons = {
    'UA': {
        'Kyivstar': 'icon-Union-1',
        'Vodafone': 'icon-Vector-1',
        'lifecell': 'icon-Vector-3'

    },
    'KZ': {
        'Activ': 'icons-Activ',
        'Altel': 'icons-Altel',
        'Beeline': 'icons-Beeline',
        'Tele2': 'icons-Tele2'

    },
    'UNKNOWN': 'icon-Union',
    'INCORRECT': 'icon-Union-18',
    'EMPTY': ''//'icon-uniE941',
};

const normalizeCountryName = (country) => {
    switch (country) {
        case 'Украина':
        case 'UA':
        case '🇺🇦':
            country = 'UA';
            break;
        case 'Казахстан':
        case 'KZ':
        case '🇰🇿':
            country = 'KZ';
            break;
        default:
            country = 'GLOBAL';
            break;
    }
    return country;
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
                .find(x =>
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
        return localOperatorIcons.EMPTY;
    //counting phone digits
    let numLen = (phone.match(/\d/g) || []).length;
    if (country == 'GLOBAL') {
        if (numLen >= currentCountryCode.minLen && numLen <= currentCountryCode.maxLen)
            return localOperatorIcons.UNKNOWN;
    }
    if (numLen != currentCountryCode.maxLen) {
        return localOperatorIcons.INCORRECT
    }
    //@ts-ignore
    let { int, operator } = phone
        .replace('+', '')
        .match(/(?<int>^\d+) (?<operator>\d+)/)
        ?.groups;
    if (!!operator && !!int) {
        operator = recognize(operator, country);
        if (operator)
            return localOperatorIcons[country][operator];
        return localOperatorIcons.UNKNOWN;
    }
    return localOperatorIcons.INCORRECT;
};

module.exports = {
    getCountry,
    formatPhone,
    recognizeOperator
};
