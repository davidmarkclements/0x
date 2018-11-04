function convert (profile) {
  const converted = {
    children: new Array(profile.children.length),
    name: `${profile.functionName} ${profile.url}:${profile.lineNumber}`,
    top: profile.hitCount,
    value: profile.hitCount,
    S: 0,
  }

  for (let i = 0; i < profile.children.length; i++) {
    converted.children[i] = convert(profile.children[i]);
    converted.value += converted.children[i].value;
  }

  return converted;
}

function convertV8Profile (profile) {
  const converted = convert(profile)
  return {
    merged: converted,
    unmerged: converted,
  }
}

module.exports = {
  convertV8Profile,
}
