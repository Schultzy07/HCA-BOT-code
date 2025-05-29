const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

// File path to contracts.json
const contractsPath = path.join(__dirname, '../data/contracts.json');

function loadContracts() {
  if (!fs.existsSync(contractsPath)) return {};
  return JSON.parse(fs.readFileSync(contractsPath));
}

function saveContracts(contracts) {
  fs.writeFileSync(contractsPath, JSON.stringify(contracts, null, 2));
}

function capitalizeWords(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changefastatus')
    .setDescription('Change a player\'s contract to RFA or UFA (admin only).')
    .addStringOption(option =>
      option.setName('player_name')
        .setDescription('Name of the player')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('status')
        .setDescription('Set contract status')
        .setRequired(true)
        .addChoices(
          { name: 'Restricted Free Agent (RFA)', value: 'RFA' },
          { name: 'Unrestricted Free Agent (UFA)', value: 'UFA' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Admin-only

  async execute(interaction) {
    const playerName = interaction.options.getString('player_name').toLowerCase();
    const newStatus = interaction.options.getString('status');

    const contracts = loadContracts();

    if (!contracts[playerName]) {
      return interaction.reply({ content: `❌ ${capitalizeWords(playerName)} does not have a contract.`, ephemeral: true });
    }

    contracts[playerName].status = newStatus;
    saveContracts(contracts);

    await interaction.reply(`✅ Updated status of **${capitalizeWords(playerName)}** to **${newStatus}**.`);
  }
};
