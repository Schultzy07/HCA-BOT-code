const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const contractsPath = path.join(__dirname, '../data/contracts.json');
const CAP_LIMIT = 130_000_000;

function loadContracts() {
  if (!fs.existsSync(contractsPath)) return {};
  return JSON.parse(fs.readFileSync(contractsPath));
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('teamcap')
    .setDescription('View the total cap used by all teams or a specific team.')
    .addStringOption(option =>
      option.setName('team')
        .setDescription('Optional team to filter by')
        .setRequired(false)
    ),

  async execute(interaction) {
    const contracts = loadContracts();
    const inputTeam = interaction.options.getString('team');
    const capUsed = {};
    let total = 0;

    for (const [_, contract] of Object.entries(contracts)) {
      const team = contract.team.toLowerCase();
      const aav = contract.aav || 0;

      if (!capUsed[team]) capUsed[team] = 0;
      capUsed[team] += aav;
      total += aav;
    }

    if (inputTeam) {
      const teamKey = inputTeam.toLowerCase();
      const used = capUsed[teamKey] || 0;
      const percent = ((used / CAP_LIMIT) * 100).toFixed(2);
      const remaining = CAP_LIMIT - used;

      await interaction.reply(
        `💰 **${capitalizeWords(inputTeam)}** has used **$${used.toLocaleString()} / $${CAP_LIMIT.toLocaleString()}** (${percent}% used).\n` +
        `Remaining cap: **$${remaining.toLocaleString()}**`
      );
    } else {
      const sorted = Object.entries(capUsed).sort((a, b) => b[1] - a[1]);
      const lines = sorted.map(([team, used]) => {
        const percent = ((used / CAP_LIMIT) * 100).toFixed(1);
        return `• **${capitalizeWords(team)}**: $${used.toLocaleString()} / $${CAP_LIMIT.toLocaleString()} (${percent}%)`;
      });

      await interaction.reply(
        `📊 **Cap Usage by Team (out of $${CAP_LIMIT.toLocaleString()}):**\n` +
        lines.join('\n')
      );
    }
  }
};
