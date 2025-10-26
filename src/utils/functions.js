function generateCardNumber() {
  let number = '';
  for (let i = 0; i < 16; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return number;
}

module.exports = { generateCardNumber };