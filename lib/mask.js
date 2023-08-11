module.exports = function mask (phone = '', pattern = '#############') {
  let i = 0
  const v = phone.toString()
  return pattern.replace(/#/g, _ => v[i++] ?? '').trimEnd()
}
