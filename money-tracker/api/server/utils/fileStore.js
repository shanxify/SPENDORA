const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const getFilePath = (fileName) => path.join(dataDir, fileName);

function readData(fileName) {
  try {
    const filePath = getFilePath(fileName);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error);
    return [];
  }
}

function writeData(fileName, data) {
  try {
    const filePath = getFilePath(fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error);
    return false;
  }
}

module.exports = {
  readData,
  writeData,
  TRANSACTIONS_FILE: 'transactions.json',
  CATEGORIES_FILE: 'categories.json',
  MERCHANT_MAP_FILE: 'merchantMap.json'
};
