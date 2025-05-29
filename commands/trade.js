const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const contractsPath = path.join(__dirname, '../data/contracts.json');

function loadContracts() {
  if (!fs.existsSync(contractsPath)) return {};
  return JSON.parse(fs.readFileSync(contractsPath));
}

function saveContracts(contracts) {
  fs.writeFileSync(contractsPath, JSON.stringify(contracts, null, 2));
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trade')
    .setDescription('Trade a player to another team.')
    .addStringOption(option =>
      option.setName('player_name')
        .setDescription('The name of the player being traded')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('new_team')
        .setDescription('The name of the team the player is being traded to')
        .setRequired(true)
    ),

  async execute(interaction) {
    const playerName = interaction.options.getString('player_name');
    const newTeam = interaction.options.getString('new_team');
    const playerKey = playerName.toLowerCase();

    const contracts = loadContracts();

    if (!contracts[playerKey]) {
      await interaction.reply({ content: `❌ No contract found for **${capitalizeWords(playerName)}**.`, ephemeral: true });
      return;
    }

    const oldTeam = contracts[playerKey].team;
    contracts[playerKey].team = newTeam.toLowerCase();

    saveContracts(contracts);

    await interaction.reply(
      `🔁 **${capitalizeWords(playerName)}** has been traded from **${capitalizeWords(oldTeam)}** to **${capitalizeWords(newTeam)}**.`
    );
  }
};
