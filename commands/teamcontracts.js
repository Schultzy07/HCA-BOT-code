const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const contractsPath = path.join(__dirname, '../data/contracts.json');

function loadContracts() {
  if (!fs.existsSync(contractsPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(contractsPath));
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('teamcontracts')
    .setDescription('Shows all contracts for a specified team.')
    .addStringOption(option =>
      option.setName('team_name')
        .setDescription('Name of the team')
        .setRequired(true)
    ),

  async execute(interaction) {
    const inputTeam = interaction.options.getString('team_name');
    const teamName = inputTeam.toLowerCase();
    const contracts = loadContracts();

    const teamContracts = Object.entries(contracts).filter(
      ([, contract]) => contract.team.toLowerCase() === teamName
    );

    if (teamContracts.length === 0) {
      await interaction.reply(`❌ No contracts found for **${capitalizeWords(inputTeam)}**.`);
      return;
    }

    let response = `📄 Contracts for **${capitalizeWords(inputTeam)}**:\n\n`;

    for (const [player, data] of teamContracts) {
      // Show status, defaulting to 'N/A' if not set
      const status = data.status ? data.status.toUpperCase() : 'N/A';

      response += `**${capitalizeWords(player)}** - ${data.ovr} OVR\n`;
      response += `• Years: ${data.years}\n`;
      response += `• AAV: $${data.aav.toLocaleString()}\n`;
      response += `• Clause: ${data.clause || 'None'}\n`;
      response += `• Status: ${status}\n\n`;
    }

    await interaction.reply(response.length < 2000 ? response : '⚠️ Too many contracts to display. Please narrow your search.');
  }
};
