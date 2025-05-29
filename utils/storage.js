const fs = require('fs');
const path = require('path');

const contractsPath = path.join(__dirname, '../data/contracts.json');
const usersPath = path.join(__dirname, '../data/users.json');

function load_contracts() {
  if (!fs.existsSync(contractsPath)) return {};
  return JSON.parse(fs.readFileSync(contractsPath));
}

function save_contracts(data) {
  fs.writeFileSync(contractsPath, JSON.stringify(data, null, 2));
}

function load_users() {
  if (!fs.existsSync(usersPath)) return {};
  return JSON.parse(fs.readFileSync(usersPath));
}

module.exports = {
  load_contracts,
  save_contracts,
  load_users
};
