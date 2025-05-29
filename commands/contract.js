const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load contracts
const contractsPath = path.join(__dirname, '../data/contracts.json');

function loadContracts() {
  if (!fs.existsSync(contractsPath)) return {};
  return JSON.parse(fs.readFileSync(contractsPath));
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('contract')
    .setDescription('View the contract of a specific player.')
    .addStringOption(option =>
      option.setName('player_name')
        .setDescription('Name of the player')
        .setRequired(true)
    ),

  async execute(interaction) {
    const inputName = interaction.options.getString('player_name');
    const playerName = inputName.toLowerCase();

    const contracts = loadContracts();

    if (!contracts[playerName]) {
      await interaction.reply(`❌ No contract found for **${capitalizeWords(inputName)}**.`);
      return;
    }

    const c = contracts[playerName];
    let response = `📃 Contract for **${capitalizeWords(playerName)}**:\n`;
    response += `• Team: ${capitalizeWords(c.team)}\n`;
    response += `• OVR: ${c.ovr}\n`;
    response += `• Years: ${c.years}\n`;
    response += `• AAV: $${c.aav.toLocaleString()}\n`;
    response += `• Clause: ${c.clause || 'None'}\n`;
    
    // Show no-trade list if present
    if (c.clause === 'M-NTC' && c.no_trade_list) {
      response += `• No Trade List: ${c.no_trade_list.map(capitalizeWords).join(', ')}\n`;
    }
    
    // Show Free Agent Status if present
    if (c.status) {
      response += `• Status: ${c.status.toUpperCase()}\n`;  // e.g. RFA or UFA
    }

    await interaction.reply(response);
  }
};