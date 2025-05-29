const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

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
    .setName('freeagency')
    .setDescription('Show all players currently in Free Agency.'),

  async execute(interaction) {
    const contracts = loadContracts();
    const freeAgents = Object.entries(contracts).filter(
      ([, contract]) => contract.team.toLowerCase() === 'free agents'
    );

    if (freeAgents.length === 0) {
      await interaction.reply('📭 There are currently no players in Free Agency.');
      return;
    }

    const sorted = freeAgents.sort((a, b) => b[1].ovr - a[1].ovr);
    const lines = sorted.map(([playerName, data]) =>
      `• **${capitalizeWords(playerName)}** (${data.ovr} OVR) — ${data.years} yrs @ $${data.aav.toLocaleString()} AAV`
    );

    const response = `📝 **Free Agency Pool (${sorted.length} Players):**\n` + lines.join('\n');

    await interaction.reply({ content: response.slice(0, 2000), ephemeral: false });
  }
};
