module.exports = function proxying(map) {
  return new Proxy(
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
}

module.exports.proxying = proxying;

