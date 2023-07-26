/**
 * 
 * @param {String} phone number to be masked
 * @param {String} pattern pattern to mask inputted number which contains '#' as placceholder 
 * @returns masked phone number e.g. value=123453, pattern='+### # ##' will gives '+123 4 53'
 */
module.exports = function mask(phone = '', pattern = '+#############') {
  let i = 0;
  const v = phone.toString();
  return pattern.replace(/#/g, _ => v[i++] ?? '').trimEnd();
}

module.exports.mask = mask;
