function generateRandomValues(num = 1000) {
  const randomValues = [];
  for (let i = 0; i < num; i += 1) {
    const random = Math.random() * 100;
    randomValues.push(random);
  }
  return randomValues;
}

function computeSumOfArray(arr) {
  return arr.map((val) => parseInt(val, 10))
    .reduce((sum, curr) => sum + curr, 0);
}

module.exports = { generateRandomValues, computeSumOfArray };
