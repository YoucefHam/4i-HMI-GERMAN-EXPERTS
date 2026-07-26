// index.js
/**
 * Simple entry file for 4i-HMI-GERMAN-EXPERTS
 * Exports a greeting function and logs on run.
 */
function greet(name = 'world') {
  const msg = `Hallo ${name}, Willkommen bei 4i-HMI-GERMAN-EXPERTS!`;
  return msg;
}

if (require.main === module) {
  console.log(greet('Entwickler'));
}

module.exports = { greet };
