module.exports = function normalizeCountryName(country) {
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
}

module.exports.normalizeCountryName = normalizeCountryName;
