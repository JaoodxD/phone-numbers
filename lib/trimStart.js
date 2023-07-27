module.exports = function trimStart (text, value) {
  return text.startsWith(value) ? text.slice(value.length) : text
}
