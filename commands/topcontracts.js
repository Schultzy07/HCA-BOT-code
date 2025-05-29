const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to contracts.json
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
    .setName('topcontracts')
    .setDescription('Show the top 20 contracts in the league sorted by AAV.'),

  async execute(interaction) {
    const contracts = loadContracts();

    // Sort contracts by AAV (descending), then total salary
    const sorted = Object.entries(contracts)
      .map(([name, data]) => ({
        name: capitalizeWords(name),
        team: capitalizeWords(data.team),
        aav: data.aav,
        years: data.years,
        total: data.salary,
        ovr: data.ovr
      }))
      .sort((a, b) => b.aav - a.aav)
      .slice(0, 20);

    if (sorted.length === 0) {
      await interaction.reply('📂 No contracts found in the league.');
      return;
    }

    let response = `💸 **Top 20 Contracts by AAV in the League**:\n`;
    sorted.forEach((c, i) => {
      response += `\n**${i + 1}. ${c.name}** (${c.ovr} OVR) – ${c.team}\n`;
      response += `• AAV: $${c.aav.toLocaleString()} | Years: ${c.years} | Total: $${c.total.toLocaleString()}\n`;
    });

    await interaction.reply(response);
  }
};
