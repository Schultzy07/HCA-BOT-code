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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('forcesign')
    .setDescription('Force a player to sign a contract (admin only).')
    .addStringOption(option =>
      option.setName('player_name')
        .setDescription("The player's name")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('player_ovr')
        .setDescription("The player's overall rating")
        .setRequired(true))
    .addStringOption(option =>
      option.setName('team_name')
        .setDescription('The team to sign the player to')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('years')
        .setDescription('Contract length (1–5 years)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('aav')
        .setDescription('Average annual value (AAV)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('clause')
        .setDescription('Contract clause (None, NTC, NMC, M-NTC)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('status')
        .setDescription('Player contract status: UFA or RFA')
        .setRequired(false)
        .addChoices(
          { name: 'Unrestricted Free Agent (UFA)', value: 'UFA' },
          { name: 'Restricted Free Agent (RFA)', value: 'RFA' }
        ))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const playerName = interaction.options.getString('player_name');
    const playerOvr = interaction.options.getInteger('player_ovr');
    const teamName = interaction.options.getString('team_name').toLowerCase();
    const years = interaction.options.getInteger('years');
    const aav = interaction.options.getInteger('aav');
    const clause = interaction.options.getString('clause') || 'None';
    const status = interaction.options.getString('status') || 'UFA';

    if (years > 5 || years < 1 || aav <= 0) {
      return interaction.reply({ content: '❌ Invalid contract parameters.', ephemeral: true });
    }

    const contracts = loadContracts();
    const playerKey = playerName.toLowerCase();

    if (contracts[playerKey]) {
      return interaction.reply({ content: `❌ ${playerName} already has a contract.`, ephemeral: true });
    }

    const contract = {
      team: teamName,
      years,
      salary: aav * years,
      aav,
      ovr: playerOvr,
      clause,
      status // 'UFA' or 'RFA'
    };

    if (clause === 'M-NTC') {
      contract.no_trade_list = ['team1', 'team2', 'team3']; // Replace with actual team names if needed
    }

    contracts[playerKey] = contract;
    saveContracts(contracts);

    await interaction.reply(`✅ Forced contract signed: **${playerName}** to **${teamName}** for ${years} years at $${aav.toLocaleString()} AAV. Clause: ${clause}. Status: **${status}**`);
  }
};
