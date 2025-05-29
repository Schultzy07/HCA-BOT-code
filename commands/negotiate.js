const { SlashCommandBuilder } = require('discord.js');
const { load_contracts, save_contracts, load_users } = require('../utils/storage');

const cooldowns = {};
const negotiations = {};
const leagueTeams = [/* Your team names here */];

function cleanAAV(aav) {
  return Math.round(aav / 1000) * 1000;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('negotiate')
    .setDescription('Negotiate a contract with a player.')
    .addStringOption(option =>
      option.setName('player_name')
        .setDescription('Name of the player')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('player_ovr')
        .setDescription("Player's overall rating")
        .setRequired(true))
    .addStringOption(option =>
      option.setName('team_name')
        .setDescription('Your team name')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('years')
        .setDescription('Contract length (max 5 years)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('aav')
        .setDescription('Average salary per year')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('clause')
        .setDescription('Contract clause')
        .setRequired(true)
        .addChoices(
          { name: 'None', value: 'None' },
          { name: 'No Trade Clause (NTC)', value: 'NTC' },
          { name: 'No Movement Clause (NMC)', value: 'NMC' },
          { name: 'Modified No Trade Clause (M-NTC)', value: 'M-NTC' },
        ))
    .addBooleanOption(option =>
      option.setName('prospects_new_contract')
        .setDescription('Is this a prospect’s new contract? Makes them a restricted free agent.')
        .setRequired(false)),

  async execute(interaction) {
    const contracts = load_contracts();
    const users = load_users();
    const userId = interaction.user.id;
    const currentTime = Date.now() / 1000;

    const playerName = interaction.options.getString('player_name');
    const playerOvr = interaction.options.getInteger('player_ovr');
    const teamName = interaction.options.getString('team_name');
    const years = interaction.options.getInteger('years');
    const aavInput = interaction.options.getInteger('aav');
    const clause = interaction.options.getString('clause');
    const isProspectRFA = interaction.options.getBoolean('prospects_new_contract') || false;

    if (!users[userId]) {
      return interaction.reply({ content: '❌ You must set your team first with `/setteam`.', ephemeral: true });
    }

    const gmTeam = users[userId].toLowerCase();
    if (gmTeam !== teamName.toLowerCase()) {
      return interaction.reply({ content: '❌ You can only negotiate for **your own team**.', ephemeral: true });
    }

    if (years <= 0 || years > 5) {
      return interaction.reply({ content: '❌ Contracts can only be between 1 and 5 years.', ephemeral: true });
    }

    if (aavInput <= 0) {
      return interaction.reply({ content: '❌ AAV must be a positive number.', ephemeral: true });
    }

    const playerKey = playerName.toLowerCase();
    if (cooldowns[playerKey] && currentTime < cooldowns[playerKey]) {
      const remaining = Math.floor(cooldowns[playerKey] - currentTime);
      return interaction.reply({ content: `⏳ ${playerName} is not ready. Try again in ${remaining} seconds.`, ephemeral: true });
    }

    if (contracts[playerKey]) {
      return interaction.reply({ content: `❌ ${playerName} already has a contract!`, ephemeral: true });
    }

    const aav = cleanAAV(aavInput);
    const totalSalary = aav * years;

    let minimumRequired = 500000;
    if (playerOvr >= 95) minimumRequired = 10000000;
    else if (playerOvr >= 92) minimumRequired = 8500000;
    else if (playerOvr >= 90) minimumRequired = 7500000;
    else if (playerOvr >= 87) minimumRequired = 5500000;
    else if (playerOvr >= 85) minimumRequired = 4000000;
    else if (playerOvr >= 82) minimumRequired = 3000000;
    else if (playerOvr >= 70) minimumRequired = 1000000;

    if (aav < minimumRequired * 0.7) {
      const availableTeams = leagueTeams.filter(t => t.toLowerCase() !== teamName.toLowerCase());
      const tradeList = availableTeams.sort(() => 0.5 - Math.random()).slice(0, 3);

      contracts[playerKey] = {
        team: teamName.toLowerCase(),
        years: 0,
        salary: 0,
        aav: 0,
        ovr: playerOvr,
        clause: 'TRADE REQUEST',
        trade_list: tradeList
      };

      save_contracts(contracts);

      const msg = `🚨 **${playerName}** (${playerOvr} OVR) was deeply insulted by an offer from **${teamName}**.\nThey are demanding a trade!\nPreferred Teams: ${tradeList.map(t => `**${t}**`).join(', ')}.`;
      await interaction.reply({ content: msg });

      const tradeChannel = interaction.client.channels.cache.get('1366809500446752828');
      if (tradeChannel) tradeChannel.send(msg);
      return;
    }

    if (aav < minimumRequired) {
      return interaction.reply({
        content: `🚫 ${playerName} (${playerOvr} OVR) demands at least **$${minimumRequired.toLocaleString()} AAV**!`,
        ephemeral: true
      });
    }

    const longTermCount = Object.values(contracts).filter(p => p.team === gmTeam && p.years >= 4).length;
    if (years >= 4 && longTermCount >= 5) {
      return interaction.reply({
        content: '❌ Your team already has 5 players signed to 4+ year contracts.',
        ephemeral: true
      });
    }

    let acceptanceChance = 90;
    if (playerOvr >= 95) acceptanceChance = 20;
    else if (playerOvr >= 92) acceptanceChance = 25;
    else if (playerOvr >= 90) acceptanceChance = 30;
    else if (playerOvr >= 87) acceptanceChance = 45;
    else if (playerOvr >= 85) acceptanceChance = 55;
    else if (playerOvr >= 82) acceptanceChance = 65;
    else if (playerOvr >= 70) acceptanceChance = 75;

    if (
      (playerOvr >= 95 && aav < 8500000) ||
      (playerOvr >= 92 && aav < 7500000) ||
      (playerOvr >= 90 && aav < 6500000) ||
      (playerOvr >= 87 && aav < 5000000) ||
      (playerOvr >= 85 && aav < 3500000)
    ) {
      acceptanceChance = Math.max(5, Math.floor(acceptanceChance / 2));
    }

    const roll = Math.floor(Math.random() * 100) + 1;
    if (roll <= acceptanceChance) {
      const contract = {
        team: teamName.toLowerCase(),
        years,
        salary: totalSalary,
        aav,
        ovr: playerOvr,
        clause,
        status: isProspectRFA ? 'RFA' : 'UFA'
      };

      if (clause === 'M-NTC') {
        const sample = leagueTeams.filter(t => t.toLowerCase() !== teamName.toLowerCase()).sort(() => 0.5 - Math.random()).slice(0, 3);
        contract.no_trade_list = sample;
      }

      contracts[playerKey] = contract;
      save_contracts(contracts);

      return interaction.reply({
        content: `✅ ${playerName} (${playerOvr} OVR) accepted your offer! ($${aav.toLocaleString()} AAV, Clause: ${clause})` +
                 (isProspectRFA ? `\n📝 This player is now a **Restricted Free Agent (RFA)**.` : '')
      });
    } else {
      const decisionRoll = Math.floor(Math.random() * 100) + 1;
      if (decisionRoll <= 70) {
        const extraMoney = Math.floor(Math.random() * 800000) + 100000;
        const newAAV = cleanAAV(aav + extraMoney);

        negotiations[playerKey] = {
          team: teamName.toLowerCase(),
          years,
          new_total_salary: newAAV * years,
          new_aav: newAAV,
          ovr: playerOvr,
          clause,
          expire_time: currentTime + 180
        };

        return interaction.reply({
          content: `🤔 ${playerName} (${playerOvr} OVR) rejected your offer.\nThey want **$${newAAV.toLocaleString()} AAV** for **${years} years**, Clause: ${clause}.\nUse \`/acceptcounter ${playerName}\` within 3 minutes to accept.`
        });
      } else {
        cooldowns[playerKey] = currentTime + 300;
        return interaction.reply({
          content: `❌ ${playerName} rejected your offer and won't negotiate again for 5 minutes.`,
          ephemeral: true
        });
      }
    }
  }
};

