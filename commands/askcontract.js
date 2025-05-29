const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('askcontract')
    .setDescription('Ask the bot what contract a player wants.')
    .addStringOption(option =>
      option.setName('player_name')
        .setDescription('Name of the player')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('player_ovr')
        .setDescription('Player overall rating')
        .setRequired(true)),
  async execute(interaction) {
    const playerName = interaction.options.getString('player_name');
    const playerOvr = interaction.options.getInteger('player_ovr');

    // Estimate base salary (AAV) and contract length based on OVR
    let minAAV = 500000;
    let maxAAV = 1500000;
    let years = Math.floor(Math.random() * 3) + 2; // 2–4 years

    if (playerOvr >= 95) {
      minAAV = 10000000;
      maxAAV = 12000000;
      years = 5;
    } else if (playerOvr >= 92) {
      minAAV = 8500000;
      maxAAV = 10500000;
    } else if (playerOvr >= 90) {
      minAAV = 7500000;
      maxAAV = 9500000;
    } else if (playerOvr >= 87) {
      minAAV = 5500000;
      maxAAV = 7500000;
    } else if (playerOvr >= 85) {
      minAAV = 4000000;
      maxAAV = 6000000;
    } else if (playerOvr >= 82) {
      minAAV = 3000000;
      maxAAV = 4500000;
    } else if (playerOvr >= 70) {
      minAAV = 1000000;
      maxAAV = 3000000;
    }

    const aav = Math.floor(Math.random() * (maxAAV - minAAV + 1)) + minAAV;

    // Clause logic
    const clauses = ['None', 'No Trade Clause (NTC)', 'No Movement Clause (NMC)', 'Modified NTC (M-NTC)'];
    let clause = 'None';
    const roll = Math.random();

    if (roll < 0.1) clause = clauses[1];       // 10% NTC
    else if (roll < 0.18) clause = clauses[2]; // 8% NMC
    else if (roll < 0.28) clause = clauses[3]; // 10% M-NTC

    await interaction.reply(
      `📝 **${playerName}** (${playerOvr} OVR) is asking for:\n` +
      `• **${years} years**\n` +
      `• **$${aav.toLocaleString()} AAV**\n` +
      `• **Clause: ${clause}**`
    );
  }
};
