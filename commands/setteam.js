const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

function loadUsers() {
  if (!fs.existsSync(usersPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(usersPath));
}

function saveUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setteam')
    .setDescription('Set your team as a general manager.')
    .addStringOption(option =>
      option.setName('team_name')
        .setDescription('The full name of the team you want to manage')
        .setRequired(true)),
  async execute(interaction) {
    const teamName = interaction.options.getString('team_name');
    const userId = interaction.user.id;

    const users = loadUsers();
    users[userId] = teamName.toLowerCase();
    saveUsers(users);

    await interaction.reply(`✅ You are now the GM of **${teamName}**.`);
  }
};
