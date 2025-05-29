const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { load_contracts, save_contracts } = require('../utils/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('makeufa')
    .setDescription('Set all players to be unrestricted free agents (UFA).')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Only admins can run

  async execute(interaction) {
    const contracts = load_contracts();

    for (const playerKey in contracts) {
      if (Object.hasOwnProperty.call(contracts, playerKey)) {
        // Set rfa to false, marking them as UFA
        contracts[playerKey].rfa = false;
      }
    }

    save_contracts(contracts);

    await interaction.reply('✅ All players are now marked as unrestricted free agents (UFA).');
  },
};
