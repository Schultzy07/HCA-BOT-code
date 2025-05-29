const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load/save contracts
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
    .setName('rookiesign')
    .setDescription('Signs a rookie to a 2-year contract at $500,000 AAV as an RFA.')
    .addStringOption(option =>
      option.setName('player_name')
        .setDescription('Name of the rookie player')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('player_ovr')
        .setDescription('Overall rating of the player')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('team_name')
        .setDescription('Team name signing the rookie')
        .setRequired(true)
    ),

  async execute(interaction) {
    const playerName = interaction.options.getString('player_name').toLowerCase();
    const playerOvr = interaction.options.getInteger('player_ovr');
    const teamName = interaction.options.getString('team_name').toLowerCase();

    const contracts = loadContracts();

    if (contracts[playerName]) {
      await interaction.reply(`❌ ${capitalizeWords(playerName)} already has a contract.`);
      return;
    }

    contracts[playerName] = {
      team: teamName,
      years: 2,
      salary: 1_000_000,
      aav: 500_000,
      ovr: playerOvr,
      clause: 'None',
      status: 'RFA' // ← Marks them as a Restricted Free Agent
    };

    saveContracts(contracts);

    await interaction.reply(`✅ ${capitalizeWords(playerName)} (${playerOvr} OVR) signed with **${capitalizeWords(teamName)}** for 2 years at $500,000 AAV.\n📝 Status: **RFA**`);
  }
};
