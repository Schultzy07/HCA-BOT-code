const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Path to contracts.json
const contractsPath = path.join(__dirname, '../data/contracts.json');

function loadContracts() {
  if (!fs.existsSync(contractsPath)) return {};
  return JSON.parse(fs.readFileSync(contractsPath));
}

function saveContracts(contracts) {
  fs.writeFileSync(contractsPath, JSON.stringify(contracts, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('release')
    .setDescription('Release a player from their contract (admin only).')
    .addStringOption(option =>
      option.setName('player_name')
        .setDescription('The player\'s name to release')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Only admins can use this

  async execute(interaction) {
    try {
      const playerName = interaction.options.getString('player_name');
      const playerKey = playerName.toLowerCase();

      const contracts = loadContracts();

      if (!contracts[playerKey]) {
        return interaction.reply({ content: `❌ ${playerName} does not have a contract to release.`, ephemeral: true });
      }

      delete contracts[playerKey];
      saveContracts(contracts);

      return interaction.reply(`✅ **${playerName}** has been released from their contract.`);
    } catch (error) {
      console.error('❌ Error in /release:', error);
      return interaction.reply({ content: '❌ An error occurred while trying to release the player.', ephemeral: true });
    }
  }
};
