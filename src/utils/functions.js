const { ALLOWED_FIELDS } = require('./constants');

function generateCardNumber() {
  let number = '';
  for (let i = 0; i < 16; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return number;
}

function buildUpdateQuery(fields) {
  const values = [];
  const setParts = [];
  const entries = Object.entries(fields);
  entries.forEach(([key, value], index) => {
    setParts.push(`${key} = $${index + 1}`);
    values.push(value);
  });
  const setClause = setParts.join(', ');
  return { setClause, values };
}

module.exports = { generateCardNumber, buildUpdateQuery };