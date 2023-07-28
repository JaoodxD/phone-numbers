module.exports = function stripNumber (text = '') {
  return text.replace(/\D/g, '')
}
