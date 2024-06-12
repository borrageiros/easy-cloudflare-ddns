const fs = require('fs');
const path = require('path');

const tokenFilePath = path.join(__dirname, '../database/data/jwt_secret');

const generateRandomToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

function getJwtSecret() {
  if (fs.existsSync(tokenFilePath)) {
    return fs.readFileSync(tokenFilePath, 'utf-8');
  } else {
    const token = generateRandomToken();
    fs.writeFileSync(tokenFilePath, token);
    return token;
  }
};

module.exports = {
  getJwtSecret
};
